import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {openCompact} from '../scripts/bank/compact.mjs';
import {initializeFreeResponseIndex,indexAdmittedFreeResponse} from '../scripts/bank/free-response-index.mjs';
import {storeAdmittedFreeResponse} from '../scripts/bank/free-response-storage.mjs';
import {sourceFixture} from './fixtures/source-bank.mjs';
import {freeResponseFixture} from './fixtures/free-response.mjs';
import {eligibleMixedQuestionCatalog} from '../lib/server/mixed-question-catalog.mjs';
import {authorizationCatalog,AUTHORIZATION_CATALOG_SQL} from '../lib/server/authorization-catalog.mjs';
const policyHash='c'.repeat(64),incarnation='d'.repeat(64),input={category:'all',difficulty:'medium'};
async function setup({control=true}={}){
 const sql=openCompact(':memory:');initializeFreeResponseIndex(sql);const origin=await sourceFixture(sql);
 const fixture=await freeResponseFixture({alterTask:t=>{t.origin=origin;t.difficulty='medium';}});
 const stored=await storeAdmittedFreeResponse(sql,fixture.record,fixture);await indexAdmittedFreeResponse(sql,stored.recordRef,fixture);
 sql.exec(readFileSync(new URL('../drizzle/0010_round_authorizations.sql',import.meta.url),'utf8'));
 if(control)sql.prepare('INSERT INTO round_authorization_control(id,incarnation,epoch,policy_hash,control_version,enabled) VALUES(1,?,7,?,3,1)').run(Buffer.from(incarnation,'hex'),Buffer.from(policyHash,'hex'));
 const calls=[];let before=()=>{};
 const db={prepare:text=>({bind:(...args)=>({all:async()=>{calls.push(text);before();return{results:sql.prepare(text).all(...args)};}})})};
 const options={policyHash,controlVersion:3,admissions:fixture.admissions,now:1000};
 const mutate=fn=>{sql.exec("BEGIN IMMEDIATE; UPDATE round_authorization_control SET writing=1,writer_id=zeroblob(32)");try{fn();sql.exec('UPDATE round_authorization_control SET writing=0,writer_id=NULL,epoch=epoch+1; COMMIT');}catch(e){sql.exec('ROLLBACK');throw e;}};
 return{sql,db,fixture,origin,calls,options,mutate,before:fn=>{before=fn;},close:()=>sql.close()};
}
test('one statement binds both formats and history flags to epoch, incarnation and millisecond clock',async()=>{
 const f=await setup();try{
  const expected=await eligibleMixedQuestionCatalog(f.db,input,{},1000,f.fixture.admissions);f.calls.length=0;
  const start=Date.now(),actual=await authorizationCatalog(f.db,input,{},f.options),end=Date.now();
  assert.deepEqual(actual.candidates,expected.candidates);assert.deepEqual(f.calls,[AUTHORIZATION_CATALOG_SQL]);
  assert.equal(actual.authorization.epoch,7);assert.equal(actual.authorization.incarnation,incarnation);assert.equal(actual.authorization.policyHash,policyHash);assert.equal(actual.authorization.controlVersion,3);
  assert(actual.authorization.asOf>=start&&actual.authorization.asOf<=end);assert(Object.isFrozen(actual.authorization));
  assert.equal(actual.diagnostics.policy,'mixed-catalog-cell-v2');assert.equal(actual.diagnostics.statements,1);
 }finally{f.close();}
});
test('empty requested cells still capture their control sentinel; missing/disabled control fails closed',async()=>{
 const f=await setup();try{
  const empty=await authorizationCatalog(f.db,{...input,category:'series'}, {},f.options);assert.equal(empty.candidates.length,0);assert.equal(empty.authorization.epoch,7);
  f.sql.exec('UPDATE round_authorization_control SET enabled=0,epoch=8,control_version=4');
  await assert.rejects(authorizationCatalog(f.db,input,{},f.options),/unavailable/);
 }finally{f.close();}
 const missing=await setup({control:false});try{await assert.rejects(authorizationCatalog(missing.db,input,{},missing.options),/control unavailable/);}finally{missing.close();}
});
test('a just committed alias/withdrawal and its epoch are observed together, without alternating reads',async()=>{
 for(const kind of ['alias','withdraw']){
  const f=await setup();try{
   let once=true;f.before(()=>{if(!once)return;once=false;f.mutate(()=>{if(kind==='alias')f.sql.prepare('INSERT INTO cbank_problem_lineage VALUES(?,?)').run('older-input',f.origin.lineageId);else f.sql.exec("INSERT INTO cbank_release_exclusions VALUES('policy-update',1,'global','fixture')");});});
   const result=await authorizationCatalog(f.db,input,{problems:['older-input']},f.options);
   assert.equal(result.authorization.epoch,8);assert.equal(f.calls.length,1);
   if(kind==='alias'){assert.equal(result.candidates.length,2);assert(result.candidates.every(r=>r.history_blocked===1));}else assert.equal(result.candidates.length,0);
  }finally{f.close();}
 }
});
test('moved later MC revisions are considered before cell filtering',async()=>{
 const f=await setup();try{
  // Metadata-only revision fixture. No payload is decoded or admitted here.
  f.mutate(()=>f.sql.exec("INSERT INTO cbank_problems SELECT 2,problem_id,2,zeroblob(32),semantic_hash,shared_id,payload_gzip FROM cbank_problems WHERE problem_ref=1; INSERT INTO cbank_publication VALUES(2,'approved',NULL); INSERT INTO cbank_pools VALUES(2,'source-mc','limits','hard','*','mc-fixture',1); INSERT INTO cbank_slots VALUES(2,0,2);"));
  const actual=await authorizationCatalog(f.db,{...input,category:'differentiation'}, {},f.options);
  assert(actual.candidates.every(r=>r.response_format==='free-response'));assert.equal(actual.candidates.length,1);
  const newer=await authorizationCatalog(f.db,{category:'limits',difficulty:'hard'}, {},f.options);
  assert.equal(newer.candidates.length,1);assert.equal(newer.candidates[0].revision,2);
 }finally{f.close();}
});
test('v2 explicitly localizes unrelated malformed MC errors while still rejecting them in their own cell',async()=>{
 const f=await setup();try{
  f.mutate(()=>{
   f.sql.exec("INSERT INTO cbank_problems SELECT 2,'cn_22222222222222222222',1,zeroblob(32),semantic_hash,shared_id,payload_gzip FROM cbank_problems WHERE problem_ref=1; INSERT INTO cbank_publication VALUES(2,'approved',NULL); INSERT INTO cbank_pools VALUES(2,'source-mc','series','hard','*','mc-fixture',1); INSERT INTO cbank_slots VALUES(2,0,2);");
   f.sql.prepare('INSERT INTO cbank_selection_features VALUES(?,?,?,?,?,?)').run(2,'x'.repeat(2000),'shape','power-rule','execution:power-rule',1);
  });
  await assert.rejects(eligibleMixedQuestionCatalog(f.db,input,{},1000,f.fixture.admissions),/oversized/);
  assert.equal((await authorizationCatalog(f.db,input,{},f.options)).candidates.length,2);
  await assert.rejects(authorizationCatalog(f.db,{category:'series',difficulty:'hard'}, {},f.options),/oversized/);
 }finally{f.close();}
});
test('both historical formats resolve aliases once; oversized lineage fails explicitly',async()=>{
 const f=await setup();try{
  for(const id of [f.origin.problemId,f.fixture.record.task.problemId]){
   const result=await authorizationCatalog(f.db,input,{problems:[id]},f.options);assert(result.candidates.every(r=>r.history_blocked===1));
  }
  f.mutate(()=>f.sql.prepare('INSERT INTO cbank_problem_lineage VALUES(?,?)').run('bad-alias','x'.repeat(257)));
  await assert.rejects(authorizationCatalog(f.db,input,{problems:['bad-alias']},f.options),/Unsupported current history aliases/);
 }finally{f.close();}
});
test('invalid control binding and known account overflow reject before catalog work; arguments detach',async()=>{
 const f=await setup();try{
  await assert.rejects(authorizationCatalog(f.db,input,{}, {...f.options,policyHash:'no'}),/Invalid expected/);assert.equal(f.calls.length,0);
  await assert.rejects(authorizationCatalog(f.db,input,{reservationOverflowUntil:2000},f.options),error=>error.name==='ReservationConflictError');assert.equal(f.calls.length,0);
  const request={...input},admissions=structuredClone(f.fixture.admissions),options={...f.options,admissions};
  f.before(()=>{request.category='series';options.controlVersion=99;admissions.records={};});
  assert.equal((await authorizationCatalog(f.db,request,{},options)).candidates.length,2);
 }finally{f.close();}
});

