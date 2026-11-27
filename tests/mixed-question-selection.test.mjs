import {DatabaseSync} from 'node:sqlite';
import test from 'node:test';
import assert from 'node:assert/strict';
import {openCompact} from '../scripts/bank/compact.mjs';
import {initializeFreeResponseIndex,indexAdmittedFreeResponse} from '../scripts/bank/free-response-index.mjs';
import {storeAdmittedFreeResponse} from '../scripts/bank/free-response-storage.mjs';
import {freeResponseFixture} from './fixtures/free-response.mjs';
import {sourceFixture} from './fixtures/source-bank.mjs';
import {selectMixedQuestions,JOINT_MC_PAYLOAD_SQL,JOINT_FR_PAYLOAD_SQL} from '../lib/server/mixed-question-selection.mjs';
import {MIXED_CATALOG_SQL} from '../lib/server/mixed-question-catalog.mjs';
import {validQuestionResponse} from '../lib/server/questions-policy.mjs';
async function fixture(){
 const db=openCompact(':memory:');initializeFreeResponseIndex(db);const origin=await sourceFixture(db,{completePresentation:true}),fixtures=[],refs=[];
 for(let i=0;i<6;i++){
  const f=await freeResponseFixture({alterTask:t=>{t.difficulty='medium';if(i===0)t.origin=origin;else{t.problemId='cn_'+i.toString(16).padStart(20,'0');t.lineageId='independent-lineage-'+i;t.familyId=t.constructionFamilyId=t.pedagogy.constructionId='family-'+i;}}});
  const stored=await storeAdmittedFreeResponse(db,f.record,f);await indexAdmittedFreeResponse(db,stored.recordRef,f);fixtures.push(f);refs.push(stored.recordRef);
 }
 const admissions={...fixtures[0].admissions,records:Object.assign({},...fixtures.map(f=>f.admissions.records))};
 return {db,refs,admissions,origin};
}
const input={category:'differentiation',difficulty:'medium',count:2,questionMix:{multipleChoice:1,freeResponse:1,order:'uniform'}};
const options=f=>({rounds:1,admissions:f.admissions,now:1000,rng:()=>.4,index:n=>n-1});
function adapter(db,before=()=>{}){return{prepare:sql=>({bind:(...args)=>({all:async()=>{before(sql,args);return{results:db.prepare(sql).all(...args)};}})})};}
test('joint loader decodes exact MC and FR snapshots, shares lineage and returns one unordered set',async()=>{
 const f=await fixture();try{const calls=[];const result=await selectMixedQuestions(adapter(f.db,(sql,args)=>calls.push({sql,args})),input,{},options(f));
 assert(validQuestionResponse(result.questions,input));assert.equal(new Set(result.questions.map(q=>q.lineageId)).size,2);assert.equal(result.questions.filter(q=>q.responseFormat==='free-response').length,1);
 assert.equal(calls.length,4);assert.equal(calls.filter(q=>q.sql===MIXED_CATALOG_SQL).length,2);assert.equal(result.diagnostics.payloadsDecoded,2);assert.equal(result.diagnostics.policy,'joint-capped-v3');
 assert(Object.isFrozen(result.questions[0]));assert(result.questions.find(q=>q.responseFormat==='free-response').freeResponse);assert(result.questions.find(q=>q.responseFormat!=='free-response').choiceOrder);
 }finally{f.db.close();}
});
test('pure FR uses the same joint solver without a within-round adjacency constraint',async()=>{
 const f=await fixture();try{
 const request={...input,questionMix:{multipleChoice:0,freeResponse:2,order:'uniform'}};
 const result=await selectMixedQuestions(adapter(f.db),request,{}, {...options(f),rounds:2});
 assert(validQuestionResponse(result.questions,request));assert.equal(result.diagnostics.requiredRounds,2);assert.equal(result.diagnostics.remainingRounds,1);assert.equal(result.diagnostics.statements,3);
 }finally{f.db.close();}
});
test('exact horizon shortage rejects before reading payloads, with no MC fallback or horizon downgrade',async()=>{
 const f=await fixture();try{const calls=[];await assert.rejects(selectMixedQuestions(adapter(f.db,sql=>calls.push(sql)),input,{}, {...options(f),rounds:2}),e=>e.code==='joint-insufficient-capacity');assert.equal(calls.length,1);
 await assert.rejects(selectMixedQuestions(adapter(f.db),input,{}, {admissions:f.admissions}),/explicit supported joint horizon/);
 }finally{f.db.close();}
});
test('final coherent catalog recomputes capacity after unrelated withdrawal; changed selected eligibility is distinct',async()=>{
 for(const target of ['unselected','selected','all-remaining']){
 const f=await fixture();try{let catalogCalls=0,selectedRefs=[];
 const d=adapter(f.db,(sql,args)=>{
  if(sql.startsWith(JOINT_FR_PAYLOAD_SQL))selectedRefs=[...args];
  if(sql===MIXED_CATALOG_SQL&&++catalogCalls===2){
   const targets=target==='selected'?[selectedRefs[0]]:target==='unselected'?[f.refs.find(ref=>!selectedRefs.includes(ref))]:f.refs.filter(ref=>!selectedRefs.includes(ref));
   for(const ref of targets)f.db.prepare('INSERT INTO frbank_withdrawals(record_ref,reason,withdrawn_at) VALUES(?,?,1000)').run(ref,'isolated-race-fixture');
  }
 });
 const request={...input,questionMix:{multipleChoice:0,freeResponse:2,order:'uniform'}},pending=selectMixedQuestions(d,request,{}, {...options(f),rounds:2});
 if(target==='unselected'){const result=await pending;assert.equal(result.questions.length,2);assert.notEqual(result.diagnostics.initialCatalogBinding,result.diagnostics.finalCatalogBinding);}
 else await assert.rejects(pending,e=>e.code==='joint-catalog-changed');
 }finally{f.db.close();}
 }
});
test('historical alias inserted at final read blocks either selected format and payload tampering rejects',async()=>{
 for(const target of ['alias','payload']){
 const f=await fixture();try{let catalogs=0;const d=adapter(f.db,(sql)=>{
  if(target==='alias'&&sql===MIXED_CATALOG_SQL&&++catalogs===2)f.db.prepare('INSERT INTO cbank_problem_lineage VALUES(?,?)').run('historical-alias',f.origin.lineageId);
 });
 if(target==='payload'){
  const base=d.prepare;d.prepare=sql=>sql.startsWith(JOINT_MC_PAYLOAD_SQL)?{bind:(...args)=>({all:async()=>{const r=await base(sql).bind(...args).all();r.results[0].content_hash=Buffer.alloc(32);return r;}})}:base(sql);
 }
 await assert.rejects(selectMixedQuestions(d,input,{problems:['historical-alias']},options(f)),target==='alias'?e=>e.code==='joint-catalog-changed':/hash mismatch/);
 }finally{f.db.close();}
 }
});
test('MC payload query bounds UTF-8 metadata and compressed bytes before materializing either field',()=>{
 const db=new DatabaseSync(':memory:');try{
 db.exec('CREATE TABLE cbank_shared(shared_id INTEGER,metadata_json TEXT); CREATE TABLE cbank_problems(problem_ref INTEGER,problem_id TEXT,revision INTEGER,content_hash BLOB,semantic_hash BLOB,shared_id INTEGER,payload_gzip BLOB);');
 db.prepare('INSERT INTO cbank_shared VALUES(1,?)').run('{}');db.prepare('INSERT INTO cbank_problems VALUES(1,?,1,?,?,1,?)').run('fixture',Buffer.alloc(32),Buffer.alloc(32),Buffer.from([1]));
 for(const [metadata,compressed,expected]of [['x'.repeat(65536),65536,1],['é'.repeat(32768),1,1],['é'.repeat(32769),1,0],['x'.repeat(1048576),1,0],['{}',65537,0],['{}',0,0],['{}','π'.repeat(65536),0]]){
  db.prepare('UPDATE cbank_shared SET metadata_json=?').run(metadata);db.prepare('UPDATE cbank_problems SET payload_gzip=?').run(typeof compressed==='string'?compressed:Buffer.alloc(compressed));
  const row=db.prepare(JOINT_MC_PAYLOAD_SQL+'(?)').get(1);assert.equal(row.payload_valid,expected);
  if(!expected){assert.equal(row.metadata_json,null);assert.equal(row.payload_gzip,null);}
 }
 }finally{db.close();}
});
test('FR query rejects a TEXT value accepted by non-strict SQLite BLOB affinity before materialization',async()=>{
 const f=await fixture();try{
 const tableSql=f.db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='frbank_records'").get().sql;
 const raw=new DatabaseSync(':memory:');try{
 raw.exec(tableSql);raw.exec('PRAGMA foreign_keys=OFF');
 raw.prepare('INSERT INTO frbank_records SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?').run(1,'test',1,'contract',Buffer.alloc(32),Buffer.alloc(32),Buffer.alloc(32),'differentiation','easy','family','construction','lineage',null,'π'.repeat(65536));
 const row=raw.prepare(JOINT_FR_PAYLOAD_SQL+'(?)').get(1);assert.equal(row.payload_valid,0);assert.equal(row.payload_gzip,null);
 }finally{raw.close();}
 }finally{f.db.close();}
});
