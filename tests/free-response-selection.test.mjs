import test from 'node:test';
import assert from 'node:assert/strict';
import {openCompact} from '../scripts/bank/compact.mjs';
import {storeAdmittedFreeResponse} from '../scripts/bank/free-response-storage.mjs';
import {initializeFreeResponseIndex,indexAdmittedFreeResponse} from '../scripts/bank/free-response-index.mjs';
import {freeResponseFixture} from './fixtures/free-response.mjs';
import {sourceFixture} from './fixtures/source-bank.mjs';
import {chooseFreeResponseCandidates,freeResponseHistory,freeResponseCapacity,selectFreeResponseRecords,FR_HISTORY_ALIASES_SQL} from '../lib/server/free-response-selection.mjs';
import {recordExposures} from '../lib/bank/exposure.ts';
import {reserveQuestionSet,ReservationConflictError} from '../lib/bank/issuance-reservations.mjs';
import {BankUnavailableError} from '../lib/server/bank-selection.ts';
import {freeResponseQuestions} from '../lib/server/free-response-questions.mjs';
import {validQuestionResponse} from '../lib/server/questions-policy.mjs';

const seed=n=>()=>{n|=0;n=n+0x6D2B79F5|0;let t=Math.imul(n^n>>>15,1|n);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
// Synthetic algorithm data only: duplicate mathematics is deliberately not
// authored/admitted or claimed as real construction/idea capacity.
const catalog=sizes=>sizes.flatMap((n,f)=>Array.from({length:n},(_,i)=>({problem_id:`fixture-${f}-${i}`,record_ref:f*1000+i+1,lineage_id:`lineage-${f}-${i}`,family_id:`family-${f}`,idea:`idea-${f}`,structure:`shape-${f}`,technique:`method-${f%4}`,combination:`execution:method-${f%4}`})));
const questions=rows=>rows.map(c=>({problemId:c.problem_id,lineageId:c.lineage_id,familyId:c.family_id,constructionFamilyId:c.family_id,pedagogy:{relatedIdeaGroupId:c.idea,structuralSignature:c.structure,primaryTechnique:c.technique,reasoningDemand:['execution']}}));
const adapter=(db,before=()=>{})=>({prepare:sql=>({bind:(...values)=>({all:async()=>{await before(sql);return {results:db.prepare(sql).all(...values)};}})})});
const database=()=>{const db=openCompact(':memory:');initializeFreeResponseIndex(db);return db;};
const put=async(db,f)=>{const stored=await storeAdmittedFreeResponse(db,f.record,f);await indexAdmittedFreeResponse(db,stored.recordRef,f);return stored;};
const merged=fixtures=>({version:'free-response-admission-1',checkerSourceHash:fixtures[0].admissions.checkerSourceHash,records:Object.assign({},...fixtures.map(f=>f.admissions.records))});

test('a known reservation overflow returns its actionable conflict before touching D1',async()=>{
 const f=await freeResponseFixture(),history={reservations:[],reservationOverflowUntil:2000000};let queries=0;
 const unavailableDb={prepare(){queries++;throw Error('D1 unavailable');}};
 await assert.rejects(selectFreeResponseRecords(unavailableDb,{category:'differentiation',difficulty:'easy',count:1},history,()=>.5,1000000,f.admissions),e=>e instanceof ReservationConflictError&&e.status===409);
 assert.equal(queries,0);
});

test('complete uneven catalogs retain five capped rounds without repeats or fixed ordering',()=>{
 const rows=catalog([12,12,12,12,12,12,8,8,8,8,10,1,10]),firstOrders=new Set();
 for(let run=0;run<25;run++){
  let history={},now=1000000;const seen=new Set(),rng=seed(501+run);
  for(let round=0;round<5;round++){
   const result=chooseFreeResponseCandidates(rows,{count:20},freeResponseHistory(history,now),rng),counts=new Map();
   assert.equal(result.selected.length,20);if(!round)firstOrders.add(result.selected.map(c=>c.problem_id).join(','));
   for(const [i,c]of result.selected.entries()){
    assert(!seen.has(c.lineage_id));seen.add(c.lineage_id);counts.set(c.family_id,(counts.get(c.family_id)||0)+1);
    if(i)assert.notEqual(c.family_id,result.selected[i-1].family_id);
   }
   assert(Math.max(...counts.values())<=2);
   history=recordExposures(history,`fixture-${round}`,questions(result.selected),'attempted',now);now+=1200000;
  }
  assert.equal(seen.size,100);
 }
 assert.equal(firstOrders.size,25);
});
test('cap, history and adjacency scarcity are explicit unavailability with no relaxation',()=>{
 const history=freeResponseHistory({});
 assert.throws(()=>chooseFreeResponseCandidates(catalog([100,100]),{count:20},history,seed(1)),BankUnavailableError);
 assert.throws(()=>chooseFreeResponseCandidates(catalog([2]),{count:2},history,seed(1)),BankUnavailableError);
 const rows=catalog([2,2,2]);const blocked={version:2,exposures:recordExposures({},'seen',questions(rows),'attempted',1000).exposures};
 assert.throws(()=>chooseFreeResponseCandidates(rows,{count:3},freeResponseHistory(blocked,2000),seed(1)),BankUnavailableError);
 assert.equal(freeResponseCapacity(rows,new Set(rows.map(r=>r.lineage_id))).unseenTasks,0);
 assert.throws(()=>chooseFreeResponseCandidates([rows[0],rows[0]],{count:1},history),/normalized/);
 assert.throws(()=>chooseFreeResponseCandidates(rows,{count:1},history,()=>1),/randomness/);
 assert.throws(()=>chooseFreeResponseCandidates(rows,{count:1},history,()=>NaN),/randomness/);
});
test('stage retention preserves attempted history while expired issuance becomes available',()=>{
 const rows=catalog([2,2]),q=questions(rows.slice(0,2));
 let h=recordExposures({},'issued',q,'issued',1000);
 assert.equal(freeResponseHistory(h,601001).ids.size,0);
 h=recordExposures(h,'issued',q,'attempted',2000);
 assert(freeResponseHistory(h,86400000).ids.has(rows[0].lineage_id));
 assert.equal(freeResponseHistory(h,2000+14*86400000+1).ids.size,0);
 assert.throws(()=>freeResponseHistory({version:2,exposures:Array(513).fill({})}),/history/);
 const w=freeResponseHistory(h,3000).weights;assert(w.get('f:family-0')>1);
});
test('actual storage selection reconstructs only registered chosen records and keeps exact filters',async()=>{
 const db=database();try{
  const fixtures=[];for(let n=0;n<8;n++){
   const f=await freeResponseFixture({alterTask:t=>{t.problemId='cn_'+n.toString(16).padStart(20,'0');t.familyId=t.constructionFamilyId=t.pedagogy.constructionId=`fixture-family-${n%4}`;t.lineageId=`fixture-task-${n}`;}});
   await put(db,f);fixtures.push(f);
  }
  const admissions=merged(fixtures),input={category:'differentiation',difficulty:'easy',count:5};
  const selected=await selectFreeResponseRecords(adapter(db),input,{},seed(52),1000,admissions);
  assert.equal(selected.records.length,5);assert.equal(selected.diagnostics.payloadsDecoded,5);assert.equal(selected.relaxation,'none');assert(Object.isFrozen(selected.records[0].contract));
  assert(selected.records.every(r=>r.task.topic==='differentiation'&&r.task.difficulty==='easy'&&r.contract.answer.expected==='2x'));
  const issued=await freeResponseQuestions(selected.records,admissions);
  assert(validQuestionResponse(issued,{...input,responseFormat:'free-response'}));
  assert(issued.every(q=>q.pedagogy.responseFormat==='free-response'&&!('choiceOrder'in q)&&!('options'in q)&&!('correctIndex'in q)));
  assert.deepEqual(issued.map(q=>q.answerContractHash),selected.records.map(r=>r.contract.contractHash));
  for(const filter of [{category:'limits'},{difficulty:'hard'},{tag:'not-taught'}])await assert.rejects(selectFreeResponseRecords(adapter(db),{...input,...filter},{},seed(1),1000,admissions),BankUnavailableError);
  // Removing registrations before capacity makes the requested round unavailable.
  await assert.rejects(selectFreeResponseRecords(adapter(db),input,{},seed(1),1000,fixtures[0].admissions),BankUnavailableError);
 }finally{db.close();}
});
test('MC identity-only history blocks a conversion through its actual exposure alias',async()=>{
 const db=database();try{
  const origin=await sourceFixture(db),f=await freeResponseFixture({alterTask:t=>{t.origin=origin;}});await put(db,f);
  const input={category:'all',difficulty:'easy',count:1};
  assert.equal((await selectFreeResponseRecords(adapter(db),input,{},seed(1),1000,f.admissions)).records.length,1);
  await assert.rejects(selectFreeResponseRecords(adapter(db),input,{problems:[origin.problemId]},seed(1),1000,f.admissions),BankUnavailableError);
  const history=recordExposures({},'mc-seen',[{problemId:origin.problemId,familyId:origin.familyId}],'attempted',1000);
  await assert.rejects(selectFreeResponseRecords(adapter(db),input,history,seed(1),2000,f.admissions),BankUnavailableError);
  const pending=reserveQuestionSet({},'mc-pending',[{problemId:origin.problemId,lineageId:origin.lineageId}],'prepared',1000);
  await assert.rejects(selectFreeResponseRecords(adapter(db),input,pending,seed(1),2000,f.admissions),BankUnavailableError);
 }finally{db.close();}
});
test('actual FR reconstruction and final eligibility accept the complete expanded history bound',async()=>{
 const db=database();try{
  const f=await freeResponseFixture();await put(db,f);
  const retained=recordExposures({},'old',Array.from({length:512},(_,i)=>({problemId:`old-${i}`,lineageId:`old-l-${i}`,familyId:'family'})),'attempted',1000);
  let held={};for(let r=0;r<4;r++)held=reserveQuestionSet(held,`round-${r}`,Array.from({length:20},(_,i)=>({problemId:`held-${r}-${i}`,lineageId:`held-l-${r}-${i}`})),'issued',1000);
  const history={...retained,...held};assert.equal(freeResponseHistory(history,2000).ids.size,1184);
  const selected=await selectFreeResponseRecords(adapter(db),{category:'all',difficulty:'easy',count:1},history,seed(1),2000,f.admissions);
  assert.equal(selected.records.length,1);
 }finally{db.close();}
});
test('new revisions cannot erase historical task identity through a corrected lineage',async()=>{
 const db=database();try{
  const original=await freeResponseFixture(),changed=await freeResponseFixture({alterTask:t=>{t.problemRevision=2;t.lineageId='corrected-fixture-lineage';}});await put(db,original);await put(db,changed);
  const history=recordExposures({},'fr-seen',[{problemId:original.record.task.problemId,lineageId:original.record.task.lineageId,familyId:original.record.task.familyId}],'attempted',1000);
  await assert.rejects(selectFreeResponseRecords(adapter(db),{category:'all',difficulty:'easy',count:1},history,seed(1),2000,merged([original,changed])),BankUnavailableError);
 }finally{db.close();}
});
test('post-decode eligibility changes reject the set while caller mutation cannot replace the approved snapshot',async()=>{
 const db=database();try{
  const f=await freeResponseFixture(),stored=await put(db,f),input={category:'all',difficulty:'easy',count:1};
  let changed=false;
  const mutationAdapter=adapter(db,sql=>{if(sql.startsWith('SELECT * FROM frbank_records')&&!changed){changed=true;f.admissions.records={};input.category='limits';}});
  assert.equal((await selectFreeResponseRecords(mutationAdapter,input,{},seed(1),1000,f.admissions)).records.length,1);
  const clean=await freeResponseFixture();let catalogCalls=0;
  const withdrawn=adapter(db,sql=>{if((sql.startsWith('WITH registered')||sql.startsWith('WITH catalog'))&&++catalogCalls===2)db.prepare('INSERT INTO frbank_withdrawals VALUES(?,?,?)').run(stored.recordRef,'Withdrawn during selection fixture',1001);});
  await assert.rejects(selectFreeResponseRecords(withdrawn,{category:'all',difficulty:'easy',count:1},{},seed(1),1000,clean.admissions),/eligibility changed/);
 }finally{db.close();}
});
test('oversized aliases are not materialized and empty/default policy cannot issue content',async()=>{
 const db=database();try{
  const f=await freeResponseFixture();await put(db,f);
  db.prepare('INSERT INTO cbank_problem_lineage VALUES(?,?)').run('cn_'+'e'.repeat(20),'x'.repeat(10000));
  const values=db.prepare(FR_HISTORY_ALIASES_SQL).all(JSON.stringify(['cn_'+'e'.repeat(20)]));assert.deepEqual(values.map(v=>v.lineage_id),[null]);
  await assert.rejects(selectFreeResponseRecords(adapter(db),{category:'all',difficulty:'easy',count:1},{problems:['cn_'+'e'.repeat(20)]},seed(1),1000,f.admissions),/Invalid exposure alias/);
  let queries=0;const none={prepare:()=>{queries++;throw Error('No default registry should query');}};
  await assert.rejects(selectFreeResponseRecords(none,{category:'all',difficulty:'easy',count:1}),BankUnavailableError);assert.equal(queries,0);
  await assert.rejects(selectFreeResponseRecords(none,{category:'all',difficulty:'easy',count:21}),/round size/);assert.equal(queries,0);
 }finally{db.close();}
});

test('malformed stages, timestamps, versions and oversized history reject before any database query',async()=>{
 const sample=recordExposures({},'round',questions(catalog([1])),'attempted',1000);
 const bad=[{version:9,problems:['seen']},{problems:'seen'},{problems:['x'.repeat(300000)]},{version:2,exposures:[] ,extra:'unknown'}];
 for(const patch of [{stage:'unknown'},{at:NaN},{at:'1000'},{at:-1},{problemId:'x'.repeat(257)},{lineageId:['seen']},{idea:'x'.repeat(1025)}])bad.push({version:2,exposures:[{...sample.exposures[0],...patch}]});
 let queries=0;const db={prepare:()=>{queries++;throw Error('Must reject history before SQL');}};
 for(const history of bad){assert.throws(()=>freeResponseHistory(history));await assert.rejects(selectFreeResponseRecords(db,{category:'all',difficulty:'easy',count:1},history));}
 assert.equal(queries,0);
});
test('new history aliases inserted during reconstruction cannot resurrect a seen lineage',async()=>{
 const db=database();try{
  const f=await freeResponseFixture();await put(db,f);let inserted=false;
  const live=adapter(db,sql=>{if(sql.startsWith('SELECT * FROM frbank_records')&&!inserted){inserted=true;db.prepare('INSERT INTO cbank_problem_lineage VALUES(?,?)').run('cn_'+'d'.repeat(20),f.record.task.lineageId);}});
  await assert.rejects(selectFreeResponseRecords(live,{category:'all',difficulty:'easy',count:1},{problems:['cn_'+'d'.repeat(20)]},seed(1),1000,f.admissions),/history alias changed/);
 }finally{db.close();}
});

test('history arrays and records reject extra fields, getters, holes and inherited data before cloning',()=>{
 const array=['seen'];array.unbounded='x'.repeat(300000);
 const getter=['seen'];Object.defineProperty(getter,'0',{get(){throw Error('Getter must not run');}});
 const bad=[{problems:array},{problems:getter},{problems:Array(1)},new Date(),Object.create({problems:['seen']}),{version:2,exposures:Array(1)}];
 for(const history of bad)assert.throws(()=>freeResponseHistory(history),/history|preferences/);
});
test('the coherent final read sees both new withdrawals and new exposure aliases',async()=>{
 for(const change of ['withdrawal','alias']){
  const db=database();try{
   const f=await freeResponseFixture(),stored=await put(db,f);let finalReads=0;
   const live=adapter(db,sql=>{if(sql.startsWith('WITH catalog')){
    finalReads++;
    if(change==='withdrawal')db.prepare('INSERT INTO frbank_withdrawals VALUES(?,?,?)').run(stored.recordRef,'Final read withdrawal',1000);
    else db.prepare('INSERT INTO cbank_problem_lineage VALUES(?,?)').run('cn_'+'c'.repeat(20),f.record.task.lineageId);
   }});
   await assert.rejects(selectFreeResponseRecords(live,{category:'all',difficulty:'easy',count:1},{problems:['cn_'+'c'.repeat(20)]},seed(1),1000,f.admissions),/eligibility changed|history alias changed/);assert.equal(finalReads,1);
  }finally{db.close();}
 }
});

test('non-enumerable history cannot disappear when the reviewed snapshot is cloned',async()=>{
 const recent={};Object.defineProperty(recent,'problems',{value:['seen-task'],enumerable:false});
 const values=['seen-task'];Object.defineProperty(values,'0',{value:'seen-task',enumerable:false});
 for(const history of [recent,{problems:values}]){
  assert.throws(()=>freeResponseHistory(history),/history|preferences/);
  await assert.rejects(selectFreeResponseRecords({prepare(){throw Error('SQL must not run');}},{category:'all',difficulty:'easy',count:1},history),/history|preferences/);
 }
});
