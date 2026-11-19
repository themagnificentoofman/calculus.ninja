import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {openCompact} from '../scripts/bank/compact.mjs';
import {initializeFreeResponseIndex,indexAdmittedFreeResponse} from '../scripts/bank/free-response-index.mjs';
import {storeAdmittedFreeResponse} from '../scripts/bank/free-response-storage.mjs';
import {sourceFixture} from './fixtures/source-bank.mjs';
import {freeResponseFixture} from './fixtures/free-response.mjs';
import {frDigest} from '../lib/bank/free-response-record.mjs';
import {createRoundIntents,roundIdentity,ROUND_CREATION_CONTROL} from '../lib/server/round-intents.ts';
import {selectionHistoryToken} from '../lib/server/selection-history-token.mjs';
import {selectMixedQuestions,JOINT_MC_PAYLOAD_SQL,JOINT_FR_PAYLOAD_SQL} from '../lib/server/mixed-question-selection.mjs';
import {validatePreparedAuthorization} from '../lib/server/prepared-authorization.mjs';
import {authorizeRound} from '../lib/server/round-authorizations.mjs';
const policyHash='c'.repeat(64),incarnation='d'.repeat(64);
async function setup({rounds=1,frOnly=false,mcOnly=false,history={}}={}){
 const sql=openCompact(':memory:');initializeFreeResponseIndex(sql);const origin=await sourceFixture(sql,{completePresentation:true}),fixtures=[],refs=[];
 for(let i=0;i<7;i++){
  const f=await freeResponseFixture({alterTask:t=>{t.difficulty='medium';if(i===0)t.origin=origin;else{t.problemId='cn_'+i.toString(16).padStart(20,'0');t.lineageId='independent-lineage-'+i;t.familyId=t.constructionFamilyId=t.pedagogy.constructionId='family-'+i;}}});
  const stored=await storeAdmittedFreeResponse(sql,f.record,f);await indexAdmittedFreeResponse(sql,stored.recordRef,f);fixtures.push(f);refs.push(stored.recordRef);
 }
 const admissions={...fixtures[0].admissions,records:Object.assign({},...fixtures.map(f=>f.admissions.records))},calls=[];let before=()=>{};
 const prepare=text=>{let params=[];const q={bind:(...p)=>{params=p;return q;},all:async()=>{calls.push(text);before(text,params);return{results:sql.prepare(text).all(...params)};},first:async()=>{calls.push(text);before(text,params);return sql.prepare(text).get(...params)??null;}};return q;};
 const db={prepare,withSession:()=>db,batch:async statements=>{sql.exec('BEGIN IMMEDIATE');try{const result=[];for(const s of statements)result.push(await s.all());sql.exec('COMMIT');return result;}catch(e){sql.exec('ROLLBACK');throw e;}}};
 const questionMix={multipleChoice:frOnly?0:1,freeResponse:mcOnly?0:frOnly?2:1,order:'uniform'},request={mode:'test',category:'differentiation',difficulty:'medium',count:questionMix.multipleChoice+questionMix.freeResponse,questionMix};
 const selection=await selectMixedQuestions(db,request,{}, {rounds,admissions,now:Date.now(),rng:()=>.4,index:n=>n-1});
 const docs=new Map([[ROUND_CREATION_CONTROL,{enabled:true,version:3}],['bankRecent/alice',history],['users/alice',{uid:'alice',rating:0,topicRatings:{}}]]),store={get:async p=>docs.has(p)?structuredClone(docs.get(p)):null,transaction:async fn=>{
  const writes=[];const result=await fn({get:async p=>{assert.equal(writes.length,0);return store.get(p);},set:(p,v)=>writes.push([p,structuredClone(v)]),delete:p=>writes.push([p,null])});for(const[p,v]of writes){if(v===null)docs.delete(p);else docs.set(p,v);}return result;
 }};
 const identity=await roundIdentity('alice','exact_operation',request),service=createRoundIntents(store),policy={registryHash:await frDigest(admissions),selectionPolicyHash:policyHash,includeLegacy:false};
 await service.prepare(identity,selection,await selectionHistoryToken(history),policy);
 const context=await service.readForAuthorization(identity),expected=await service.readAuthorizationIdentity(identity);
 sql.exec(readFileSync(new URL('../drizzle/0010_round_authorizations.sql',import.meta.url),'utf8'));
 sql.prepare('INSERT INTO round_authorization_control(id,incarnation,epoch,policy_hash,control_version,enabled) VALUES(1,?,7,?,3,1)').run(Buffer.from(incarnation,'hex'),Buffer.from(policyHash,'hex'));
 const mutate=fn=>{sql.exec("BEGIN IMMEDIATE; UPDATE round_authorization_control SET writing=1,writer_id=zeroblob(32)");try{fn();sql.exec('UPDATE round_authorization_control SET writing=0,writer_id=NULL,epoch=epoch+1; COMMIT');}catch(e){sql.exec('ROLLBACK');throw e;}};
 calls.length=0;
 return {sql,db,docs,identity,service,context,expected,selection,admissions,refs,calls,mutate,options:{rounds,policyHash,admissions},before:fn=>{before=fn;},close:()=>sql.close()};
}
const validate=f=>validatePreparedAuthorization(f.db,f.expected,f.context,f.options);
const withdraw=(f,refs)=>f.mutate(()=>{for(const ref of refs)f.sql.prepare('INSERT INTO frbank_withdrawals VALUES(?,?,?)').run(ref,'isolated-test',Date.now());});
test('exact prepared mixed, pure FR and pure MC snapshots produce bounded proofs without reselection',async()=>{
 for(const options of [{},{frOnly:true,rounds:2},{mcOnly:true}]){
  const f=await setup(options);try{
   const original=structuredClone(f.context),proof=await validate(f);
   assert.deepEqual(Object.keys(proof).sort(),['history_token','incarnation','epoch','authorization_deadline'].sort());assert.equal(proof.epoch,7);assert.equal(proof.incarnation,incarnation);assert.equal(proof.history_token,f.context.historyToken);assert(Object.isFrozen(proof));assert(proof.authorization_deadline<=f.expected.intent_expires);assert.deepEqual(f.context,original);
   assert.equal(f.calls.length,options.frOnly||options.mcOnly?2:3);assert.equal(f.sql.prepare('SELECT count(*) n FROM round_authorizations').get().n,0);
   const issued=await authorizeRound(f.db,f.expected,()=>validate(f));assert.equal(issued.status,'authorized');
  }finally{f.close();}
 }
});
test('registry, policy, selected payload and horizon changes reject before catalog reads',async()=>{
 const f=await setup();try{
  for(const change of [c=>c.set.questions[0].explanation=['forged'],c=>c.set.policy.registryHash='a'.repeat(64),c=>c.identity.request.options={newField:true},c=>c.intent.state='CANCELLED',c=>c.control.enabled=false]){
   const c=structuredClone(f.context);change(c);await assert.rejects(validatePreparedAuthorization(f.db,f.expected,c,f.options));assert.equal(f.calls.length,0);
  }
  await assert.rejects(validatePreparedAuthorization(f.db,f.expected,f.context,{...f.options,rounds:2}),/strict horizon/);
  await assert.rejects(validatePreparedAuthorization(f.db,f.expected,f.context,{...f.options,policyHash:'a'.repeat(64)}),/policy/);assert.equal(f.calls.length,0);
 }finally{f.close();}
});
test('current withdrawal or history alias blocks the exact chosen question before decoding',async()=>{
 for(const kind of ['withdraw','alias']){
  const f=await setup();try{
   const selected=f.context.set.questions.find(q=>q.responseFormat==='free-response');
   if(kind==='withdraw')withdraw(f,[f.sql.prepare('SELECT record_ref FROM frbank_records WHERE problem_id=?').get(selected.problemId).record_ref]);
   else{const c=structuredClone(f.context);c.selectionHistory.problems=['historic-identity'];f.context=c;f.mutate(()=>f.sql.prepare('INSERT INTO cbank_problem_lineage VALUES(?,?)').run('historic-identity',selected.lineageId));}
   await assert.rejects(validate(f),/no longer eligible/);assert.equal(f.calls.length,1);
  }finally{f.close();}
 }
});
test('unrelated withdrawal permits a new feasible completion but lost remaining capacity rejects',async()=>{
 for(const exhaustion of [false,true]){
  const f=await setup({frOnly:true,rounds:2});try{
   const selected=new Set(f.context.set.questions.map(q=>q.problemId));const unused=f.sql.prepare('SELECT record_ref,problem_id FROM frbank_records').all().filter(r=>!selected.has(r.problem_id)).map(r=>r.record_ref);
   withdraw(f,exhaustion?unused:unused.slice(0,1));
   if(exhaustion){await assert.rejects(validate(f),/cannot complete/);assert.equal(f.calls.length,1);}else assert.equal((await validate(f)).epoch,8);
  }finally{f.close();}
 }
});
test('reconstruction catches saved presentation corruption even with internally consistent preparation hashes',async()=>{
 for(const kind of ['statement','choice','duplicate-order','solution','contract']){
  const f=await setup();try{
   const c=structuredClone(f.context),mc=c.set.questions.find(q=>q.responseFormat!=='free-response'),fr=c.set.questions.find(q=>q.responseFormat==='free-response');
   if(kind==='statement')mc.latexProblem='Different question';if(kind==='choice')mc.options[0]='999';if(kind==='duplicate-order')mc.choiceOrder[0]=mc.choiceOrder[1];if(kind==='solution')fr.explanation=['Different explanation'];if(kind==='contract')fr.freeResponse.instructions=fr.answerInstructions='Different instructions';
   c.set.selectionHash=c.intent.selectionHash=await frDigest({selected:{questions:c.set.questions,relaxation:c.set.relaxation,diagnostics:c.set.diagnostics},policy:c.set.policy});
   const expected={...f.expected,selection_hash:c.set.selectionHash};
   await assert.rejects(validatePreparedAuthorization(f.db,expected,c,f.options),kind==='duplicate-order'?/saved choice order/:/presentation changed/);
  }finally{f.close();}
 }
});
test('bounded payload adapter rejects corrupt hashes and duplicate result identities',async()=>{
 for(const kind of ['hash','duplicate']){
  const f=await setup({frOnly:kind==='duplicate'});try{
   const db={prepare:sql=>{const q=f.db.prepare(sql);return {bind:(...args)=>{const b=q.bind(...args);return{all:async()=>{const result=await b.all();if(kind==='hash'&&sql.startsWith(JOINT_MC_PAYLOAD_SQL))result.results[0].content_hash=Buffer.alloc(32);if(kind==='duplicate'&&sql.startsWith(JOINT_FR_PAYLOAD_SQL))result.results[1]=result.results[0];return result;}};}};}};
   await assert.rejects(validatePreparedAuthorization(db,f.expected,f.context,f.options),kind==='hash'?/hash mismatch/:/duplicate/);
  }finally{f.close();}
 }
});
test('epoch changes after exact validation prevent insertion; committed receipt recovers before revalidation',async()=>{
 const f=await setup();try{
  const changed=await authorizeRound(f.db,f.expected,async()=>{const proof=await validate(f);f.mutate(()=>{});return proof;});assert.equal(changed.status,'unavailable');assert.equal(changed.receipt,null);
  const first=await authorizeRound(f.db,f.expected,()=>validate(f));assert.equal(first.status,'authorized');
  f.sql.exec('UPDATE round_authorization_control SET enabled=0,epoch=epoch+1,control_version=4');
  const recovered=await authorizeRound(f.db,f.expected,()=>{throw Error('must not revalidate committed authorization');});assert.equal(recovered.status,'recovered');assert.deepEqual(recovered.receipt,first.receipt);
  assert.equal(f.docs.has('games/'+f.identity.id),false);
 }finally{f.close();}
});
test('all caller-owned context and registry data are detached before asynchronous work',async()=>{
 const f=await setup();try{
  const c=structuredClone(f.context),options={...f.options,admissions:structuredClone(f.admissions)},expected={...f.expected};
  const pending=validatePreparedAuthorization(f.db,expected,c,options);c.set.questions=[];options.admissions.records={};options.rounds=10;expected.binding='e'.repeat(64);
  assert.equal((await pending).epoch,7);
 }finally{f.close();}
});
test('combined reader context retains the supported separate history and question-set bounds',async()=>{
 // Valid codec stress, not a claim that a >1 MiB history is a deployable single
 // Firestore document. The independent report additionally covers a sub-1 MiB
 // history whose combined 20-question context crosses the old 1 MB boundary.
 const at=Date.now()-1000,history={version:2,exposures:Array.from({length:512},(_,i)=>({roundId:'older_round_'+i,problemId:'old_problem_'+i,lineageId:'old_lineage_'+i,familyId:'old_family_'+i,idea:'i'.repeat(600),structure:'s'.repeat(600),technique:'t'.repeat(600),combination:'c'.repeat(600),stage:'attempted',at}))};
 const f=await setup({history});try{assert(Buffer.byteLength(JSON.stringify(f.context))>1000000);assert.equal((await validate(f)).epoch,7);}finally{f.close();}
});
test('a real local D1 proof activates exact mixed content and replay atomically in the store adapter',async()=>{
 const f=await setup();try{
  const ticket=await authorizeRound(f.db,f.expected,()=>validate(f));
  const result=await f.service.activate(f.identity,ticket.receipt),id=f.identity.id;
  assert.equal(result.id,id);assert.equal(result.game.responseFormat,'mixed');
  assert.deepEqual(f.docs.get('gameSecrets/'+id).questions,f.selection.questions);
  assert.deepEqual(f.docs.get('replayContent/'+id).questions,f.selection.questions);
  assert.equal(f.docs.get('roundIntents/'+id).state,'ISSUED');assert.equal(f.docs.get('roundActivations/'+id).receipt.body_hash,ticket.receipt.body_hash);
  assert.equal(f.docs.get('bankRecent/alice').issuanceGeneration,2);assert(f.docs.get('bankRecent/alice').reservations.every(r=>r.stage==='issued'));
  assert.equal(f.docs.get('replayManifests/'+id).replayVersion,2);assert.equal(f.docs.get('replayManifests/'+id).chunkCount,1);
  assert(result.game.questions.every(q=>!Object.hasOwn(q,'freeResponse')&&!Object.hasOwn(q,'explanation')&&!Object.hasOwn(q,'correctIndex')));
  assert.deepEqual(await f.service.recoverActive(f.identity),result);
 }finally{f.close();}
});