test('compiled cell scope returns the same eligible revision and historical exposure, with a full-scan fallback',async()=>{
 const {compilePracticeCells}=await import('../scripts/bank/compile-practice-cells.mjs');
 const {eligiblePracticeCatalog,SCOPED_MIXED_CATALOG_SQL}=await import('../lib/server/mixed-catalog-scope.mjs');
 const f=await setup();
 try{
  const {record,admissions}=f.fixture;
  const index=await compilePracticeCells([record],admissions);
  await assert.rejects(compilePracticeCells([],admissions),/Missing registered/);
  await assert.rejects(compilePracticeCells([record,record],admissions),/Duplicate/);
  await assert.rejects(compilePracticeCells([{...record,task:{...record.task,difficulty:'easy'}}],admissions));
  for(const [category,difficulty] of [['all','medium'],['differentiation','medium'],['limits','hard']]){
   const request={category,difficulty};
   const history={problems:[f.origin.problemId]};
   const expected=await eligibleMixedQuestionCatalog(f.db,request,history,1000,admissions);
   f.calls.length=0;
   const actual=await eligiblePracticeCatalog(f.db,request,history,1000,admissions,undefined,index);
   assert.deepEqual(actual.candidates,expected.candidates);
   assert.deepEqual(actual.retainedIds,expected.retainedIds);
   assert.deepEqual(f.calls,[SCOPED_MIXED_CATALOG_SQL]);
   assert.equal(actual.diagnostics.policy,'mixed-catalog-cell-v3');
   const fallback=await eligiblePracticeCatalog(f.db,request,history,1000,admissions,undefined,{version:1,cells:{}});
   assert.deepEqual(fallback,expected);
  }
 }finally{f.close();}
});

