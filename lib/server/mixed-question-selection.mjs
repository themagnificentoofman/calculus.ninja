// Private integration only. Runtime enablement still requires admitted pools,
// measured Worker resources and the separate D1/Firestore issuance protocol.
import {indexedPracticeTags} from '../bank/practice-technique-tags.mjs';
import {eligiblePracticeCatalog} from './mixed-catalog-scope.mjs';
import {selectJointMetadataV2} from './joint-selection-v2.mjs';
import {normalizeJointCatalog,aggregateFeasibility,cryptoIndex} from './joint-selection.mjs';
import {selectionHistorySnapshot} from './selection-history-token.mjs';
import {freeResponseHistory} from './free-response-selection.mjs';
import {boundedJsonSnapshot} from './bounded-json-snapshot.mjs';
import {freeResponseQuestions} from './free-response-questions.mjs';
import {decodeFreeResponseRecord} from '../bank/free-response-codec.mjs';
import {freeResponseSelectionHash} from '../bank/free-response-metadata.mjs';
import {freeResponseEligibilityPolicy} from './free-response-eligibility.mjs';
import {decodeCompact,canonical} from '../bank/compact-codec.mjs';
import {frDigest} from '../bank/free-response-record.mjs';
import {presentBankProblem} from './solution-presentation.mjs';
import {assertSelectionVocabularySource} from './selection-vocabulary.mjs';
import {contentAttribution} from '../bank/content-attribution.mjs';
import {legacyPolicy} from './legacy-selection.mjs';
import {validQuestionMix} from '../round-question-config.mjs';
import {validQuestionResponse} from './questions-policy.mjs';
import defaultAdmissions from './free-response-admissions.json' with {type:'json'};
import {JointSelectionError} from './joint-selection-error.mjs';
export {JointSelectionError} from './joint-selection-error.mjs';
const assert=(ok,message)=>{if(!ok)throw Error(message);};
const key=row=>row.response_format==='free-response'?`frq:${row.record_ref}:${row.record_hash}`:`mcq:${row.problem_ref}:${row.content_hash}`;
const mcPayloadBound="typeof(b.payload_gzip)='blob' AND length(b.payload_gzip) BETWEEN 1 AND 65536 AND typeof(m.metadata_json)='text' AND length(CAST(m.metadata_json AS BLOB)) BETWEEN 1 AND 65536";
export const JOINT_MC_PAYLOAD_SQL=`SELECT b.problem_ref,b.problem_id,b.revision,b.content_hash,b.semantic_hash,
 (${mcPayloadBound}) AS payload_valid,
 CASE WHEN ${mcPayloadBound} THEN b.payload_gzip ELSE NULL END AS payload_gzip,
 CASE WHEN ${mcPayloadBound} THEN m.metadata_json ELSE NULL END AS metadata_json
 FROM cbank_problems b JOIN cbank_shared m USING(shared_id) WHERE b.problem_ref IN `;
const frPayloadBound="typeof(payload_gzip)='blob' AND length(payload_gzip) BETWEEN 1 AND 65536";
export const JOINT_FR_PAYLOAD_SQL=`SELECT record_ref,problem_id,revision,contract_id,content_hash,contract_hash,record_hash,topic,difficulty,family_id,construction_id,lineage_id,mc_problem_ref,
 (${frPayloadBound}) AS payload_valid,CASE WHEN ${frPayloadBound} THEN payload_gzip ELSE NULL END AS payload_gzip
 FROM frbank_records WHERE record_ref IN `;
