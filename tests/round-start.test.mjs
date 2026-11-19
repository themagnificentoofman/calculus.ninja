import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRoundStartClient,RoundStartRequestError} from '../lib/round-start.mjs';
const input={mode:'test',category:'integration',difficulty:'easy',count:2,questionMix:{multipleChoice:1,freeResponse:1,order:'uniform'}};
function setup(){
 const values=new Map(),calls=[],states=new Map(),locks=new Map();let ids=0,storageFails=false,lose='',mutation;
 const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>{if(storageFails)throw Error('private storage trace');values.set(k,v);},removeItem:k=>values.delete(k)};
 const withLock=(key,callback)=>{const promise=(locks.get(key)||Promise.resolve()).catch(()=>{}).then(callback);locks.set(key,promise);return promise;};
 const send=async(uid,body)=>{
  calls.push(structuredClone({uid,...body}));const key=uid+':'+body.operationId,id=createHash('sha256').update(key).digest('hex');
  let state=states.get(key);
  if(body.action==='prepare'&&!state){state={status:'PREPARED',request:structuredClone(body.request),id};states.set(key,state);}
  if(body.action==='activate')state.status='ISSUED';
  if(body.action==='cancel'){
   if(!state){state={status:'CANCELLED',request:body.request,id};states.set(key,state);}
   else if(state.status!=='ISSUED')state.status='CANCELLED';
  }
  mutation?.(body,state);
  if(lose===body.action){lose='';throw Error('Network response lost');}
  return body.action==='activate'?{id}:{questionSetId:id,questionCount:body.request.count,status:state.status};
 };
 const deps={storage,withLock,send,newId:()=>`operation-${++ids}`};
 return {client:createRoundStartClient(deps),fresh:()=>createRoundStartClient(deps),values,calls,states,ids:()=>ids,failStorage:value=>storageFails=value,lose:action=>lose=action,mutate:fn=>mutation=fn};
}

test('pending round identity survives reloads and losses before and after activation',async()=>{
 for(const phase of ['prepare','activate']){
  const s=setup();s.lose(phase);await assert.rejects(s.client.start('account-one',input),/Please retry/);
  const pending=await s.fresh().pending('account-one','test');assert.deepEqual(pending.request,{...input,options:{}});
  const id=await s.fresh().resume('account-one','test');assert.equal(s.ids(),1);
  assert.equal(s.states.size,1);assert(s.calls.every(call=>call.operationId==='operation-1'));
  assert.equal((await s.client.pending('account-one','test')).roundId,id);
  await assert.rejects(s.client.acknowledge('account-one','test','f'.repeat(64)),/different round/);
  await s.client.acknowledge('account-one','test',id);assert.equal(await s.client.pending('account-one','test'),null);
  assert.notEqual(await s.client.start('account-one',input),id);assert.equal(s.ids(),2);
 }
});

test('exclusive browser-key locks share one start across concurrent callers and protect other accounts',async()=>{
 const s=setup();const results=await Promise.all(Array.from({length:12},()=>s.fresh().start('account-one',input)));
 assert.equal(new Set(results).size,1);assert.equal(s.ids(),1);assert.equal(s.calls.length,2);
 await s.client.start('account-two',input);assert.equal(s.ids(),2);assert.equal(s.states.size,2);
 const before=s.calls.length;await assert.rejects(s.client.start('account-one',{...input,difficulty:'hard'}),/different settings/);assert.equal(s.calls.length,before);
});

test('cancel keeps uncertain tombstones and redirects issued rounds to recovery',async()=>{
 const s=setup();s.lose('prepare');await assert.rejects(s.client.start('account-one',input));
 s.lose('cancel');await assert.rejects(s.client.cancel('account-one','test'),/Please retry/);assert(await s.client.pending('account-one','test'));
 assert.deepEqual(await s.fresh().cancel('account-one','test'),{status:'cleared'});assert.equal(await s.client.pending('account-one','test'),null);
 const id=await s.client.start('account-one',input);assert.deepEqual(await s.client.cancel('account-one','test'),{status:'issued',roundId:id});
 assert.equal(await s.client.resume('account-one','test'),id);assert.equal(s.ids(),2);
});

test('storage or malformed saved state never silently creates a replacement request',async()=>{
 const s=setup();s.failStorage(true);await assert.rejects(s.client.start('account-one',input),/browser could not save/);assert.equal(s.calls.length,0);
 s.failStorage(false);s.lose('activate');await assert.rejects(s.client.start('account-one',input));
 const key='round-start-1:account-one:test',saved=s.values.get(key),before=s.calls.length;
 for(const bad of ['{',' '.repeat(10001),JSON.stringify({version:1,operationId:'operation-2',stage:'pending',request:{...input,uid:'injected'}})]){
  s.values.set(key,bad);await assert.rejects(s.fresh().resume('account-one','test'),/saved round could not be read/);assert.equal(s.calls.length,before);
 }
 s.values.set(key,saved);const id=await s.client.resume('account-one','test');assert.match(id,/^[a-f0-9]{64}$/);assert.equal(s.states.size,1);
 const t=setup();t.mutate(body=>{if(body.action==='activate')t.failStorage(true);});
 await assert.rejects(t.client.start('account-one',input),/browser could not save/);assert.equal(t.states.size,1);
 t.mutate(null);t.failStorage(false);await t.fresh().resume('account-one','test');assert.equal(t.ids(),1);assert.equal(t.states.size,1);
});

