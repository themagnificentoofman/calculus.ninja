import {canonical,hex} from './compact-codec.mjs';
import {isLegacyProblem} from './legacy-origin.mjs';
import {topics,difficulties} from '../server/questions-policy.mjs';
import {checkerFor,CURRENT_CHECKER} from '../math-answer/versioned-grade.mjs';
import {assertAdmissionChecker} from '../math-answer/admission-checker.mjs';
import {parse as parseV2} from '../math-answer/v2/parser.mjs';
import {certificate,compareCertificates} from '../math-answer/v2/constant-certificate.mjs';
import {budget as budgetV2,MathInputError as MathInputErrorV2} from '../math-answer/v2/rational.mjs';
import {parse} from '../math-answer/parser.mjs';
import {normalForm} from '../math-answer/algebra.mjs';
import {range,pointRange} from '../math-answer/domain.mjs';
import {budget,ZERO,cmp} from '../math-answer/rational.mjs';
import {freeResponseSelectionHash} from './free-response-metadata.mjs';

export const FR_RECORD_VERSION='free-response-record-1';
export const FR_RECORD_BYTES=65536;
const encoder=new TextEncoder();
const sha=/^[a-f0-9]{64}$/;
const id=/^cn_[a-f0-9]{20}$/;
const label=/^[a-z][a-z0-9-]{1,100}$/;
const matches=(pattern,value)=>typeof value==='string'&&pattern.test(value);
const problemKeys=['schemaVersion','responseFormat','problemId','problemRevision','contentHash','familyId','constructionFamilyId','lineageId','legacy','origin','topic','difficulty','presentationVersion','statement','assumptions','solutionSteps','pedagogy','provenance'];
const contractKeys=['version','parserVersion','graderVersion','contractId','contractHash','problem','presentation','answer','instructions','domain','branch','allowedOperators','review','fixtures','difficulty'];
const assert=(condition,message)=>{if(!condition)throw Error(message);};
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const only=(value,keys)=>assert(object(value)&&Object.keys(value).every(key=>keys.includes(key))&&keys.every(key=>Object.hasOwn(value,key)),'Unexpected or missing free-response record fields');
const text=(value,max=8000)=>typeof value==='string'&&value.trim().length>0&&value.length<=max&&!/[\u0000-\u001f\u007f]/.test(value);
const strings=(value,max=40)=>Array.isArray(value)&&value.length<=max&&value.every(s=>text(s));
export const admissionKey=record=>`${record.task.problemId}@${record.task.problemRevision}#${record.contract.contractId}`;
export async function frDigest(value){return hex(await crypto.subtle.digest('SHA-256',encoder.encode(canonical(value))));}

function answerShape(answer,depth=0){
 assert(object(answer)&&depth<=4,'Unsupported answer shape');
 const fields={scalar:['expected'],function:['expected','variable','domain'],antiderivative:['integrand','reference','variable','domain','constant','request'],approximate:['expected','absoluteTolerance','relativeTolerance','precision'],tuple:['components'],interval:['lower','upper','lowerClosed','upperClosed'],outcome:['expected']}[answer.kind];
 assert(fields,'Unsupported answer type');only(answer,['kind',...fields]);
 if(answer.kind==='tuple'){
  assert(Array.isArray(answer.components)&&answer.components.length>0&&answer.components.length<=16,'Invalid tuple size');
  answer.components.forEach(c=>answerShape(c,depth+1));return;
 }
 if(answer.kind==='outcome'){assert(['positive-infinity','negative-infinity','does-not-exist','diverges','converges','absolute','conditional'].includes(answer.expected),'Invalid outcome');return;}
 if(answer.kind==='interval'){
  assert(text(answer.lower,2048)&&text(answer.upper,2048)&&typeof answer.lowerClosed==='boolean'&&typeof answer.upperClosed==='boolean','Invalid interval');return;
 }
 for(const key of ['expected','integrand','reference','absoluteTolerance','relativeTolerance','precision'])if(key in answer)assert(text(answer[key],2048),'Invalid answer expression');
 if('variable'in answer){
  assert(matches(/^[a-df-hj-z]$/,answer.variable),'Unsupported variable');
  const d=answer.domain;assert(object(d),'Domain required');
  if(d.kind==='real-line')only(d,['kind']);
  else {
   only(d,['kind','lower','upper','lowerClosed','upperClosed']);assert(d.kind==='interval','Unsupported domain');
   for(const key of ['lower','upper'])assert(d[key]===null||text(d[key],2048),'Invalid domain endpoint');
   assert(typeof d.lowerClosed==='boolean'&&typeof d.upperClosed==='boolean'&&!(d.lower===null&&d.lowerClosed)&&!(d.upper===null&&d.upperClosed),'Invalid endpoint closure');
  }
 }
 if(answer.kind==='antiderivative')assert(answer.constant==='optional-real-additive'&&answer.request==='any','General families are not supported');
}

