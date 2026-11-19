import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {readFileSync,openSync,fstatSync,readSync,closeSync,constants} from 'node:fs';
import registry from '../../lib/server/study-admissions.json' with {type:'json'};
import authorRegistry from '../../lib/server/study-authorship.json' with {type:'json'};
import bankSnapshot from '../../lib/server/study-bank-snapshot.json' with {type:'json'};
import contentReleasePlan from '../../lib/server/content-release-plan.json' with {type:'json'};
import {studyLessons} from '../../content/study/catalog.mjs';
import {studyPaths} from '../../content/study/path-catalog.mjs';
import {studyTiers} from '../../content/study/tiers.mjs';
import {lessonTierUse,lessonTierUseReview} from '../../content/study/lesson-tier-use.mjs';
import {studyContentHash,studyDocumentKey,admittedStudyCatalog} from '../../lib/study/admission.mjs';
import {reviewStudyPublicDocument} from '../../lib/study/structure.mjs';
import {reviewPathStructure} from '../../lib/study/pathways.mjs';
import {reviewTierStructure} from '../../lib/study/tier-structure.mjs';
import {canonical} from '../../lib/bank/compact-codec.mjs';
import {evidenceDirectory,immutableReviewSnapshot} from '../bank/free-response.mjs';

const assert=(condition,message)=>{if(!condition)throw Error(message);};
const isHash=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const substantive=value=>typeof value==='string'&&value.trim().length>=40&&value.length<=16000;
const identity=value=>typeof value==='string'?value.normalize('NFKC').trim().toLocaleLowerCase('en-US'):'';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const root=resolve(fileURLToPath(new URL('../..',import.meta.url)));
export const STUDY_PRESENTATION_FILES = [
 'app/study/page.tsx', 'app/study/lessons/[lessonId]/page.tsx', 'app/study/paths/[pathId]/page.tsx', 'app/study/tiers/[tierId]/page.tsx',
 'components/study/StudyDiagram.tsx', 'components/study/StudyLessonReader.tsx', 'components/study/StudyLibrary.tsx',
 'components/study/StudyPathReader.tsx', 'components/study/StudyTierReader.tsx', 'components/MathDisplay.tsx',
 'components/study/StudyMark.tsx', 'lib/study/learner-context.tsx', 'lib/study/marks.mjs', 'lib/study/syllabus.mjs', 'lib/contact-link.mjs',
 'lib/render-math.mjs', 'lib/math-notation.mjs', 'lib/study/prose.mjs', 'lib/study/public-content.mjs',
 'lib/study/catalog.ts', 'lib/study/contracts.ts', 'lib/study/editorial.mjs', 'lib/study/pathways.mjs',
 'lib/study/admission.mjs', 'lib/bank/compact-codec.mjs', 'lib/study/practice-link.mjs', 'lib/round-url.mjs',
 'content/study/editorial.json', 'content/study/reference-titles.json', 'lib/server/study-editorial-bindings.json',
 'lib/study/practice-drills.mjs', 'lib/study/exercise-techniques.json',
 'lib/server/study-practice-availability.mjs', 'lib/server/study-practice-activation.json','lib/server/round-creation-policy.json',
 'app/play/test/page.tsx', 'app/globals.css', 'package.json', 'package-lock.json', 'tsconfig.json',
];
export const currentStudyPresentationHash=()=>sha(canonical(Object.fromEntries(STUDY_PRESENTATION_FILES.map(path=>[path,sha(readFileSync(resolve(root,path)))]))));
export function studyInventoryFile(path){
 return ()=>{
  const limit=64*1024*1024,fd=openSync(path,constants.O_RDONLY|constants.O_NONBLOCK);
  try{
   const stat=fstatSync(fd);assert(stat.isFile()&&stat.size>0&&stat.size<=limit,'Invalid study bank inventory file');
   const bytes=Buffer.alloc(stat.size+1);let length=0;
   while(length<bytes.length){const n=readSync(fd,bytes,length,bytes.length-length,length);if(!n)break;length+=n;}
   assert(length===stat.size,'Study bank inventory changed while reading');return bytes.subarray(0,length);
  }finally{closeSync(fd);}
 };
}
const requirements={
 lesson:['literalMathematics','definitionsAndHypotheses','workedExamples','transferExercises','alternativesAndFailures','notationAndRendering','sourceRights'],
 path:['prerequisiteOrder','transitions','actualReadiness','teachingScope'],
 tier:['expectedConcepts','prerequisites','reasoningProgression','rankDistinction'],
 relationships:['actualTeachingAnchors','tierFit','boundedRoles','uncoveredConcepts'],
};
const exposureParts={lesson:['sections','worked','contrast','exercises','alternatives','diagrams'],path:['summaryObjectives','stepPurposes','readinessPrompts'],tier:['summaries','concepts','reasoning'],relationships:['explanations','anchors']};
const defaultCatalog=()=>({lessons:studyLessons,paths:studyPaths,tiers:studyTiers,tierUse:{id:'lesson-tier-use',revision:lessonTierUseReview.revision,mappings:lessonTierUse}});

