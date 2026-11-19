import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CURRENT_CHECKER} from '../lib/math-answer/versioned-grade.mjs';
import {versionedFreeResponseFixture,freeResponseFixture} from './fixtures/free-response.mjs';
import {assertFreeResponseRecord,assertRegisteredFreeResponse,referenceSource} from '../lib/bank/free-response-record.mjs';
import {verifyFreeResponseAdmission} from '../scripts/bank/free-response.mjs';
import {currentCheckerSourceHash,checkerSourceFiles} from '../scripts/bank/checker-source.mjs';
import {verifyCheckerSources} from '../scripts/milestone4/checker-policy.mjs';
import {freeResponseQuestions} from '../lib/server/free-response-questions.mjs';
import {freeResponseEligibilityPolicy,eligibleFreeResponseCatalog} from '../lib/server/free-response-eligibility.mjs';
import {openCompact} from '../scripts/bank/compact.mjs';
import {storeAdmittedFreeResponse} from '../scripts/bank/free-response-storage.mjs';
import {initializeFreeResponseIndex,indexAdmittedFreeResponse} from '../scripts/bank/free-response-index.mjs';

test('v2 source manifest discovers actual helpers while preserving the v1 aggregate',()=>{
 const original=currentCheckerSourceHash(),current=currentCheckerSourceHash(CURRENT_CHECKER.key);
 assert.notEqual(current,original);assert.equal(verifyCheckerSources()[CURRENT_CHECKER.key],current);
 const files=checkerSourceFiles(CURRENT_CHECKER.key);
 for(const name of ['grade','parser','rational','algebra','domain','constant-certificate'])assert(files.includes(`lib/math-answer/v2/${name}.mjs`));
 assert(files.includes('lib/math-answer/versioned-contracts.ts'));assert(files.includes('lib/math-answer/contracts.ts'));
 const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
 const changed=path=>read(path)+(path.endsWith('constant-certificate.mjs')?'\n// source change\n':'');
 assert.notEqual(currentCheckerSourceHash(CURRENT_CHECKER.key,changed),current);
 assert.equal(currentCheckerSourceHash(undefined,changed),original);
 const added=path=>read(path)+(path.endsWith('/v2/grade.mjs')?"\nimport '../feedback.mjs';\n":'');
 assert(checkerSourceFiles(CURRENT_CHECKER.key,added).includes('lib/math-answer/feedback.mjs'));
 for(const statement of ["import('elsewhere');","require('./other.mjs');","import x from 'unbound-package';","import fs = require('node:fs');","import helper = require('./constant-certificate.mjs');"]){
  assert.throws(()=>checkerSourceFiles(CURRENT_CHECKER.key,path=>read(path)+(path.endsWith('/v2/grade.mjs')?'\n'+statement:'')));
 }
 for(const identity of ['future',null,['exact-algebra-2/bounded-latex-2'],{graderVersion:'exact-algebra-2',parserVersion:'bounded-latex-1'}])assert.throws(()=>currentCheckerSourceHash(identity));
});

test('only source-bound v2 entries enter the current registry and one-hash SQL catalog',async()=>{
 const fixture=await versionedFreeResponseFixture(),db=openCompact(':memory:');initializeFreeResponseIndex(db);
 try{
  const checked=await verifyFreeResponseAdmission(fixture.record,fixture);assert.equal(checked.checkerSourceHash,currentCheckerSourceHash(CURRENT_CHECKER.key));
  const saved=await storeAdmittedFreeResponse(db,fixture.record,fixture);await indexAdmittedFreeResponse(db,saved.recordRef,fixture);
  const policy=freeResponseEligibilityPolicy(fixture.admissions);assert.equal(policy.count,1);assert.equal(policy.checkerSourceHash,checked.checkerSourceHash);
  const adapter={prepare:sql=>({bind:(...args)=>({all:async()=>({results:db.prepare(sql).all(...args)})})})};
  const rows=await eligibleFreeResponseCatalog(adapter,{category:'all',difficulty:'easy'},policy);assert.equal(rows.length,1);
  const questions=await freeResponseQuestions([fixture.record],fixture.admissions);assert.deepEqual(questions[0].freeResponse,fixture.record.contract);
  for(const mutate of [
   r=>{r.activeChecker='exact-algebra-1/bounded-latex-1';},
   r=>{Object.values(r.records)[0].checkerKey='exact-algebra-1/bounded-latex-1';},
   r=>{r.checkers[CURRENT_CHECKER.key].checkerSourceHash=currentCheckerSourceHash();Object.values(r.records)[0].checkerSourceHash=currentCheckerSourceHash();},
   r=>{r.checkers[CURRENT_CHECKER.key].parserVersion='bounded-latex-1';},
   r=>{r.checkers.unreviewed={};},r=>{Object.values(r.records)[0].ignored='extra';},
  ]){const registry=structuredClone(fixture.admissions);mutate(registry);assert.throws(()=>freeResponseEligibilityPolicy(registry));await assert.rejects(assertRegisteredFreeResponse(fixture.record,registry));}
  const old=await freeResponseFixture();await assert.rejects(assertRegisteredFreeResponse(old.record,fixture.admissions));
  assert.deepEqual((await freeResponseQuestions([old.record],old.admissions))[0].freeResponse,old.record.contract);
 }finally{db.close();}
});

