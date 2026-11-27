import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {studyContentHash,registeredStudyDocument,admittedStudyCatalog,studyDocumentKey} from '../lib/study/admission.mjs';
import {verifyStudyAdmissions,currentStudyPresentationHash,STUDY_PRESENTATION_FILES} from '../scripts/milestone4/verify-study-admissions.mjs';
import {studyTiers} from '../content/study/tiers.mjs';
import {publicStudyBlocks,publicStudySections,publicStudyExample} from '../lib/study/public-content.mjs';

const long='Isolated fixture review explanation; this is not a real teaching or exposure certificate.';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const p=text=>({kind:'prose',text});
const fixture=async({alterLesson=()=>{}}={})=>{
 const lesson={id:'fixture',revision:1,title:'Fixture lesson',summary:long,objectives:[long,long+' Second objective.'],prerequisites:[],related:[],next:[],
  sections:[{id:'method',title:'Fixture method',body:[p(long)]},{id:'check',title:'Fixture check',body:[p(long)]}],
  worked:[{id:'worked',revision:1,title:'Fixture example',problem:[p(long)],solution:[{kind:'math',latex:'1+1=2'}],verification:[long]}],
  exercises:[{id:'transfer',revision:1,title:'Fixture transfer',problem:[p(long)],solution:[p(long)],hints:[[p(long)],[p(long)]],verification:[long]}],
  contrast:[p(long)],alternatives:[p(long)],mistakes:[long],references:[{sourceId:'fixture',url:'https://example.invalid/reference',use:'reference-only'}]};
 alterLesson(lesson);
 const catalog={lessons:[lesson],paths:[],tiers:structuredClone(studyTiers),tierUse:{id:'lesson-tier-use',revision:1,mappings:{fixture:[{tier:'easy',topic:'limits',concept:'algebra',role:'foundation',explanation:long,anchors:['method']}]}}};
 const presentationHash=currentStudyPresentationHash(),admissions={version:'study-admission-1',presentationHash,documents:{}},authorship={version:'study-authorship-1',documents:{}},evidence=new Map();
 const put=value=>{const hash=sha(JSON.stringify(value));evidence.set(hash,value);return hash;};
 const detail=put({detail:long}),expectedBankRelease='isolated-fixture-bank';
 const inventoryBytes=Buffer.from(JSON.stringify({problemId:'cn_11111111111111111111',problemRevision:1,contentHash:'a'.repeat(64)})+'\n');
 const expectedBank={version:'study-bank-snapshot-1',releaseId:expectedBankRelease,inventoryHash:sha(inventoryBytes),recordCount:1,bytes:inventoryBytes.length};
 const bankSnapshotHash=put(expectedBank);
 const checkNames=['literalMathematics','definitionsAndHypotheses','workedExamples','transferExercises','alternativesAndFailures','notationAndRendering','sourceRights','expectedConcepts','prerequisites','reasoningProgression','rankDistinction','actualTeachingAnchors','tierFit','boundedRoles','uncoveredConcepts'];
 const exposureNames=['sections','worked','contrast','exercises','alternatives','diagrams','summaryObjectives','stepPurposes','readinessPrompts','summaries','concepts','reasoning','explanations','anchors'];
 for(const [kind,values]of Object.entries({lesson:catalog.lessons,tier:catalog.tiers,relationships:[catalog.tierUse]}))for(const value of values){
  const key=studyDocumentKey(kind,value),contentHash=await studyContentHash(value),authors=['fixture-author'];
  authorship.documents[key]={contentHash,authors,provenanceHash:put({version:'study-authorship-evidence-1',key,contentHash,authors,sourceHistory:long})};
  const entry={contentHash,presentationHash,reviewHash:put({version:'study-document-review-1',decision:'reviewed',key,contentHash,presentationHash,author:'fixture-author',reviewer:'fixture-reviewer',checks:Object.fromEntries(checkNames.map(k=>[k,long])),evidenceHashes:[detail]})};
  entry.exposureDecision='distinct';
  entry.exposureHash=put({version:'study-exposure-review-1',decision:'distinct',key,contentHash,presentationHash,author:'fixture-author',reviewer:'fixture-exposure-reviewer',bankSnapshotHash,checks:Object.fromEntries(exposureNames.map(k=>[k,long])),evidenceHashes:[detail]});
  admissions.documents[key]=entry;
 }
 return {catalog,admissions,authorship,expectedBank,presentationHash,expectedBankRelease,readInventory:()=>inventoryBytes,readEvidence:hash=>{assert(evidence.has(hash),'Missing evidence bytes');return evidence.get(hash);},evidence};
};

