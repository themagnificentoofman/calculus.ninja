// Private operator gate. Register exact reviewed hashes before using this path;
// a research file or referenceVerified flag cannot register itself.
import {readFileSync,openSync,fstatSync,readSync,closeSync,constants} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import katex from 'katex';
import {assertNoHeldAssessmentRevisions} from '../../lib/bank/free-response-assessment-holds.mjs';
import registry from '../../lib/server/free-response-admissions.json' with {type:'json'};
import {assertRegisteredFreeResponse,admissionKey,frDigest,referenceSource} from '../../lib/bank/free-response-record.mjs';
import {canonical} from '../../lib/bank/compact-codec.mjs';
import {gradeAnswer} from '../../lib/math-answer/versioned-grade.mjs';
import {admissionChecker} from '../../lib/math-answer/admission-checker.mjs';
import {currentCheckerSourceHash,CHECKER_FILES} from './checker-source.mjs';
export {currentCheckerSourceHash,CHECKER_FILES} from './checker-source.mjs';
import {formatProblemStatement,formatSolutionStep} from '../../lib/solution-format.mjs';
import {normalizeNotation} from '../../lib/math-notation.mjs';
import {studyProseParts} from '../../lib/study/prose.mjs';

const root=resolve(new URL('../..',import.meta.url).pathname);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const assert=(value,message)=>{if(!value)throw Error(message);};
const substantive=value=>typeof value==='string'&&value.trim().length>=24&&value.length<=12000;
// Detach caller-owned objects before the first await or evidence callback.
// A review receipt must describe one stable snapshot throughout preparation.
export function immutableReviewSnapshot(value){
 const snapshot=structuredClone(value);
 const freeze=node=>{if(node&&typeof node==='object'&&!Object.isFrozen(node)){Object.freeze(node);for(const child of Object.values(node))freeze(child);}return node;};
 return freeze(snapshot);
}
export function evidenceDirectory(directory){
 return hash=>{
  assert(/^[a-f0-9]{64}$/.test(hash),'Invalid evidence hash');
  const limit=4*1024*1024,fd=openSync(resolve(directory,`${hash}.json`),constants.O_RDONLY|constants.O_NONBLOCK);
  try {
   const stat=fstatSync(fd);assert(stat.isFile()&&stat.size<=limit,'Oversized evidence artifact');
   const buffer=Buffer.alloc(Math.min(limit+1,stat.size+1));let length=0;
   while(length<buffer.length){const n=readSync(fd,buffer,length,buffer.length-length,length);if(!n)break;length+=n;}
   assert(length===stat.size&&length<=limit,'Evidence changed while reading');
   const bytes=buffer.subarray(0,length);assert(sha(bytes)===hash,'Missing or changed evidence artifact');
   return JSON.parse(bytes.toString('utf8'));
  }finally{closeSync(fd);}
 };
}
function renderRecord(task,contract){
 let formulas=0;
 const render=source=>{katex.renderToString(source,{throwOnError:true,strict:'error',trust:false,maxExpand:1000});formulas++;};
 const inspect=blocks=>{for(const block of blocks)if(block.kind==='math')render(block.value);else for(const part of block.parts)if(part.kind==='math')render(part.value);};
 // Do not accept text that would be normalized after the review binding.
 for(const source of [task.statement,...task.solutionSteps])assert(normalizeNotation(source)===source,'FR source must already follow the served notation standard');
 inspect(formatProblemStatement(task.statement));
 for(const step of task.solutionSteps)inspect(formatSolutionStep(step));
 for(const source of [...task.assumptions,contract.instructions])for(const part of studyProseParts(source)){
  if(part.kind==='math'){assert(normalizeNotation(part.value)===part.value,'Assumption/instruction notation must already be normalized');render(part.value);}
  else assert(!/\\(?:[a-zA-Z]+|[()[\]])/.test(part.value),'Assumption/instruction TeX must use explicit inline math delimiters');
 }
 for(const fixture of contract.fixtures){const result=gradeAnswer(contract,fixture.source);assert(result.outcome===fixture.expected,`Bound fixture failed: ${result.outcome}, expected ${fixture.expected}`);if(result.interpretation)render(result.interpretation);}
 const canonicalResult=gradeAnswer(contract,referenceSource(contract.answer));assert(canonicalResult.outcome==='correct','Reference answer is not supported');
 return {formulas,fixtures:contract.fixtures.length};
}