/** Build-time evidence verification. Drafts can build privately. No document's
 * status flags authorize publication, and full release requires all documents. */
export async function verifyStudyAdmissions({catalog=defaultCatalog(),admissions=registry,authorship=authorRegistry,expectedBank=bankSnapshot,readEvidence,readInventory,requireComplete=false,expectedBankRelease=contentReleasePlan.release,presentationHash=currentStudyPresentationHash()}={}){
 catalog=immutableReviewSnapshot(catalog);admissions=immutableReviewSnapshot(admissions);authorship=immutableReviewSnapshot(authorship);expectedBank=immutableReviewSnapshot(expectedBank);
 assert(admissions.version==='study-admission-1'&&admissions.documents&&typeof admissions.documents==='object'&&!Array.isArray(admissions.documents),'Invalid Study Guide registry');
 const documents=new Map();
 for(const [kind,values] of Object.entries({lesson:catalog.lessons,path:catalog.paths,tier:catalog.tiers,relationships:[catalog.tierUse]}))for(const value of values){
  const key=studyDocumentKey(kind,value);assert(!documents.has(key),'Duplicate study identity');documents.set(key,{kind,value});
 }
 for(const {kind,value} of documents.values()){const report=reviewStudyPublicDocument(kind,value);assert(report.passed,JSON.stringify(report.errors));}
 assert(reviewPathStructure(catalog.lessons,catalog.paths).passed,'Invalid study pathway structure');
 assert(reviewTierStructure(catalog.lessons,catalog.tiers,catalog.tierUse.mappings).passed,'Invalid study tier relationships');
 const keys=Object.keys(admissions.documents);
 if(keys.length){
  assert(isHash(presentationHash)&&admissions.presentationHash===presentationHash,'Unreviewed study presentation source');
  assert(typeof readEvidence==='function'&&typeof readInventory==='function','Private study review and bank inventory evidence are required');
  assert(authorship.version==='study-authorship-1'&&authorship.documents,'Trusted study authorship is required');
  assert(expectedBank.version==='study-bank-snapshot-1'&&expectedBank.releaseId===expectedBankRelease&&isHash(expectedBank.inventoryHash)&&Number.isSafeInteger(expectedBank.recordCount)&&expectedBank.recordCount>0,'Current trusted bank snapshot is required');
  const supplied=readInventory(),bytes=typeof supplied==='string'?Buffer.from(supplied):Buffer.from(supplied);
  assert(bytes.length>0&&bytes.length<=64*1024*1024&&bytes.length===expectedBank.bytes&&sha(bytes)===expectedBank.inventoryHash,'Study bank inventory bytes do not match the trusted snapshot');
  const lines=new TextDecoder('utf-8',{fatal:true}).decode(bytes).split('\n').filter(line=>line.trim());
  assert(lines.length===expectedBank.recordCount,'Study bank inventory count mismatch');
  const inventory=new Set();
  for(const line of lines){const record=JSON.parse(line);assert(typeof record.problemId==='string'&&/^cn_[a-f0-9]{20}$/.test(record.problemId)&&Number.isSafeInteger(record.problemRevision)&&record.problemRevision>0&&isHash(record.contentHash),'Invalid study inventory identity');const key=`${record.problemId}@${record.problemRevision}`;assert(!inventory.has(key),'Duplicate study inventory identity');inventory.add(key);}
  const evidence=hash=>{assert(isHash(hash),'Invalid study evidence hash');return immutableReviewSnapshot(readEvidence(hash));};
  for(const key of keys){
   const document=documents.get(key),entry=admissions.documents[key];assert(document,'Unknown registered study document');
   const {kind,value}=document,contentHash=await studyContentHash(value);
   assert(entry.contentHash===contentHash&&entry.presentationHash===presentationHash,'Registered study content or presentation changed');
   const authors=authorship.documents[key];
   assert(authors?.contentHash===contentHash&&Array.isArray(authors.authors)&&authors.authors.length>0&&authors.authors.every(a=>identity(a))&&new Set(authors.authors.map(identity)).size===authors.authors.length,'Unbound actual study authorship');
   const provenance=evidence(authors.provenanceHash);
   assert(provenance.version==='study-authorship-evidence-1'&&provenance.key===key&&provenance.contentHash===contentHash&&canonical(provenance.authors)===canonical(authors.authors)&&substantive(provenance.sourceHistory),'Unbound study author provenance');
   const independent=review=>assert(authors.authors.some(a=>identity(a)===identity(review.author))&&identity(review.reviewer)&&!authors.authors.some(a=>identity(a)===identity(review.reviewer)),'Study reviewer must be independent of every bound author');
   const review=evidence(entry.reviewHash);
   assert(review.version==='study-document-review-1'&&review.decision==='reviewed'&&review.key===key&&review.contentHash===contentHash&&review.presentationHash===presentationHash,'Unbound study review');
   independent(review);
   for(const check of requirements[kind])assert(substantive(review.checks?.[check]),`Incomplete study review: ${check}`);
   assert(Array.isArray(review.evidenceHashes)&&review.evidenceHashes.length>0&&review.evidenceHashes.length<=32,'Independent study evidence attachments required');
   for(const hash of review.evidenceHashes)evidence(hash);
   assert(entry.exposureDecision==='distinct','Mapped teaching exposure requires a supported reveal flow');
   const exposure=evidence(entry.exposureHash);
   assert(exposure.version==='study-exposure-review-1'&&exposure.decision==='distinct'&&exposure.contentHash===contentHash&&exposure.key===key&&exposure.presentationHash===presentationHash,'Unbound study exposure decision');
   independent(exposure);
   const bank=evidence(exposure.bankSnapshotHash);
   assert(canonical(bank)===canonical(expectedBank),'Teaching exposure uses a different bank snapshot');
   for(const part of exposureParts[kind])assert(substantive(exposure.checks?.[part]),`Missing teaching exposure inspection: ${part}`);
   assert(Array.isArray(exposure.evidenceHashes)&&exposure.evidenceHashes.length>0&&exposure.evidenceHashes.length<=32,'Teaching exposure evidence attachments required');
   for(const hash of exposure.evidenceHashes)evidence(hash);
  }
 }
 const admitted=await admittedStudyCatalog({...catalog,registry:admissions});
 for(const [key,{kind,value}] of documents)if(admissions.documents[key]){
  if(kind==='lesson')assert(admitted.lessonIds.has(value.id),'Registered lesson has unadmitted prerequisites or difficulty connections');
  if(kind==='path')assert(admitted.pathIds.has(value.id),'Registered path has an unadmitted lesson');
 }
 if(keys.some(key=>key.startsWith('lesson/')||key.startsWith('tier/')))assert(admitted.relationships,'Public lessons and tiers require reviewed difficulty relationships');
 if(requireComplete)assert(keys.length===documents.size,'Study release review is incomplete');
 return {version:'study-admission-verification-2',registeredDocuments:keys.length,authoredDocuments:documents.size,admittedLessons:admitted.lessonIds.size,admittedPaths:admitted.pathIds.size,admittedTiers:admitted.tierIds.size,relationships:admitted.relationships,complete:keys.length===documents.size};
}

export function studyEvidenceEnvironment(){
 const directory=process.env.CALCULUS_STUDY_EVIDENCE_DIR,inventory=process.env.CALCULUS_STUDY_BANK_INVENTORY;
 return {...(directory?{readEvidence:evidenceDirectory(directory)}:{}),...(inventory?{readInventory:studyInventoryFile(inventory)}:{})};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(await verifyStudyAdmissions({...studyEvidenceEnvironment(),requireComplete:process.argv.includes('--release')}),null,2));