test('authored review flags never publish a lesson without an exact external registration',async()=>{
 const f=await fixture(),lesson=f.catalog.lessons[0];
 assert.equal(await registeredStudyDocument('lesson',lesson,f.admissions),true);
 lesson.review={status:'reviewed',evidence:'self-asserted',contentHash:'0'.repeat(64)};lesson.exposureAudit={status:'distinct',evidence:'self-asserted'};
 assert.equal(await registeredStudyDocument('lesson',lesson,{version:'study-admission-1',documents:{}}),false);
 lesson.title='Different teaching content';assert.equal(await registeredStudyDocument('lesson',lesson,f.admissions),false);
 const clean=await fixture();clean.admissions.documents['lesson/fixture@1'].reviewHash=[clean.admissions.documents['lesson/fixture@1'].reviewHash];assert.equal(await registeredStudyDocument('lesson',clean.catalog.lessons[0],clean.admissions),false);
});
test('study admission verifies bound review, actual authors, presentation and every public exposure surface',async()=>{
 const f=await fixture();const result=await verifyStudyAdmissions({...f,requireComplete:true});assert(result.complete);assert.equal(result.admittedLessons,1);
 for(const change of [
  g=>{g.admissions.documents['lesson/fixture@1'].contentHash='0'.repeat(64);},
  g=>{g.admissions.documents['lesson/fixture@1'].exposureDecision='mapped';},
  g=>{g.evidence.delete(g.admissions.documents['lesson/fixture@1'].reviewHash);},
  g=>{g.readEvidence=()=>({version:'study-document-review-1',decision:'reviewed'});},
  g=>{g.evidence.get(g.admissions.documents['lesson/fixture@1'].reviewHash).reviewer=' FIXTURE-AUTHOR ';},
  g=>{delete g.evidence.get(g.admissions.documents['lesson/fixture@1'].reviewHash).checks.literalMathematics;},
  g=>{const e=g.evidence.get(g.admissions.documents['lesson/fixture@1'].exposureHash);e.author='someone-else';e.reviewer='fixture-author';},
  g=>{g.authorship.documents={};},
  g=>{g.presentationHash='0'.repeat(64);},
  g=>{g.admissions.documents['tier/easy@1'].exposureDecision='mapped';},
  g=>{delete g.evidence.get(g.admissions.documents['relationships/lesson-tier-use@1'].exposureHash).checks.explanations;},
  g=>{g.expectedBankRelease='a-new-bank-release';},
  g=>{g.evidence.delete(g.evidence.get(g.admissions.documents['lesson/fixture@1'].exposureHash).bankSnapshotHash);},
  g=>{g.readInventory=()=>Buffer.from('different inventory');},
  g=>{g.expectedBank={...g.expectedBank,recordCount:999};},
 ]){const g=await fixture();change(g);await assert.rejects(verifyStudyAdmissions({...g,requireComplete:true}));}
});
test('missing tiers, prerequisite reviews and relationships cannot silently disappear from a public lesson',async()=>{
 for(const change of [
  g=>{delete g.admissions.documents['tier/easy@1'];},
  g=>{for(const key of Object.keys(g.admissions.documents))if(key.startsWith('tier/'))delete g.admissions.documents[key];},
  g=>{delete g.admissions.documents['relationships/lesson-tier-use@1'];},
 ]){
  const f=await fixture();change(f);const admitted=await admittedStudyCatalog({...f.catalog,registry:f.admissions});assert.equal(admitted.lessonIds.size,0);await assert.rejects(verifyStudyAdmissions(f));
 }
 const f=await fixture(),lesson=f.catalog.lessons[0];lesson.prerequisites=['missing'];
 f.admissions.documents['lesson/fixture@1'].contentHash=await studyContentHash(lesson);
 const admitted=await admittedStudyCatalog({...f.catalog,registry:f.admissions});assert.equal(admitted.lessonIds.size,0);
 await assert.rejects(verifyStudyAdmissions(f),/pathway structure/);
});
test('an exact registered hash does not waive full lesson shape and strict rendering checks',async()=>{
 for(const alterLesson of [l=>{delete l.title;},l=>{l.worked[0].solution=[{kind:'math',latex:String.raw`\invalidmathcommand{x}`}];},l=>{l.sections[0].body=[{kind:'diagram',id:'not-written'}];},l=>{l.exercises[0].hints=[];},l=>{l.sections[0].body=[{kind:'invented',id:'cubic-tangent'}];}]){
  const f=await fixture({alterLesson});await assert.rejects(verifyStudyAdmissions(f));
 }
});
test('study evidence callbacks cannot change the catalog, registry or author binding after validation starts',async()=>{
 const f=await fixture(),read=f.readEvidence;
 f.readEvidence=hash=>{f.catalog.lessons[0].title='Substituted title';f.admissions.documents={};f.authorship.documents={};return read(hash);};
 const result=await verifyStudyAdmissions({...f,requireComplete:true});assert(result.complete);assert.equal(result.admittedLessons,1);
});
test('future study content cannot display raw math in plain fields or change notation after review',async()=>{
 for(const alterLesson of [
  l=>{l.title=String.raw`About \(x^2\)`;},
  l=>{l.summary=String.raw`About \(x^2\)`;},
  l=>{l.sections[0].title=String.raw`About \(x^2\)`;},
  l=>{l.worked[0].title=String.raw`About \(x^2\)`;},
  l=>{l.exercises[0].title=String.raw`About \(x^2\)`;},
  l=>{l.readiness=[{lessonId:'fixture',exerciseId:'transfer',prompt:String.raw`Check \(x^2\)`}];},
  l=>{l.objectives[0]=String.raw`About \[x^2\]`;},
  l=>{l.sections[0].body=[p('About $x^2$')];},
  l=>{l.worked[0].solution=[{kind:'math',latex:String.raw`\log(x)`}];},
  l=>{l.sections[0].privateBankMapping=['private'];},
  l=>{l.exercises[0].hints[0][0].privateBankMapping=['private'];},
  l=>{l.references[0].url=['https://example.invalid/reference',{privateBankMapping:['private']}];},
  l=>{l.objectives=Array(2);},
  l=>{l.mistakes=Array(1);},
  l=>{l.worked[0].verification=Array(1);},
 ]){const f=await fixture({alterLesson});await assert.rejects(verifyStudyAdmissions(f));}
 const f=await fixture({alterLesson:l=>{l.objectives[0]=String.raw`Explain \(\ln(x)\) on its real domain.`;}});
 assert((await verifyStudyAdmissions(f)).complete);
});
test('nested public teaching projections never forward private authoring fields',()=>{
 const privateBankMapping=['private'],block={kind:'math',latex:'x^2',privateBankMapping};
 assert.deepEqual(publicStudyBlocks([block]),[{kind:'math',latex:'x^2'}]);
 assert.deepEqual(publicStudySections([{id:'method',title:'Method',body:[block],privateBankMapping}]),[{id:'method',title:'Method',body:[{kind:'math',latex:'x^2'}]}]);
 const example=publicStudyExample({id:'example',revision:1,title:'Example',problem:[block],solution:[block],verification:['private'],privateBankMapping});
 assert(!JSON.stringify(example).includes('private'));
 assert.throws(()=>publicStudyBlocks([{kind:'invented',privateBankMapping}]));
});

