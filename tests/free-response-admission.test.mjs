import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {frDigest,admissionKey,assertFreeResponseRecord,assertRegisteredFreeResponse,referenceSource} from '../lib/bank/free-response-record.mjs';
import {verifyFreeResponseAdmission,evidenceDirectory,currentCheckerSourceHash} from '../scripts/bank/free-response.mjs';
import actualRegistry from '../lib/server/free-response-admissions.json' with {type:'json'};
import {LEGACY_FAMILIES} from '../lib/bank/legacy-origin.mjs';

import {freeResponseFixture as fixture} from './fixtures/free-response.mjs';

test('FR admission executes finite fixtures and requires exact external registration',async()=>{
 const f=await fixture();assert.equal((await verifyFreeResponseAdmission(f.record,f)).fixtures,3);
 await assert.rejects(verifyFreeResponseAdmission(f.record,{readEvidence:f.readEvidence}),/checker changed/);
 await assert.rejects(assertRegisteredFreeResponse(f.record,actualRegistry),/Unregistered/);
 const changed=structuredClone(f.record);changed.contract.instructions+=' Please type carefully.';
 await assert.rejects(assertFreeResponseRecord(changed),/contract hash/);
 changed.contract.contractHash=await frDigest(Object.fromEntries(Object.entries(changed.contract).filter(([k])=>k!=='contractHash')));
 await assert.rejects(assertRegisteredFreeResponse(changed,f.admissions),/Unknown or changed/);
 await assert.rejects(verifyFreeResponseAdmission(f.record,{...f,checkerSourceHash:'0'.repeat(64)}),/checker changed/);
});
test('FR admission binds actual task, fixtures, independent author and per-item disposition',async()=>{
 for(const options of [
  {alterMath:m=>{m.taskContentHash='0'.repeat(64);}},
  {alterMath:m=>{m.fixturesHash='0'.repeat(64);}},
  {alterMath:m=>{m.reviewer=m.author;}},
  {alterMath:m=>{m.reviewer='  FIXTURE-AUTHOR  ';}},
  {alterMath:m=>{delete m.checks.wholeDomain;}},
  {alterReview:r=>{r.decision='defer';}},
  {alterReview:r=>{r.lineage.origin={kind:'bank'};}},
  {alterReview:r=>{r.difficulty='hard';}},
  {alterContract:c=>{c.fixtures[2].source='2*x';}}
 ]){const f=await fixture(options);await assert.rejects(verifyFreeResponseAdmission(f.record,f));}
});
test('interval contracts need justified endpoint order and a nonempty interval',async()=>{
 const interval=async(lower,upper,lowerClosed=false,upperClosed=false)=>fixture({alterContract:c=>{c.answer={kind:'interval',lower,upper,lowerClosed,upperClosed};c.allowedOperators=['sqrt'];c.fixtures=[{source:referenceSource(c.answer),expected:'correct',reason:'Isolated interval shape fixture.'},{source:'(0,2)',expected:'correct',reason:'Isolated unused fixture; not a grading proof.'},{source:'(0,3)',expected:'incorrect',reason:'Isolated unused fixture; not a grading proof.'}];}});
 for(const args of [['2','1'],['1','1'],['1','1',true,false],['infinity','2'],['1','infinity',false,true],['-infinity','1',true,false],['sqrt(2)','sqrt(3)']])await assert.rejects(assertFreeResponseRecord((await interval(...args)).record));
 for(const args of [['1','2'],['1','1',true,true],['-infinity','infinity'],['2','pi'],['0','sqrt(2)']])await assertFreeResponseRecord((await interval(...args)).record);
});
test('identity fields cannot be coerced from arrays and served prose math is validated',async()=>{
 for(const options of [{alterTask:t=>{t.problemId=[t.problemId];}},{alterContract:c=>{c.contractId=[c.contractId];}},{alterContract:c=>{c.answer.variable=['x'];}}])await assert.rejects(assertFreeResponseRecord((await fixture(options)).record));
 for(const options of [{alterTask:t=>{t.assumptions=[String.raw`Use \undefinedcommand{x}.`];}},{alterContract:c=>{c.instructions=String.raw`Enter \(\undefinedcommand{x}\).`;}},{alterTask:t=>{t.assumptions=[String.raw`Use \[x\] here.`];}},{alterContract:c=>{c.instructions=String.raw`Use \[x\] here.`;}}]){const f=await fixture(options);await assert.rejects(verifyFreeResponseAdmission(f.record,f));}
 const f=await fixture({alterTask:t=>{t.assumptions=[String.raw`The variable \(x\) is real.`];},alterContract:c=>{c.instructions=String.raw`Enter an expression in \(x\).`;}});await verifyFreeResponseAdmission(f.record,f);
});
test('nonregular evidence files are rejected without waiting for a writer',{skip:process.platform==='win32'},()=>{
 const dir=mkdtempSync(join(tmpdir(),'fr-fifo-'));try{
  const hash='f'.repeat(64),result=spawnSync('mkfifo',[join(dir,`${hash}.json`)]);assert.equal(result.status,0);
  assert.throws(()=>evidenceDirectory(dir)(hash),/Oversized evidence artifact/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('source-MC conversions preserve lineage and difficulty independently; legacy stays excluded',async()=>{
 const origin={kind:'bank',problemId:'cn_11111111111111111111',problemRevision:2,contentHash:'a'.repeat(64),familyId:'mc-fixture',constructionFamilyId:'fixture-derivative',lineageId:'fixture-derivative-square',bankRelease:'mc-fixture-release',mcDifficulty:'medium'};
 const f=await fixture({alterTask:t=>{t.origin=origin;}});await verifyFreeResponseAdmission(f.record,f);assert.equal(f.record.task.origin.mcDifficulty,'medium');assert.equal(f.record.task.difficulty,'easy');
 for(const mutate of [t=>{t.origin={...origin,lineageId:'new-unseen-id'};},t=>{t.origin={...origin,constructionFamilyId:'renamed-origin'};},t=>{t.origin={...origin,constructionFamilyId:LEGACY_FAMILIES[0]};},t=>{t.familyId=LEGACY_FAMILIES[0];},t=>{t.legacy=true;},t=>{t.origin={...origin};t.problemId=origin.problemId;}]){
  const changed=await fixture({alterTask:mutate});await assert.rejects(assertFreeResponseRecord(changed.record));
 }
});
test('malformed or unsupported answer contracts and hidden response fields fail closed',async()=>{
 for(const mutate of [c=>{c.answer={kind:'finite-set',elements:[],multiplicity:'ignore'};},c=>{c.answer.extra='ambiguous';},c=>{c.answer.domain={kind:'interval',lower:null,upper:null,lowerClosed:true,upperClosed:false};},c=>{c.answer.variable='e';},c=>{c.allowedOperators=['eval'];},c=>{c.fixtures.pop();},c=>{c.options=['leak'];},c=>{c.presentation.statement='changed';}]){
  const f=await fixture({alterContract:mutate});await assert.rejects(assertFreeResponseRecord(f.record));
 }
 assert.equal(referenceSource({kind:'tuple',components:[{kind:'scalar',expected:'1/2'},{kind:'outcome',expected:'does-not-exist'}]}),'(1/2,DNE)');
});
test('operator reads verified evidence bytes and never trusts a fabricated path or pass flag',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'fr-evidence-'));try{
  const f=await fixture();for(const[hash,{bytes}]of f.evidence)writeFileSync(join(dir,`${hash}.json`),bytes);
  await verifyFreeResponseAdmission(f.record,{admissions:f.admissions,readEvidence:evidenceDirectory(dir)});
  const hash=f.record.contract.review.evidenceHash;writeFileSync(join(dir,`${hash}.json`),'{}');
  await assert.rejects(verifyFreeResponseAdmission(f.record,{admissions:f.admissions,readEvidence:evidenceDirectory(dir)}),/changed evidence/);
  assert.throws(()=>evidenceDirectory(dir)('../outside'),/Invalid evidence hash/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