/** Checks actual evidence bytes, exact served content, grading source and every
 * finite fixture. The supplied registry is injectable only for isolated tests. */
export async function verifyFreeResponseAdmission(record,{admissions=registry,readEvidence,checkerSourceHash}={}){
 record=immutableReviewSnapshot(record);admissions=immutableReviewSnapshot(admissions);
 const actualCheckerSourceHash=currentCheckerSourceHash(record.contract);
 assert(checkerSourceHash===undefined||checkerSourceHash===actualCheckerSourceHash,'The checker changed after admission review');
 checkerSourceHash=actualCheckerSourceHash;
 assert(typeof readEvidence==='function','Private review evidence is required');
 assert(admissionChecker(admissions).sourceHash===checkerSourceHash,'The checker changed after admission review');
 assertNoHeldAssessmentRevisions(admissions);
 const entry=await assertRegisteredFreeResponse(record,admissions),{task,contract}=record;
 const evidence=hash=>immutableReviewSnapshot(readEvidence(hash));
 const review=evidence(entry.reviewHash),math=evidence(contract.review.evidenceHash);
 assert(review.version==='free-response-item-review-1'&&review.decision==='admit'&&review.recordHash===entry.recordHash&&review.mathEvidenceHash===contract.review.evidenceHash&&review.checkerSourceHash===checkerSourceHash,'Unbound final item review');
 assert(math.version==='free-response-mathematical-review-1'&&math.decision==='pass'&&math.taskContentHash===task.contentHash&&math.answerHash===await frDigest(contract.answer)&&math.fixturesHash===await frDigest(contract.fixtures),'Unbound mathematical review');
 const identity=value=>value.normalize('NFKC').trim().toLocaleLowerCase('en-US');
 for(const evidence of [review,math])assert(typeof evidence.author==='string'&&evidence.author===task.provenance.author&&typeof evidence.reviewer==='string'&&evidence.reviewer.trim()&&identity(evidence.reviewer)!==identity(evidence.author),'Review must be independent of the author');
 assert(math.reviewVersion===contract.review.version,'Mathematical review version mismatch');
 for(const key of ['literalStatement','assumptions','referenceAnswer','equivalentAnswers','wrongAnswers','workedSolution','wholeDomain','permittedFinalForms'])assert(substantive(math.checks?.[key]),`Missing independent review: ${key}`);
 assert(review.difficulty===task.difficulty&&substantive(review.simplestRoute)&&substantive(review.difficultyRationale)&&substantive(review.usefulness),'FR difficulty and usefulness review required');
 assert(review.lineage?.lineageId===task.lineageId&&review.lineage?.constructionFamilyId===task.constructionFamilyId&&substantive(review.lineage.equivalenceDisposition)&&canonical(review.lineage.origin)===canonical(task.origin),'Unbound exposure/origin review');
 if(task.difficulty==='olympiad')assert(review.qualifiedOlympiad===true&&substantive(review.recognitionDecision),'Olympiad idea qualification required');
 if(task.provenance.kind==='adapted'){
  const permission=evidence(task.provenance.permissionEvidenceHash);
  assert(permission.version==='free-response-source-permission-1'&&permission.statementHash===await frDigest(task.statement)&&permission.solutionHash===await frDigest(task.solutionSteps)&&permission.author===task.provenance.author&&canonical(permission.credit)===canonical(task.provenance.credit)&&permission.reusePermitted===true&&substantive(permission.scope),'Missing exact source permission');
 }
 // No self-asserted pass substitutes for these executed contract fixtures.
 const executed=renderRecord(task,contract);
 const recordHash=await frDigest(record);
 assert(recordHash===entry.recordHash,'Reviewed snapshot changed during admission');
 return {key:admissionKey(record),recordHash,taskHash:task.contentHash,contractHash:contract.contractHash,reviewHash:entry.reviewHash,checkerSourceHash,...executed};
}