test('all local runtime inputs to Study readers are presentation-bound or separately reviewed documents',async()=>{
 const {build}=await import('esbuild');
 const root=fileURLToPath(new URL('../',import.meta.url));
 // These document exports are hashed after construction. The registration reads
 // the presentation hash, so including the registry itself would be circular.
 const separate=new Set([
  'content/study/catalog.mjs','content/study/path-catalog.mjs','content/study/tiers.mjs','content/study/lesson-tier-use.mjs',
  'lib/server/study-admissions.json',
 ]);
 const routes=readdirSync(resolve(root,'app/study'),{recursive:true})
  .filter(path=>path==='page.tsx'||path.endsWith('/page.tsx')).map(path=>'app/study/'+path);
 const {metafile}=await build({
  absWorkingDir:root,entryPoints:routes,
  bundle:true,format:'esm',platform:'neutral',packages:'external',write:false,metafile:true,outdir:'unused-study-output',
 });
 const inputs=new Set();
 const pending=[...routes];
 while(pending.length){
  const path=pending.pop();
  if(separate.has(path)||inputs.has(path))continue;
  inputs.add(path);
  for(const dependency of metafile.inputs[path].imports)if(!dependency.external)pending.push(dependency.path);
 }
 const uncovered=[...inputs].filter(path=>!STUDY_PRESENTATION_FILES.includes(path));
 assert.deepEqual(uncovered,[]);
 assert.ok(inputs.has('content/study/reference-titles.json'));
});