function intervalSemantics(answer,operators,checker){
 if(answer.kind==='tuple'){answer.components.forEach(c=>intervalSemantics(c,operators,checker));return;}
 if(answer.kind!=='interval')return;
 const infinity=s=>['-infinity','-\\infty','-∞'].includes(s)?-1:['infinity','+infinity','\\infty','+\\infty','∞'].includes(s)?1:0;
 const lowerInfinity=infinity(answer.lower),upperInfinity=infinity(answer.upper);
 assert(lowerInfinity!==1&&upperInfinity!==-1&&!(lowerInfinity&&answer.lowerClosed)&&!(upperInfinity&&answer.upperClosed),'Invalid infinite interval endpoint');
 if(checker===CURRENT_CHECKER){
  const b=budgetV2();
  try{
   const endpoint=s=>certificate(parseV2(s,{variables:[],allowedOperators:operators},b),b);
   const lo=lowerInfinity?null:endpoint(answer.lower),hi=upperInfinity?null:endpoint(answer.upper);
   if(!lo||!hi)return;
   const order=compareCertificates(lo,hi,b);assert(order<0||order===0&&answer.lowerClosed&&answer.upperClosed,'Interval must be ordered and nonempty');return;
  }catch(error){if(!(error instanceof MathInputErrorV2)||error.kind!=='unsupported')throw error;}
 }
 const b=budget(),endpoint=source=>{
  const ast=parse(source,{variables:[],allowedOperators:operators},b),enclosure=range(ast,null,pointRange(ZERO),b);
  assert(enclosure.issues.length===0,'Interval endpoint domain is unproved');return ast;
 };
 const lo=lowerInfinity?null:endpoint(answer.lower),hi=upperInfinity?null:endpoint(answer.upper);
 if(!lo||!hi)return;
 const difference={op:'-',args:[lo,hi]},exact=normalForm(difference,b).rational();
 if(exact){const order=cmp(exact,ZERO);assert(order<0||order===0&&answer.lowerClosed&&answer.upperClosed,'Interval must be ordered and nonempty');return;}
 const result=range(difference,null,pointRange(ZERO),b),r=result.range;
 assert(result.issues.length===0&&r.hi&&(cmp(r.hi,ZERO)<0||cmp(r.hi,ZERO)===0&&r.hiOpen),'Interval ordering is outside the verified capabilities');
}

/** Canonical answer entry, not an independent mathematical certificate. */
export function referenceSource(answer){
 if(answer.kind==='antiderivative')return answer.reference;
 if(answer.kind==='tuple')return `(${answer.components.map(referenceSource).join(',')})`;
 if(answer.kind==='interval')return `${answer.lowerClosed?'[':'('}${answer.lower},${answer.upper}${answer.upperClosed?']':')'}`;
 if(answer.kind==='outcome')return {'positive-infinity':'infinity','negative-infinity':'-infinity','does-not-exist':'DNE',diverges:'diverges',converges:'converges',absolute:'absolute',conditional:'conditional'}[answer.expected];
 return answer.expected;
}

/** Storage integrity only. Admission additionally requires an exact registered
 * independent review and replay of its bound fixtures in the operator gate. */
