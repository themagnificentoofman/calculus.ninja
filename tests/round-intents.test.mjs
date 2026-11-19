import test from 'node:test';
import assert from 'node:assert/strict';
import {createRoundIntents,roundIdentity,creationControl,ROUND_CREATION_CONTROL} from '../lib/server/round-intents.ts';
import {selectionHistoryToken} from '../lib/server/selection-history-token.mjs';
import {reserveQuestionSet,reservedIdentities,observeReservedQuestions} from '../lib/bank/issuance-reservations.mjs';
import {recordExposures} from '../lib/bank/exposure.ts';
import {createServerGames} from '../lib/server/game-engine.ts';
import {createGameApi} from '../lib/server/game-api.ts';
class MemoryStore {
 docs=new Map();writes=0;tail=Promise.resolve();retry=0;loseAck=false;
 async get(path){return this.docs.has(path)?structuredClone(this.docs.get(path)):null;}
 async find(){return [];}
 async transaction(fn){
  const previous=this.tail;let release;this.tail=new Promise(r=>release=r);await previous;
  try{
   let result,writes;
   for(let attempt=0;attempt<=this.retry;attempt++){
    writes=new Map();result=await fn({get:async p=>{assert.equal(writes.size,0,'all reads precede writes');return this.get(p);},set:(p,v)=>writes.set(p,structuredClone(v)),delete:p=>writes.set(p,null)});
   }
   this.retry=0;for(const[p,v]of writes){if(v===null)this.docs.delete(p);else this.docs.set(p,v);this.writes++;}
   this.onCommit?.(writes);
   if(this.loseAck){this.loseAck=false;throw Error('lost acknowledgement after commit');}return result;
  }finally{release();}
 }
}
const request={mode:'test',category:'integration',difficulty:'easy',count:2};
const policy={registryHash:'a'.repeat(64),selectionPolicyHash:'b'.repeat(64),includeLegacy:false};
const questions=(prefix='first')=>Array.from({length:2},(_,i)=>({problemId:`${prefix}_problem_${i}`,lineageId:`${prefix}_lineage_${i}`,familyId:'test_family',topic:'integration',difficulty:'easy',latexProblem:'1+1',options:['2','3','4','5'],correctIndex:0,explanation:['1+1=2'],problemRevision:1,contentHash:'c'.repeat(64),bankRelease:'test_only',choiceOrder:['a','b','c','d']}));
const selection=(prefix)=>({questions:questions(prefix),relaxation:'none'});
async function setup(){
 let at=1000000;const store=new MemoryStore(),service=createRoundIntents(store,()=>at),identity=await roundIdentity('alice','operation_one',request);
 store.docs.set(ROUND_CREATION_CONTROL,{enabled:true,version:1});
 const token=()=>selectionHistoryToken(store.docs.get('bankRecent/alice')||{});
 return {store,service,identity,token,advance:n=>at+=n,now:()=>at,prepare:async(prefix)=>service.prepare(identity,selection(prefix),await token(),policy)};
}
test('stable account-scoped identity binds every client setting and rejects hidden/invalid fields',async()=>{
 const identity=await roundIdentity('alice','operation_one',request);
 assert.deepEqual(await roundIdentity('alice','operation_one',{...request,options:{}}),identity);
 assert.notEqual((await roundIdentity('bobby','operation_one',request)).id,identity.id);
 assert.notEqual((await roundIdentity('alice','operation_two',request)).id,identity.id);
 assert.notEqual((await roundIdentity('alice','operation_one',{...request,difficulty:'hard'})).requestHash,identity.requestHash);
 for(const value of [{...request,count:21},{...request,answer:'secret'},{...request,options:{timeLimit:60}},{...request,questionMix:{multipleChoice:1,freeResponse:2,order:'uniform'}},{...request,mode:'rapid'},{...request,mode:'pvp',responseFormat:'free-response'}])await assert.rejects(roundIdentity('alice','operation_one',value));
 for(const mode of ['rapid','multiplayer']){
  const options=mode==='rapid'?{timeLimit:60}:{winCondition:'time_limit',targetScore:5,timeLimit:60,penalties:false};
  const a=await roundIdentity('alice','operation_one',{...request,mode,options}),b=await roundIdentity('alice','operation_one',{...request,mode,options:{...options,timeLimit:90}});assert.notEqual(a.requestHash,b.requestHash);
 }
 let reads=0;await assert.rejects(roundIdentity('alice','operation_one',{...request,get count(){reads++;return 2;}}));assert.equal(reads,0);
});
test('preparation stores one exact private selection and a separate hold without issuing exposure',async()=>{
 const s=await setup(),selected=selection(),token=await s.token(),pending=s.service.prepare(s.identity,selected,token,policy);
 selected.questions[0].correctIndex=3;
 const result=await pending;
 assert.deepEqual(result,{questionSetId:s.identity.id,questionCount:2,status:'PREPARED'});
 const saved=await s.store.get('questionSets/'+result.questionSetId),history=await s.store.get('bankRecent/alice');
 assert.equal(saved.questions[0].correctIndex,0);assert.equal(history.issuanceGeneration,1);assert.equal(history.exposures,undefined);
 assert.equal(history.reservations.length,2);assert(history.reservations.every(r=>r.stage==='prepared'&&r.at===s.now()));
 assert.equal((await s.store.get('roundIntents/'+s.identity.id)).preparedHistoryToken,await selectionHistoryToken(history));
 for(const field of ['questions','binding','request','policy','correctIndex','explanation'])assert(!Object.hasOwn(result,field));
});
test('diagnostics must be an object and their exact presence survives preparation',async()=>{
 for(const diagnostics of [null,false,0,'',[],true,'text']){
  const s=await setup();await assert.rejects(s.service.prepare(s.identity,{...selection(),diagnostics},await s.token(),policy),/Invalid selection diagnostics/);
  assert.equal(s.store.writes,0);assert.equal(await s.service.recover(s.identity),null);
 }
 for(const diagnostics of [{},{policy:'fixture',count:2}]){
  const s=await setup();await s.service.prepare(s.identity,{...selection(),diagnostics},await s.token(),policy);
  assert.deepEqual((await s.service.readForAuthorization(s.identity)).set.diagnostics,diagnostics);
 }
});
test('immutable receipt lookup precedes current gates but grants no activation or revived lifetime',async()=>{
 const s=await setup();await s.prepare();const first=await s.service.readAuthorizationIdentity(s.identity),writes=s.store.writes;
 assert.deepEqual(Object.keys(first).sort(),['intent_id','binding','request_hash','selection_hash','policy_hash','control_version','intent_expires'].sort());
 assert(Object.isFrozen(first));assert.equal(first.policy_hash,policy.selectionPolicyHash);
 s.store.docs.set(ROUND_CREATION_CONTROL,{enabled:false,version:2});
 assert.deepEqual(await s.service.readAuthorizationIdentity(s.identity),first);
 await assert.rejects(s.service.readForAuthorization(s.identity),e=>e.code==='ROUND_CREATION_CHANGED');
 s.advance(30*60000);assert.deepEqual(await s.service.readAuthorizationIdentity(s.identity),first);
 await assert.rejects(s.service.readForAuthorization(s.identity),e=>e.code==='ROUND_NOT_PREPARED');
 assert.equal(s.store.writes,writes);
 assert.equal((await s.service.recover(s.identity)).status,'EXPIRED');
 await assert.rejects(s.service.readAuthorizationIdentity(s.identity),e=>e.code==='ROUND_NOT_PREPARED');
 const corrupted=await setup();await corrupted.prepare();corrupted.store.docs.get('questionSets/'+corrupted.identity.id).questions[0].correctIndex=2;
 await assert.rejects(corrupted.service.readAuthorizationIdentity(corrupted.identity),e=>e.code==='ROUND_STATE_UNAVAILABLE');
 const cancelled=await setup();await cancelled.prepare();await cancelled.service.cancel(cancelled.identity);
 await assert.rejects(cancelled.service.readAuthorizationIdentity(cancelled.identity),e=>e.code==='ROUND_NOT_PREPARED');
});
test('retry after lost acknowledgement recovers without reselecting or refreshing the first hold',async()=>{
 const s=await setup();s.store.loseAck=true;
 await assert.rejects(s.prepare(),/lost acknowledgement/);
 const first=await s.store.get('questionSets/'+s.identity.id),history=await s.store.get('bankRecent/alice'),writes=s.store.writes;
 s.advance(20000);s.store.docs.set(ROUND_CREATION_CONTROL,{enabled:false,version:2});
 assert.equal((await s.service.recover(s.identity)).status,'PREPARED');
 assert.equal((await s.service.prepare(s.identity,selection('other'),await s.token(),policy)).status,'PREPARED');
 assert.deepEqual(await s.store.get('questionSets/'+s.identity.id),first);assert.deepEqual(await s.store.get('bankRecent/alice'),history);assert.equal(s.store.writes,writes);
});
test('simultaneous duplicate requests converge on first final order; changed body conflicts',async()=>{
 const s=await setup(),token=await s.token();s.store.retry=5;
 const setPath = 'questionSets/' + s.identity.id;
 const committed = [];
 s.store.onCommit = writes => {
   if (writes.has(setPath)) committed.push(structuredClone(writes.get(setPath).questions));
 };
 const results=await Promise.all(['first','second'].map(p=>s.service.prepare(s.identity,selection(p),token,policy)));
 assert.deepEqual(results[0],results[1]);
 assert.equal(committed.length, 1, 'one durable question-set write');
 const winner = committed[0][0].problemId.startsWith('first_') ? 'first' : 'second';
 assert.deepEqual(committed[0], questions(winner), 'the entire winning selection retains its order');
 assert.deepEqual((await s.store.get(setPath)).questions, committed[0]);
 assert.equal((await s.store.get('bankRecent/alice')).issuanceGeneration,1);
 const changed=await roundIdentity('alice','operation_one',{...request,difficulty:'hard'});
 await assert.rejects(s.service.recover(changed),e=>e.code==='ROUND_REQUEST_CHANGED');
 await assert.rejects(s.service.cancel(changed),e=>e.code==='ROUND_REQUEST_CHANGED');
});
test('distinct simultaneous starts conflict, and a current token cannot bypass an existing preparation',async()=>{
 const s=await setup(),other=await roundIdentity('alice','operation_two',request),token=await s.token();
 const results=await Promise.allSettled([s.service.prepare(s.identity,selection(),token,policy),s.service.prepare(other,selection('second'),token,policy)]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.find(r=>r.status==='rejected').reason.code,'ROUND_HISTORY_CHANGED');
 await assert.rejects(s.service.prepare(other,selection('second'),await s.token(),policy),/Finish or resume/);
});
test('cancellation and expiry retain terminal identities, release only preparation, and cannot refresh',async()=>{
 for(const expired of [false,true]){
  const s=await setup();await s.prepare();const old=await s.store.get('roundIntents/'+s.identity.id);
  s.advance(expired?30*60000:1);
  const terminal=expired?await s.service.recover(s.identity):await s.service.cancel(s.identity);
  assert.equal(terminal.status,expired?'EXPIRED':'CANCELLED');assert.equal(await s.store.get('questionSets/'+s.identity.id),null);
  const history=await s.store.get('bankRecent/alice'),writes=s.store.writes;
  assert.equal(history.issuanceGeneration,2);assert.equal(history.reservations.length,0);
  s.advance(86400000);assert.deepEqual(await s.prepare('replacement'),terminal);assert.deepEqual(await s.service.cancel(s.identity),terminal);
  assert.equal(s.store.writes,writes);assert.equal((await s.store.get('roundIntents/'+s.identity.id)).binding,old.binding);
 }
});
test('cancel-before-prepare tombstone defeats an already in-flight start and stays account scoped',async()=>{
 const s=await setup(),result=await s.service.cancel(s.identity);
 assert.equal(result.status,'CANCELLED');assert.deepEqual(await s.prepare(),result);assert.equal(await s.store.get('questionSets/'+s.identity.id),null);
 const other=await roundIdentity('bobby','operation_one',request);
 assert.equal((await s.service.prepare(other,selection(),await selectionHistoryToken({}),policy)).status,'PREPARED');
});
test('expired preparation is terminal even when preparation itself is retried',async()=>{
 const s=await setup();await s.prepare();s.advance(30*60000);
 assert.equal((await s.prepare('late')).status,'EXPIRED');assert.equal((await s.store.get('bankRecent/alice')).issuanceGeneration,2);
 assert.equal(await s.store.get('questionSets/'+s.identity.id),null);
});
test('private control is fail closed; disabled recovery remains available',async()=>{
 for(const value of [null,{}, {enabled:true,version:0},{enabled:'true',version:1},{enabled:true,version:1,extra:true},{enabled:false,version:1}]){
  const s=await setup();if(value===null)s.store.docs.delete(ROUND_CREATION_CONTROL);else s.store.docs.set(ROUND_CREATION_CONTROL,value);
  await assert.rejects(s.prepare(),e=>e.code==='ROUND_CREATION_UNAVAILABLE');assert.equal(s.store.writes,0);
 }
 assert.deepEqual(creationControl({enabled:true,version:Number.MAX_SAFE_INTEGER}),{enabled:true,version:Number.MAX_SAFE_INTEGER});
 const s=await setup();await s.prepare();s.store.docs.set(ROUND_CREATION_CONTROL,{enabled:false,version:2});assert.equal((await s.service.cancel(s.identity)).status,'CANCELLED');
});
test('full attempted retention and all hold barriers remain intact during private preparation',async()=>{
 const s=await setup(),old=recordExposures({},'older',Array.from({length:512},(_,i)=>({problemId:`old_${i}`,familyId:'old_family'})),'attempted',s.now());
 s.store.docs.set('bankRecent/alice',old);await s.prepare();
 const history=await s.store.get('bankRecent/alice');assert.deepEqual(history.exposures,old.exposures);assert.equal(reservedIdentities(history,s.now()).size,4);
 await s.service.cancel(s.identity);assert.deepEqual((await s.store.get('bankRecent/alice')).exposures,old.exposures);
 for(const barrier of ['overflow','collision','four-rounds']){
  const t=await setup();let held={};
  if(barrier==='overflow')held={reservationOverflowUntil:t.now()+1000};
  if(barrier==='collision')held=reserveQuestionSet({},'other-round',questions(),'issued',t.now());
  if(barrier==='four-rounds')for(let i=0;i<4;i++)held=reserveQuestionSet(held,`round-${i}`,questions('held'+i),'issued',t.now());
  t.store.docs.set('bankRecent/alice',held);await assert.rejects(t.prepare());assert.equal(t.store.writes,0);
 }
});
test('cancellation never removes already-issued exposure and the old activation route cannot bypass preparation',async()=>{
 const s=await setup(),games=createServerGames(s.store,s.now);await games.profile('alice',{});await s.prepare();
 await assert.rejects(games.createGame('alice',s.identity.id,'test',{}),e=>e.status===409&&/practice screen/.test(e.message));
 s.store.docs.delete(ROUND_CREATION_CONTROL);
 await assert.rejects(games.createGame('alice',s.identity.id,'test',{}),e=>e.status===409&&/activation/.test(e.message));
 assert.equal(await s.store.get('gameSecrets/'+s.identity.id),null);assert.equal(await s.store.get('replayContent/'+s.identity.id),null);
 const intent=await s.store.get('roundIntents/'+s.identity.id);intent.state='ISSUED';s.store.docs.set('roundIntents/'+s.identity.id,intent);
 const history={...await s.store.get('bankRecent/alice'),...reserveQuestionSet(await s.store.get('bankRecent/alice'),s.identity.id,questions(),'issued',s.now())};
 s.store.docs.set('bankRecent/alice',history);const writes=s.store.writes;
 assert.equal((await s.service.cancel(s.identity)).status,'ISSUED');assert.deepEqual(await s.store.get('bankRecent/alice'),history);assert.equal(s.store.writes,writes);
});
test('installing creation control closes legacy solo creation even while disabled and preserves old game recovery',async()=>{
 const s=await setup();s.store.docs.delete(ROUND_CREATION_CONTROL);const games=createServerGames(s.store,s.now);await games.profile('alice',{});
 const old=await games.storeQuestions('alice','test','integration','easy',questions('old'),'none');
 const active=await games.createGame('alice',old.questionSetId,'test',{});
 const pending=await games.storeQuestions('alice','test','integration','easy',questions('pending'),'none');
 const recorded=structuredClone(s.store.docs.get('gameSecrets/'+old.questionSetId));
 for(const control of [{enabled:false,version:2},{enabled:true,version:3},{malformed:true}]){
  s.store.docs.set(ROUND_CREATION_CONTROL,control);const before=s.store.writes;
  await assert.rejects(games.createGame('alice',pending.questionSetId,'test',{}),error=>error.status===409);
  assert.equal(s.store.writes,before);assert.equal(s.store.docs.has('gameSecrets/'+pending.questionSetId),false);
  assert.deepEqual(await games.createGame('alice',old.questionSetId,'test',{}),active);
  assert.deepEqual(s.store.docs.get('gameSecrets/'+old.questionSetId),recorded);
 }
 let selected=0,charged=0;
 const api=createGameApi({store:s.store,verify:async()=>({sub:'alice'}),select:async()=>{selected++;return selection();},quota:async()=>{charged++;return true;}});
 const response=await api('questions',new Request('https://calculus.ninja/api/questions',{method:'POST',headers:{authorization:'Bearer owned','content-type':'application/json'},body:JSON.stringify(request)}));
 assert.equal(response.status,409);assert.equal(selected,0);assert.equal(charged,0);
});
test('a legacy selection already in flight cannot issue after control installation',async()=>{
 const s=await setup();s.store.docs.delete(ROUND_CREATION_CONTROL);
 const before=s.store.writes,history=await s.store.get('bankRecent/alice');
 const api=createGameApi({store:s.store,verify:async()=>({sub:'alice'}),select:async()=>{s.store.docs.set(ROUND_CREATION_CONTROL,{enabled:false,version:2});return selection();},quota:async()=>true});
 const response=await api('questions',new Request('https://calculus.ninja/api/questions',{method:'POST',headers:{authorization:'Bearer owned','content-type':'application/json'},body:JSON.stringify(request)}));
 assert.equal(response.status,409);assert.equal(s.store.writes,before);assert.deepEqual(await s.store.get('bankRecent/alice'),history);
 assert.equal([...s.store.docs.keys()].filter(p=>p.startsWith('questionSets/')).length,0);
});
test('tampered identity, partial state and changed selection fields fail before writes',async()=>{
 const s=await setup();await assert.rejects(s.service.recover({...s.identity,id:'d'.repeat(64)}));
 const token=await s.token();
 for(const value of [{...selection(),extra:true},{...selection(),relaxation:'invented'},{...selection(),questions:questions().slice(1)},{...selection(),questions:questions().map(q=>({...q,lineageId:''}))}])await assert.rejects(s.service.prepare(s.identity,value,token,policy));
 for(const value of [{...policy,extra:true},{...policy,registryHash:'short'},null])await assert.rejects(s.service.prepare(s.identity,selection(),token,value));
 assert.equal(s.store.writes,0);
 s.store.docs.set('questionSets/'+s.identity.id,{historical:true});await assert.rejects(s.prepare(),/already in use/);await assert.rejects(s.service.cancel(s.identity),/already in use/);
});
test('authorization context verifies the saved snapshot and removes only its own preparation from selection',async()=>{
 const s=await setup(),other=reserveQuestionSet({},'other-round',questions('other'),'issued',s.now());
 s.store.docs.set('bankRecent/alice',other);await s.prepare();
 // An unrelated real attempt after preparation is presented to the external
 // eligibility recheck; it is not silently replaced by preparation-time history.
 const changed=recordExposures(await s.store.get('bankRecent/alice'),'other-game',questions('attempted'),'attempted',s.now()+1);
 s.store.docs.set('bankRecent/alice',changed);s.advance(1);
 const before=structuredClone([...s.store.docs]),writes=s.store.writes,context=await s.service.readForAuthorization(s.identity);
 assert.deepEqual(context.set.questions,questions());assert.equal(context.control.version,1);assert.equal(context.asOf,s.now());
 assert.equal(context.historyToken,await selectionHistoryToken(changed));assert.notEqual(context.historyToken,context.intent.preparedHistoryToken);
 assert.deepEqual(context.selectionHistory.exposures,changed.exposures);assert.equal(context.selectionHistory.issuanceGeneration,changed.issuanceGeneration);
 assert(context.selectionHistory.reservations.every(r=>r.roundId==='other-round'));assert.equal(context.selectionHistory.reservations.length,2);
 assert.deepEqual([...s.store.docs],before);assert.equal(s.store.writes,writes);
 assert(Object.isFrozen(context.set.questions[0]));assert(Object.isFrozen(context.selectionHistory));
});
test('metadata recovery is not payload readiness: missing or mutated saved content cannot authorize',async()=>{
 for(const alter of [s=>s.store.docs.delete('questionSets/'+s.identity.id),s=>{s.store.docs.get('questionSets/'+s.identity.id).questions[0].correctIndex=3;},s=>{s.store.docs.get('questionSets/'+s.identity.id).policy.includeLegacy=true;},s=>{s.store.docs.get('questionSets/'+s.identity.id).expiresAt=new Date(s.now()+30*60000+1);},s=>{s.store.docs.get('questionSets/'+s.identity.id).questionMix={multipleChoice:2,freeResponse:0,order:'uniform'};},s=>{s.store.docs.get('questionSets/'+s.identity.id).extra='unbound';},s=>{s.store.docs.get('roundIntents/'+s.identity.id).binding='d'.repeat(64);s.store.docs.get('questionSets/'+s.identity.id).binding='d'.repeat(64);}]){
  const s=await setup();await s.prepare();alter(s);const writes=s.store.writes;
  assert.equal((await s.service.recover(s.identity)).status,'PREPARED');await assert.rejects(s.service.readForAuthorization(s.identity));assert.equal(s.store.writes,writes);
 }
});
test('authorization context requires every exact unexpired own hold and rejects observed collisions',async()=>{
 for(const alter of [h=>{h.reservations.pop();},h=>{h.reservations[0].lineageId='changed_lineage';},h=>{h.reservations[0].at++;h.reservations[0].expiresAt++;},h=>{h.reservations[0].stage='issued';h.reservations[0].expiresAt=h.reservations[0].at+600000;},h=>{h.reservationOverflowUntil=2000000;}]){
  const s=await setup();await s.prepare();const history=await s.store.get('bankRecent/alice');alter(history);s.store.docs.set('bankRecent/alice',history);
  await assert.rejects(s.service.readForAuthorization(s.identity));
 }
 const s=await setup();await s.prepare();const history=await s.store.get('bankRecent/alice');
 s.store.docs.set('bankRecent/alice',{...history,...observeReservedQuestions(history,'real-older-game',[questions()[0]],'displayed',s.now(),s.now())});
 await assert.rejects(s.service.readForAuthorization(s.identity),/unfinished round/);
});
test('creation-control changes and exact expiry block authorization while recovery and cancellation remain available',async()=>{
 for(const control of [{enabled:false,version:1},{enabled:true,version:2}]){
  const s=await setup();await s.prepare();s.store.docs.set(ROUND_CREATION_CONTROL,control);
  await assert.rejects(s.service.readForAuthorization(s.identity),e=>e.code==='ROUND_CREATION_CHANGED');assert.equal((await s.service.recover(s.identity)).status,'PREPARED');assert.equal((await s.service.cancel(s.identity)).status,'CANCELLED');
 }
 const s=await setup();await s.prepare();s.advance(30*60000);
 await assert.rejects(s.service.readForAuthorization(s.identity),e=>e.code==='ROUND_NOT_PREPARED');assert.equal((await s.service.recover(s.identity)).status,'EXPIRED');
 await assert.rejects(s.service.readForAuthorization(s.identity),e=>e.code==='ROUND_NOT_PREPARED');
});

