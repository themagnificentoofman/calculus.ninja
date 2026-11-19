import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {openCompact} from '../scripts/bank/compact.mjs';
import {initializeFreeResponseIndex} from '../scripts/bank/free-response-index.mjs';
import {sourceFixture} from './fixtures/source-bank.mjs';
import {createRoundCreation} from '../lib/server/round-creation.mjs';
import {createServerGames} from '../lib/server/game-engine.ts';
import {ROUND_CREATION_CONTROL} from '../lib/server/round-intents.ts';
import {selectMixedQuestions} from '../lib/server/mixed-question-selection.mjs';
import {frDigest} from '../lib/bank/free-response-record.mjs';
import admissions from '../lib/server/free-response-admissions.json' with {type:'json'};
const request={mode:'test',category:'differentiation',difficulty:'medium',count:1};
async function setup(){
 const sql=openCompact(':memory:');initializeFreeResponseIndex(sql);await sourceFixture(sql,{completePresentation:true});
 sql.exec(readFileSync(new URL('../drizzle/0010_round_authorizations.sql',import.meta.url),'utf8'));
 const policy={rounds:1,selectionPolicyHash:'c'.repeat(64),registryHash:await frDigest(admissions)};
 // One-record integration fixture, not the compiled production horizon.
 sql.prepare('INSERT INTO round_authorization_control(id,incarnation,epoch,policy_hash,control_version,enabled) VALUES(1,?,7,?,3,1)').run(Buffer.from('d'.repeat(64),'hex'),Buffer.from(policy.selectionPolicyHash,'hex'));
 let now=Date.now(),queries=0,quotaCalls=0,allowQuota=true,policyAvailable=true,loseTicket=false,beforeTicket=()=>{},afterSelect=()=>{};
 const prepare=(text,args=[])=>({text,args,bind:(...a)=>prepare(text,a),all:async()=>{queries++;return {results:sql.prepare(text).all(...args)};},first:async()=>{queries++;return sql.prepare(text).get(...args)||null;}});
 const db={prepare,withSession:()=>db,batch:async stmts=>{beforeTicket();sql.exec('BEGIN IMMEDIATE');try{const r=[];for(const s of stmts)r.push(await s.all());sql.exec('COMMIT');if(loseTicket){loseTicket=false;throw Error('Lost ticket acknowledgement');}return r;}catch(e){if(sql.isTransaction)sql.exec('ROLLBACK');throw e;}}};
 const docs=new Map([[ROUND_CREATION_CONTROL,{enabled:true,version:3}]]);let tail=Promise.resolve(),writes=0,loseStoreAck=false;
 const store={get:async p=>structuredClone(docs.get(p)||null),find:async()=>[],transaction:async fn=>{const prev=tail;let release;tail=new Promise(r=>release=r);await prev;try{const pending=new Map(),result=await fn({get:async p=>{assert.equal(pending.size,0);return store.get(p);},set:(p,v)=>pending.set(p,structuredClone(v)),delete:p=>pending.set(p,null)});for(const[p,v]of pending){v===null?docs.delete(p):docs.set(p,v);writes++;}if(loseStoreAck&&pending.size){loseStoreAck=false;throw Error('Lost store acknowledgement');}return result;}finally{release();}}};
 const games=createServerGames(store,()=>now);await games.profile('alice',{});
 const service=createRoundCreation({store,database:db,now:()=>now,takeSelectionQuota:async()=>{quotaCalls++;return allowQuota;},policyFor:async()=>{if(!policyAvailable)throw Error('Policy unavailable');return policy;},select:async(...args)=>{const selected=await selectMixedQuestions(...args);await afterSelect();return selected;}});
 return {sql,db,docs,store,games,service,policy,counts:()=>({queries,quotaCalls,writes}),advance:ms=>now+=ms,quota:value=>allowQuota=value,policyAvailable:value=>policyAvailable=value,loseTicket:()=>loseTicket=true,loseStore:()=>loseStoreAck=true,beforeTicket:fn=>beforeTicket=fn,afterSelect:fn=>afterSelect=fn,close:()=>sql.close()};
}
test('private workflow connects real selection, D1 receipt and atomic game activation with opaque preparation',async()=>{
 const f=await setup();try{
  const prepared=await f.service.prepare('alice','new_action',request);assert.deepEqual(Object.keys(prepared).sort(),['questionCount','questionSetId','status']);assert.equal(prepared.status,'PREPARED');
  const before=f.counts();f.policyAvailable(false);assert.deepEqual(await f.service.prepare('alice','new_action',request),prepared);assert.deepEqual(f.counts(),before);f.policyAvailable(true);
  const active=await f.service.activate('alice','new_action',request);assert.equal(active.game.status,'active');assert.equal(active.game.questions[0].correctIndex,undefined);assert.equal(f.sql.prepare('SELECT count(*) n FROM round_authorizations').get().n,1);
  assert.equal(f.counts().quotaCalls,2);const counts=f.counts();f.policyAvailable(false);assert.deepEqual(await f.service.activate('alice','new_action',request),active);assert.deepEqual(f.counts(),counts);
  const game=f.docs.get('gameSecrets/'+prepared.questionSetId);await f.games.act('alice',prepared.questionSetId,'answer',{index:0,selectedOption:game.questions[0].correctIndex,requestId:'valid_answer'});
  const historical=structuredClone([...f.docs]);f.advance(31*60000);f.docs.set(ROUND_CREATION_CONTROL,{enabled:false,version:4});
  assert.equal((await f.service.activate('alice','new_action',request)).game.status,'finished');
  assert.deepEqual([...f.docs].filter(([key])=>key!==ROUND_CREATION_CONTROL),historical.filter(([key])=>key!==ROUND_CREATION_CONTROL));
 }finally{f.close();}
});
test('lost D1 and Firestore responses recover the first decision and game without reselecting or refreshing',async()=>{
 const f=await setup();try{
  const prepared=await f.service.prepare('alice','lost_action',request);f.loseTicket();
  await assert.rejects(f.service.activate('alice','lost_action',request),/Lost ticket/);
  assert.equal(f.docs.has('gameSecrets/'+prepared.questionSetId),false);const quota=f.counts().quotaCalls;
  f.policyAvailable(false);f.loseStore();const firstRecovered=await f.service.activate('alice','lost_action',request);assert.equal(firstRecovered.game.status,'active');
  const before=f.counts(),saved=structuredClone(f.docs.get('gameSecrets/'+prepared.questionSetId));f.advance(1000);
  const recovered=await f.service.activate('alice','lost_action',request);assert.equal(recovered.game.startTime,saved.startTime);assert.equal(f.counts().quotaCalls,quota);assert.deepEqual(f.counts(),before);
  assert.equal(f.sql.prepare('SELECT count(*) n FROM round_authorizations').get().n,1);
 }finally{f.close();}
});
test('a concurrent exact commit after the first recovery miss is recovered on the bounded failure path',async()=>{
 for(const action of ['prepare','activate']){
  const f=await setup();try{
   const operationId='concurrent_'+action;
   if(action==='activate')await f.service.prepare('alice',operationId,request);
   let release,entered;const gate=new Promise(resolve=>release=resolve),reached=new Promise(resolve=>entered=resolve);
   const original=f.store.transaction;let armed=true;
   f.store.transaction=async fn=>{const result=await original(fn);if(armed&&result===null){armed=false;entered();await gate;}return result;};
   const first=f.service[action]('alice',operationId,request);await reached;
   const winner=await f.service[action]('alice',operationId,request),before=f.counts();f.quota(false);release();
   assert.deepEqual(await first,winner);assert.equal(f.counts().writes,before.writes);assert.equal(f.counts().queries,before.queries);
   assert.equal(f.sql.prepare('SELECT count(*) n FROM round_authorizations').get().n,action==='activate'?1:0);
  }finally{f.close();}
 }
});
test('history changes after authorization cannot spend a recovered ticket on a different history',async()=>{
 const f=await setup();try{
  const prepared=await f.service.prepare('alice','history_action',request);
  f.beforeTicket(()=>{f.docs.get('bankRecent/alice').issuanceGeneration++;});
  await assert.rejects(f.service.activate('alice','history_action',request),e=>e.code==='ROUND_HISTORY_CHANGED');
  f.beforeTicket(()=>{});const quota=f.counts().quotaCalls;
  await assert.rejects(f.service.activate('alice','history_action',request),e=>e.code==='ROUND_HISTORY_CHANGED');assert.equal(f.counts().quotaCalls,quota);
  assert.equal(f.docs.has('gameSecrets/'+prepared.questionSetId),false);assert.equal((await f.service.cancel('alice','history_action',request)).status,'CANCELLED');
 }finally{f.close();}
});
test('cancellation wins against an in-flight selection and current gates reject before catalog work',async()=>{
 const f=await setup();try{
  f.afterSelect(()=>f.service.cancel('alice','cancel_action',request));
  assert.equal((await f.service.prepare('alice','cancel_action',request)).status,'CANCELLED');
  assert.equal([...f.docs.keys()].some(p=>p.startsWith('questionSets/')),false);
  f.afterSelect(()=>{});f.quota(false);const queries=f.counts().queries;
  await assert.rejects(f.service.prepare('alice','quota_action',request),e=>e.status===429);assert.equal(f.counts().queries,queries);
  f.quota(true);f.docs.set(ROUND_CREATION_CONTROL,{enabled:false,version:3});
  await assert.rejects(f.service.prepare('alice','gated_action',request),e=>e.code==='ROUND_CREATION_UNAVAILABLE');assert.equal(f.counts().queries,queries);
  await assert.rejects(f.service.prepare('alice','competitive_action',{...request,mode:'pvp'}),e=>e.code==='ROUND_TYPE_UNAVAILABLE');
 }finally{f.close();}
});