export async function jointCatalogMetadata(value){
 const rows=value.candidates.map(row=>({format:row.response_format==='free-response'?'frq':'mcq',key:key(row),taskId:row.problem_id,revision:row.revision,lineage:row.lineage_id,family:row.family_id,weight:row.weight??1,idea:row.idea,structure:row.structure,technique:row.technique,combination:row.combination}));
 return {complete:true,sourceBinding:await frDigest(value.candidates),rows};
}
const blocks=value=>new Set(value.candidates.filter(row=>row.history_blocked).map(row=>row.lineage_id));
function mcQuestion(original,candidate,input,originPolicy,index,savedOrder){
 assert(original.problemId===candidate.problem_id&&original.problemRevision===candidate.revision&&original.contentHash===candidate.content_hash,'Selected MC identity changed');
 assertSelectionVocabularySource(original);
 const legacy=originPolicy.check(original,candidate.family_id,input.includeLegacy),p=presentBankProblem(original);
 assert(Array.isArray(p.assumptions)&&typeof p.subtopic==='string'&&Array.isArray(p.techniqueTags)&&p.parameters&&typeof p.parameters==='object','Selected MC context is incomplete');
 assert(p.familyId===candidate.source_family&&p.topic===candidate.topic&&p.difficulty===candidate.difficulty&&(!input.tag||input.tag==='*'||indexedPracticeTags(p).includes(input.tag)),'Selected MC metadata changed');
 let choices=[...p.choices];
 if(savedOrder!==undefined){
  assert(Array.isArray(savedOrder)&&savedOrder.length===choices.length&&new Set(savedOrder).size===choices.length&&savedOrder.every(id=>choices.some(c=>c.choiceId===id)),'Invalid saved choice order');
  choices=savedOrder.map(id=>choices.find(c=>c.choiceId===id));
 }else for(let i=choices.length-1;i>0;i--){const j=index(i+1);assert(Number.isInteger(j)&&j>=0&&j<=i,'Invalid choice randomness');[choices[i],choices[j]]=[choices[j],choices[i]];}
 const credit=contentAttribution(p);
 return {...(legacy?{legacy:true}:{}),...(credit?{contentAttribution:credit}:{}),problemId:p.problemId,problemRevision:p.problemRevision,contentHash:p.contentHash,bankRelease:candidate.active_release,
 familyId:p.familyId,lineageId:candidate.lineage_id,constructionFamilyId:candidate.family_id,...(p.templateVersion?{templateVersion:p.templateVersion}:{}),...(p.solutionQuality?{solutionReviewVersion:p.solutionQuality.version}:{}),...(p.pedagogy?{pedagogy:{...p.pedagogy,relatedIdeaGroupId:candidate.idea,structuralSignature:candidate.structure,primaryTechnique:candidate.technique}}:{}),context:{assumptions:p.assumptions,subtopic:p.subtopic,techniqueTags:p.techniqueTags,parameters:p.parameters},
 choiceOrder:choices.map(c=>c.choiceId),latexProblem:p.statement,options:choices.map(c=>c.math),correctIndex:choices.findIndex(c=>c.choiceId===p.answerChoiceId),explanation:p.solutionSteps,topic:p.topic,difficulty:p.difficulty};
}
/** Reconstruct the exact saved presentation without consuming randomness or
 * changing its choice order. Only the private authorization validator uses it. */
export function reconstructMixedMcQuestion(original,candidate,input,originPolicy,savedOrder){
 assert(savedOrder!==undefined,'Missing saved choice order');
 return mcQuestion(original,candidate,input,originPolicy,null,savedOrder);
}
/** Exact shared selection, bounded to 20 payloads. Returned question order is
 * deliberately not the player's format order; the API applies that once. */
