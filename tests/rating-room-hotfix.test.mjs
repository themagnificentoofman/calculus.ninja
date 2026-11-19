import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign, createHash } from 'node:crypto';
import { applyRatingChange, clampProfileRatings } from '../lib/rating-floor.ts';
import { observeGameState } from '../lib/game-observer.ts';
import { repairRatingPage, ratingRepairApi, repairMessage } from '../lib/server/rating-repair.ts';

test('rating floor changes only deltas crossing zero, including topic balances', () => {
  assert.deepEqual(applyRatingChange(5, -16), { newRating: 0, ratingChange: -5 });
  assert.deepEqual(applyRatingChange(0, -16), { newRating: 0, ratingChange: 0 });
  for (const [balance, delta] of [[400,-16],[0,16],[400,3.14159],[20,-3.14159],[5,-5],[400,0]]) {
    assert.deepEqual(applyRatingChange(balance,delta), { newRating: balance + delta, ratingChange: delta });
  }
  const p={rating:15,topicRatings:{integration:4,limits:0},xp:123};
  assert.equal(clampProfileRatings(p),p);
  assert.deepEqual(clampProfileRatings({...p,rating:-16,topicRatings:{integration:-32,limits:8}}), {...p,rating:0,topicRatings:{integration:0,limits:8},ratedGames:1});
});

function storeFixture() {
  const docs=new Map();
  return {docs,get:async path=>structuredClone(docs.get(path)??null),transaction:async fn=>{
    const writes=new Map();const result=await fn({get:async path=>{assert.equal(writes.size,0);return structuredClone(docs.get(path)??null);},set:(path,data)=>writes.set(path,structuredClone(data))});
    for(const [path,data]of writes)docs.set(path,data);return result;
  }};
}
test('repair dry run, current-value transactions, projections and retries preserve history and earned progress', async () => {
  const store=storeFixture();
  store.docs.set('users/alice',{uid:'alice',rating:-16,topicRatings:{integration:-4,limits:123},xp:140,gamesPlayed:8,email:'private@example.test',settings:{theme:'dark'}});
  store.docs.set('users_public/alice',{rating:-16});store.docs.set('games/history',{receipts:{alice:{ratingChange:-16,newRating:-16}}});
  const before=structuredClone([...store.docs]);
  assert.equal((await repairRatingPage(store,['alice'],false)).affected,1);assert.deepEqual([...store.docs],before);
  assert.equal((await repairRatingPage(store,['alice'],true)).affected,1);
  const p=await store.get('users/alice');assert.equal(p.rating,0);assert.equal(p.topicRatings.integration,0);assert.equal(p.topicRatings.limits,123);assert.equal(p.xp,140);assert.equal(p.gamesPlayed,8);assert.equal(p.ratedGames,1);
  const pub=await store.get('users_public/alice');assert.equal(pub.rating,0);assert.ok(!('email'in pub));assert.ok(!('settings'in pub));
  assert.deepEqual(await store.get('games/history'),before[2][1]);assert.equal((await repairRatingPage(store,['alice'],true)).affected,0);
  store.docs.set('users/alice',{...p,rating:20});assert.equal((await repairRatingPage(store,['alice'],true)).affected,0);assert.equal((await store.get('users/alice')).rating,20);
});

test('repair endpoint fails closed on unsigned, expired, oversized or tampered requests', async () => {
  const {privateKey,publicKey}=generateKeyPairSync('ed25519'),now=Date.now(),store=storeFixture();let pages=0;
  const deps={store,publicKey:publicKey.export({type:'spki',format:'der'}).toString('base64'),expiresAt:String(now+60000),now:()=>now,page:async()=>{pages++;return {ids:[],nextCursor:null};}};
  const make=(body,changes={})=>{const time=String(now),hash=createHash('sha256').update(body).digest('hex');return new Request('https://ninja.test/api/rating-repair',{method:'POST',body,headers:{'x-repair-time':time,'x-repair-hash':hash,'x-repair-signature':sign(null,Buffer.from(repairMessage(time,hash)),privateKey).toString('base64'),...changes}});};
  const body=JSON.stringify({cursor:null,apply:false}),api=ratingRepairApi(deps);
  assert.equal((await api(make(body))).status,200);assert.equal(pages,1);
  assert.equal((await api(make(body,{'x-repair-hash':'0'.repeat(64)}))).status,403);
  assert.equal((await api(make(body,{origin:'https://ninja.test'}))).status,403);
  assert.equal((await api(make(JSON.stringify({cursor:null,apply:true,rating:100})))).status,403);
  assert.equal((await api(make('x'.repeat(5000)))).status,403);
  assert.equal((await ratingRepairApi({...deps,expiresAt:String(now)})(make(body))).status,404);
  assert.equal((await ratingRepairApi({...deps,publicKey:undefined})(make(body))).status,404);assert.equal(pages,1);
});

function observer() {
  let game,progress,gameError,progressError;const views=[],removed=[],errors=[];
  const stop=observeGameState('alice',(next,error)=>{game=next;gameError=error;return()=>{};},(next,error)=>{progress=next;progressError=error;return()=>{};},(g,p)=>views.push({game:g,progress:p}),e=>errors.push(e),()=>removed.push(true));
  return {game:g=>game(g),progress:p=>progress(p),error:e=>gameError(e),progressError:e=>progressError(e),views,removed,errors,stop};
}
test('lobby joins/leaves and host cancellation emit immediately without reviews', () => {
  const s=observer(),waiting={status:'waiting',players:['alice','bobby'],answers:{}};
  s.game(waiting);assert.equal(s.views.length,1);s.game({...waiting,players:['alice']});assert.deepEqual(s.views.at(-1).game.players,['alice']);
  s.game({...waiting,status:'cancelled'});assert.equal(s.views.at(-1).game.status,'cancelled');
});
test('departed tabs clear on lost membership, deleted rooms or listener permission loss; callbacks stop on cleanup', () => {
  for(const remove of [s=>s.game({status:'waiting',players:['bobby']}),s=>s.game(null),s=>s.progressError({code:'permission-denied'})]) {
    const s=observer();remove(s);s.error({code:'permission-denied'});assert.equal(s.removed.length,1);assert.equal(s.errors.length,0);s.stop();s.game(null);assert.equal(s.removed.length,1);
  }
});
test('active answers still wait for matching private reviews and transport failures retain the room', () => {
  const s=observer();s.game({status:'active',players:['alice'],answers:{alice:{0:{correct:true}}}});s.progress({answers:{}});assert.equal(s.views.length,0);
  s.progress({answers:{0:{correct:true}}});assert.equal(s.views.length,1);s.error({code:'unavailable'});assert.equal(s.removed.length,0);assert.equal(s.errors.length,1);
});
