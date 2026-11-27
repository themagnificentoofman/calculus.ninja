import {selectionHistoryToken} from '../lib/server/selection-history-token.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createServerGames,publicGame} from '../lib/server/game-engine.ts';
import {createGameApi} from '../lib/server/game-api.ts';
import {createReplayApi} from '../lib/server/replay-api.ts';
import {loadReplay} from '../lib/replay/playback.ts';
import {compileReplay,roundAnalysis} from '../lib/replay/engine.ts';
import {OPERATORS} from '../lib/math-answer/grade.mjs';
import {readDraft,writeDraft,clearDraft,entrySafety} from '../lib/math-entry.mjs';
import {freeResponseQuestions} from '../lib/server/free-response-questions.mjs';
import {freeResponseFixture} from './fixtures/free-response.mjs';
import {JointSelectionError} from '../lib/server/joint-selection-error.mjs';
import {recordExposures} from '../lib/bank/exposure.ts';
const clone=x=>structuredClone(x);
class MemoryStore {
 docs=new Map();writes=0;retry=0;tail=Promise.resolve();beforeTransaction=null;
 async get(path){return this.docs.has(path)?clone(this.docs.get(path)):null;}async find(){return [];}
 async transaction(fn){const previous=this.tail;let release;this.tail=new Promise(r=>release=r);await previous;try{if(this.beforeTransaction){const f=this.beforeTransaction;this.beforeTransaction=null;await f();}let result,writes;for(let i=0;i<=this.retry;i++){writes=new Map();result=await fn({get:async p=>{assert.equal(writes.size,0,'all reads before writes');return this.get(p);},set:(p,v)=>writes.set(p,clone(v)),delete:p=>writes.set(p,null)});}this.retry=0;for(const[p,v]of writes){if(v===null)this.docs.delete(p);else this.docs.set(p,v);this.writes++;}return result;}finally{release();}}
}
function question(i=0){const contract={version:'answer-contract-1',parserVersion:'bounded-latex-1',graderVersion:'exact-algebra-1',contractId:`fixture_contract_${i}`,contractHash:`fixture_hash_${i}`,domain:'real',branch:'real-principal',allowedOperators:OPERATORS,answer:{kind:'scalar',expected:'1/2'},instructions:'Enter an exact real number.',review:{referenceVerified:true},presentation:{version:'fixture-1',statement:'\\int_0^1 x\\,\\mathrm{d}x',assumptions:['real']}};return {responseFormat:'free-response',problemId:`fixture_problem_${i}`,problemRevision:1,contentHash:`content_${i}`,lineageId:`lineage_${i}`,constructionFamilyId:'fixture_family',familyId:'fixture_family',bankRelease:'fixture_only',latexProblem:contract.presentation.statement,explanation:['\\int_0^1 x\\,\\mathrm{d}x=[x^2/2]_0^1=1/2'],answerInstructions:contract.instructions,answerContractId:contract.contractId,answerContractHash:contract.contractHash,graderVersion:contract.graderVersion,parserVersion:contract.parserVersion,freeResponse:contract,topic:'integration',difficulty:'easy',context:{assumptions:['real'],subtopic:'FTC',techniqueTags:['FTC'],parameters:{}}};}
async function setup(count=2){const store=new MemoryStore();let clock=1000000;const games=createServerGames(store,()=>clock);for(const uid of ['alice','bobby'])await games.profile(uid,{});const set=await games.storeQuestions('alice','test','integration','easy',Array.from({length:count},(_,i)=>question(i)),'none',undefined,undefined,await selectionHistoryToken({}));await games.createGame('alice',set.questionSetId,'test',{});return{store,games,id:set.questionSetId,advance:n=>clock+=n,now:()=>clock};}
test('registered record adapter preserves the exact private contract through API issuance, grading and replay',async()=>{
 const f=await freeResponseFixture(),store=new MemoryStore(),games=createServerGames(store,()=>1000000);
 await games.profile('alice',{});
 const questions=await freeResponseQuestions([f.record],f.admissions);
 assert(Object.isFrozen(questions[0].freeResponse.fixtures));
 assert.equal(questions[0].pedagogy.responseFormat,'free-response');
 const api=createGameApi({store,now:()=>1000000,verify:async()=>({sub:'alice'}),select:async()=>{throw Error('No MC substitution');},selectFreeResponse:async()=>({questions,relaxation:'none'}),freeResponseEnabled:true,quota:async()=>true});
 const call=async(resource,body)=>{const response=await api(resource,new Request(`https://test.invalid/api/${resource}`,{method:'POST',headers:{authorization:'Bearer alice','content-type':'application/json'},body:JSON.stringify(body)}));const value=await response.json();assert.equal(response.status,200,JSON.stringify(value));return value;};
 const set=await call('questions',{mode:'test',category:'differentiation',difficulty:'easy',count:1,responseFormat:'free-response'});
 const created=await call('games',{action:'create',questionSetId:set.questionSetId,mode:'test',options:{}});
 assert.deepEqual(created.game.questions[0].assumptions,f.record.task.assumptions);
 for(const key of ['expected','freeResponse','fixtures','pedagogy','explanation','options','correctIndex','choiceOrder'])assert(!JSON.stringify(created.game).includes(`"${key}"`),key);
 assert.equal((await store.get(`replayContent/${set.questionSetId}`)).contextMissing,false);
 const answer=await call('games',{action:'fr-submit',gameId:set.questionSetId,index:0,source:'x+x',requestId:'record_adapter_answer'});
 assert.equal(answer.answer.outcome,'correct');assert.equal(answer.game.status,'finished');
 assert.equal((await store.get('users/alice')).xp,10);
 const saved=await store.get(`gameSecrets/${set.questionSetId}`),replay=await store.get(`replayContent/${set.questionSetId}`);
 assert.deepEqual(saved.questions[0].freeResponse,f.record.contract);
 assert.deepEqual(replay.questions[0],saved.questions[0]);
 assert.equal(saved.roundSnapshot.questions[0].bankRelease,questions[0].bankRelease);
 const seen=(await store.get('bankRecent/alice')).exposures[0];
 assert.equal(seen.lineageId,f.record.task.lineageId);assert.equal(seen.familyId,f.record.task.constructionFamilyId);assert.equal(seen.idea,f.record.task.pedagogy.relatedIdeaGroupId);assert.equal(seen.stage,'attempted');
});
test('registered record adapter freezes its input snapshot and rejects unknown or changed contracts',async()=>{
 const f=await freeResponseFixture(),before=clone(f.record),pending=freeResponseQuestions([f.record],f.admissions);
 f.record.task.statement='changed after starting';f.record.contract.answer.expected='999';f.admissions.records={};
 const questions=await pending;
 assert.equal(questions[0].latexProblem,before.task.statement);assert.equal(questions[0].freeResponse.answer.expected,'2x');
 const clean=await freeResponseFixture();
 await assert.rejects(freeResponseQuestions([clean.record]),/Unregistered|Unknown/);
 clean.record.contract.answer.expected='999';await assert.rejects(freeResponseQuestions([clean.record],clean.admissions),/fixtures required/);
 const changed=await freeResponseFixture();changed.record.contract.instructions='Changed but otherwise valid instructions.';
 await assert.rejects(freeResponseQuestions([changed.record],changed.admissions),/contract hash mismatch/);
 await assert.rejects(freeResponseQuestions([]),/size/);await assert.rejects(freeResponseQuestions(Array(21).fill(before)),/size/);
});
test('FR issuance has complete references without fictitious choices; public documents are allowlisted',async()=>{
 const s=await setup(),privateGame=await s.store.get(`gameSecrets/${s.id}`),view=await s.games.act('alice',s.id,'view');assert.equal(privateGame.replayVersion,2);assert.equal(privateGame.roundSnapshot.schemaVersion,3);assert.ok(privateGame.roundSnapshot.questions.every(q=>!('choiceOrder'in q)&&q.answerContractHash));
 assert.equal((await s.store.get(`replayContent/${s.id}`)).contextMissing,false);assert.equal((await s.store.get('bankRecent/alice')).exposures.length,2);
 for(const key of ['expected','freeResponse','fixtures','explanation','correctIndex','options','private'])assert.equal(JSON.stringify(view).includes(`"${key}"`),false,key);
 await assert.rejects(s.games.act('bobby',s.id,'fr-submit',{index:0,source:'1/2',requestId:'outsider_1'}),/belong/);
 await assert.rejects(s.games.act('alice',s.id,'answer',{index:0,selectedOption:0}),/mathematical answer/);
});
test('ungraded retries keep solutions private; graded settlement and XP are once-only across transaction retries',async()=>{
 const s=await setup();const invalid=await s.games.act('alice',s.id,'fr-submit',{index:0,source:'',requestId:'empty_answer'});assert.equal(invalid.verdict.outcome,'invalid');assert.equal(invalid.answer,null);assert.deepEqual(invalid.progress.reviews,{});assert.equal((await s.store.get('users/alice')).xp,0);
 const writes=s.store.writes;assert.equal((await s.games.act('alice',s.id,'fr-submit',{index:0,source:'',requestId:'empty_answer'})).duplicate,true);assert.equal(s.store.writes,writes);
 await assert.rejects(s.games.act('alice',s.id,'fr-submit',{index:0,source:'1/2',requestId:'empty_answer'}),/different content/);
 s.store.retry=5;const results=await Promise.all([s.games.act('alice',s.id,'fr-submit',{index:0,source:'2/4',requestId:'good_answer_1'}),s.games.act('alice',s.id,'fr-submit',{index:0,source:'0.5',requestId:'good_answer_2'})]);assert.equal(results.filter(x=>x.duplicate).length,1);assert.equal((await s.store.get('users/alice')).xp,10);assert.equal((await s.store.get('users/alice')).answeredQuestions,0);assert.equal(results[0].progress.reviews[0].canonicalAnswer,'1/2');
 const record=await s.store.get(`gameSecrets/${s.id}`),publicText=JSON.stringify(publicGame(record));for(const key of ['source','interpretation','contractHash','frSubmissions'])assert.equal(publicText.includes(`"${key}"`),false);
 const profile=await s.store.get('users/alice');assert.deepEqual(profile.freeResponseStats,{ungraded:1,finalized:1,graded:1,correct:1});
});
test('skip/reveal and submit race settles once, records exposure without false wrong answers',async()=>{
 const s=await setup(1);
 const results=await Promise.all([s.games.act('alice',s.id,'fr-reveal',{index:0,requestId:'reveal_answer'}),s.games.act('alice',s.id,'fr-submit',{index:0,source:'1/2',requestId:'racing_answer'})]);
 assert.equal(results.filter(x=>x.duplicate).length,1);
 const game=await s.store.get(`gameSecrets/${s.id}`),a=game.answers.alice[0],p=await s.store.get('users/alice');
 assert(['revealed','graded'].includes(a.finalization));assert.equal(game.status,'finished');assert.equal(p.gamesPlayed,0);assert.equal(p.correctAnswers,0);assert.equal(p.freeResponseStats.finalized,1);assert.equal(p.freeResponseStats.rounds,1);
 if(a.finalization==='revealed'){assert.equal(a.correct,undefined);assert.equal(p.xp,0);assert.equal(p.freeResponseStats.revealed,1);assert.equal(p.freeResponseStats.graded,undefined);}
 else{assert.equal(a.correct,true);assert.equal(p.xp,10);assert.equal(p.freeResponseStats.graded,1);assert.equal(p.freeResponseStats.correct,1);assert.equal(p.freeResponseStats.revealed,undefined);}
 assert.equal((await s.store.get('bankRecent/alice')).exposures[0].stage,'attempted');
 await assert.rejects(s.games.act('alice',s.id,'fr-skip',{index:0,requestId:a.submissionId}),/different content/);
});
test('stale snapshot rejects a prepared verdict before any grade or reward is written',async()=>{
 const s=await setup();s.store.beforeTransaction=async()=>{const g=await s.store.get(`gameSecrets/${s.id}`);g.questions[0].latexProblem='changed';s.store.docs.set(`gameSecrets/${s.id}`,g);};await assert.rejects(s.games.act('alice',s.id,'fr-submit',{index:0,source:'1/2',requestId:'stale_answer'}),/changed/);assert.equal((await s.store.get('users/alice')).xp,0);
});
test('submission limits apply across rounds, preserve retries, and allow neutral continuation',async()=>{
 const s=await setup(),otherSet=await s.games.storeQuestions('alice','test','integration','easy',[question(7)],'none',undefined,undefined,await selectionHistoryToken(await s.store.get('bankRecent/alice')));await s.games.createGame('alice',otherSet.questionSetId,'test',{});
 for(let i=0;i<12;i++)await s.games.act('alice',s.id,'fr-submit',{index:0,source:'',requestId:`invalid_request_${i}`});
 const writes=s.store.writes;
 await assert.rejects(s.games.act('alice',otherSet.questionSetId,'fr-submit',{index:0,source:'1/2',requestId:'other_round_request'}),e=>e.status===429);
 assert.equal((await s.games.act('alice',s.id,'fr-submit',{index:0,source:'',requestId:'invalid_request_0'})).duplicate,true);assert.equal(s.store.writes,writes);
 s.advance(60001);
 for(let i=12;i<16;i++)await s.games.act('alice',s.id,'fr-submit',{index:0,source:'',requestId:`invalid_request_${i}`});
 await assert.rejects(s.games.act('alice',s.id,'fr-submit',{index:0,source:'1/2',requestId:'attempt_seventeen'}),e=>e.status===429);
 const skipped=await s.games.act('alice',s.id,'fr-skip',{index:0,requestId:'neutral_continue'});assert.equal(skipped.answer.finalization,'skipped');assert.equal(skipped.progress.freeResponseSummary.ungradedSubmissions,16);assert.equal(skipped.progress.freeResponseSummary.graded,0);
 assert.equal((await s.store.get('users/alice')).xp,0);assert.equal('frRecentSubmissionAt'in(await s.store.get('users_public/alice')),false);
});
test('version2 replay records actual ungraded/final decisions, remains private and never regrades',async()=>{
 const s=await setup(1);await s.games.act('alice',s.id,'fr-submit',{index:0,source:'z',requestId:'unknown_answer'});await s.games.act('alice',s.id,'fr-submit',{index:0,source:'1/2',requestId:'final_answer'});
 const api=createReplayApi({store:s.store,verify:async t=>({sub:t}),now:s.now});const call=async body=>{const response=await api(new Request('https://test.invalid/api/replay',{method:'POST',headers:{authorization:'Bearer alice','content-type':'application/json'},body:JSON.stringify(body)}));assert.equal(response.status,200);return response.json();};
 const before=clone([...s.store.docs]),data=await loadReplay(s.id,call);assert.equal(data.manifest.replayVersion,2);assert.ok(data.events.some(e=>e.type==='answer_ungraded'&&e.data.source==='z'));const event=data.events.find(e=>e.type==='answer_finalized');assert.equal(event.schemaVersion,2);assert.equal(event.data.source,'1/2');assert.equal(compileReplay(data).seek(event.at).accepted[0].outcome,'correct');assert.equal(roundAnalysis(data).overall.correct,1);assert.deepEqual([...s.store.docs],before);
});
test('creation kill switch does not change existing FR reader/grader availability',async()=>{
 const s=await setup(),api=createGameApi({store:s.store,verify:async()=>({sub:'alice'}),select:async()=>{throw Error('MC must not substitute');},quota:async()=>true,freeResponseEnabled:false});const response=await api('questions',new Request('https://test.invalid/api/questions',{method:'POST',headers:{authorization:'Bearer alice','content-type':'application/json'},body:JSON.stringify({mode:'test',category:'integration',difficulty:'easy',count:20,responseFormat:'free-response'})}));assert.equal(response.status,409);assert.equal((await s.games.act('alice',s.id,'fr-submit',{index:0,source:'1/2',requestId:'still_readable'})).answer.correct,true);
});
test('drafts isolate owner, round, revision and contract, and unsafe source stays unrendered',()=>{
 const data=new Map(),storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},scope={uid:'alice',roundId:'round',problemId:'p',problemRevision:1,contentHash:'h',contractHash:'c'};
 writeDraft(storage,scope,{source:'\\unknown{x}',mode:'raw'});assert.equal(readDraft(storage,scope).source,'\\unknown{x}');for(const patch of [{uid:'bobby'},{roundId:'other'},{problemRevision:2},{contractHash:'new'}])assert.equal(readDraft(storage,{...scope,...patch}),null);assert.ok(entrySafety('\\unknown{x}'));assert.ok(entrySafety('\\htmlData{onclick=evil}{x}'));assert.equal(entrySafety('\\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}'),null);clearDraft(storage,scope);assert.equal(readDraft(storage,scope),null);
});

