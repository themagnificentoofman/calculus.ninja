import {afterSixAborts, afterSixRetryableCommits} from './fixtures/exhausted-contention.mjs';
import {freeResponseFixture} from './fixtures/free-response.mjs';
import {freeResponseQuestions} from '../lib/server/free-response-questions.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, signInAnonymously } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where, terminate, onSnapshot } from 'firebase/firestore';
import { firestoreStore, StoreError } from '../lib/server/firestore-admin.ts';
import { createReplayApi } from '../lib/server/replay-api.ts';
import { createGameApi } from '../lib/server/game-api.ts';
import { repairRatingPage } from '../lib/server/rating-repair.ts';
import { watchPublicLobbies } from '../lib/lobby-catalog.ts';
import { LOBBY_LEASE_MS } from '../lib/lobby.ts';
import { loadLeaderboard, loadRecentGames, loadWaitingGames, searchPublicProfiles } from '../lib/stat-queries.ts';
import {OPERATORS} from '../lib/math-answer/grade.mjs';
import {loadReplay} from '../lib/replay/playback.ts';
import {roundAnalysis} from '../lib/replay/engine.ts';
import {createServerGames} from '../lib/server/game-engine.ts';
import {recordExposures} from '../lib/bank/exposure.ts';
import {reserveQuestionSet} from '../lib/bank/issuance-reservations.mjs';
import {createRoundIntents,roundIdentity,ROUND_CREATION_CONTROL} from '../lib/server/round-intents.ts';
import {selectionHistoryToken} from '../lib/server/selection-history-token.mjs';
import {frDigest} from '../lib/bank/free-response-record.mjs';
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
const enabled = /^127\.0\.0\.1:\d+$/.test(process.env.FIRESTORE_EMULATOR_HOST || '');
const project = 'demo-calculus-rendering';
const store = firestoreStore(project, '(default)', async () => 'owner', `http://${firestoreHost}`);
let clock = Date.now(), sequence = 0;
const actors = [], identities = new Map();
const fixture = (difficulty, count) => Array.from({length:count},(_,i)=>({latexProblem:String.raw`\int x^2\,dx`,options:[String.raw`\frac{x^3}{3}+C`,'x+C','2x+C','3x+C'],correctIndex:0,explanation:[String.raw`\textnormal{Apply the power rule.}`],topic:'integration',difficulty}));
const api = createGameApi({store,now:()=>clock,verify:async token=>{const c=identities.get(token);if(!c)throw Error('invalid');return c;},select:async({difficulty:d,count:n})=>({questions:fixture(d,n),relaxation:'none'}),quota:async()=>true});
async function actor() {
 const app=initializeApp({projectId:project,apiKey:'emulator-only',authDomain:'localhost'},`secure-${Date.now()}-${sequence++}`);
 const auth=getAuth(app);connectAuthEmulator(auth,`http://${authHost}`,{disableWarnings:true});const db=getFirestore(app);connectFirestoreEmulator(db,'127.0.0.1',Number(firestoreHost.split(':')[1]));
 const {user}=await signInAnonymously(auth),token=await user.getIdToken();identities.set(token,{sub:user.uid,name:'Secure QA',email:'private@example.test'});
 const a={app,db,uid:user.uid,token,
  call:async(resource,body,expected=200)=>{const res=await api(resource,new Request(`https://test.invalid/api/${resource}`,{method:'POST',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify(body)}));const payload=await res.json();assert.equal(res.status,expected,JSON.stringify(payload));return payload;},
  profile:async()=> (await getDoc(doc(db,'users',user.uid))).data(), game:async id=>(await getDoc(doc(db,'games',id))).data()};actors.push(a);await a.call('profile',{});return a;
}
async function game(a,mode='test',difficulty='easy',count=3,extra={}) {
 const set=await a.call('questions',{mode,category:'integration',difficulty,count});assert.deepEqual(Object.keys(set).sort(),['questionCount','questionSetId']);
 const options={category:'integration',difficulty,timeLimit:30,visibility:'public',settings:{winCondition:'first_to_n',targetScore:5,timeLimit:30,penalties:false},...extra};
 return (await a.call('games',{action:'create',mode,questionSetId:set.questionSetId,options})).id;
}
const answer=(a,id,index,selectedOption=0,expected=200)=>a.call('games',{action:'answer',gameId:id,index,selectedOption},expected);
const all=async(a,id,choice=0)=>{for(let i=0;i<3;i++)await answer(a,id,i,choice);};
const denied=promise=>assert.rejects(promise,e=>e.code==='permission-denied');
test('Server-authoritative games and Firestore attack tests', {skip:!enabled,timeout:180000},async t=>{
 try {
  await t.test('Private preparation survives real Firestore races and uncertain acknowledgement without exposing content',async()=>{
   const a=await actor(),other=await actor(),previousControl=await store.get(ROUND_CREATION_CONTROL),at=clock;
   try{
    await store.transaction(async tx=>tx.set(ROUND_CREATION_CONTROL,{enabled:true,version:1}));
    const service=createRoundIntents(store,()=>clock),identity=await roundIdentity(a.uid,'emulator_stable_start',{mode:'test',category:'integration',difficulty:'easy',count:2});
    const questions=fixture('easy',2).map((q,i)=>({...q,problemId:`intent_problem_${i}`,lineageId:`intent_lineage_${i}`,familyId:'intent_family',problemRevision:1,contentHash:'c'.repeat(64),bankRelease:'emulator_only',choiceOrder:['a','b','c','d']}));
    const selected={questions,relaxation:'none',diagnostics:{}},policy={registryHash:'a'.repeat(64),selectionPolicyHash:'b'.repeat(64),includeLegacy:false};
    const retained=recordExposures({},'older',Array.from({length:512},(_,i)=>({problemId:`intent_old_${i}`,familyId:'old_family'})),'attempted',clock);
    await store.transaction(async tx=>tx.set('bankRecent/'+a.uid,retained));
    const token=await selectionHistoryToken(retained),results=await Promise.all([service.prepare(identity,selected,token,policy),service.prepare(identity,selected,token,policy)]);
    assert.deepEqual(results[0],results[1]);assert.equal(results[0].status,'PREPARED');
    const history=await store.get('bankRecent/'+a.uid);assert.deepEqual(history.exposures,retained.exposures);assert.equal(history.issuanceGeneration,(retained.issuanceGeneration??0)+1);assert.equal(history.reservations.length,2);
    const context=await service.readForAuthorization(identity);
    assert.deepEqual(context.set.questions,questions);assert.equal(context.set.expiresAt,clock+30*60000);
    assert.equal(context.selectionHistory.reservations.length,0);assert.deepEqual(context.selectionHistory.exposures,retained.exposures);assert.equal(context.historyToken,await selectionHistoryToken(history));
    assert.deepEqual(context.set.diagnostics,{});
    const receiptIdentity=await service.readAuthorizationIdentity(identity);
    assert.equal(receiptIdentity.selection_hash,context.intent.selectionHash);assert.equal(receiptIdentity.intent_expires,context.intent.expiresAt);
    await store.transaction(async tx=>tx.set(ROUND_CREATION_CONTROL,{enabled:false,version:2}));
    assert.deepEqual(await service.readAuthorizationIdentity(identity),receiptIdentity);
    await assert.rejects(service.readForAuthorization(identity),e=>e.code==='ROUND_CREATION_CHANGED');
    for(const path of ['roundIntents/'+identity.id,'questionSets/'+identity.id,ROUND_CREATION_CONTROL]){await denied(getDoc(doc(a.db,path)));await denied(setDoc(doc(other.db,path),{enabled:true}));}
    await assert.rejects(createServerGames(store,()=>clock).createGame(a.uid,identity.id,'test',{}),e=>e.status===409);
    let lost=true;const flaky={...store,transaction:async fn=>{const value=await store.transaction(fn);if(lost){lost=false;throw Error('lost commit acknowledgement');}return value;}};
    await assert.rejects(createRoundIntents(flaky,()=>clock).cancel(identity),/lost commit/);
    assert.equal((await service.recover(identity)).status,'CANCELLED');assert.equal(await store.get('questionSets/'+identity.id),null);
    await assert.rejects(service.readAuthorizationIdentity(identity),e=>e.code==='ROUND_NOT_PREPARED');
    assert.deepEqual((await store.get('bankRecent/'+a.uid)).exposures,retained.exposures);
    await store.transaction(async tx=>tx.set(ROUND_CREATION_CONTROL,{enabled:true,version:3}));
    const next=await roundIdentity(a.uid,'emulator_expiring_start',identity.request),nextToken=await selectionHistoryToken(await store.get('bankRecent/'+a.uid));
    await service.prepare(next,selected,nextToken,policy);clock+=30*60000;
    assert.equal((await service.recover(next)).status,'EXPIRED');assert.equal((await service.prepare(next,selected,nextToken,policy)).status,'EXPIRED');
    assert.equal(await store.get('gameSecrets/'+identity.id),null);assert.equal(await store.get('replayContent/'+identity.id),null);
   }finally{clock=at;await store.transaction(async tx=>{if(previousControl)tx.set(ROUND_CREATION_CONTROL,previousControl);else tx.delete(ROUND_CREATION_CONTROL);});}
  });
  await t.test('Authorized solo activation is atomic and recoverable in real Firestore; client receipts remain private',async()=>{
   const a=await actor(),other=await actor(),previousControl=await store.get(ROUND_CREATION_CONTROL),at=clock;
   try{
    await store.transaction(async tx=>tx.set(ROUND_CREATION_CONTROL,{enabled:true,version:41}));
    const service=createRoundIntents(store,()=>clock),identity=await roundIdentity(a.uid,'emulator_authorized_solo',{mode:'test',category:'integration',difficulty:'easy',count:2});
    const questions=fixture('easy',2).map((q,i)=>({...q,problemId:`activation_problem_${i}`,lineageId:`activation_lineage_${i}`,familyId:'activation_family',constructionFamilyId:'activation_family',problemRevision:1,contentHash:'c'.repeat(64),bankRelease:'emulator_only',choiceOrder:['a','b','c','d']}));
    await service.prepare(identity,{questions,relaxation:'none',diagnostics:{}},await selectionHistoryToken({}),{registryHash:'a'.repeat(64),selectionPolicyHash:'b'.repeat(64),includeLegacy:false});
    const fixed=await service.readAuthorizationIdentity(identity),context=await service.readForAuthorization(identity);
    // Trusted receipt stub isolates the real Firestore boundary. A different
    // test obtains the receipt from actual local SQLite, not this stub.
    const body={...fixed,history_token:context.historyToken,incarnation:'d'.repeat(64),epoch:7,authorization_deadline:clock+30000,protocol_version:1},receipt={...body,body_hash:await frDigest(body),authorized_at:clock};
    const results=await Promise.all([service.activate(identity,receipt),service.activate(identity,receipt)]),id=identity.id;assert.deepEqual(results[0],results[1]);
    const recoveredDuplicate=await afterSixAborts(project,firestoreHost,async()=>{},db=>createRoundIntents(db,()=>clock).activate(identity,receipt));
    assert.deepEqual(recoveredDuplicate,results[0]);
    assert.equal((await store.get('roundIntents/'+id)).state,'ISSUED');assert.equal((await store.get('replayManifests/'+id)).chunkCount,1);
    assert.deepEqual((await store.get('replayContent/'+id)).questions,questions);assert.equal((await store.get('bankRecent/'+a.uid)).issuanceGeneration,2);
    for(const path of ['roundActivations/'+id,'roundIntents/'+id,'gameSecrets/'+id,'replayContent/'+id]){await denied(getDoc(doc(a.db,path)));await denied(setDoc(doc(other.db,path),{receipt}));}
    const exposed=await a.game(id);assert(exposed.questions.every(q=>q.correctIndex===undefined&&q.explanation===undefined));
    await answer(a,id,0);await answer(a,id,1);const finished=await service.recoverActive(identity);assert.equal(finished.game.status,'finished');
    const priorGame=await store.get('gameSecrets/'+id),priorHistory=await store.get('bankRecent/'+a.uid),priorProfile=await a.profile();
    clock+=31*60000;await store.transaction(async tx=>tx.set(ROUND_CREATION_CONTROL,{enabled:false,version:42}));
    assert.deepEqual(await service.activate(identity,receipt),finished);assert.deepEqual(await store.get('gameSecrets/'+id),priorGame);assert.deepEqual(await store.get('bankRecent/'+a.uid),priorHistory);assert.deepEqual(await a.profile(),priorProfile);
    // Losing the acknowledgement of the first activation still recovers the
    // original game, replay and hold rather than producing a second issuance.
    clock=at;await store.transaction(async tx=>tx.set(ROUND_CREATION_CONTROL,{enabled:true,version:43}));
    const b=await actor(),next=await roundIdentity(b.uid,'emulator_lost_activation',identity.request);
    await service.prepare(next,{questions,relaxation:'none'},await selectionHistoryToken({}),{registryHash:'a'.repeat(64),selectionPolicyHash:'b'.repeat(64),includeLegacy:false});
    const fixed2=await service.readAuthorizationIdentity(next),context2=await service.readForAuthorization(next),body2={...fixed2,history_token:context2.historyToken,incarnation:'d'.repeat(64),epoch:7,authorization_deadline:clock+30000,protocol_version:1},receipt2={...body2,body_hash:await frDigest(body2),authorized_at:clock};
    await afterSixAborts(project,firestoreHost,async()=>{},db=>
     assert.rejects(createRoundIntents(db,()=>clock).activate(next,receipt2),e=>e instanceof StoreError&&e.status===409));
    assert.equal((await store.get('roundIntents/'+next.id)).state,'PREPARED');assert.equal(await store.get('roundActivations/'+next.id),null);
    let lost=true;const flaky={...store,transaction:async fn=>{const value=await store.transaction(fn);if(lost){lost=false;throw Error('lost activation acknowledgement');}return value;}};
    await assert.rejects(createRoundIntents(flaky,()=>clock).activate(next,receipt2),/lost activation/);clock+=1000;
    const recovered=await service.activate(next,receipt2);assert.equal(recovered.game.startTime,at);assert.equal((await store.get('replayManifests/'+next.id)).chunkCount,1);assert.equal((await store.get('bankRecent/'+b.uid)).issuanceGeneration,2);
   }finally{clock=at;await store.transaction(async tx=>{if(previousControl)tx.set(ROUND_CREATION_CONTROL,previousControl);else tx.delete(ROUND_CREATION_CONTROL);});}
  });
  await t.test('FR: actual Firestore private receipts, editable ungraded input, concurrent settlement and recorded v2 replay',async()=>{
   const a=await actor(),outsider=await actor();
   const questions=Array.from({length:2},(_,i)=>{
    const statement=String.raw`\int_0^1 x\,\mathrm{d}x`,contract={version:'answer-contract-1',parserVersion:'bounded-latex-1',graderVersion:'exact-algebra-1',contractId:`emulator_contract_${i}`,contractHash:`emulator_contract_hash_${i}`,domain:'real',branch:'real-principal',allowedOperators:OPERATORS,answer:{kind:'scalar',expected:'1/2'},instructions:'Enter an exact real number.',review:{referenceVerified:true},presentation:{version:'emulator-fixture-only',statement,assumptions:['real']}};
    return {responseFormat:'free-response',problemId:`emulator_problem_${i}`,problemRevision:1,contentHash:`emulator_content_${i}`,lineageId:`emulator_lineage_${i}`,constructionFamilyId:'emulator_fixture',familyId:'emulator_fixture',bankRelease:'emulator_only',latexProblem:statement,explanation:[String.raw`[x^2/2]_0^1=1/2`],answerInstructions:contract.instructions,answerContractId:contract.contractId,answerContractHash:contract.contractHash,graderVersion:contract.graderVersion,parserVersion:contract.parserVersion,freeResponse:contract,topic:'integration',difficulty:'easy',context:{assumptions:['real'],subtopic:'FTC',techniqueTags:['FTC'],parameters:{}}};
   });
   const fr=createGameApi({store,now:()=>clock,verify:async token=>identities.get(token),select:async()=>{throw Error('No MC substitution');},selectFreeResponse:async()=>({questions,relaxation:'none'}),freeResponseEnabled:true,quota:async()=>true});
   const call=async(resource,body,expected=200)=>{const response=await fr(resource,new Request(`https://test.invalid/api/${resource}`,{method:'POST',headers:{authorization:`Bearer ${a.token}`,'content-type':'application/json'},body:JSON.stringify(body)}));const value=await response.json();assert.equal(response.status,expected,JSON.stringify(value));return value;};
   const set=await call('questions',{mode:'test',category:'integration',difficulty:'easy',count:2,responseFormat:'free-response'}),id=(await call('games',{action:'create',mode:'test',questionSetId:set.questionSetId,options:{}})).id;
   await store.transaction(async tx=>{const recent=await tx.get(`bankRecent/${a.uid}`);tx.set(`bankRecent/${a.uid}`,{...recent,...reserveQuestionSet(recent,id,questions,'issued',clock)});});
   const original=await a.game(id);assert.equal(original.replayVersion,2);for(const key of ['freeResponse','expected','options','correctIndex','source','interpretation'])assert.equal(JSON.stringify(original).includes(`"${key}"`),false,key);
   const send=(index,source,requestId)=>call('games',{action:'fr-submit',gameId:id,index,source,requestId});
   const invalid=await send(0,'','invalid_source');assert.equal(invalid.verdict.outcome,'invalid');assert.deepEqual(invalid.progress.reviews,{});assert.equal((await a.profile()).xp,0);
   assert.equal((await store.get(`bankRecent/${a.uid}`)).reservations.length,2,'neutral submission preserves holds');
   const path=`frSubmissions/${a.uid}_${id}_invalid_source`;await denied(getDoc(doc(a.db,path)));await denied(getDoc(doc(outsider.db,path)));await denied(setDoc(doc(a.db,path),{outcome:'correct'}));
   await denied(getDoc(doc(a.db,`gameSecrets/${id}`)));await denied(getDoc(doc(outsider.db,`games/${id}/reviews/${a.uid}`)));
   assert.equal((await send(0,'','invalid_source')).duplicate,true);await call('games',{action:'fr-submit',gameId:id,index:0,source:'1/2',requestId:'invalid_source'},409);
   const results=await Promise.all([send(0,'2/4','graded_source'),send(0,'2/4','graded_source')]);assert.equal(results.filter(r=>r.duplicate).length,1);assert.equal((await a.profile()).xp,10);assert.equal(results[0].progress.reviews[0].canonicalAnswer,'1/2');
   assert.deepEqual((await store.get(`bankRecent/${a.uid}`)).reservations.map(r=>r.problemId),[questions[1].problemId]);
   const completed=await call('games',{action:'fr-reveal',gameId:id,index:1,requestId:'reveal_second'});assert.equal(completed.game.status,'finished');assert.deepEqual(completed.progress.freeResponseSummary,{correct:1,incorrect:0,graded:1,skipped:0,revealed:1,ungradedSubmissions:1,finalized:2,total:2});
   assert.equal((await store.get(`bankRecent/${a.uid}`)).reservations.length,0,'final exposure transfers to retained attempts without grading the reveal');
   const profile=await a.profile();assert.equal(profile.correctAnswers,0);assert.equal(profile.answeredQuestions,0);assert.equal(profile.ratedGames,0);assert.equal(profile.xp,10);
   const replay=createReplayApi({store,now:()=>clock,verify:async token=>identities.get(token)});
   const read=async body=>{const response=await replay(new Request('https://test.invalid/api/replay',{method:'POST',headers:{authorization:`Bearer ${a.token}`,'content-type':'application/json'},body:JSON.stringify(body)}));assert.equal(response.status,200);return response.json();};
   const recording=await loadReplay(id,read),analysis=roundAnalysis(recording);assert.equal(recording.manifest.replayVersion,2);assert.equal(analysis.overall.correct,1);assert.equal(analysis.overall.attempted,1);assert.equal(analysis.overall.revealed,1);assert.equal(analysis.overall.ungradedSubmissions,1);assert.equal(analysis.overall.accuracy,100);
  });
  await t.test('An exhausted FR submission recovers only its exact committed receipt',async()=>{
   const f=await freeResponseFixture(),questions=await freeResponseQuestions([f.record],f.admissions);
   for(const scenario of ['absent','changed','exact']){
    const a=await actor(),dependencies={now:()=>clock,verify:async token=>identities.get(token),
     select:async()=>{throw Error('Unexpected MC selection');},selectFreeResponse:async()=>({questions,relaxation:'none'}),
     freeResponseEnabled:true,quota:async()=>true};
    const ordinary=createGameApi({...dependencies,store});
    const call=(client,resource,body)=>client(resource,new Request('https://test.invalid/api/'+resource,{
     method:'POST',headers:{authorization:'Bearer '+a.token,'content-type':'application/json'},body:JSON.stringify(body),
    }));
    const set=await call(ordinary,'questions',{mode:'test',category:'differentiation',difficulty:'easy',count:1,responseFormat:'free-response'});
    assert.equal(set.status,200);
    const create=await call(ordinary,'games',{action:'create',mode:'test',questionSetId:(await set.json()).questionSetId,options:{}});
    assert.equal(create.status,200);
    const id=(await create.json()).id,body={action:'fr-submit',gameId:id,index:0,source:'2x',requestId:'graded_receipt'};
    const peerSource=scenario==='changed'?'3x':body.source;
    const result=await afterSixAborts(project,firestoreHost,async()=>{
     if(scenario!=='absent')assert.equal((await call(ordinary,'games',{...body,source:peerSource})).status,200);
    },db=>call(createGameApi({...dependencies,store:db}),'games',body));
    const response=await result.json(),receipt=await store.get('frSubmissions/'+a.uid+'_'+id+'_'+body.requestId),profile=await a.profile();
    if(scenario==='absent'){
     assert.equal(result.status,503);assert.equal(receipt,null);assert.equal(profile.xp,0);
     assert.equal((await a.game(id)).status,'active');
    }else{
     assert.equal(receipt.source,peerSource);assert.equal(profile.freeResponseStats.graded,1);
     if(scenario==='changed'){
      assert.equal(result.status,409);assert.match(response.error,/different content/);assert.equal(profile.xp,0);
     }else{
      assert.equal(result.status,200);assert.equal(response.duplicate,true);
      assert.equal(response.answer.submissionId,body.requestId);assert.equal(response.verdict.outcome,'correct');assert.equal(profile.xp,10);
     }
    }
   }
  });
  await t.test('Concurrent FR and mixed issuance retries against actual Firestore history without duplicate exposure',async()=>{
   const f=await freeResponseFixture(),[fr]=await freeResponseQuestions([f.record],f.admissions);
   for(const mixed of [false,true]){
    const a=await actor(),mc={...fixture('easy',1)[0],topic:'differentiation',problemId:'issuance_mc',problemRevision:1,contentHash:'issuance_mc_hash',lineageId:'issuance_mc_lineage',familyId:'issuance_mc_family',constructionFamilyId:'issuance_mc_family',bankRelease:'emulator_only',choiceOrder:['a','b','c','d']};
    let arrivals=0,release;const barrier=new Promise(r=>release=r),questions=mixed?[mc,fr]:[fr];
    const select=async()=>{if(++arrivals===2)release();await barrier;return{questions,relaxation:'none'};};
    const race=createGameApi({store,now:()=>clock,verify:async token=>identities.get(token),select:async()=>{throw Error('No substitution');},selectFreeResponse:select,selectMixed:select,freeResponseEnabled:true,quota:async()=>true});
    const body={mode:'test',category:'differentiation',difficulty:'easy',count:questions.length,...(mixed?{questionMix:{multipleChoice:1,freeResponse:1,order:'uniform'}}:{responseFormat:'free-response'})};
    const send=()=>race('questions',new Request('https://test.invalid/api/questions',{method:'POST',headers:{authorization:`Bearer ${a.token}`,'content-type':'application/json'},body:JSON.stringify(body)}));
    const results=await Promise.all([send(),send()]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
    const conflict=await results.find(r=>r.status===409).json();assert.match(conflict.error,/history changed/);assert.equal(conflict.code,undefined);
    const issued=await results.find(r=>r.status===200).json(),saved=await store.get('questionSets/'+issued.questionSetId),history=await store.get('bankRecent/'+a.uid);
    assert.equal(saved.questions.length,questions.length);assert.equal(history.exposures.length,questions.length);assert.match(saved.issuanceBinding,/^[a-f0-9]{64}$/);
   }
  });
  await t.test('Legacy FR issuance reconciles the durable ticket or stale history after contention', async () => {
    const f = await freeResponseFixture();
    const [fr] = await freeResponseQuestions([f.record], f.admissions);
    for (const scenario of ['missing', 'peer issued', 'own acknowledgement lost']) {
      const a = await actor();
      const dependencies = {now: () => clock, verify: async token => identities.get(token),
        select: async () => {throw Error('Unexpected MC selection');},
        selectFreeResponse: async () => ({questions: [fr], relaxation: 'none'}),
        freeResponseEnabled: true, quota: async () => true};
      const attemptedIds = new Set();
      const send = db => createGameApi({...dependencies, store: {...db,
        transaction: (write, read) => db.transaction(tx => write({...tx, get: path => {
          if (path.startsWith('questionSets/')) attemptedIds.add(path.slice('questionSets/'.length));
          return tx.get(path);
        }}), read)}})('questions',
        new Request('https://test.invalid/api/questions', {method: 'POST',
          headers: {authorization: 'Bearer ' + a.token, 'content-type': 'application/json'},
          body: JSON.stringify({mode: 'test', difficulty: 'easy', category: 'differentiation', count: 1, responseFormat: 'free-response'})}));
      let peerId;
      const result = await afterSixRetryableCommits(project, firestoreHost, async () => {
        if (scenario === 'peer issued') {
          const peer = await send(store);
          assert.equal(peer.status, 200);
          peerId = (await peer.json()).questionSetId;
        }
      }, send, {loseLastAcknowledgement: scenario === 'own acknowledgement lost'});
      const body = await result.json();
      const history = await store.get('bankRecent/' + a.uid);
      assert.equal(attemptedIds.size, scenario === 'peer issued' ? 2 : 1);
      const documents = await Promise.all([...attemptedIds].map(async id => ({id, data: await store.get('questionSets/' + id)})));
      const sets = documents.filter(doc => doc.data);
      if (scenario === 'missing') {
        assert.equal(result.status, 503);
        assert.equal(sets.length, 0);
        assert.equal((history?.exposures ?? []).length, 0);
        continue;
      }
      assert.equal(sets.length, 1);
      assert.deepEqual(sets[0].data.questions, [fr]);
      assert.equal(history.exposures.length, 1);
      if (scenario === 'peer issued') {
        assert.equal(result.status, 409);
        assert.match(body.error, /history changed/);
        assert.equal(body.questionSetId, undefined);
        assert.equal(sets[0].id, peerId);
      } else {
        assert.equal(result.status, 200);
        assert.deepEqual(body, {questionSetId: sets[0].id, questionCount: 1});
      }
    }
  });
  await t.test('Mixed: persisted counts/order and separate once-only results for either final question type',async()=>{
   for(const order of ['mcq-first','frq-first']){
    const a=await actor(),mix={multipleChoice:1,freeResponse:1,order};
    const statement=String.raw`\int_0^1 x\,\mathrm{d}x`,contract={version:'answer-contract-1',parserVersion:'bounded-latex-1',graderVersion:'exact-algebra-1',contractId:'mixed-emulator-contract',contractHash:'mixed-emulator-hash',domain:'real',branch:'real-principal',allowedOperators:OPERATORS,answer:{kind:'scalar',expected:'1/2'},instructions:'Enter an exact real number.',review:{referenceVerified:true},presentation:{version:'emulator-fixture-only',statement,assumptions:['real']}};
    const fr={responseFormat:'free-response',problemId:'mixed_emulator_fr',problemRevision:1,contentHash:'mixed_fr_hash',lineageId:'mixed_fr_lineage',constructionFamilyId:'mixed_fr_family',familyId:'mixed_fr_family',bankRelease:'emulator_only',latexProblem:statement,explanation:['1/2'],answerInstructions:contract.instructions,answerContractId:contract.contractId,answerContractHash:contract.contractHash,graderVersion:contract.graderVersion,parserVersion:contract.parserVersion,freeResponse:contract,topic:'integration',difficulty:'easy',context:{assumptions:['real'],subtopic:'FTC',techniqueTags:['FTC'],parameters:{}}};
    const mc={...fixture('easy',1)[0],problemId:'mixed_emulator_mc',problemRevision:1,contentHash:'mixed_mc_hash',lineageId:'mixed_mc_lineage',constructionFamilyId:'mixed_mc_family',familyId:'mixed_mc_family',bankRelease:'emulator_only',choiceOrder:['a','b','c','d'],context:{assumptions:['real'],subtopic:'fixture',techniqueTags:['fixture'],parameters:{}}};
    const mixedApi=createGameApi({store,now:()=>clock,verify:async token=>identities.get(token),select:async()=>{throw Error('No fallback');},selectMixed:async()=>({questions:[fr,mc],relaxation:'none'}),freeResponseEnabled:true,quota:async()=>true});
    const call=async(resource,body)=>{const response=await mixedApi(resource,new Request(`https://test.invalid/api/${resource}`,{method:'POST',headers:{authorization:`Bearer ${a.token}`,'content-type':'application/json'},body:JSON.stringify(body)}));const value=await response.json();assert.equal(response.status,200,JSON.stringify(value));return value;};
    const set=await call('questions',{mode:'test',category:'integration',difficulty:'easy',count:2,questionMix:mix}),id=(await call('games',{action:'create',mode:'test',questionSetId:set.questionSetId,options:{}})).id;
    const original=await a.game(id);assert.deepEqual(original.questionMix,mix);assert.equal(original.responseFormat,'mixed');await denied(updateDoc(doc(a.db,'games',id),{questionMix:{multipleChoice:20,freeResponse:0,order:'uniform'}}));
    for(let i=0;i<2;i++){
     const free=(order==='frq-first')===(i===0),body={action:free?'fr-submit':'answer',gameId:id,index:i,requestId:`mixed_emulator_${i}`,...(free?{source:'1/2'}:{selectedOption:0})};
     if(i===0)await call('games',body);else{const pair=await Promise.all([call('games',body),call('games',body)]);assert.equal(pair.filter(r=>r.duplicate).length,1);}
    }
    const profile=await a.profile(),view=await call('games',{action:'view',gameId:id});assert.equal(view.game.status,'finished');assert.equal(profile.xp,20);assert.equal(profile.gamesPlayed,1);assert.equal(profile.answeredQuestions,1);assert.equal(profile.correctAnswers,1);assert.equal(profile.freeResponseStats.graded,1);assert.equal(profile.freeResponseStats.correct,1);assert.equal(profile.freeResponseStats.rounds,1);assert.equal(view.progress.freeResponseSummary.total,1);
    assert.deepEqual((await store.get(`replayManifests/${id}`)).settings.questionMix,mix);assert.deepEqual((await store.get(`replayContent/${id}`)).questions.map(q=>q.responseFormat==='free-response'),order==='frq-first'?[true,false]:[false,true]);
   }
  });
  await t.test('A retry of a multiple-choice answer recovers only the matching saved submission after contention', async () => {
    for (const scenario of ['exact', 'final', 'legacy request', 'absent', 'other option', 'other request']) {
      const a = await actor();
      const id = await game(a, 'test', 'easy', scenario === 'final' ? 1 : 3);
      const request = {action: 'answer', gameId: id, index: 0, selectedOption: 0};
      if (scenario !== 'legacy request') request.requestId = 'original_answer_request';
      const peer = {...request};
      if (scenario === 'other option') peer.selectedOption = 1;
      if (scenario === 'other request') peer.requestId = 'different_answer_request';
      const response = await afterSixAborts(project, firestoreHost, async () => {
        if (scenario !== 'absent') await a.call('games', peer);
      }, db => {
        const client = createGameApi({store: db, now: () => clock, quota: async () => true,
          verify: async token => identities.get(token), select: async () => {throw Error('Unexpected selection');}});
        return client('games', new Request('https://test.invalid/api/games', {method: 'POST',
          headers: {authorization: 'Bearer ' + a.token, 'content-type': 'application/json'}, body: JSON.stringify(request)}));
      });
      const state = await store.get('gameSecrets/' + id);
      const saved = state.answers?.[a.uid]?.[0];
      const profile = await a.profile();
      if (scenario === 'absent') {
        assert.equal(response.status, 503);
        assert.equal(saved, undefined);
        assert.equal(profile.answeredQuestions, 0);
        assert.equal(profile.xp, 0);
        continue;
      }
      assert.equal(saved.selectedOption, peer.selectedOption);
      assert.equal(profile.answeredQuestions, 1);
      assert.equal(profile.xp, saved.xp);
      if (scenario === 'other option' || scenario === 'other request') {
        assert.equal(response.status, 503);
        continue;
      }
      assert.equal(response.status, 200);
      const acknowledgement = await response.json();
      assert.equal(acknowledgement.duplicate, true);
      assert.deepEqual(acknowledgement.answer, saved);
      assert.deepEqual(acknowledgement.receipt, state.receipts?.[a.uid] ?? null);
      assert.equal(acknowledgement.progress.reviews[0].correctIndex, 0);
      assert.equal(acknowledgement.progress.reviews[1], undefined);
      assert.equal(profile.xp, 10);
      assert.equal(profile.gamesPlayed, scenario === 'final' ? 1 : 0);
    }
  });
  await t.test('Test: private generation, server grading, concurrent replay and exactly-once rewards',async()=>{
   const a=await actor(),id=await game(a);
   const first=await a.call('games',{action:'view',gameId:id});assert.ok(!JSON.stringify(first).includes('correctIndex'));assert.ok(!JSON.stringify(first).includes('explanation'));
   const r=await Promise.all([answer(a,id,0),answer(a,id,0)]);assert.equal(r.filter(x=>x.duplicate).length,1);assert.equal((await a.profile()).xp,10);
   assert.equal(r[0].progress.reviews[0].correctIndex,0);assert.equal(r[0].progress.reviews[1],undefined);
   await answer(a,id,1);await answer(a,id,2,1);await a.call('games',{action:'claim',gameId:id});await a.call('games',{action:'claim',gameId:id});
   const p=await a.profile();assert.equal(p.xp,20);assert.equal(p.gamesPlayed,1);assert.equal(p.answeredQuestions,3);assert.equal(p.correctAnswers,2);
   assert.equal((await loadRecentGames(a.db,a.uid))[0].id,id);
   const publicDoc=await a.game(id);assert.ok(!JSON.stringify(publicDoc).includes('correctIndex'));assert.ok(!JSON.stringify(publicDoc).includes('selectedOption'));
  });
  await t.test('Private replay endpoints enforce the whole-match gate and persist real Firestore chunks',async()=>{
   const a=await actor(),b=await actor(),c=await actor(),id=await game(a,'pvp');const replay=createReplayApi({store,now:()=>clock,verify:async token=>identities.get(token)});
   const read=async(actor,body,expected=200)=>{const response=await replay(new Request('https://test.invalid/api/replay',{method:'POST',headers:{authorization:`Bearer ${actor.token}`,'content-type':'application/json'},body:JSON.stringify({roundId:id,...body})}));assert.equal(response.status,expected);return response.json();};
   await b.call('games',{action:'join',gameId:id,mode:'pvp'});clock+=4000;await all(a,id);await read(a,{op:'read'},409);await read(c,{op:'read'},403);
   for(const path of [`replayContent/${id}`,`replayManifests/${id}`,`replayServer/${id}_000000`,`replayCapture/${id}_${a.uid}`])await denied(getDoc(doc(a.db,path)));
   await read(a,{op:'open',segmentId:'real_segment'});const payload={op:'upload',segmentId:'real_segment',chunkIndex:0,anchorMs:100,uncertaintyMs:5,closed:true,events:[{schemaVersion:1,eventId:'real_event_1',sequence:1,monotonicMs:100,type:'session_closed'}]};await read(a,payload);assert.equal((await read(a,payload)).duplicate,true);
   await all(b,id);const before=await a.profile(),result=await read(a,{op:'read'}),server=await read(a,{op:'server',start:0});assert.equal(result.manifest.questionCount,3);assert.equal(result.replayStatus,'Partial');assert.ok(server.chunks.flatMap(c=>c.events).filter(e=>e.type==='answer_accepted').every(e=>e.playerId===a.uid));assert.deepEqual(await a.profile(),before);
  });
  await t.test('Actual Firestore display clocks survive full retention and a later browser segment without refreshing exposure',async()=>{
   const a=await actor(),games=createServerGames(store,()=>clock),questions=fixture('easy',1).map(q=>({...q,problemId:'clock_problem',lineageId:'clock_lineage',familyId:'clock_family',problemRevision:1,contentHash:'clock_hash',bankRelease:'emulator_only',choiceOrder:['a','b','c','d']}));
   const set=await games.storeQuestions(a.uid,'test','integration','easy',questions),id=set.questionSetId;await games.createGame(a.uid,id,'test',{});
   const content=await store.get(`replayContent/${id}`),before=await a.profile();
   const retained=recordExposures({},'older',Array.from({length:512},(_,i)=>({problemId:`old-${i}`,familyId:'old-family'})),'attempted',clock);
   await store.transaction(async tx=>tx.set(`bankRecent/${a.uid}`,retained));
   const replay=createReplayApi({store,now:()=>clock,verify:async token=>identities.get(token)});
   const call=async body=>{const response=await replay(new Request('https://test.invalid/api/replay',{method:'POST',headers:{authorization:`Bearer ${a.token}`,'content-type':'application/json'},body:JSON.stringify({roundId:id,...body})}));const value=await response.json();assert.equal(response.status,200,JSON.stringify(value));return value;};
   const upload=(segmentId,mono)=>call({op:'upload',segmentId,chunkIndex:0,anchorMs:0,uncertaintyMs:0,closed:false,events:[{schemaVersion:1,eventId:'clock_event',sequence:1,monotonicMs:mono,type:'question_displayed',questionIndex:0}]});
   await call({op:'open',segmentId:'clock_first'});clock+=1000;await upload('clock_first',1000);const first=clock;
   let history=await store.get(`bankRecent/${a.uid}`);assert.deepEqual(history.exposures,retained.exposures);assert.equal(history.reservations[0].at,first);
   await denied(getDoc(doc(a.db,`replayCapture/${id}_${a.uid}`)));
   clock+=2*86400000;await call({op:'open',segmentId:'clock_later'});await upload('clock_later',0);
   history=await store.get(`bankRecent/${a.uid}`);assert.equal(history.reservations.length,0);assert.equal(history.exposures.length,512);assert.equal((await store.get(`replayCapture/${id}_${a.uid}`)).firstDisplayAt[0],first);
   assert.deepEqual(await store.get(`replayContent/${id}`),content);assert.deepEqual(await a.profile(),before);
  });
  await t.test('All score, key, receipt, UID and private-profile tampering paths are denied',async()=>{
   const a=await actor(),b=await actor(),id=await game(a);
   for (const patch of [{xp:99999},{rating:99999},{topicRatings:{integration:99999}},{gamesPlayed:999},{uid:b.uid}]) await denied(updateDoc(doc(a.db,'users',a.uid),patch));
   await denied(setDoc(doc(a.db,'users','invented'),{uid:'invented',xp:999}));await denied(deleteDoc(doc(a.db,'users',a.uid)));
   for(const patch of [{scores:{[a.uid]:999}},{players:[b.uid]},{receipts:{[a.uid]:{newRating:999}}},{questions:fixture('olympiad',3)},{deadline:clock+10000000},{messages:[{text:'forged'}]}])await denied(updateDoc(doc(a.db,'games',id),patch));
   await denied(getDoc(doc(a.db,'gameSecrets',id)));await denied(getDoc(doc(a.db,'questionSets',id)));await denied(getDoc(doc(b.db,'users',a.uid)));await denied(getDoc(doc(b.db,'games',id)));await denied(getDocs(collection(a.db,'users')));
   await denied(setDoc(doc(a.db,'users_public',a.uid),{rating:999}));await denied(setDoc(doc(a.db,'games',id,'reviews',a.uid),{answers:{0:{correct:true}}}));
   for(const key of ['uid','score','xp','correct','correctIndex','now','deadline'])await a.call('games',{action:'answer',gameId:id,index:0,selectedOption:0,[key]:999},400);
   await a.call('profile',{patch:{xp:999}},400);await b.call('games',{action:'answer',gameId:id,index:0,selectedOption:0},403);
   await answer(a,id,2,0,409);await answer(a,id,-1,0,400);await answer(a,id,0,4,400);
   assert.equal((await a.profile()).xp,0);
  });
  await t.test('Question sets are bound to owner and mode, expire, and cannot be replayed as new games',async()=>{
   const a=await actor(),b=await actor(),set=await a.call('questions',{mode:'test',category:'integration',difficulty:'hard',count:3});
   await b.call('games',{action:'create',mode:'test',questionSetId:set.questionSetId,options:{}},403);
   await a.call('games',{action:'create',mode:'pvp',questionSetId:set.questionSetId,options:{}},403);
   const create={action:'create',mode:'test',questionSetId:set.questionSetId,options:{}};
   const [x,y]=await Promise.all([a.call('games',create),a.call('games',create)]);assert.equal(x.id,y.id);await all(a,x.id);assert.equal((await a.profile()).xp,90);
   assert.equal((await a.call('games',create)).id,x.id);assert.equal((await a.profile()).gamesPlayed,1);
   const expired=await a.call('questions',{mode:'test',category:'integration',difficulty:'easy',count:1});clock+=31*60_000;
   await a.call('games',{action:'create',mode:'test',questionSetId:expired.questionSetId,options:{}},400);
  });
  await t.test('Rapid uses server time, rejects early/late answers, and applies the time penalty',async()=>{
   const a=await actor(),id=await game(a,'rapid');await answer(a,id,0,0,409);clock+=4000;
   await answer(a,id,0);const before=(await a.game(id)).deadline;await answer(a,id,1,1);assert.equal((await a.game(id)).deadline,before-5000);
   await a.call('games',{action:'complete',gameId:id});assert.equal((await a.game(id)).status,'active');
   clock=before+1000;const late=await answer(a,id,2);assert.equal(late.answer,null);assert.equal(late.game.status,'finished');assert.equal((await a.profile()).xp,10);assert.equal((await a.profile()).gamesPlayed,1);
  });
  await t.test('PvP hides waiting questions, isolates reviews, waits for both and credits both atomically',async()=>{
   const a=await actor(),b=await actor(),id=await game(a,'pvp','medium');assert.equal((await a.game(id)).questions.length,0);
   await b.call('games',{action:'join',gameId:id,mode:'pvp'});clock+=4000;await all(a,id);assert.equal((await a.game(id)).status,'active');
   await denied(getDoc(doc(b.db,'games',id,'reviews',a.uid)));
   const view=await b.call('games',{action:'view',gameId:id});assert.ok(!JSON.stringify(view).includes('correctIndex'));assert.ok(!JSON.stringify(view).includes('selectedOption'));
   await answer(b,id,0);await answer(b,id,1,1);await answer(b,id,2,1);
   const pa=await a.profile(),pb=await b.profile();assert.equal(pa.rating,16);assert.equal(pb.rating,0);assert.equal(pa.wins,1);assert.equal(pb.losses,1);assert.equal(pa.xp,60);assert.equal(pb.xp,20);
   const receipt=(await a.game(id)).receipts[b.uid];assert.equal(receipt.ratingChange,0);assert.equal(receipt.newRating,0);assert.equal(receipt.topicChanges.integration,0);assert.equal(pb.topicRatings.integration,0);assert.equal(pb.ratedGames,1);
   await a.call('games',{action:'claim',gameId:id});await b.call('games',{action:'claim',gameId:id});assert.equal((await a.profile()).rating,16);
   const board=await loadLeaderboard(a.db);assert.ok(board.some(p=>p.id===b.uid));assert.ok(board.every(p=>!('email' in p)&&!('settings' in p)&&!('friends' in p)));
  });
  await t.test('Concurrent PvP joins respect capacity and outsider/early starts fail',async()=>{
   const a=await actor(),b=await actor(),c=await actor(),id=await game(a,'pvp');
   const join=async p=>{const res=await api('games',new Request('https://test.invalid/api/games',{method:'POST',headers:{authorization:`Bearer ${p.token}`,'content-type':'application/json'},body:JSON.stringify({action:'join',gameId:id,mode:'pvp'})}));return res.status;};
   assert.deepEqual((await Promise.all([join(b),join(c)])).sort(),[200,409]);assert.equal((await a.game(id)).players.length,2);
  });
  await t.test('Multiplayer ties, target completion and offline player results remain consistent',async()=>{
   const a=await actor(),b=await actor(),c=await actor(),id=await game(a,'multiplayer');
   await b.call('games',{action:'join',gameId:id,mode:'multiplayer'});await c.call('games',{action:'join',gameId:id,mode:'multiplayer'});await b.call('games',{action:'start',gameId:id},403);await a.call('games',{action:'start',gameId:id});
   await all(a,id);await all(b,id);await all(c,id,1);const g=await a.game(id);assert.equal(g.status,'finished');assert.deepEqual(Object.values(g.receipts).map(r=>r.rank).sort(),[1,1,3]);
   const ps=await Promise.all([a.profile(),b.profile(),c.profile()]);assert.equal(ps[0].rating,ps[1].rating);assert.equal(ps[2].rating,0);assert.ok(ps[0].rating>0);assert.equal(ps[0].draws,1);assert.equal(ps[2].losses,1);
   const target=await game(a,'multiplayer','olympiad',3,{settings:{winCondition:'first_to_n',targetScore:2,timeLimit:30,penalties:true}});await b.call('games',{action:'join',gameId:target,mode:'multiplayer'});await a.call('games',{action:'start',gameId:target});await answer(a,target,0);await answer(a,target,1);
   assert.equal((await a.game(target)).status,'finished');assert.equal((await b.profile()).gamesPlayed,2);assert.equal((await a.profile()).xp,130);
  });
  await t.test('Multiplayer accepts both UI target limits and rejects forged settings',async()=>{
   const a=await actor(),b=await actor();
   const one=await game(a,'multiplayer','easy',3,{settings:{winCondition:'first_to_n',targetScore:1,timeLimit:30,penalties:false}});
   await b.call('games',{action:'join',gameId:one,mode:'multiplayer'});await a.call('games',{action:'start',gameId:one});await answer(a,one,0);assert.equal((await a.game(one)).status,'finished');
   await game(a,'multiplayer','hard',20,{settings:{winCondition:'first_to_n',targetScore:20,timeLimit:300,penalties:true}});
   const set=await a.call('questions',{mode:'multiplayer',category:'integration',difficulty:'easy',count:3});
   for(const patch of [{targetScore:0},{targetScore:21},{timeLimit:29},{timeLimit:301},{penalties:'false'},{xp:999}])await a.call('games',{action:'create',mode:'multiplayer',questionSetId:set.questionSetId,options:{settings:{winCondition:'first_to_n',targetScore:2,timeLimit:30,penalties:false,...patch}}},400);
  });
  await t.test('Server reconciliation closes expired matches and cannot re-award historical games',async()=>{
   const a=await actor(),b=await actor(),id=await game(a,'multiplayer','easy',3,{settings:{winCondition:'time_limit',targetScore:5,timeLimit:30,penalties:false}});
   await b.call('games',{action:'join',gameId:id,mode:'multiplayer'});await a.call('games',{action:'start',gameId:id});await answer(a,id,0);
   // Unfinished untimed practice must not crowd expired matches out of reconciliation.
   await store.transaction(async tx=>{await tx.get(`users/${b.uid}`);for(let i=0;i<101;i++)tx.set(`gameSecrets/unended_${b.uid}_${i}`,{mode:'test',status:'active',players:[b.uid],progressionVersion:3});});
   clock+=31000;await b.call('games',{action:'sync'});
   assert.equal((await a.profile()).wins,1);assert.equal((await b.profile()).losses,1);await a.call('games',{action:'sync'});assert.equal((await a.profile()).gamesPlayed,1);
   await store.transaction(async tx=>{await tx.get('games/historical');tx.set('games/historical',{mode:'test',status:'finished',progressionVersion:2,players:[a.uid],scores:{[a.uid]:5},createdAt:'2025-01-01T00:00:00.000Z'});});
   await a.call('games',{action:'claim',gameId:'historical'},409);assert.equal((await a.profile()).gamesPlayed,1);assert.ok((await loadRecentGames(a.db,a.uid)).some(g=>g.id==='historical'));
  });
  await t.test('Profile preferences, private friendships, invitations and chat still work under locked rules',async()=>{
   const a=await actor(),b=await actor(),c=await actor();await a.call('profile',{patch:{displayName:'Player A',color:'#123456',settings:{soundEnabled:false}}});
   const r=await a.call('social',{action:'request',to:b.uid});await c.call('social',{action:'accept',id:r.id},404);await a.call('social',{action:'accept',id:r.id},403);await b.call('social',{action:'accept',id:r.id});assert.ok((await b.profile()).friends.includes(a.uid));
   const found=await searchPublicProfiles(b.db,b.uid,'player a');assert.ok(found.some(p=>p.uid===a.uid));assert.ok(found.every(p=>!('email'in p)));
   const id=await game(a,'pvp');assert.ok((await loadWaitingGames(b.db,b.uid,'pvp')).some(g=>g.id===id));
   await a.call('games',{action:'chat',gameId:id,text:3},400);const invite=await a.call('social',{action:'invite',to:b.uid,gameId:id});await b.call('social',{action:'invite_accept',id:invite.id});await b.call('games',{action:'join',gameId:id,mode:'pvp'});
   await c.call('games',{action:'chat',gameId:id,text:'forged'},403);await a.call('games',{action:'chat',gameId:id,text:'hello'});const m=(await a.game(id)).messages[0];assert.equal(m.senderId,a.uid);assert.equal(m.senderName,'Player A');assert.equal(m.timestamp,clock);
   await a.call('games',{action:'chat',gameId:id,text:'bad',senderId:b.uid},400);await denied(setDoc(doc(a.db,'friendRequests','spoof'),{from:b.uid,to:c.uid,status:'accepted'}));
   await b.call('social',{action:'remove',friendId:a.uid});assert.ok(!(await a.profile()).friends.includes(b.uid));
   const waiting=await game(a,'multiplayer');assert.ok((await getDocs(query(collection(b.db,'games'),where('status','==','waiting'),where('mode','==','multiplayer'),where('progressionVersion','==',3)))).docs.some(d=>d.id===waiting));
  });

  await t.test('Friend request send, duplicate, reciprocal, cancel, decline, accept and removal preserve consent',async()=>{
   const a=await actor(),b=await actor(),c=await actor();
   const r=await a.call('social',{action:'request',to:b.uid});
   await a.call('social',{action:'request',to:b.uid});
   await b.call('social',{action:'request',to:a.uid},409);
   await b.call('social',{action:'cancel',id:r.id},403);
   await a.call('social',{action:'cancel',id:r.id});
   assert.equal(await store.get(`friendRequests/${r.id}`),null);
   clock+=2001;const declined=await a.call('social',{action:'request',to:b.uid});
   await b.call('social',{action:'reject',id:declined.id});
   await b.call('social',{action:'accept',id:declined.id});
   assert.deepEqual((await a.profile()).friends,[]);
   clock+=2001;const accepted=await a.call('social',{action:'request',to:b.uid});
   // Reconcile a crossed request created by the previous release.
   await store.transaction(async tx=>{await tx.get(`friendRequests/${b.uid}_${a.uid}`);tx.set(`friendRequests/${b.uid}_${a.uid}`,{from:b.uid,to:a.uid,status:'pending',createdAt:new Date(clock)});});
   await b.call('social',{action:'accept',id:accepted.id});
   assert.equal(await store.get(`friendRequests/${b.uid}_${a.uid}`),null);
   await b.call('social',{action:'remove',friendId:a.uid});
   await a.call('social',{action:'accept',id:`${b.uid}_${a.uid}`},404);
   assert.deepEqual((await a.profile()).friends,[]);assert.deepEqual((await b.profile()).friends,[]);
   const before=await c.profile();await a.call('social',{action:'remove',friendId:c.uid});assert.deepEqual(await c.profile(),before);
   await a.call('social',{action:'request',to:a.uid},400);
   assert.deepEqual(await searchPublicProfiles(a.db,a.uid,'no-match-xyz'),[]);
  });
  await t.test('Invitations join atomically, reject full/expired/nonfriend rooms and cannot be replayed',async()=>{
   const a=await actor(),b=await actor(),c=await actor();const request=await a.call('social',{action:'request',to:b.uid});await b.call('social',{action:'accept',id:request.id});
   const full=await game(a,'pvp');const invite=await a.call('social',{action:'invite',to:b.uid,gameId:full});
   await c.call('games',{action:'join',gameId:full,mode:'pvp'});
   await b.call('social',{action:'invite_accept',id:invite.id},409);
   assert.equal((await store.get(`gameInvites/${invite.id}`)).status,'pending');
   await b.call('social',{action:'invite_reject',id:invite.id});
   clock+=2001;const id=await game(a,'pvp');const next=await a.call('social',{action:'invite',to:b.uid,gameId:id});
   const accepted=await b.call('social',{action:'invite_accept',id:next.id});assert.equal(accepted.gameId,id);assert.equal((await a.game(id)).status,'active');
   await b.call('social',{action:'invite_accept',id:next.id});assert.equal((await a.game(id)).players.length,2);
   clock+=2001;const waiting=await game(a,'multiplayer');const stale=await a.call('social',{action:'invite',to:b.uid,gameId:waiting});
   await b.call('social',{action:'remove',friendId:a.uid});await b.call('social',{action:'invite_accept',id:stale.id},409);
   await b.call('social',{action:'invite_reject',id:stale.id});
   await a.call('social',{action:'invite',to:c.uid,gameId:waiting},403);
  });
  await t.test('Leaving and cancelling lobbies changes server membership; abandoned lobbies expire',async()=>{
   const a=await actor(),b=await actor(),c=await actor();const id=await game(a,'multiplayer');
   await b.call('games',{action:'join',gameId:id,mode:'multiplayer'});
   await c.call('games',{action:'leave',gameId:id},403);
   await b.call('games',{action:'leave',gameId:id});assert.deepEqual((await a.game(id)).players,[a.uid]);
   await denied(getDoc(doc(b.db,'games',id,'reviews',b.uid)));
   await a.call('games',{action:'start',gameId:id},400);
   await a.call('games',{action:'leave',gameId:id});assert.equal((await a.game(id)).status,'cancelled');
   await c.call('games',{action:'join',gameId:id,mode:'multiplayer'},409);
   assert.ok(!(await loadWaitingGames(c.db,c.uid,'multiplayer')).some(g=>g.id===id));
   const expired=await game(a,'pvp');clock+=30*60000+1;await b.call('games',{action:'join',gameId:expired,mode:'pvp'},409);
   await a.call('games',{action:'view',gameId:expired});assert.equal((await a.game(expired)).status,'cancelled');
   const active=await game(a,'pvp');await b.call('games',{action:'join',gameId:active,mode:'pvp'});await a.call('games',{action:'leave',gameId:active},409);
   assert.equal((await a.profile()).xp,0);assert.equal((await a.profile()).ratedGames,0);
  });
  await t.test('Live lobby listeners receive departures and host cancellation for every remaining participant',async()=>{
   const a=await actor(),b=await actor(),c=await actor(),id=await game(a,'multiplayer');
   await b.call('games',{action:'join',gameId:id,mode:'multiplayer'});await c.call('games',{action:'join',gameId:id,mode:'multiplayer'});
   const until=(player,predicate)=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>{stop();reject(Error('Lobby listener timed out'));},8000);const stop=onSnapshot(doc(player.db,'games',id),snapshot=>{if(predicate(snapshot.data())){clearTimeout(timer);stop();resolve(snapshot.data());}},error=>{clearTimeout(timer);reject(error);});});
   const departure=until(a,g=>g?.players.length===2);await b.call('games',{action:'leave',gameId:id});assert.deepEqual((await departure).players,[a.uid,c.uid]);
   await b.call('games',{action:'view',gameId:id},403);
   const closed=[until(a,g=>g?.status==='cancelled'),until(c,g=>g?.status==='cancelled')];
   await a.call('games',{action:'leave',gameId:id});for(const room of await Promise.all(closed))assert.equal(room.endReason,'lobby_cancelled');
   await c.call('games',{action:'chat',gameId:id,text:'stale lobby'},409);await c.call('games',{action:'join',gameId:id,mode:'multiplayer'},409);await a.call('games',{action:'start',gameId:id},409);
   assert.equal((await c.game(id)).status,'cancelled');assert.equal((await c.profile()).gamesPlayed,0);
  });
  await t.test('Current negative balances repair atomically in private and public profiles without changing earned progress',async()=>{
   const a=await actor();
   await store.transaction(async tx=>{const p=await tx.get(`users/${a.uid}`);const negative={...p,rating:-20,topicRatings:{integration:-8,limits:40},xp:123,gamesPlayed:4,ratedGames:3};tx.set(`users/${a.uid}`,negative);tx.set(`users_public/${a.uid}`,{uid:a.uid,rating:-20});});
   assert.equal((await repairRatingPage(store,[a.uid],false)).affected,1);assert.equal((await a.profile()).rating,-20);
   assert.equal((await repairRatingPage(store,[a.uid],true)).affected,1);const p=await a.profile();assert.equal(p.rating,0);assert.deepEqual(p.topicRatings,{integration:0,limits:40});assert.equal(p.xp,123);assert.equal(p.gamesPlayed,4);assert.equal(p.ratedGames,3);
   const projection=(await getDoc(doc(a.db,'users_public',a.uid))).data();assert.equal(projection.rating,0);assert.deepEqual(projection.topicRatings,p.topicRatings);assert.ok(!('email'in projection));assert.equal((await repairRatingPage(store,[a.uid],true)).affected,0);
  });
  await t.test('Public catalogs stream membership, start and cancellation without listing private rooms or truncating at ten',async()=>{
   const a=await actor(),b=await actor(),privateId=await game(a,'multiplayer','easy',3,{visibility:'private'}),publicId=await game(a,'multiplayer');
   assert.equal((await a.game(privateId)).status,'private_waiting');await denied(getDoc(doc(b.db,'games',privateId)));
   await denied(getDocs(query(collection(b.db,'games'),where('status','==','private_waiting'),where('mode','==','multiplayer'),where('progressionVersion','==',3))));
   const catalogUntil=predicate=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>{stop();reject(Error('Catalog update timed out'));},10000);const stop=watchPublicLobbies(b.db,'multiplayer',rooms=>{if(predicate(rooms)){clearTimeout(timer);stop();resolve(rooms);}},()=>{clearTimeout(timer);reject(Error('Catalog listener failed'));});});
   const initial=await catalogUntil(rooms=>rooms.some(room=>room.id===publicId));assert.ok(!initial.some(room=>room.id===privateId));
   const joined=catalogUntil(rooms=>rooms.find(room=>room.id===publicId)?.players.length===2);await b.call('games',{action:'join',gameId:publicId,mode:'multiplayer'});await joined;
   const started=catalogUntil(rooms=>!rooms.some(room=>room.id===publicId));await a.call('games',{action:'start',gameId:publicId});await started;
   const ids=[];for(let i=0;i<12;i++)ids.push(await game(a,'multiplayer'));
   const allRooms=await catalogUntil(rooms=>ids.every(id=>rooms.some(room=>room.id===id)));assert.ok(allRooms.length>=12);
   const cancelled=catalogUntil(rooms=>!rooms.some(room=>room.id===ids[0]));await a.call('games',{action:'leave',gameId:ids[0]});await cancelled;
   const request=await a.call('social',{action:'request',to:b.uid});await b.call('social',{action:'accept',id:request.id});const invite=await a.call('social',{action:'invite',to:b.uid,gameId:privateId});await b.call('social',{action:'invite_accept',id:invite.id});assert.equal((await b.game(privateId)).status,'private_waiting');
   for(const patch of [{uid:a.uid},{now:clock+999999},{expiresAt:clock+999999}])await b.call('games',{action:'heartbeat',gameId:privateId,...patch},400);
   await b.call('games',{action:'create',questionSetId:'invalid',mode:'multiplayer',options:{visibility:'hidden'}},400);
  });
  await t.test('Heartbeat cleanup removes idle guests, closes an idle host, handles legacy rooms and never settles active matches',async()=>{
   const a=await actor(),b=await actor(),c=await actor(),id=await game(a,'multiplayer');await b.call('games',{action:'join',gameId:id,mode:'multiplayer'});
   const before=await a.profile();clock+=60000;await a.call('games',{action:'heartbeat',gameId:id});clock+=30000;
   await c.call('games',{action:'sweep',mode:'multiplayer'});assert.deepEqual((await a.game(id)).players,[a.uid]);await denied(getDoc(doc(b.db,'games',id,'reviews',b.uid)));assert.deepEqual(await a.profile(),before);
   await b.call('games',{action:'join',gameId:id,mode:'multiplayer'});clock+=30000;await b.call('games',{action:'heartbeat',gameId:id});clock+=30000;await c.call('games',{action:'sweep',mode:'multiplayer'});assert.equal((await b.game(id)).endReason,'host_disconnected');await a.call('games',{action:'start',gameId:id},409);
   const legacy=await game(a,'multiplayer');await store.transaction(async tx=>{const g=await tx.get(`gameSecrets/${legacy}`);delete g.lobbyPresence;delete g.lobbyExpiresAt;tx.set(`gameSecrets/${legacy}`,g);});await c.call('games',{action:'sweep',mode:'multiplayer'});assert.ok((await store.get(`gameSecrets/${legacy}`)).lobbyExpiresAt>clock);clock+=LOBBY_LEASE_MS;await c.call('games',{action:'sweep',mode:'multiplayer'});assert.equal((await a.game(legacy)).status,'cancelled');
   const active=await game(a,'pvp');await b.call('games',{action:'join',gameId:active,mode:'pvp'});clock+=LOBBY_LEASE_MS;await a.call('games',{action:'heartbeat',gameId:active});await c.call('games',{action:'sweep',mode:'pvp'});assert.equal((await a.game(active)).status,'active');assert.equal((await a.profile()).gamesPlayed,before.gamesPlayed);
  });
  await t.test('Mutation throttling rejects before any profile or game database work',async()=>{
   const a=await actor();const before=await a.profile();
   const limited=createGameApi({store,verify:async()=>({sub:a.uid}),generate:async()=>[],quota:async()=>true,mutationQuota:async()=>false});
   const response=await limited('profile',new Request('https://test.invalid/api/profile',{method:'POST',headers:{authorization:`Bearer ${a.token}`,'content-type':'application/json'},body:JSON.stringify({patch:{displayName:'Should not change'}})}));
   assert.equal(response.status,429);assert.deepEqual(await a.profile(),before);
  });
  await t.test('Missing/forged authentication, cross-site requests and unbounded bodies fail closed',async()=>{
   for(const authorization of ['', 'Bearer forged']) {const r=await api('games',new Request('https://test.invalid/api/games',{method:'POST',headers:{authorization,'content-type':'application/json'},body:'{"action":"sync"}'}));assert.equal(r.status,401);}
   const a=await actor();const r=await api('games',new Request('https://test.invalid/api/games',{method:'POST',headers:{authorization:`Bearer ${a.token}`,origin:'https://evil.invalid','content-type':'application/json'},body:'{}'}));assert.equal(r.status,403);
   for (const resource of ['games','social','profile','questions']) await a.call(resource,null,400);
   for (const action of ['constructor','__proto__','toString']) await a.call('games',{action},400);
   await a.call('profile',{patch:7},400);
   await a.call('games',{action:'sync',padding:'x'.repeat(9000)},400);
   const app=initializeApp({projectId:project,apiKey:'emulator-only'},'unsigned-read');const db=getFirestore(app);connectFirestoreEmulator(db,'127.0.0.1',Number(firestoreHost.split(':')[1]));await denied(getDocs(collection(db,'users_public')));await terminate(db);await deleteApp(app);
  });
 } finally {await Promise.all(actors.map(async a=>{await terminate(a.db);await deleteApp(a.app);}));}
});