test('requesting any revision includes every registered version of its identity before supersession',async()=>{
 const {registeredForCell}=await import('../lib/server/mixed-catalog-scope.mjs');
 const rows=[['older-moved',1,'a','p','pr'],['older-moved',2,'b','q','qr'],['other',1,'a','s','sr']];
 const policy={count:3,registeredJson:JSON.stringify(rows),selectionHashes:{p:'h1',q:'h2',s:'h3'}};
 const index={version:1,cells:{h1:['limits','medium'],h2:['series','hard'],h3:['integration','easy']}};
 for(const [category,difficulty] of [['limits','medium'],['series','hard'],['all','medium']]){
  assert.deepEqual(JSON.parse(registeredForCell(policy,{category,difficulty},index)),rows.slice(0,2));
 }
 assert.deepEqual(JSON.parse(registeredForCell(policy,{category:'limits',difficulty:'hard'},index)),[]);
 assert.equal(registeredForCell(policy,input,{version:1,cells:{...index.cells,h3:undefined}}),null);
 assert.throws(()=>registeredForCell(policy,input,{version:1,cells:{...index.cells,h3:['invented','easy']}}),/Invalid registered/);
});

test('an oversized out-of-cell MC catalog cannot evade the whole-catalog limit through a narrow filter',async()=>{
 const {compilePracticeCells}=await import('../scripts/bank/compile-practice-cells.mjs');
 const {eligiblePracticeCatalog}=await import('../lib/server/mixed-catalog-scope.mjs');
 const f=await setup();try{
  const {record,admissions}=f.fixture,index=await compilePracticeCells([record],admissions);
  f.mutate(()=>f.sql.exec(`INSERT INTO cbank_pools VALUES(2,'source-mc','series','hard','*','mc-fixture',6000);
   WITH RECURSIVE indices(n) AS (VALUES(2) UNION ALL SELECT n+1 FROM indices WHERE n<6001)
   INSERT INTO cbank_problems SELECT n,printf('cn_%020x',n),1,unhex(printf('%064x',n)),semantic_hash,shared_id,payload_gzip FROM indices JOIN cbank_problems AS original ON original.problem_ref=1;
   INSERT INTO cbank_publication SELECT problem_ref,'approved',NULL FROM cbank_problems WHERE problem_ref>1;
   INSERT INTO cbank_slots SELECT 2,problem_ref-2,problem_ref FROM cbank_problems WHERE problem_ref>1;
   `));
  await assert.rejects(eligiblePracticeCatalog(f.db,input,{},1000,admissions,undefined,index),/exceeds its supported bound/);
 }finally{f.close();}
});