export async function selectMixedQuestions(db,input,recent={},options={}){
 const request=boundedJsonSnapshot(input,{maxBytes:8192,maxNodes:100,maxDepth:4}),savedHistory=selectionHistorySnapshot(recent);
 const {rounds,now=Date.now(),rng,index=cryptoIndex,originPolicy=legacyPolicy}=options;
 assert(Number.isInteger(rounds)&&rounds>=1&&rounds<=10,'An explicit supported joint horizon is required');
 assert(validQuestionMix(request.questionMix,request.count),'Invalid joint question counts/order');
 const registry=boundedJsonSnapshot(options.admissions??defaultAdmissions,{maxBytes:4000000,maxNodes:50000,maxDepth:8}),policy=freeResponseEligibilityPolicy(registry);
 const catalog=await eligiblePracticeCatalog(db,request,savedHistory,now,registry,originPolicy),metadata=await jointCatalogMetadata(catalog),blocked=blocks(catalog),history=freeResponseHistory(savedHistory,now);
 const normalized=normalizeJointCatalog(metadata,blocked),mix=request.questionMix;
 if(!aggregateFeasibility(normalized,mix.multipleChoice*rounds,mix.freeResponse*rounds,2*rounds).feasible)throw new JointSelectionError('joint-insufficient-capacity');
 const chosen=selectJointMetadataV2(metadata,mix,{rounds,blocked,historyWeights:history.weights,...(rng?{rng}:{}),index});
 const byKey=new Map(catalog.candidates.map(row=>[key(row),row])),selected=chosen.selected.map(row=>byKey.get(row.key));
 assert(selected.length===request.count&&selected.every(Boolean),'Incomplete joint metadata selection');
 let statements=1;const decoded=new Map();
 const mc=selected.filter(row=>row.response_format==='multiple-choice'),fr=selected.filter(row=>row.response_format==='free-response');
 if(mc.length){
  const rows=(await db.prepare(JOINT_MC_PAYLOAD_SQL+`(${mc.map(()=>'?').join(',')})`).bind(...mc.map(row=>row.problem_ref)).all()).results;statements++;
  assert(Array.isArray(rows)&&rows.length===mc.length,'Missing selected MC record');assert(rows.every(row=>row.payload_valid===1),'Oversized or missing selected MC payload');const byRef=new Map(rows.map(row=>[row.problem_ref,row]));
  for(const candidate of mc)decoded.set(key(candidate),mcQuestion(await decodeCompact(byRef.get(candidate.problem_ref)),candidate,request,originPolicy,index));
 }
 if(fr.length){
  const rows=(await db.prepare(JOINT_FR_PAYLOAD_SQL+`(${fr.map(()=>'?').join(',')})`).bind(...fr.map(row=>row.record_ref)).all()).results;statements++;
  assert(Array.isArray(rows)&&rows.length===fr.length,'Missing selected FR record');assert(rows.every(row=>row.payload_valid===1),'Oversized or missing selected FR payload');const byRef=new Map(rows.map(row=>[row.record_ref,row])),records=[];
  for(const candidate of fr){const record=await decodeFreeResponseRecord(byRef.get(candidate.record_ref),{admissions:registry});assert(await freeResponseSelectionHash(record)===policy.selectionHashes[candidate.record_hash],'Selected FR metadata changed');records.push(record);}
  const questions=await freeResponseQuestions(records,registry);for(let i=0;i<fr.length;i++)decoded.set(key(fr[i]),questions[i]);
 }
 const questions=selected.map(row=>decoded.get(key(row)));assert(validQuestionResponse(questions,request),'Invalid decoded joint question set');
 // Recompute from a coherent current catalog, not from the old witness. An
 // unrelated withdrawal is acceptable when another exact completion remains.
 const current=await eligiblePracticeCatalog(db,request,savedHistory,now,registry,originPolicy);statements++;
 const currentByKey=new Map(current.candidates.map(row=>[key(row),row]));
 for(const row of selected){const actual=currentByKey.get(key(row));if(!actual||actual.history_blocked||canonical(actual)!==canonical(row))throw new JointSelectionError('joint-catalog-changed');}
 const currentMetadata=await jointCatalogMetadata(current),remainingBlocked=blocks(current);for(const row of selected)remainingBlocked.add(row.lineage_id);
 const remaining=normalizeJointCatalog(currentMetadata,remainingBlocked),future=aggregateFeasibility(remaining,mix.multipleChoice*(rounds-1),mix.freeResponse*(rounds-1),2*(rounds-1));
 if(!future.feasible)throw new JointSelectionError('joint-catalog-changed');
 return boundedJsonSnapshot({questions,relaxation:'none',diagnostics:{policy:'joint-capped-v2',candidateCount:current.candidates.length,catalogFamilies:new Set(current.candidates.map(row=>row.family_id)).size,statements,payloadsDecoded:questions.length,requiredRounds:rounds,remainingRounds:rounds-1,initialCatalogBinding:metadata.sourceBinding,finalCatalogBinding:currentMetadata.sourceBinding,remainingRank:future.rank,algorithm:chosen.diagnostics}},{maxBytes:2000000,maxNodes:180000,maxDepth:40});
}
