// Private bridge from a checked Firestore preparation to one D1 authorization
// proof. It neither creates a ticket nor activates/exposes a game.
import {boundedJsonSnapshot} from './bounded-json-snapshot.mjs';
import {authorizationIdentity,AUTHORIZATION_WINDOW_MS} from './round-authorizations.mjs';
import {authorizationCatalog} from './authorization-catalog.mjs';
import {jointCatalogMetadata,reconstructMixedMcQuestion,JOINT_MC_PAYLOAD_SQL,JOINT_FR_PAYLOAD_SQL} from './mixed-question-selection.mjs';
import {normalizeJointCatalog,aggregateFeasibility} from './joint-selection.mjs';
import {decodeCompact,canonical} from '../bank/compact-codec.mjs';
import {decodeFreeResponseRecord} from '../bank/free-response-codec.mjs';
import {frDigest} from '../bank/free-response-record.mjs';
import {freeResponseSelectionHash} from '../bank/free-response-metadata.mjs';
import {freeResponseEligibilityPolicy} from './free-response-eligibility.mjs';
import {freeResponseQuestions} from './free-response-questions.mjs';
import {validQuestionResponse,validateQuestionRequest} from './questions-policy.mjs';
import {validQuestionMix,questionOrderMatches} from '../round-question-config.mjs';
import {legacyPolicy} from './legacy-selection.mjs';
import defaultAdmissions from './free-response-admissions.json' with {type:'json'};
const check=(ok,message)=>{if(!ok)throw Error(message);};
const digest=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
const time=v=>Number.isSafeInteger(v)&&v>=0&&v<=8640000000000000;
const qkey=q=>`${q.responseFormat==='free-response'?'fr':'mc'}:${q.problemId}:${q.problemRevision}:${q.contentHash}`;
const rkey=r=>`${r.response_format==='free-response'?'fr':'mc'}:${r.problem_id}:${r.revision}:${r.content_hash}`;

/** Call only with readForAuthorization() output, after receipt recovery found
 * no ticket. policyHash and rounds are trusted compiled server policy, never
 * client options or values taken from the saved diagnostics. Current support
 * is the strict joint selector (including its pure-MC/pure-FR cases); this does
 * not reinterpret the historical MC fallback policy as a strict horizon. */
