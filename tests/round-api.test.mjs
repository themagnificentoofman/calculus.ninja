import test from 'node:test';
import assert from 'node:assert/strict';
import {createRoundApi} from '../lib/server/round-api.ts';
import {roundIdentity,RoundIntentError} from '../lib/server/round-intents.ts';
import {JointSelectionError} from '../lib/server/joint-selection-error.mjs';

const configuration={mode:'test',category:'integration',difficulty:'easy',count:2,questionMix:{multipleChoice:1,freeResponse:1,order:'uniform'}};
const body={action:'prepare',operationId:'operation-one',request:configuration};
const request=(value=body,headers={},method='POST')=>new Request('https://calculus.ninja/api/rounds',{method,headers:{authorization:'Bearer signed',origin:'https://calculus.ninja','content-type':'application/json',...headers},...(method==='POST'?{body:typeof value==='string'?value:JSON.stringify(value)}:{})});
function setup(overrides={}){
 const calls=[],charges=[];
 const workflow=Object.fromEntries(['prepare','activate','cancel'].map(action=>[action,async(uid,id,input)=>{
  calls.push({action,uid,id,input});const identity=await roundIdentity(uid,id,input);
  return {id:identity.id,questionSetId:identity.id,questionCount:input.count,status:action==='cancel'?'CANCELLED':'PREPARED',questions:[{correctIndex:2,answer:'private'}],history:'private',policy:'private',receipt:'private'};
 }]));
 const api=createRoundApi({verify:async()=>({sub:'account-one'}),workflow,mutationQuota:async uid=>{charges.push(uid);return true;},...overrides});
 return {api,calls,charges};
}

test('round API binds verified owner and returns only the exact opaque identity',async()=>{
 const s=setup(),identity=await roundIdentity('account-one',body.operationId,configuration);
 for(const action of ['prepare','activate','cancel']){
  const response=await s.api(request({...body,action}));assert.equal(response.status,200);
  assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(response.headers.get('x-content-type-options'),'nosniff');
  assert.deepEqual(await response.json(),action==='activate'?{id:identity.id}:{questionSetId:identity.id,questionCount:2,status:action==='cancel'?'CANCELLED':'PREPARED'});
 }
 assert(s.calls.every(call=>call.uid==='account-one'&&call.id==='operation-one'));assert.equal(s.charges.length,3);
 assert.equal(s.calls[0].input.questionMix.order,'uniform');
});

test('authentication, origin and request boundaries reject before workflow and quota',async()=>{
 const s=setup();
 for(const [input,status] of [
  [request(body,{},'GET'),405],[request(body,{authorization:''}),401],
  [request(body,{authorization:'Bearer '+ 'x'.repeat(8193)}),401],
  [request(body,{origin:'https://attacker.example'}),403],
  [request(body,{'sec-fetch-site':'cross-site'}),403],
  [request(body,{'content-type':'text/plain'}),400],
  [request('{'),400],[request(' '.repeat(10001)),400],
  ...[null,[],{}, {...body,uid:'account-other'}, {...body,action:'toString'}, {...body,operationId:'../escape'}, {...body,request:{...configuration,policyHash:'forged'}}, {...body,request:{...configuration,count:21}}, {...body,request:{...configuration,questionMix:{multipleChoice:2,freeResponse:1,order:'uniform'}}}].map(value=>[request(value),400]),
 ])assert.equal((await s.api(input)).status,status);
 assert.equal(s.calls.length,0);assert.equal(s.charges.length,0);
 for(const verify of [async()=>{throw Error('private auth trace');},async()=>({sub:['account-one']}),async()=>({sub:'constructor'})]){
  const rejected=setup({verify});const result=await rejected.api(request());assert.equal(result.status,401);assert(!JSON.stringify(await result.json()).includes('private'));assert.equal(rejected.calls.length,0);
 }
});

test('quota denies dispatch and internal errors never become displayed copy',async()=>{
 const limited=setup({mutationQuota:async()=>false});assert.equal((await limited.api(request())).status,429);assert.equal(limited.calls.length,0);
 for(const [error,status,code] of [
  [new RoundIntentError('roundIntents/foo schema milestone-4 fixture','ROUND_HISTORY_CHANGED',409),409,'ROUND_HISTORY_CHANGED'],
  [new RoundIntentError('private clock diagnostics','ROUND_CLOCK_UNAVAILABLE',409),409,'ROUND_CLOCK_UNAVAILABLE'],
  [new RoundIntentError('private quota data','ROUND_SELECTION_LIMIT',429),429,'ROUND_SELECTION_LIMIT'],
  [new RoundIntentError('private unknown code','PRIVATE_UNKNOWN',400),503,'ROUND_RETRY'],
  [new JointSelectionError('joint-insufficient-capacity'),409,'INSUFFICIENT_CONTENT'],
  [new Error('SQL secret/token stack fixture'),503,'ROUND_RETRY'],
 ]){
  const workflow={prepare:async()=>{throw error;}},s=setup({workflow});const result=await s.api(request()),value=await result.json();
  assert.equal(result.status,status);assert.equal(value.code,code);assert(!/private|schema|milestone|fixture|SQL|token|stack/.test(value.error));
 }
 for(const result of [{questionSetId:'f'.repeat(64),questionCount:2,status:'PREPARED'},{id:'f'.repeat(64)}]){
  const action='id'in result?'activate':'prepare',s=setup({workflow:{[action]:async()=>result}});
  assert.equal((await s.api(request({...body,action}))).status,503);
 }
});