function mcQuestion(i=0){return {problemId:`mc_fixture_${i}`,problemRevision:1,contentHash:`mc_content_${i}`,lineageId:`mc_lineage_${i}`,familyId:`mc_family_${i}`,constructionFamilyId:`mc_family_${i}`,bankRelease:'fixture_only',choiceOrder:['a','b','c','d'],latexProblem:'1+1',options:['2','3','4','5'],correctIndex:0,explanation:['1+1=2'],topic:'integration',difficulty:'easy',context:{assumptions:['real'],subtopic:'fixture',techniqueTags:['fixture'],parameters:{}}};}
test('mixed rounds preserve configuration and settle separate stats for either last-question format',async()=>{
 for(const order of ['mcq-first','frq-first']){
  const store=new MemoryStore(),games=createServerGames(store,()=>1000000);await games.profile('alice',{});
  const mix={multipleChoice:1,freeResponse:1,order},qs=order==='mcq-first'?[mcQuestion(),question()]:[question(),mcQuestion()];
  const set=await games.storeQuestions('alice','test','integration','easy',qs,'none',undefined,mix,await selectionHistoryToken({}));await games.createGame('alice',set.questionSetId,'test',{});
  const view=await games.act('alice',set.questionSetId,'view');assert.equal(view.game.responseFormat,'mixed');assert.deepEqual(view.game.questionMix,mix);assert.equal(view.progress.freeResponseSummary.total,1);
  for(let i=0;i<2;i++){
   const isFr=qs[i].responseFormat==='free-response';
   await assert.rejects(games.act('alice',set.questionSetId,isFr?'answer':'fr-submit',isFr?{index:i,selectedOption:0}:{index:i,source:'1/2',requestId:`wrong_type_${i}`}),isFr?/mathematical answer/:/answer cannot be submitted for the saved question/);
   store.retry=2;
   const input=isFr?{index:i,source:'1/2',requestId:`mixed_answer_${i}`}:{index:i,selectedOption:0,requestId:`mixed_answer_${i}`};
   const result=await games.act('alice',set.questionSetId,isFr?'fr-submit':'answer',input);assert.equal(result.answer.correct,true);
   assert.equal((await games.act('alice',set.questionSetId,isFr?'fr-submit':'answer',input)).duplicate,true);
  }
  const profile=await store.get('users/alice'),game=await store.get(`gameSecrets/${set.questionSetId}`);
  assert.equal(profile.xp,20);assert.equal(profile.answeredQuestions,1);assert.equal(profile.correctAnswers,1);assert.equal(profile.gamesPlayed,1);assert.equal(profile.freeResponseStats.graded,1);assert.equal(profile.freeResponseStats.correct,1);assert.equal(profile.freeResponseStats.rounds,1);
  assert.equal(game.status,'finished');assert.equal(game.replayVersion,2);assert.equal(game.receipts.alice.statisticsKind,'mixed');assert.equal(game.receipts.alice.ratingChange,0);
  const replay=await store.get(`replayContent/${set.questionSetId}`);assert.deepEqual(replay.questions.map(q=>q.problemId),qs.map(q=>q.problemId));assert.deepEqual((await store.get(`replayManifests/${set.questionSetId}`)).settings.questionMix,mix);
  assert.equal((await games.act('alice',set.questionSetId,'view')).progress.freeResponseSummary.total,1);
  const replayApi=createReplayApi({store,verify:async()=>({sub:'alice'}),now:()=>1000000});
  const data=await loadReplay(set.questionSetId,async body=>{const response=await replayApi(new Request('https://test.invalid/api/replay',{method:'POST',headers:{authorization:'Bearer alice','content-type':'application/json'},body:JSON.stringify(body)}));assert.equal(response.status,200);return response.json();});
  assert.equal(roundAnalysis(data).formats.length,2);assert(roundAnalysis(data).formats.every(f=>f.attempted===1&&f.correct===1));
 }
});
test('mixed completion with a skipped FRQ keeps it outside both accuracy denominators',async()=>{
 const store=new MemoryStore(),games=createServerGames(store,()=>1000000);await games.profile('alice',{});
 const set=await games.storeQuestions('alice','test','integration','easy',[mcQuestion(),question()],'none',undefined,{multipleChoice:1,freeResponse:1,order:'mcq-first'},await selectionHistoryToken({}));await games.createGame('alice',set.questionSetId,'test',{});
 await games.act('alice',set.questionSetId,'answer',{index:0,selectedOption:0});
 const result=await games.act('alice',set.questionSetId,'fr-skip',{index:1,requestId:'mixed_skip'});assert.equal(result.progress.freeResponseSummary.graded,0);assert.equal(result.progress.freeResponseSummary.skipped,1);assert.equal(result.progress.freeResponseSummary.total,1);
 const profile=await store.get('users/alice');assert.equal(profile.correctAnswers,1);assert.equal(profile.answeredQuestions,1);assert.equal(profile.freeResponseStats.graded,undefined);assert.equal(profile.freeResponseStats.rounds,1);assert.equal(profile.gamesPlayed,1);
});
test('configured API validates mix, persists requested order and requires joint selection without fallback',async()=>{
 const store=new MemoryStore(),games=createServerGames(store,()=>1000000);await games.profile('alice',{});let jointCalls=0,mcCalls=0,frCalls=0;
 const deps={store,verify:async()=>({sub:'alice'}),quota:async()=>true,now:()=>1000000,freeResponseEnabled:true,
  select:async()=>{mcCalls++;return{questions:[mcQuestion()],relaxation:'none'};},selectFreeResponse:async()=>{frCalls++;return{questions:[question()],relaxation:'none'};},
  selectMixed:async()=>{jointCalls++;return{questions:[question(),mcQuestion()],relaxation:'none'};}};
 const call=async(mix,extra={},override={})=>createGameApi({...deps,...override})('questions',new Request('https://test.invalid/api/questions',{method:'POST',headers:{authorization:'Bearer alice','content-type':'application/json'},body:JSON.stringify({mode:'test',category:'integration',difficulty:'easy',count:mix.multipleChoice+mix.freeResponse,questionMix:mix,...extra})}));
 for(const order of ['mcq-first','frq-first','uniform']){
  const mix={multipleChoice:1,freeResponse:1,order},response=await call(mix);assert.equal(response.status,200);
  const set=await store.get(`questionSets/${(await response.json()).questionSetId}`);assert.deepEqual(set.questionMix,mix);assert.equal(set.questions.filter(q=>q.responseFormat==='free-response').length,1);
  if(order!=='uniform')assert.equal(set.questions[0].responseFormat==='free-response',order==='frq-first');
 }
 assert.equal(jointCalls,3);assert.equal(mcCalls,0);assert.equal(frCalls,0);
 const mix={multipleChoice:1,freeResponse:1,order:'uniform'};
 for(const extra of [{count:3},{mode:'rapid'},{responseFormat:'free-response'}])assert.equal((await call(mix,extra)).status,400);
 assert.equal((await call(mix,{}, {selectMixed:undefined})).status,409);assert.equal((await call(mix,{}, {freeResponseEnabled:false})).status,409);assert.equal(jointCalls,3);
 assert.equal((await call({multipleChoice:1,freeResponse:0,order:'uniform'})).status,200);assert.equal(mcCalls,1);
 assert.equal((await call({multipleChoice:0,freeResponse:1,order:'frq-first'})).status,200);assert.equal(frCalls,1);
 const duplicate={...mcQuestion(),lineageId:question().lineageId};
 const rejected=await call(mix,{}, {selectMixed:async()=>({questions:[question(),duplicate],relaxation:'none'})});
 assert.equal(rejected.status,409);
 assert.deepEqual(await rejected.json(),{code:'INSUFFICIENT_CONTENT',error:'There are too few different problems for this question mix. Try another mix.'});
});