test('a Test practice presentation review only carries the exact Test page change', async () => {
  const { createHash } = await import('node:crypto');
  const { canonical } = await import('../lib/bank/compact-codec.mjs');
  const { beforeTestPracticeReview } = await import('../scripts/milestone4/verify-study-admissions.mjs');
  const hash = value => createHash('sha256').update(canonical(value)).digest('hex');
  const page = 'app/play/test/page.tsx';
  const older = { [page]: hash('before'), 'other.ts': hash('same') };
  const newer = { ...older, [page]: hash('after') };
  const review = { version: 'study-test-practice-review-1', before: older[page],
    after: newer[page], predecessor: hash(older), successor: hash(newer) };
  assert.deepEqual(beforeTestPracticeReview(review, newer), older);
  assert.throws(() => beforeTestPracticeReview(review, { ...newer, [page]: hash('stale') }));
  assert.throws(() => beforeTestPracticeReview(review, { ...newer, 'other.ts': hash('changed') }));
  assert.throws(() => beforeTestPracticeReview({ ...review, before: hash('other') }, newer));
});

test('a Study drill availability review covers only the reader and the recorded predecessor', async () => {
  const { createHash } = await import('node:crypto');
  const { canonical } = await import('../lib/bank/compact-codec.mjs');
  const { beforeDrillAvailabilityReview } = await import('../scripts/milestone4/verify-study-admissions.mjs');
  const hash = value => createHash('sha256').update(canonical(value)).digest('hex');
  const reader = 'components/study/StudyLessonReader.tsx';
  const previous = { [reader]: hash('previous reader'), 'other.ts': hash('other file') };
  const current = { ...previous, [reader]: hash('current reader') };
  const review = { version: 'study-drill-availability-review-1', before: previous[reader],
    after: current[reader], predecessor: hash(previous), successor: hash(current) };
  assert.deepEqual(beforeDrillAvailabilityReview(review, current), previous);
  assert.throws(() => beforeDrillAvailabilityReview(review, { ...current, [reader]: previous[reader] }));
  assert.throws(() => beforeDrillAvailabilityReview(review, { ...current, 'other.ts': hash('changed') }));
  assert.throws(() => beforeDrillAvailabilityReview({ ...review, predecessor: hash('unrelated') }, current));
  assert.throws(() => beforeDrillAvailabilityReview({ ...review, version: 'study-test-practice-review-1' }, current));
});

test('the security bridge accepts only its reviewed package, control and drill sources', async () => {
 const {beforeSecurityPresentation}=await import('../scripts/milestone4/verify-study-admissions.mjs');
 const {canonical}=await import('../lib/bank/compact-codec.mjs');
 const sha=value=>createHash('sha256').update(canonical(value)).digest('hex');
 const files=['package.json','package-lock.json','lib/server/round-creation-policy.json','lib/server/study-practice-activation.json'];
 const before=Object.fromEntries(files.map(path=>[path,sha(path+' old')]));
 const after=Object.fromEntries(files.map(path=>[path,sha(path+' new')]));
 const changes=Object.fromEntries(files.map(path=>[path,{before:before[path],after:after[path]}]));
 const counts={total:1,identical:1,changed:[]},markup={before:{lockSha256:before['package-lock.json']},
  after:{lockSha256:after['package-lock.json']},pages:{lessons:counts,paths:counts,tiers:counts}};
 const drills={policy:sha('policy'),db:sha('db'),reviewOnly:false,scopes:[1,2]};
 const table=new Map([[sha(markup),markup],[sha(drills),drills]]);
 const read=key=>table.get(key);
 const review={version:'study-security-presentation-1',changes,predecessor:sha(before),successor:sha(after),
  support:{selectorProof:sha(drills),readerMarkup:sha(markup),servedScopes:1,checkedFormats:2,lessonPages:1,pathPages:1,tierPages:1}};
 assert.deepEqual(beforeSecurityPresentation(review,after,read),before);
 assert.throws(()=>beforeSecurityPresentation({...review,changes:{...changes,'extra.ts':changes['package.json']}},after,read));
 assert.throws(()=>beforeSecurityPresentation(review,{...after,'other.ts':sha('extra')},read));
 assert.throws(()=>beforeSecurityPresentation({...review,predecessor:sha('unrelated')},after,read));
 assert.throws(()=>beforeSecurityPresentation(review,after,k=>k===sha(drills)?{...drills,reviewOnly:true}:read(k)));
 assert.throws(()=>beforeSecurityPresentation(review,after,k=>k===sha(markup)?{...markup,pages:{...markup.pages,paths:{...counts,identical:0}}}:read(k)));
});

