import test from 'node:test';
import assert from 'node:assert/strict';
import {startProfileSession} from '../lib/profile-session.ts';
import {createGameApi} from '../lib/server/game-api.ts';
import {StoreError} from '../lib/server/firestore-admin.ts';
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function session(readOnly=false){
 let next,fail,resolve,reject;const profiles=[],errors=[],loads=[];let ready=0,unsubscribed=false;
 const boot=new Promise((ok,no)=>{resolve=ok;reject=no;});
 const stop=startProfileSession({subscribe:(onNext,onFail)=>{next=onNext;fail=onFail;return()=>{unsubscribed=true;};},bootstrap:readOnly?undefined:()=>boot,profile:value=>profiles.push(value),error:value=>errors.push(value),loading:value=>loads.push(value),ready:()=>ready++});
 return {next:value=>next(value),fail:()=>fail(),resolve:()=>resolve(),reject:()=>reject(Error('503')),profiles,errors,loads,ready:()=>ready,stop,unsubscribed:()=>unsubscribed};
}
test('an existing profile loads before server bootstrap and remains visible through an API outage',async()=>{
 const s=session(),profile={uid:'alice',xp:800,rating:35};s.next(profile);assert.deepEqual(s.profiles,[profile]);assert.equal(s.loads.at(-1),false);s.reject();await flush();assert.deepEqual(s.profiles,[profile]);assert.match(s.errors.at(-1),/saved profile is loaded/);assert.equal(s.ready(),0);s.stop();
});
test('a cached profile arriving after bootstrap fails recovers the profile view without replacing earned progress',async()=>{
 const s=session();s.reject();await flush();assert.match(s.errors.at(-1),/could not be loaded/);s.next({uid:'alice',xp:123});assert.equal(s.profiles.at(-1).xp,123);assert.match(s.errors.at(-1),/saved profile is loaded/);s.stop();
});
test('new-account initialization waits for creation and starts reconciliation only after successful bootstrap',async()=>{
 const s=session();s.next(null);assert.equal(s.loads.length,0);s.resolve();await flush();assert.equal(s.ready(),1);s.next({uid:'new'});assert.equal(s.loads.at(-1),false);assert.equal(s.errors.at(-1),'');s.stop();
});
test('account changes stop stale profile callbacks and late bootstrap completions',async()=>{
 const s=session();s.stop();s.next({uid:'old'});s.resolve();await flush();assert.equal(s.profiles.length,0);assert.equal(s.ready(),0);assert.equal(s.unsubscribed(),true);
 const failure=session();failure.stop();failure.reject();await flush();assert.equal(failure.errors.length,0);
});
test('replay-only sessions read profiles without starting writes or result reconciliation',()=>{
 const s=session(true);s.next({uid:'alice'});assert.equal(s.profiles.length,1);assert.equal(s.ready(),0);s.stop();
});
test('upstream storage quota failures return an explicit safe API code',async()=>{
 const api=createGameApi({store:{transaction:async()=>{throw new StoreError(429);}},verify:async()=>({sub:'alice'}),select:async()=>{throw Error('unused');},quota:async()=>true});
 const response=await api('profile',new Request('https://calculus.ninja/api/profile',{method:'POST',headers:{Authorization:'Bearer fixture','Content-Type':'application/json'},body:'{}'}));
 assert.equal(response.status,503);assert.deepEqual(await response.json(),{error:'Online storage is at its usage limit. Please try again later.',code:'STORAGE_QUOTA_EXCEEDED'});
});