export async function validatePreparedAuthorization(database,identityValue,contextValue,options={}){
 const expected=authorizationIdentity(identityValue);
 // The reader separately accepts history up to 3 MB, a 760 KB saved set,
 // 10 KB identity and 12 KB intent. The composed envelope must retain those
 // supported states; one Firestore document's limit is not this object's size.
 const context=boundedJsonSnapshot(contextValue,{maxBytes:3800000,maxNodes:85000,maxDepth:46});
 const registry=boundedJsonSnapshot(options.admissions??defaultAdmissions,{maxBytes:4000000,maxNodes:50000,maxDepth:8});
 const {rounds,policyHash,originPolicy=legacyPolicy}=options;
 check(Number.isInteger(rounds)&&rounds>=1&&rounds<=10&&digest(policyHash)&&policyHash===expected.policy_hash,'Unsupported current authorization policy');
 const {identity,intent,set,control,historyToken,selectionHistory,asOf}=context;
 check(identity&&intent&&set&&control&&digest(historyToken)&&time(asOf),'Invalid checked preparation context');
 const request=identity.request;
 check(validateQuestionRequest(request)&&identity.id===expected.intent_id&&identity.requestHash===expected.request_hash&&intent.id===identity.id&&intent.state==='PREPARED'&&intent.binding===expected.binding&&intent.selectionHash===expected.selection_hash&&intent.expiresAt===expected.intent_expires&&intent.expiresAt>asOf&&intent.controlVersion===expected.control_version,'Prepared authorization identity changed');
 check(control.enabled===true&&control.version===expected.control_version&&set.binding===expected.binding&&set.selectionHash===expected.selection_hash&&set.expiresAt===expected.intent_expires&&set.policy?.selectionPolicyHash===policyHash&&typeof set.policy.includeLegacy==='boolean','Prepared authorization control changed');
 check(set.policy.registryHash===await frDigest(registry),'Prepared registry changed');
 check(await frDigest(request)===expected.request_hash,'Prepared request changed');
 const selected={questions:set.questions,relaxation:set.relaxation,...(set.diagnostics!==undefined?{diagnostics:set.diagnostics}:{})};
 check(await frDigest({selected,policy:set.policy})===expected.selection_hash,'Prepared questions changed');
 check(set.relaxation==='none'&&set.diagnostics?.policy==='joint-capped-v2'&&set.diagnostics.requiredRounds===rounds,'Preparation does not use the current strict horizon');
 const mix=request.questionMix??{multipleChoice:request.responseFormat==='free-response'?0:request.count,freeResponse:request.responseFormat==='free-response'?request.count:0,order:'uniform'};
 check(validQuestionMix(mix,request.count)&&validQuestionResponse(set.questions,{...request,questionMix:mix})&&(!request.questionMix||questionOrderMatches(set.questions,mix)),'Prepared question configuration changed');
 const input={...request,includeLegacy:set.policy.includeLegacy};
 const db=typeof database.withSession==='function'?database.withSession('first-primary'):database;
 const catalog=await authorizationCatalog(db,input,selectionHistory,{admissions:registry,originPolicy,policyHash,controlVersion:expected.control_version,now:asOf});
 const byKey=new Map(catalog.candidates.map(row=>[rkey(row),row])),chosen=[],lineages=new Set(),families=new Map();
 for(const q of set.questions){
  const row=byKey.get(qkey(q));
  check(row&&!row.history_blocked&&q.lineageId===row.lineage_id&&q.constructionFamilyId===row.family_id,'Selected question is no longer eligible');
  check(!lineages.has(row.lineage_id),'Prepared questions repeat a mathematical item');lineages.add(row.lineage_id);
  const count=(families.get(row.family_id)??0)+1;check(count<=2,'Prepared construction cap exceeded');families.set(row.family_id,count);chosen.push(row);
 }
 // Recompute completion from the CURRENT snapshot, not a witness saved before
 // a withdrawal. Selected lineages consume their opportunity in both formats.
 const blocked=new Set(catalog.candidates.filter(row=>row.history_blocked).map(row=>row.lineage_id));
 for(const id of lineages)blocked.add(id);
 const remaining=normalizeJointCatalog(await jointCatalogMetadata(catalog),blocked);
 check(aggregateFeasibility(remaining,mix.multipleChoice*(rounds-1),mix.freeResponse*(rounds-1),2*(rounds-1)).feasible,'Current catalog cannot complete the prepared horizon');
 const reconstructed=new Map(),mc=chosen.filter(row=>row.response_format==='multiple-choice'),fr=chosen.filter(row=>row.response_format==='free-response');
 const payloadRows=async(sql,rows,field)=>{
  const result=(await db.prepare(sql+`(${rows.map(()=>'?').join(',')})`).bind(...rows.map(row=>row[field])).all()).results;
  check(Array.isArray(result)&&result.length===rows.length&&new Set(result.map(row=>row[field])).size===rows.length&&result.every(row=>row.payload_valid===1),'Missing, duplicate or oversized selected payload');
  const byRef=new Map(result.map(row=>[row[field],row]));check(rows.every(row=>byRef.has(row[field])),'Selected payload identity changed');return byRef;
 };
 if(mc.length){
  const rows=await payloadRows(JOINT_MC_PAYLOAD_SQL,mc,'problem_ref');
  for(const row of mc){const saved=set.questions.find(q=>qkey(q)===rkey(row));reconstructed.set(rkey(row),reconstructMixedMcQuestion(await decodeCompact(rows.get(row.problem_ref)),row,input,originPolicy,saved.choiceOrder));}
 }
 if(fr.length){
  const rows=await payloadRows(JOINT_FR_PAYLOAD_SQL,fr,'record_ref'),policy=freeResponseEligibilityPolicy(registry),records=[];
  for(const row of fr){const record=await decodeFreeResponseRecord(rows.get(row.record_ref),{admissions:registry});check(await freeResponseSelectionHash(record)===policy.selectionHashes[row.record_hash],'Selected FR metadata changed');records.push(record);}
  const questions=await freeResponseQuestions(records,registry);for(let i=0;i<fr.length;i++)reconstructed.set(rkey(fr[i]),questions[i]);
 }
 for(const q of set.questions)check(canonical(reconstructed.get(qkey(q)))===canonical(q),'Saved question presentation changed');
 const captured=catalog.authorization,deadline=Math.min(expected.intent_expires,captured.asOf+AUTHORIZATION_WINDOW_MS);
 check(time(deadline)&&deadline>captured.asOf&&expected.intent_expires>captured.retiredBefore&&captured.ticketCount<10000,'Prepared authorization window unavailable');
 // The conditional ticket INSERT compares this epoch again. Changes between
 // this snapshot and payload reads cannot commit a ticket under a newer epoch.
 return Object.freeze({history_token:historyToken,incarnation:captured.incarnation,epoch:captured.epoch,authorization_deadline:deadline});
}