test('joint catalog changes and insufficient capacity have distinct public errors without persistence',async()=>{
 const store=new MemoryStore();
 const body={mode:'test',category:'integration',difficulty:'easy',count:2,questionMix:{multipleChoice:1,freeResponse:1,order:'uniform'}};
 for(const [code,publicCode]of [['joint-catalog-changed','CONTENT_CHANGED'],['joint-insufficient-capacity','INSUFFICIENT_CONTENT']]){
  const api=createGameApi({store,verify:async()=>({sub:'alice'}),select:async()=>{throw Error('No substitution');},selectMixed:async()=>{throw new JointSelectionError(code);},freeResponseEnabled:true,quota:async()=>true});
  const result=await api('questions',new Request('https://test.invalid/api/questions',{method:'POST',headers:{authorization:'Bearer alice','content-type':'application/json'},body:JSON.stringify(body)}));
  assert.equal(result.status,409);assert.deepEqual(await result.json(),{error:new JointSelectionError(code).message,code:publicCode});assert.equal(store.writes,0);
 }
});

test('a full attempted-history buffer still serializes concurrent FR issuance',async()=>{
 const store=new MemoryStore(),now=1000000;
 const history=recordExposures({},'previous',Array.from({length:512},(_,i)=>({problemId:`previous-${i}`,familyId:'old-family',lineageId:`previous-${i}`})),'attempted',now);
 store.docs.set('bankRecent/alice',history);
 const games=createServerGames(store,()=>now),token=await selectionHistoryToken(history);
 const results=await Promise.allSettled([0,1].map(()=>games.storeQuestions('alice','test','integration','easy',[question()],'none',undefined,undefined,token)));
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.filter(r=>r.status==='rejected'&&r.reason.status===409).length,1);
 const saved=await store.get('bankRecent/alice');assert.deepEqual(saved.exposures,history.exposures);assert.equal(saved.issuanceGeneration,1);assert.notEqual(await selectionHistoryToken(saved),token);
 const displayed=recordExposures(saved,'previous',[{problemId:'previous-0',familyId:'old-family'}],'displayed',now+1);assert.equal(displayed.issuanceGeneration,1);
 for(const generation of [-1,1.5,Number.MAX_SAFE_INTEGER+1])await assert.rejects(selectionHistoryToken({...saved,issuanceGeneration:generation}),/issuance generation/);
});

