import test from 'node:test';
import assert from 'node:assert/strict';
import {openCompact} from '../scripts/bank/compact.mjs';
import {initializeFreeResponseIndex,indexAdmittedFreeResponse} from '../scripts/bank/free-response-index.mjs';
import {storeAdmittedFreeResponse} from '../scripts/bank/free-response-storage.mjs';
import {freeResponseFixture} from './fixtures/free-response.mjs';
import {sourceFixture} from './fixtures/source-bank.mjs';
import {eligibleMixedQuestionCatalog,MIXED_CATALOG_SQL} from '../lib/server/mixed-question-catalog.mjs';
import {recordExposures} from '../lib/bank/exposure.ts';
import {reserveQuestionSet,ReservationConflictError} from '../lib/bank/issuance-reservations.mjs';
const adapter=(db,before=()=>{})=>({prepare:sql=>({bind:(...args)=>({all:async()=>{before(sql);return {results:db.prepare(sql).all(...args)};}})})});
async function fixture(){
 const db=openCompact(':memory:');initializeFreeResponseIndex(db);const origin=await sourceFixture(db);
 const f=await freeResponseFixture({alterTask:t=>{t.origin=origin;t.difficulty='medium';}});
 const stored=await storeAdmittedFreeResponse(db,f.record,f);await indexAdmittedFreeResponse(db,stored.recordRef,f);
 return {db,f,origin,stored};
}
const input={category:'all',difficulty:'medium'};
test('one coherent query supplies both formats without payloads and preserves cross-format identities',async()=>{
 const {db,f,origin}=await fixture();try{
 let calls=0;const value=await eligibleMixedQuestionCatalog(adapter(db,()=>calls++),input,{},1000,f.admissions);
 assert.equal(calls,1);assert.equal(value.candidates.length,2);assert.deepEqual(value.counts,{'multiple-choice':1,'free-response':1});
 assert.equal(new Set(value.candidates.map(r=>r.lineage_id)).size,1);
 assert.equal(new Set(value.candidates.map(r=>r.family_id)).size,1);
 assert.equal(value.candidates.find(r=>r.response_format==='multiple-choice').content_hash,origin.contentHash);
 assert(Object.isFrozen(value.candidates[0]));assert(!JSON.stringify(value).includes('2x'));
 for(const field of ['payload_gzip','statement','answer','contract'])assert(value.candidates.every(r=>!Object.hasOwn(r,field)));
 }finally{db.close();}
});
test('actual MC tags and FR technique filters never silently widen a request',async()=>{
 const {db,f}=await fixture();try{
 db.exec("INSERT INTO cbank_pools VALUES(2,'source-mc','differentiation','medium','power-rule','mc-fixture',1); INSERT INTO cbank_slots VALUES(2,0,1);");
 for(const [filter,expected]of [[{tag:'power-rule'},2],[{tag:'not-present'},0],[{category:'limits'},0],[{difficulty:'easy'},0]]){
  assert.equal((await eligibleMixedQuestionCatalog(adapter(db),{...input,...filter},{},1000,f.admissions)).candidates.length,expected);
 }
 }finally{db.close();}
});
test('MC and FR retained IDs each suppress equivalent mathematics in BOTH formats',async()=>{
 const {db,f,origin}=await fixture();try{
 for(const id of [origin.problemId,f.record.task.problemId,'old-task']){
  if(id==='old-task')db.prepare('INSERT INTO cbank_problem_lineage VALUES(?,?)').run(id,origin.lineageId);
  const value=await eligibleMixedQuestionCatalog(adapter(db),input,{problems:[id]},1000,f.admissions);
  assert.equal(value.candidates.length,2);assert(value.candidates.every(r=>r.history_blocked===1));
 }
 }finally{db.close();}
});
test('current source exclusions and family withdrawals remove both MC and its conversion',async()=>{
 for(const change of ["INSERT INTO cbank_release_exclusions VALUES('source-mc',1,'active','fixture')", "INSERT INTO cbank_release_exclusions VALUES('policy-update',1,'global','fixture')", "INSERT INTO cbank_withdrawn_families VALUES('source-mc','mc-fixture','policy-update','fixture')", "UPDATE cbank_publication SET state='retired' WHERE problem_ref=1"]){
  const {db,f}=await fixture();try{db.exec(change);assert.equal((await eligibleMixedQuestionCatalog(adapter(db),input,{},1000,f.admissions)).candidates.length,0);}finally{db.close();}
 }
});
test('full retained plus reserved histories block both formats in the coherent catalog query',async()=>{
 const {db,f,origin}=await fixture();try{
  const retained=recordExposures({},'old',Array.from({length:512},(_,i)=>({problemId:`old-${i}`,lineageId:`old-l-${i}`,familyId:'family'})),'attempted',1000);
  let held={};for(let r=0;r<4;r++)held=reserveQuestionSet(held,`round-${r}`,Array.from({length:20},(_,i)=>r===3&&i===19?{problemId:origin.problemId,lineageId:origin.lineageId}:{problemId:`held-${r}-${i}`,lineageId:`held-l-${r}-${i}`}),'issued',1000);
  const history={...retained,...held};const value=await eligibleMixedQuestionCatalog(adapter(db),input,history,2000,f.admissions);
  assert.equal(value.retainedIds.length,1184);assert.equal(value.candidates.length,2);assert(value.candidates.every(r=>r.history_blocked===1));
  let calls=0;const never={prepare(){calls++;throw Error('No query expected');}};
  await assert.rejects(eligibleMixedQuestionCatalog(never,input,{...history,reservationOverflowUntil:3000},2000,f.admissions),ReservationConflictError);assert.equal(calls,0);
 }finally{db.close();}
});
test('FR withdrawal and missing registration cannot remove independent eligible MC',async()=>{
 const {db,f,stored}=await fixture();try{
 assert.deepEqual((await eligibleMixedQuestionCatalog(adapter(db),input,{},1000)).candidates.map(r=>r.response_format),['multiple-choice']);
 db.prepare('INSERT INTO frbank_withdrawals VALUES(?,?,?)').run(stored.recordRef,'fixture',1001);
 assert.deepEqual((await eligibleMixedQuestionCatalog(adapter(db),input,{},1000,f.admissions)).candidates.map(r=>r.response_format),['multiple-choice']);
 }finally{db.close();}
});
test('SQL bounds malformed metadata before materialization; owner projection rejects it',async()=>{
 const {db,f}=await fixture();try{
 db.prepare('INSERT INTO cbank_selection_features VALUES(?,?,?,?,?,?)').run(1,'x'.repeat(100000),'shape','power-rule','execution:power-rule',1);
 let raw;
 const api={prepare:sql=>({bind:(...args)=>({all:async()=>{raw=db.prepare(sql).all(...args);return{results:raw};}})})};
 await assert.rejects(eligibleMixedQuestionCatalog(api,input,{},1000,f.admissions),/oversized/);
 const mc=raw.find(r=>r.response_format==='multiple-choice');assert.equal(mc.selection_valid,0);assert.equal(mc.metadata_json,'{}');
 }finally{db.close();}
});
test('invalid filters/history reject before SQL and mutations cannot change prepared policy',async()=>{
 const {db,f}=await fixture();try{
 const never={prepare(){throw Error('unexpected SQL');}};
 for(const request of [{...input,category:'invented'},{...input,tag:'x'.repeat(1000)},{...input,includeLegacy:1}])await assert.rejects(eligibleMixedQuestionCatalog(never,request),/Invalid mixed/);
 await assert.rejects(eligibleMixedQuestionCatalog(never,input,{version:2,exposures:[{stage:'fake'}]}),/Invalid exposure/);
 const mutable={...input};const value=await eligibleMixedQuestionCatalog(adapter(db,()=>{mutable.difficulty='hard';f.admissions.records={};}),mutable,{},1000,f.admissions);
 assert.equal(value.candidates.length,2);
 }finally{db.close();}
});
test('same query observes a just-inserted alias and source withdrawal without alternating reads',async()=>{
 for(const kind of ['alias','withdraw']){
 const {db,f}=await fixture();try{
 let calls=0;const value=await eligibleMixedQuestionCatalog(adapter(db,sql=>{calls++;assert.equal(sql,MIXED_CATALOG_SQL);if(kind==='alias')db.prepare('INSERT INTO cbank_problem_lineage VALUES(?,?)').run('old-task',f.record.task.lineageId);else db.exec("INSERT INTO cbank_release_exclusions VALUES('policy-update',1,'global','fixture')");}),input,{problems:['old-task']},1000,f.admissions);
 assert.equal(calls,1);if(kind==='alias'){assert.equal(value.candidates.length,2);assert(value.candidates.every(r=>r.history_blocked===1));}else assert.equal(value.candidates.length,0);
 }finally{db.close();}
 }
});