export async function assertFreeResponseRecord(record){
 only(record,['task','contract']);const {task:t,contract:c}=record;
 assert(encoder.encode(canonical(record)).length<=FR_RECORD_BYTES,'Oversized free-response record');
 only(t,problemKeys);only(c,contractKeys);
 assert(t.schemaVersion===3&&t.responseFormat==='free-response'&&matches(id,t.problemId)&&Number.isSafeInteger(t.problemRevision)&&t.problemRevision>0,'Invalid task identity');
 assert(matches(sha,t.contentHash)&&matches(sha,c.contractHash)&&matches(label,c.contractId),'Invalid content/contract identity');
 assert([t.familyId,t.constructionFamilyId,t.lineageId].every(v=>text(v,128))&&typeof t.legacy==='boolean','Invalid task lineage');
 // No legacy FR task has yet earned exact-revision admission. An opt-in is
 // never evidence, and an MC conversion cannot erase its original origin.
 assert(!isLegacyProblem(t)&&!isLegacyProblem(t.origin),'Legacy free-response admission is unavailable');
 assert(topics.includes(t.topic)&&difficulties.includes(t.difficulty),'Invalid FR classification');
 assert(t.presentationVersion==='problem-tex-1'&&text(t.statement)&&strings(t.assumptions,16)&&strings(t.solutionSteps)&&t.solutionSteps.length>0,'Invalid served presentation');
 if(t.origin?.kind==='original')only(t.origin,['kind']);
 else {
  only(t.origin,['kind','problemId','problemRevision','contentHash','familyId','constructionFamilyId','lineageId','bankRelease','mcDifficulty']);
  const o=t.origin;assert(o.kind==='bank'&&matches(id,o.problemId)&&Number.isSafeInteger(o.problemRevision)&&o.problemRevision>0&&matches(sha,o.contentHash)&&[o.familyId,o.constructionFamilyId,o.lineageId,o.bankRelease].every(v=>text(v,128))&&difficulties.includes(o.mcDifficulty),'Invalid source-bank binding');
  assert(t.problemId!==o.problemId&&t.lineageId===o.lineageId&&t.constructionFamilyId===o.constructionFamilyId,'A conversion must preserve exposure/origin under a separate task identity');
 }
 const p=t.pedagogy;
 only(p,['constructionId','relatedIdeaGroupId','structuralSignature','primaryTechnique','alternativeTechniques','prerequisites','reasoningDemand','answerForm','difficultyRationale','sourceRecordIds','responseFormat']);
 assert(p.responseFormat==='free-response'&&p.constructionId===t.constructionFamilyId&&[p.relatedIdeaGroupId,p.structuralSignature,p.primaryTechnique,p.answerForm,p.difficultyRationale].every(v=>text(v)),'Invalid reviewed task pedagogy');
 assert(strings(p.alternativeTechniques,16)&&strings(p.prerequisites,32)&&strings(p.sourceRecordIds,32)&&Array.isArray(p.reasoningDemand)&&p.reasoningDemand.length>0&&p.reasoningDemand.every(v=>['execution','recognition','method-selection','reframing','convergence','synthesis'].includes(v)),'Invalid reasoning metadata');
 const provenance=t.provenance;assert(object(provenance)&&text(provenance.author,200),'Authoring provenance required');
 if(provenance.kind==='original'){only(provenance,['kind','author','sourceReferences']);assert(strings(provenance.sourceReferences,32)&&provenance.sourceReferences.every(url=>/^https:\/\//.test(url)),'Invalid source references');}
 else {
  only(provenance,['kind','author','credit','permissionEvidenceHash']);assert(provenance.kind==='adapted'&&matches(sha,provenance.permissionEvidenceHash),'Permission evidence required');
  only(provenance.credit,['credit','sourceUrl','sourceItem','license','licenseUrl','modifications']);assert(Object.values(provenance.credit).every(v=>text(v,6000))&&/^https:\/\//.test(provenance.credit.sourceUrl)&&/^https:\/\//.test(provenance.credit.licenseUrl),'Invalid source credit');
 }
 const checker=checkerFor(c);
 assert(c.version==='answer-contract-1'&&checker&&c.domain==='real'&&c.branch==='real-principal','Unsupported contract version or domain');
 const identity={problemId:t.problemId,problemRevision:t.problemRevision,contentHash:t.contentHash,lineageId:t.lineageId,constructionFamilyId:t.constructionFamilyId,legacy:t.legacy};
 assert(canonical(c.problem)===canonical(identity),'Contract/task identity mismatch');
 assert(canonical(c.presentation)===canonical({version:t.presentationVersion,statement:t.statement,assumptions:t.assumptions}),'Contract/served presentation mismatch');
 assert(c.difficulty===t.difficulty&&text(c.instructions,2000),'Contract/task difficulty mismatch');
 assert(Array.isArray(c.allowedOperators)&&new Set(c.allowedOperators).size===c.allowedOperators.length&&c.allowedOperators.every(v=>checker.operators.includes(v)),'Invalid final-answer operators');
 only(c.review,['version','evidenceHash','referenceVerified']);assert(text(c.review.version,100)&&matches(sha,c.review.evidenceHash)&&c.review.referenceVerified===true,'Independent evidence binding required');
 answerShape(c.answer);intervalSemantics(c.answer,c.allowedOperators,checker);
 assert(Array.isArray(c.fixtures)&&c.fixtures.length>=3&&c.fixtures.length<=64,'Finite answer fixtures required');
 for(const f of c.fixtures){only(f,['source','expected','reason']);assert(text(f.source,2048)&&text(f.reason,2000)&&['correct','incorrect','invalid','unsupported','indeterminate'].includes(f.expected),'Invalid answer fixture');}
 assert(c.fixtures.some(f=>f.source===referenceSource(c.answer)&&f.expected==='correct')&&c.fixtures.filter(f=>f.expected==='correct').length>=2&&c.fixtures.some(f=>f.expected==='incorrect'),'Canonical, equivalent and wrong fixtures required');
 assert(new Set(c.fixtures.map(f=>f.source)).size===c.fixtures.length,'Duplicate answer fixture');
 const {contentHash,...body}=t,{contractHash,...contractBody}=c;
 assert(await frDigest(body)===contentHash,'Immutable FR task hash mismatch');
 assert(await frDigest(contractBody)===contractHash,'Immutable FR contract hash mismatch');
 return record;
}

export async function assertRegisteredFreeResponse(record,registry){
 await assertFreeResponseRecord(record);
 const entry=registry?.records?.[admissionKey(record)];
 assertAdmissionChecker(record,entry,registry);
 assert(entry&&matches(sha,entry.reviewHash)&&entry.recordHash===await frDigest(record),'Unknown or changed source-bound free-response record');
 assert(matches(sha,entry.selectionHash)&&entry.selectionHash===await freeResponseSelectionHash(record),'Unknown or changed FR selection metadata binding');
 return entry;
}
