import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {frDigest,admissionKey} from '../../lib/bank/free-response-record.mjs';
import {currentCheckerSourceHash} from '../../scripts/bank/free-response.mjs';
import {CURRENT_CHECKER} from '../../lib/math-answer/versioned-grade.mjs';
import {freeResponseSelectionHash} from '../../lib/bank/free-response-metadata.mjs';

// Explicit isolated records: this registry is never written into production.
export async function freeResponseFixture({checkerVersion=1,alterTask=()=>{},alterContract=()=>{},alterMath=()=>{},alterReview=()=>{}}={}){
 const evidence=new Map(),put=value=>{const bytes=JSON.stringify(value),hash=createHash('sha256').update(bytes).digest('hex');evidence.set(hash,{bytes,value});return hash;};
 const task={schemaVersion:3,responseFormat:'free-response',problemId:'cn_0123456789abcdefabcd',problemRevision:1,familyId:'fixture-derivative',constructionFamilyId:'fixture-derivative',lineageId:'fixture-derivative-square',legacy:false,origin:{kind:'original'},topic:'differentiation',difficulty:'easy',presentationVersion:'problem-tex-1',statement:String.raw`\text{Find the derivative of } f(x)=x^2\text{ for all real }x.`,assumptions:['All variables are real.'],solutionSteps:[String.raw`\text{Apply the power rule: }f^{\prime}(x)=2x.`,'2x'],pedagogy:{constructionId:'fixture-derivative',relatedIdeaGroupId:'fixture-power-rule',structuralSignature:'fixture-monomial',primaryTechnique:'power-rule',alternativeTechniques:['definition'],prerequisites:['integer-powers'],reasoningDemand:['execution'],answerForm:'function',difficultyRationale:'Isolated test fixture; no real content review.',sourceRecordIds:[],responseFormat:'free-response'},provenance:{kind:'original',author:'fixture-author',sourceReferences:[]}};
 alterTask(task);task.contentHash=await frDigest(task);
 const contract={version:'answer-contract-1',parserVersion:`bounded-latex-${checkerVersion}`,graderVersion:`exact-algebra-${checkerVersion}`,contractId:'fixture-derivative-contract',problem:{problemId:task.problemId,problemRevision:task.problemRevision,contentHash:task.contentHash,lineageId:task.lineageId,constructionFamilyId:task.constructionFamilyId,legacy:task.legacy},presentation:{version:task.presentationVersion,statement:task.statement,assumptions:task.assumptions},answer:{kind:'function',expected:'2x',variable:'x',domain:{kind:'real-line'}},instructions:'Enter an expression in x.',domain:'real',branch:'real-principal',allowedOperators:[],difficulty:task.difficulty,fixtures:[{source:'2x',expected:'correct',reason:'Canonical derivative.'},{source:'x+x',expected:'correct',reason:'Independent test-only equivalent expression.'},{source:'x',expected:'incorrect',reason:'At x=1, the derivative is 2, not 1.'}]};
 alterContract(contract);
 const checks=Object.fromEntries(['literalStatement','assumptions','referenceAnswer','equivalentAnswers','wrongAnswers','workedSolution','wholeDomain','permittedFinalForms'].map(key=>[key,`Isolated fixture assertion for ${key}; this is not admitted evidence.`]));
 const math={version:'free-response-mathematical-review-1',decision:'pass',taskContentHash:task.contentHash,answerHash:await frDigest(contract.answer),fixturesHash:await frDigest(contract.fixtures),author:'fixture-author',reviewer:'fixture-reviewer',reviewVersion:'fixture-math-1',checks};
 alterMath(math);contract.review={version:math.reviewVersion,evidenceHash:put(math),referenceVerified:true};contract.contractHash=await frDigest(contract);
 const record={task,contract},recordHash=await frDigest(record),checkerSourceHash=currentCheckerSourceHash(checkerVersion===2?CURRENT_CHECKER.key:undefined);
 const review={version:'free-response-item-review-1',decision:'admit',recordHash,mathEvidenceHash:contract.review.evidenceHash,checkerSourceHash,author:'fixture-author',reviewer:'fixture-reviewer',difficulty:task.difficulty,simplestRoute:'Test-only direct differentiation of a quadratic.',difficultyRationale:'Test-only isolated direct rule application.',usefulness:'Test-only demonstration of a content gate.',lineage:{lineageId:task.lineageId,constructionFamilyId:task.constructionFamilyId,origin:task.origin,equivalenceDisposition:'Test-only isolated mathematical lineage, no active content.'}};
 // Negative fixtures may intentionally violate metadata types. Keep those
 // constructible so the admission boundary itself is exercised; zero is never
 // a real content certificate or written to the production registry.
 let selectionHash='0'.repeat(64);try{selectionHash=await freeResponseSelectionHash(record);}catch{}
 alterReview(review);const reviewHash=put(review),admissions=checkerVersion===2?{version:'free-response-admission-2',activeChecker:CURRENT_CHECKER.key,checkers:{[CURRENT_CHECKER.key]:{graderVersion:CURRENT_CHECKER.graderVersion,parserVersion:CURRENT_CHECKER.parserVersion,checkerSourceHash}},records:{[admissionKey(record)]:{checkerKey:CURRENT_CHECKER.key,recordHash,selectionHash,reviewHash,checkerSourceHash}}}:{version:'free-response-admission-1',checkerSourceHash,records:{[admissionKey(record)]:{recordHash,selectionHash,reviewHash,checkerSourceHash}}};
 return {record,admissions,evidence,readEvidence:hash=>{assert(evidence.has(hash),'Missing fixture evidence');return evidence.get(hash).value;}};
}

export const versionedFreeResponseFixture=options=>freeResponseFixture({...options,checkerVersion:2});