test('question-selection copy review binds the six source changes and every previously verified drill',async()=>{
 const {beforeSelectionCopyPresentation}=await import('../scripts/milestone4/verify-study-admissions.mjs');
 const {canonical}=await import('../lib/bank/compact-codec.mjs');
 const sha=s=>createHash('sha256').update(s).digest('hex');
 const fileSha=v=>sha(JSON.stringify(v,null,2)+'\n');
 const paths=['bank-selection.ts','compact-bank-selection.ts','free-response-selection.mjs','game-api.ts','joint-selection-error.mjs','runtime-api.ts'].map(n=>'lib/server/'+n);
 const source=(side)=>Object.fromEntries(paths.map(p=>[p,sha(side+p)]));
 const evidence=new Map(), proofId=(v)=>{const h=fileSha(v);evidence.set(h,v);return h;};
 const scopes=['multiple-choice','free-response'].map(format=>({scope:'limits/easy/*',format,rounds:5,example:sha(format)}));
 function makeSide(label,version){
  const body={version:'round-creation-policy-v1',sourceHashes:{...source(label),'other':sha('fixed')},policy:{selection:'same selector'},registryHash:sha('registry')};
  const policy={...body,digest:sha(canonical(body))};
  const activation={version:1,control:{epoch:version+10,version,incarnation:sha('catalog'),policy:policy.digest},formats:{'limits/easy/*':['multiple-choice','free-response']}};
  const selectorProof=proofId({reviewOnly:false,policy:policy.digest,db:sha(label),operator:sha('operator'),registry:sha('saved registry'),scopes});
  return {policy,activation,selectorProof};
 }
 const slices=x=>({'lib/server/round-creation-policy.json':fileSha(x.policy),'lib/server/study-practice-activation.json':fileSha(x.activation),'page.tsx':sha('same page')});
 const before=makeSide('before',5),after=makeSide('after',8);
 const old=slices(before),current=slices(after);
 const receipt={version:'study-selection-copy-presentation-1',predecessor:sha(canonical(old)),successor:sha(canonical(current)),before,after};
 const read=h=>evidence.get(h);
 assert.deepEqual(beforeSelectionCopyPresentation(receipt,current,read,before.selectorProof),old);
 assert.throws(()=>beforeSelectionCopyPresentation(receipt,current,read,sha('different predecessor selector proof')));
 assert.throws(()=>beforeSelectionCopyPresentation({...receipt,predecessor:sha('unknown')},current,read,before.selectorProof));
 assert.throws(()=>beforeSelectionCopyPresentation(receipt,{...current,'page.tsx':sha('changed')},read,before.selectorProof));
 const failed={...read(after.selectorProof),scopes:[{...scopes[0],example:sha('different problem')},scopes[1]]};
 assert.throws(()=>beforeSelectionCopyPresentation({...receipt,after:{...after,selectorProof:proofId(failed)}},current,read,before.selectorProof));
 const unexpected=structuredClone(after);unexpected.policy.sourceHashes.other=sha('new code');
 const {digest,...body}=unexpected.policy;unexpected.policy.digest=sha(canonical(body));unexpected.activation.control.policy=unexpected.policy.digest;
 unexpected.selectorProof=proofId({...read(after.selectorProof),policy:unexpected.policy.digest});
 const changed=slices(unexpected);
 assert.throws(()=>beforeSelectionCopyPresentation({...receipt,after:unexpected,successor:sha(canonical(changed))},changed,read,before.selectorProof));
});