test('concurrent FR and mixed selections cannot both commit against stale account history',async()=>{
 for(const mixed of [false,true]){
  const store=new MemoryStore(),games=createServerGames(store,()=>1000000);await games.profile('alice',{});
  const qs=mixed?[mcQuestion(),question()]:[question()];let arrivals=0,release;const barrier=new Promise(r=>release=r);
  const select=async()=>{if(++arrivals===2)release();await barrier;return{questions:qs,relaxation:'none'};};
  const api=createGameApi({store,now:()=>1000000,verify:async()=>({sub:'alice'}),select:async()=>{throw Error('No MC substitution');},selectFreeResponse:select,selectMixed:select,freeResponseEnabled:true,quota:async()=>true});
  const body={mode:'test',category:'integration',difficulty:'easy',count:qs.length,...(mixed?{questionMix:{multipleChoice:1,freeResponse:1,order:'mcq-first'}}:{responseFormat:'free-response'})};
  const call=()=>api('questions',new Request('https://test.invalid/api/questions',{method:'POST',headers:{authorization:'Bearer alice','content-type':'application/json'},body:JSON.stringify(body)}));
  const results=await Promise.all([call(),call()]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
  const rejected=await results.find(r=>r.status===409).json();assert.match(rejected.error,/history changed/);assert(!rejected.code,'A history conflict is not an insufficient-content claim');
  assert.equal([...store.docs.keys()].filter(k=>k.startsWith('questionSets/')).length,1);
  assert.equal((await store.get('bankRecent/alice')).exposures.length,qs.length);
 }
});
test('FR issuance requires a matching history token and rejects transaction-time history changes before writes',async()=>{
 const store=new MemoryStore(),games=createServerGames(store,()=>1000000);await games.profile('alice',{});
 const before=store.writes;
 await assert.rejects(games.storeQuestions('alice','test','integration','easy',[question()]),/history changed/);
 assert.equal(store.writes,before);
 const token=await selectionHistoryToken({});store.beforeTransaction=()=>store.docs.set('bankRecent/alice',{problems:['just-seen'],families:[]});
 await assert.rejects(games.storeQuestions('alice','test','integration','easy',[question()],'none',undefined,undefined,token),/history changed/);
 assert.equal(store.writes,before);assert.equal([...store.docs.keys()].filter(k=>k.startsWith('questionSets/')).length,0);
 const current=await selectionHistoryToken(await store.get('bankRecent/alice'));
 assert.match((await games.storeQuestions('alice','test','integration','easy',[question()],'none',undefined,undefined,current)).questionSetId,/^[a-f0-9]+$/);
});

test('FR issuance owns immutable selector history, input and returned snapshots',async()=>{
 const store=new MemoryStore(),games=createServerGames(store,()=>1000000);await games.profile('alice',{});
 store.docs.set('bankRecent/alice',{problems:['previous-task'],families:[]});
 const q=question(),mix={multipleChoice:0,freeResponse:1,order:'uniform'};
 const select=async(input,recent)=>{
  assert(Object.isFrozen(input));assert(Object.isFrozen(recent.problems));
  assert.throws(()=>recent.problems.length=0,TypeError);
  store.beforeTransaction=()=>{q.latexProblem='CHANGED-AFTER-VALIDATION';q.freeResponse.answer.expected='999';};
  return{questions:[q],relaxation:'none'};
 };
 const api=createGameApi({store,now:()=>1000000,verify:async()=>({sub:'alice'}),select:async()=>{throw Error('No MC substitution');},selectFreeResponse:select,freeResponseEnabled:true,quota:async()=>true});
 const res=await api('questions',new Request('https://test.invalid/api/questions',{method:'POST',headers:{authorization:'Bearer alice','content-type':'application/json'},body:JSON.stringify({mode:'test',category:'integration',difficulty:'easy',count:1,questionMix:mix})}));
 assert.equal(res.status,200);const set=await store.get('questionSets/'+(await res.json()).questionSetId);
 assert.equal(set.questions[0].latexProblem,question().latexProblem);assert.equal(set.questions[0].freeResponse.answer.expected,'1/2');assert.deepEqual(set.questionMix,mix);
 assert.match(set.issuanceBinding,/^[a-f0-9]{64}$/);
});
test('direct FR issuance detaches inputs before asynchronous work and recovers an acknowledged-late commit',async()=>{
 const store=new MemoryStore(),games=createServerGames(store,()=>1000000);await games.profile('alice',{});
 const original=store.transaction.bind(store);let calls=0;
 store.transaction=async fn=>{const first=await original(fn);calls++;await original(fn);return first;};
 const q=question(),token=await selectionHistoryToken({});
 const pending=games.storeQuestions('alice','test','integration','easy',[q],'none',undefined,undefined,token);
 q.latexProblem='MUTATED';q.freeResponse.answer.expected='999';
 const {questionSetId}=await pending;const set=await store.get('questionSets/'+questionSetId);
 assert.equal(set.questions[0].latexProblem,question().latexProblem);assert.equal(set.questions[0].freeResponse.answer.expected,'1/2');
 assert.equal(calls,1);assert.equal([...store.docs.keys()].filter(k=>k.startsWith('questionSets/')).length,1);assert.equal((await store.get('bankRecent/alice')).exposures.length,1);
});
test('new snapshots retain the actual FR or joint policy without relabeling historical MC defaults',async()=>{
 for(const policy of [undefined,'free-response-capped-v1','joint-capped-v1','joint-capped-v2','joint-capped-v3']){
  const store=new MemoryStore(),games=createServerGames(store,()=>1000000);await games.profile('alice',{});
  const diagnostics=policy?{policy,candidateCount:1,statements:3,payloadsDecoded:1,catalogFamilies:1,reservedRounds:1}:undefined;
  const set=await games.storeQuestions('alice','test','integration','easy',[question()],'none',diagnostics,undefined,await selectionHistoryToken({}));
  const saved=await store.get('questionSets/'+set.questionSetId);assert.equal(saved.roundSnapshot.selectionPolicy,policy??'unrecorded-v1');assert.equal(saved.roundSnapshot.schemaVersion,3);
 }
 const store=new MemoryStore(),games=createServerGames(store,()=>1000000);await games.profile('alice',{});const mc=await games.storeQuestions('alice','test','integration','easy',[mcQuestion()]);assert.equal((await store.get('questionSets/'+mc.questionSetId)).roundSnapshot.selectionPolicy,'family-uniform-v1');
});

test('saved checker versions govern new attempts and exact receipt recovery without regrading replay history',async()=>{
 for(const version of [1,2]){
  const store=new MemoryStore(),games=createServerGames(store,()=>1000000);await games.profile('alice',{});
  const q=question();q.parserVersion=q.freeResponse.parserVersion=`bounded-latex-${version}`;q.graderVersion=q.freeResponse.graderVersion=`exact-algebra-${version}`;
  if(version===2)q.freeResponse.allowedOperators=[...OPERATORS,'root'];
  const set=await games.storeQuestions('alice','test','integration','easy',[q],'none',undefined,undefined,await selectionHistoryToken({}));await games.createGame('alice',set.questionSetId,'test',{});
  const input={index:0,source:String.raw`\sqrt[3]{1/8}`,requestId:`version_${version}_attempt`};
  const first=await games.act('alice',set.questionSetId,'fr-submit',input),receipt=await store.get(`frSubmissions/alice_${set.questionSetId}_${input.requestId}`);
  assert.equal(first.verdict.outcome,version===1?'invalid':'correct');
  assert.equal(first.verdict.version,`exact-algebra-${version}`);
  const duplicate=await games.act('alice',set.questionSetId,'fr-submit',input);assert.equal(duplicate.duplicate,true);assert.deepEqual(duplicate.verdict,receipt.outcome);
  assert.deepEqual(await store.get(`frSubmissions/alice_${set.questionSetId}_${input.requestId}`),receipt);
  assert.equal((await store.get('users/alice')).xp,version===1?0:10);
  if(version===1){
   const next=await games.act('alice',set.questionSetId,'fr-submit',{...input,requestId:'version_1_new_attempt'});assert.equal(next.verdict.outcome,'invalid');
   await games.act('alice',set.questionSetId,'fr-reveal',{index:0,requestId:'version_1_reveal'});
  }
  const privateGame=await store.get(`gameSecrets/${set.questionSetId}`),content=await store.get(`replayContent/${set.questionSetId}`);
  assert.deepEqual(content.questions[0].freeResponse,privateGame.questions[0].freeResponse);
  assert.equal(content.questions[0].graderVersion,`exact-algebra-${version}`);
  const replayApi=createReplayApi({store,now:()=>1000000,verify:async()=>({sub:'alice'})});
  const replay=await loadReplay(set.questionSetId,async body=>{const response=await replayApi(new Request('https://test.invalid/api/replay',{method:'POST',headers:{authorization:'Bearer alice','content-type':'application/json'},body:JSON.stringify(body)}));assert.equal(response.status,200);return response.json();});
  const outcomes=replay.events.filter(e=>e.type==='answer_ungraded'||e.type==='answer_finalized');
  assert(outcomes.length>0);assert.equal(replay.content.questions[0].graderVersion,`exact-algebra-${version}`);
  assert.equal((await store.get('users/alice')).xp,version===1?0:10);
 }
});