test('terminal preparations require an explicit clear and preserve the original submitted options',async()=>{
 const s=setup();s.mutate((body,state)=>{if(body.action==='prepare')state.status='EXPIRED';});
 await assert.rejects(s.client.start('account-one',input),/pending round has ended/);assert.equal(s.calls.length,1);assert(await s.client.pending('account-one','test'));
 s.mutate(null);await s.client.cancel('account-one','test');assert.equal(await s.client.pending('account-one','test'),null);
 const rapid={mode:'rapid',category:'all',difficulty:'medium',count:20,options:{timeLimit:90}};
 const result=await s.client.start('account-one',rapid);assert.match(result,/^[a-f0-9]{64}$/);
 assert(s.calls.slice(-2).every(call=>call.request.options.timeLimit===90));
 for(const invalid of [{...rapid,options:{timeLimit:0}},{...rapid,responseFormat:'free-response'},{...input,count:21},{...input,questionMix:{multipleChoice:2,freeResponse:1,order:'uniform'}}])await assert.rejects(s.client.start('account-one',invalid));
});

function boundaryClient(send,withLock=async(_,fn)=>fn()){
 const values=new Map();
 const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
 return {client:createRoundStartClient({storage,withLock,send,newId:()=> 'operation-safe'}),values,storage};
}
test('transport bodies and summaries are detached, and issued cancellation cannot change the known identity',async()=>{
 const savedId='a'.repeat(64),otherId='b'.repeat(64);let prepared,wrong=false,cancelled=false,activationBody;
 const s=boundaryClient(async(_,body)=>{
  assert(Object.isFrozen(body)&&Object.isFrozen(body.request)&&Object.isFrozen(body.request.questionMix));
  assert.equal(Reflect.set(body.request,'difficulty','hard'),false);
  if(body.action==='prepare'){prepared={questionSetId:savedId,questionCount:2,status:'PREPARED'};return prepared;}
  if(body.action==='activate'){activationBody=body;prepared.questionSetId=otherId;return {id:savedId};}
  return {questionSetId:wrong?otherId:savedId,questionCount:2,status:cancelled?'CANCELLED':'ISSUED'};
 });
 assert.equal(await s.client.start('account-one',input),savedId);assert.equal(activationBody.request.difficulty,'easy');
 const before=[...s.values];wrong=true;await assert.rejects(s.client.cancel('account-one','test'),/did not match/);assert.deepEqual([...s.values],before);
 wrong=false;cancelled=true;await assert.rejects(s.client.cancel('account-one','test'),/did not match/);assert.deepEqual([...s.values],before);
 cancelled=false;assert.equal((await s.client.cancel('account-one','test')).roundId,savedId);
 const bad=boundaryClient(async(_,body)=>{if(body.action==='prepare'){prepared={questionSetId:savedId,questionCount:2,status:'PREPARED'};return prepared;}prepared.questionSetId=otherId;return {id:otherId};});
 await assert.rejects(bad.client.start('account-one',input),/response could not be read/);
});
test('untrusted transport and lock diagnostics become plain public errors',async()=>{
 for(const send of [async()=>{throw Error('private SQL schema fixture bearer-token');},async()=>{const e=new RoundStartRequestError('ROUND_SELECTION_LIMIT');e.message='private mutated message';throw e;}]){
  const s=boundaryClient(send);await assert.rejects(s.client.start('account-one',input),error=>! /private|SQL|schema|fixture|token/.test(error.message)&&/retry|try again/i.test(error.message));
 }
 const locked=boundaryClient(async()=>{},async()=>{throw Error('private browser lock diagnostics');});
 await assert.rejects(locked.client.start('account-one',input),error=>!error.message.includes('private')&&error.message.includes('Please retry'));
 for(const code of ['__proto__','constructor',null,{toString:()=>{throw Error('coerced');}}])assert.equal(new RoundStartRequestError(code).message,'The server could not finish this round request. Please retry in this browser.');
 const s=boundaryClient(async()=>{throw Error('initial transport loss');});await assert.rejects(s.client.start('account-one',input));
 s.storage.removeItem=()=>{throw Error('private storage');};
 const cleanup=createRoundStartClient({storage:s.storage,withLock:async(_,fn)=>fn(),send:async()=>({questionSetId:'a'.repeat(64),questionCount:2,status:'CANCELLED'}),newId:()=> 'unused-id'});
 await assert.rejects(cleanup.cancel('account-one','test'),error=>error.message==='This browser could not clear the pending start. Please retry.');
 const getter=boundaryClient(async()=>{},async()=>{const error=new RoundStartRequestError('ROUND_SELECTION_LIMIT');Object.defineProperty(error,'code',{get:()=>{throw Error('PRIVATE_CODE_GETTER');}});throw error;});
 await assert.rejects(getter.client.pending('account-one','test'),error=>error.message==='Question selection limit reached. Please try again later.');
 const modified=boundaryClient(async()=>{},async(_,fn)=>{try{return await fn();}catch(error){error.message='PRIVATE_MODIFIED_MESSAGE';throw error;}});
 await assert.rejects(modified.client.resume('account-one','test'),error=>error.message==='There is no saved round to resume. Choose your settings and start a round.');
 const unsupported=boundaryClient(async()=>{},async()=>{throw new RoundStartRequestError('BROWSER_UNSUPPORTED');});
 await assert.rejects(unsupported.client.pending('account-one','test'),error=>error.message.includes('current browser version'));
});