test('v2 interval admission proves root endpoint order rather than inheriting a v1 parse',async()=>{
 const make=(lower,upper,lowerClosed=false,upperClosed=false)=>versionedFreeResponseFixture({alterContract:c=>{c.allowedOperators=['root'];c.answer={kind:'interval',lower,upper,lowerClosed,upperClosed};c.fixtures=[{source:referenceSource(c.answer),expected:'correct',reason:'Private shape check only.'},{source:'(0,2)',expected:'correct',reason:'Not an executed content admission.'},{source:'(0,3)',expected:'incorrect',reason:'Not an executed content admission.'}];}});
 for(const ends of [[String.raw`\sqrt[3]{2}`,String.raw`\sqrt[3]{3}`],['0',String.raw`\sqrt[3]{256}`],[String.raw`\sqrt[3]{8}`,'2',true,true]])await assertFreeResponseRecord((await make(...ends)).record);
 for(const ends of [[String.raw`\sqrt[3]{3}`,String.raw`\sqrt[3]{2}`],[String.raw`\sqrt[3]{8}`,'2'],[String.raw`\sqrt[3]{-8}`,'2'],[String.raw`\sqrt[3]{ln(3)}`,'2']])await assert.rejects(assertFreeResponseRecord((await make(...ends)).record));
});

test('only detached registries reuse validation, within the bounds of the consuming call', async () => {
  const {boundedJsonSnapshot}=await import('../lib/server/bounded-json-snapshot.mjs');
  const {admissionChecker}=await import('../lib/math-answer/admission-checker.mjs');
  const source={nested:{list:[1,2]}};
  const limits={maxBytes:25,maxNodes:5,maxDepth:3};
  const frozen=boundedJsonSnapshot(source,limits);
  assert.strictEqual(boundedJsonSnapshot(frozen,limits),frozen);
  assert.throws(()=>boundedJsonSnapshot(frozen,{...limits,maxBytes:24}));
  assert.throws(()=>boundedJsonSnapshot(frozen,{...limits,maxNodes:4}));
  assert.throws(()=>boundedJsonSnapshot(frozen,{...limits,maxDepth:2}));
  const fixture=await versionedFreeResponseFixture();
  const registry=structuredClone(fixture.admissions);
  const detached=boundedJsonSnapshot(registry,{maxBytes:10000});
  const policy=freeResponseEligibilityPolicy(detached);
  assert.strictEqual(freeResponseEligibilityPolicy(detached),policy);
  assert.strictEqual(admissionChecker(detached),admissionChecker(detached));
  Object.freeze(registry);
  freeResponseEligibilityPolicy(registry);
  const entry=Object.values(registry.records)[0];
  entry.selectionHash='changed';
  assert.throws(()=>freeResponseEligibilityPolicy(registry));
  entry.checkerKey='unreviewed';
  assert.throws(()=>admissionChecker(registry));
  assert.equal(freeResponseEligibilityPolicy(detached).count,1);
  assert.throws(()=>{Object.values(detached.records)[0].selectionHash='changed';},TypeError);
});