test('newer FR classification supersedes older task before filtering and ambiguous contracts reject',async()=>{
 const {db,f}=await fixture();try{
 const newer=await freeResponseFixture({alterTask:t=>{t.origin=f.record.task.origin;t.problemRevision=2;t.difficulty='hard';}});
 const stored=await storeAdmittedFreeResponse(db,newer.record,newer);await indexAdmittedFreeResponse(db,stored.recordRef,newer);
 const admissions={...f.admissions,records:{...f.admissions.records,...newer.admissions.records}};
 assert.deepEqual((await eligibleMixedQuestionCatalog(adapter(db),input,{},1000,admissions)).candidates.map(r=>r.response_format),['multiple-choice']);
 assert.equal((await eligibleMixedQuestionCatalog(adapter(db),{...input,difficulty:'hard'},{},1000,admissions)).candidates[0].revision,2);
 const other=await freeResponseFixture({alterTask:t=>{t.origin=f.record.task.origin;t.problemRevision=2;t.difficulty='hard';},alterContract:c=>{c.contractId='other-contract';}});
 const alternate=await storeAdmittedFreeResponse(db,other.record,other);await indexAdmittedFreeResponse(db,alternate.recordRef,other);
 const ambiguous={...admissions,records:{...admissions.records,...other.admissions.records}};
 await assert.rejects(eligibleMixedQuestionCatalog(adapter(db),input,{},1000,ambiguous),/Ambiguous current/);
 }finally{db.close();}
});
test('obsolete ambiguous contracts do not hide a unique newer revision in either row order',async()=>{
 const {db,f}=await fixture();try{
 const records=[f];
 for(const [revision,contractId]of [[1,'obsolete-alternative'],[2,'current-contract']]){
  const next=await freeResponseFixture({alterTask:t=>{t.origin=f.record.task.origin;t.problemRevision=revision;t.difficulty='medium';},alterContract:c=>{c.contractId=contractId;}});
  const stored=await storeAdmittedFreeResponse(db,next.record,next);await indexAdmittedFreeResponse(db,stored.recordRef,next);records.push(next);
 }
 const admissions={...f.admissions,records:Object.assign({},...records.map(r=>r.admissions.records))};
 for(const reverse of [false,true]){
  const reversed={prepare:sql=>({bind:(...args)=>({all:async()=>{const rows=db.prepare(sql).all(...args);return{results:reverse?rows.reverse():rows};}})})};
  const result=await eligibleMixedQuestionCatalog(reversed,input,{},1000,admissions);
  assert.equal(result.candidates.filter(r=>r.response_format==='free-response').length,1);
  assert.equal(result.candidates.find(r=>r.response_format==='free-response').revision,2);
 }
 }finally{db.close();}
});
test('metadata overflow is unsupported rather than truncated or reported as exhaustion',async()=>{
 const {db,f}=await fixture();try{
 let base;await eligibleMixedQuestionCatalog({prepare:sql=>({bind:(...args)=>({all:async()=>{base=db.prepare(sql).all(...args);return{results:base};}})})},input,{},1000,f.admissions);
 const mc=base.find(r=>r.response_format==='multiple-choice');
 const huge={prepare:()=>({bind:()=>({all:async()=>({results:Array(6001).fill(mc)})})})};
 await assert.rejects(eligibleMixedQuestionCatalog(huge,input,{},1000,f.admissions),/supported bound/);
 const corrupt=structuredClone(base);const row=corrupt.find(r=>r.response_format==='free-response'),metadata=JSON.parse(row.metadata_json);metadata.idea='invented-idea';row.metadata_json=JSON.stringify(metadata);
 await assert.rejects(eligibleMixedQuestionCatalog({prepare:()=>({bind:()=>({all:async()=>({results:corrupt})})})},input,{},1000,f.admissions),/Unbound FR/);
 }finally{db.close();}
});

test('an unregistered historical FR resolves its lineage once for the complete mixed catalog',async()=>{
 const {db,f,origin}=await fixture();
 try{
  const historical=await freeResponseFixture({alterTask(task){
   task.problemId='cn_12345123451234512345';
   task.origin=origin;
   task.difficulty='medium';
  }});
  await storeAdmittedFreeResponse(db,historical.record,historical);
  let plan;
  const observed={prepare:sql=>({bind:(...args)=>({all:async()=>{
   plan=db.prepare('EXPLAIN QUERY PLAN '+sql).all(...args);
   return {results:db.prepare(sql).all(...args)};
  }})})};
  const saved={problems:[historical.record.task.problemId]};
  const catalog=await eligibleMixedQuestionCatalog(observed,input,saved,1000,f.admissions);
  assert.deepEqual(catalog.candidates.map(row=>row.response_format).sort(),['free-response','multiple-choice']);
  assert(catalog.candidates.every(row=>row.history_blocked===1));
  for(const name of ['blocked','mc_aliases','fr_aliases','aliases']){
   assert.equal(plan.filter(step=>step.detail==='MATERIALIZE '+name).length,1,name);
  }
 }finally{db.close();}
});