// Trusted-receipt fixtures exercise Firestore transition semantics only. The
// prepared-authorization suite separately obtains a real SQLite/D1 receipt.
async function activationSetup(){
 const s=await setup();s.store.docs.set('users/alice',{uid:'alice',rating:100,topicRatings:{integration:100}});await s.prepare();
 const fixed=await s.service.readAuthorizationIdentity(s.identity),context=await s.service.readForAuthorization(s.identity);
 const {frDigest}=await import('../lib/bank/free-response-record.mjs');
 const body={...fixed,history_token:context.historyToken,incarnation:'d'.repeat(64),epoch:7,authorization_deadline:s.now()+30000,protocol_version:1};
 const receipt={...body,body_hash:await frDigest(body),authorized_at:s.now()};
 return {...s,receipt};
}
test('solo activation atomically commits intent, private receipt, exposure, public game and immutable replay',async()=>{
 const s=await activationSetup(),id=s.identity.id,at=s.now(),result=await s.service.activate(s.identity,s.receipt);
 assert.equal(result.game.status,'active');assert.equal(result.game.startTime,at);assert(result.game.questions.every(q=>q.correctIndex===undefined&&q.explanation===undefined));
 assert.equal(s.store.docs.get('roundIntents/'+id).state,'ISSUED');assert(s.store.docs.get('questionSets/'+id).used);assert.equal(s.store.docs.get('questionSets/'+id).questions,undefined);
 const history=s.store.docs.get('bankRecent/alice');assert.equal(history.issuanceGeneration,2);assert.equal(history.exposures.length,2);assert(history.exposures.every(e=>e.stage==='issued'&&e.at===at));assert(history.reservations.every(r=>r.stage==='issued'&&r.at===at&&r.expiresAt===at+600000));
 assert.deepEqual(s.store.docs.get('replayContent/'+id).questions,s.store.docs.get('gameSecrets/'+id).questions);assert.equal(s.store.docs.get('replayManifests/'+id).chunkCount,1);assert.equal(s.store.docs.get('users/alice').rating,100);
 assert.deepEqual(await s.service.recoverActive(s.identity),result);assert.equal((await s.service.cancel(s.identity)).status,'ISSUED');
});
test('simultaneous activation, callback retry and lost acknowledgement keep the first game and original clock',async()=>{
 const s=await activationSetup();s.store.retry=1;
 const results=await Promise.all([s.service.activate(s.identity,s.receipt),s.service.activate(s.identity,s.receipt)]);assert.deepEqual(results[0],results[1]);
 const history=await s.store.get('bankRecent/alice'),writes=s.store.writes;s.advance(1000);assert.deepEqual(await s.service.activate(s.identity,s.receipt),results[0]);assert.equal(s.store.writes,writes);assert.deepEqual(await s.store.get('bankRecent/alice'),history);
 const lost=await activationSetup();lost.store.loseAck=true;await assert.rejects(lost.service.activate(lost.identity,lost.receipt),/lost acknowledgement/);
 const original=await lost.service.recoverActive(lost.identity),before=lost.store.writes;lost.advance(31*60000);lost.store.docs.set(ROUND_CREATION_CONTROL,{enabled:false,version:2});lost.store.docs.set('bankRecent/alice',{issuanceGeneration:999});
 assert.deepEqual(await lost.service.activate(lost.identity,lost.receipt),original);assert.equal(lost.store.writes,before);assert.equal((await lost.service.recover(lost.identity)).status,'ISSUED');
});
test('activation rejects changed history/control, terminal state, expiry and missing exact holds without partial writes',async()=>{
 for(const kind of ['history','disabled','version','expiry','cancelled','holds','profile','orphan']){
  const s=await activationSetup(),id=s.identity.id;
  if(kind==='history')s.store.docs.get('bankRecent/alice').issuanceGeneration++;
  if(kind==='disabled')s.store.docs.set(ROUND_CREATION_CONTROL,{enabled:false,version:1});
  if(kind==='version')s.store.docs.set(ROUND_CREATION_CONTROL,{enabled:true,version:2});
  if(kind==='expiry')s.advance(30*60000);
  if(kind==='cancelled')await s.service.cancel(s.identity);
  if(kind==='holds')s.store.docs.get('bankRecent/alice').reservations=[];
  if(kind==='profile')s.store.docs.delete('users/alice');
  if(kind==='orphan')s.store.docs.set('replayContent/'+id,{preserve:'old data'});
  const writes=s.store.writes;await assert.rejects(s.service.activate(s.identity,s.receipt));assert.equal(s.store.writes,writes);assert.equal(s.store.docs.has('gameSecrets/'+id),false);assert.equal(s.store.docs.has('roundActivations/'+id),false);
 }
});
test('backward clocks cannot create an unrecoverable activation or cancellation',async()=>{
 const s=await activationSetup(),before=structuredClone([...s.store.docs]),writes=s.store.writes;
 s.advance(-1);
 for(const run of [()=>s.service.activate(s.identity,s.receipt),()=>s.service.readForAuthorization(s.identity),()=>s.service.cancel(s.identity)]){
  await assert.rejects(run(),e=>e.code==='ROUND_CLOCK_UNAVAILABLE');assert.equal(s.store.writes,writes);assert.deepEqual([...s.store.docs],before);
 }
 // A clock can also regress after this activation request was received.
 const times=[s.now()+10,s.now()+9],withinRequest=createRoundIntents(s.store,()=>times.shift());
 await assert.rejects(withinRequest.activate(s.identity,s.receipt),e=>e.code==='ROUND_CLOCK_UNAVAILABLE');
 assert.equal(s.store.writes,writes);assert.deepEqual([...s.store.docs],before);
 s.advance(1);const active=await s.service.activate(s.identity,s.receipt);
 s.advance(-1);assert.deepEqual(await s.service.recoverActive(s.identity),active);
 assert.deepEqual(await s.service.activate(s.identity,s.receipt),active);
 const cancelled=await activationSetup();await cancelled.service.cancel(cancelled.identity);cancelled.advance(-1);
 assert.equal((await cancelled.service.recover(cancelled.identity)).status,'CANCELLED');
});
test('a valid saved D1 decision can activate after its insertion deadline but never beyond the original preparation',async()=>{
 const s=await activationSetup();s.advance(31000);assert(s.now()>s.receipt.authorization_deadline);
 const result=await s.service.activate(s.identity,s.receipt);assert.equal(result.game.startTime,s.now());
 const bad=await activationSetup();bad.advance(30*60000);await assert.rejects(bad.service.activate(bad.identity,bad.receipt),e=>e.code==='ROUND_NOT_PREPARED');
});
test('receipt integrity/body and active recovery bindings fail closed',async()=>{
 for(const field of ['binding','selection_hash','policy_hash','body_hash','intent_expires','history_token']){
  const s=await activationSetup(),receipt={...s.receipt,[field]:field==='intent_expires'?s.receipt.intent_expires+1:'e'.repeat(64)},writes=s.store.writes;
  await assert.rejects(s.service.activate(s.identity,receipt));assert.equal(s.store.writes,writes);
 }
 for(const kind of ['questions','selection-override','receipt','missing-game','owner']){
  const s=await activationSetup(),id=s.identity.id;await s.service.activate(s.identity,s.receipt);
  if(kind==='questions')s.store.docs.get('gameSecrets/'+id).questions[0].correctIndex=2;
  if(kind==='selection-override')s.store.docs.get('roundActivations/'+id).selection.questions=questions();
  if(kind==='receipt')s.store.docs.get('roundActivations/'+id).receipt.body_hash='e'.repeat(64);
  if(kind==='missing-game')s.store.docs.delete('gameSecrets/'+id);
  if(kind==='owner')s.store.docs.get('roundActivations/'+id).uid='bobby';
  await assert.rejects(s.service.recoverActive(s.identity));
 }
});
test('caller receipt mutation cannot cross the first asynchronous boundary',async()=>{
 const s=await activationSetup(),receipt=structuredClone(s.receipt),pending=s.service.activate(s.identity,receipt);receipt.body_hash='f'.repeat(64);receipt.control_version=100;
 assert.equal((await pending).game.status,'active');
});
test('rapid activation retains the bound timer while competitive activation remains explicitly unavailable',async()=>{
 for(const mode of ['rapid','pvp']){
  const s=await setup();s.store.docs.set('users/alice',{uid:'alice',rating:0});
  const identity=await roundIdentity('alice','mode_operation',{...request,mode,...(mode==='rapid'?{options:{timeLimit:60}}:{})});
  await s.service.prepare(identity,selection(),await s.token(),policy);
  const fixed=await s.service.readAuthorizationIdentity(identity),context=await s.service.readForAuthorization(identity),{frDigest}=await import('../lib/bank/free-response-record.mjs');
  const body={...fixed,history_token:context.historyToken,incarnation:'d'.repeat(64),epoch:7,authorization_deadline:s.now()+30000,protocol_version:1},receipt={...body,body_hash:await frDigest(body),authorized_at:s.now()};
  if(mode==='rapid'){const r=await s.service.activate(identity,receipt);assert.equal(r.game.startTime,s.now()+3000);assert.equal(r.game.deadline,s.now()+63000);assert.equal(r.game.originalTimeLimit,60);}else{const writes=s.store.writes;await assert.rejects(s.service.activate(identity,receipt),/Competitive/);assert.equal(s.store.writes,writes);}
 }
});
