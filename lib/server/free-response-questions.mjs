// Private adapter for registered, decoded FR records. It does not enable a
// practice pool or connect the private selector to the production API.
import {boundedJsonSnapshot} from './bounded-json-snapshot.mjs';
import {FR_RECORD_BYTES} from '../bank/free-response-record.mjs';
import defaultAdmissions from './free-response-admissions.json' with {type:'json'};
import {assertRegisteredFreeResponse,frDigest} from '../bank/free-response-record.mjs';
import {freeResponseEligibilityPolicy} from './free-response-eligibility.mjs';

const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};

/** Snapshot only exact registered content, without invented MC choice fields.
 * The bankRelease identifies the complete compiled FR registry bytes. This
 * stamp is provenance, not proof that a pool passed its capacity gates. */
export async function freeResponseQuestions(records,admissions=defaultAdmissions){
 if(!Array.isArray(records)||records.length<1||records.length>20)throw Error('Invalid FR question set size');
 const registry=boundedJsonSnapshot(admissions,{maxBytes:4000000,maxNodes:50000,maxDepth:8});
 const modern=registry.version==='free-response-admission-2';
 if(Object.keys(registry).sort().join(',')!==(modern?'activeChecker,checkers,records,version':'checkerSourceHash,records,version'))throw Error('Invalid FR registry fields');
 for(const entry of Object.values(registry.records??{}))if(!entry||typeof entry!=='object'||Object.keys(entry).sort().join(',')!==(modern?'checkerKey,checkerSourceHash,recordHash,reviewHash,selectionHash':'checkerSourceHash,recordHash,reviewHash,selectionHash'))throw Error('Invalid FR registration fields');
 freeResponseEligibilityPolicy(registry);
 const saved=boundedJsonSnapshot(records,{maxBytes:20*FR_RECORD_BYTES+64,maxNodes:20*8192,maxDepth:34});
 for(const record of saved)boundedJsonSnapshot(record,{maxBytes:FR_RECORD_BYTES});
 const bankRelease=`fr-registry-${await frDigest(registry)}`;
 const questions=[];
 for(const record of saved){
  await assertRegisteredFreeResponse(record,registry);
  const {task,contract}=record;
  questions.push({
   responseFormat:'free-response',
   problemId:task.problemId,problemRevision:task.problemRevision,contentHash:task.contentHash,bankRelease,
   familyId:task.familyId,constructionFamilyId:task.constructionFamilyId,lineageId:task.lineageId,
   legacy:task.legacy,templateVersion:task.presentationVersion,solutionReviewVersion:contract.review.version,
   latexProblem:task.statement,explanation:task.solutionSteps,topic:task.topic,difficulty:task.difficulty,
   answerInstructions:contract.instructions,answerContractId:contract.contractId,answerContractHash:contract.contractHash,
   graderVersion:contract.graderVersion,parserVersion:contract.parserVersion,
   freeResponse:contract,pedagogy:task.pedagogy,
   ...(task.provenance.kind==='adapted'?{contentAttribution:task.provenance.credit}:{}),
  });
 }
 return freeze(questions);
}
