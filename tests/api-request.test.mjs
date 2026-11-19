import test from 'node:test';
import assert from 'node:assert/strict';
import {createApiRequest,ApiRequestError} from '../lib/api-request.mjs';
const deferred=()=>{let resolve;return {promise:new Promise(r=>resolve=r),resolve};};
const flush=()=>new Promise(r=>setImmediate(r));
function setup({token=Promise.resolve('token'),fetch=async()=>Response.json({ok:true})}={}){
 let user={uid:'alice',getIdToken:()=>token},expire,cleared=0,requests=[];
 const request=createApiRequest({currentUser:()=>user,fetch:async(...args)=>{requests.push(args);return fetch(...args);},setTimer:fn=>{expire=fn;return 1;},clearTimer:()=>cleared++});
 return {request,requests,expire:()=>expire(),switchUser:value=>user=value,get cleared(){return cleared;}};
}
test('one deadline bounds a stuck token and forbids a late authenticated send',async()=>{
 const token=deferred(),s=setup({token:token.promise}),pending=s.request('rounds',{action:'prepare'},'alice');
 s.expire();await assert.rejects(pending,e=>e instanceof ApiRequestError&&e.code==='REQUEST_TIMEOUT');
 token.resolve('late token');await flush();assert.equal(s.requests.length,0);assert.equal(s.cleared,1);
});
test('one deadline also bounds fetch and response decoding and aborts transport',async()=>{
 for(const stage of ['fetch','json']){
  const stalled=deferred(),s=setup({fetch:stage==='fetch'?()=>stalled.promise:async()=>({ok:true,json:()=>stalled.promise})});
  const pending=s.request('games',{});await flush();s.expire();await assert.rejects(pending,e=>e.code==='REQUEST_TIMEOUT');
  assert.equal(s.requests[0][1].signal.aborted,true);stalled.resolve(stage==='fetch'?Response.json({ok:true}):{ok:true});await flush();assert.equal(s.cleared,1);
 }
});
test('account changes cannot send or accept work under an old account',async()=>{
 const token=deferred(),s=setup({token:token.promise}),pending=s.request('rounds',{},'alice');
 s.switchUser({uid:'bob'});token.resolve('token');await assert.rejects(pending,e=>e.code==='SIGN_IN');assert.equal(s.requests.length,0);
 const response=deferred(),t=setup({fetch:()=>response.promise}),second=t.request('games',{});await flush();t.switchUser(null);response.resolve(Response.json({ok:true}));await assert.rejects(second,e=>e.code==='SIGN_IN');
 const denied=setup();await assert.rejects(denied.request('games',{},'bob'),e=>e.code==='SIGN_IN');assert.equal(denied.requests.length,0);
});
test('raw token/network/upstream diagnostics stay out of displayed API errors',async()=>{
 for(const variant of ['token','network','upstream','malformed']){
  const secret='fixture-internal-stack private-token';
  const s=setup(variant==='token'?{token:Promise.reject(Error(secret))}:{fetch:async()=>{if(variant==='network')throw Error(secret);return variant==='upstream'?Response.json({error:secret},{status:503}):Response.json([secret]);}});
  await assert.rejects(s.request('games',{}),e=>e instanceof ApiRequestError&&!e.message.includes(secret)&&e.message.includes('retry'));assert.equal(s.cleared,1);
 }
 const s=setup({fetch:async()=>Response.json({error:'Choose a supported question count.',code:'BAD_REQUEST'},{status:400})});
 await assert.rejects(s.request('rounds',{}),e=>e.message==='Choose a supported question count.'&&e.code==='BAD_REQUEST');
});
