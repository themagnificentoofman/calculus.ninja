import test from 'node:test';
import assert from 'node:assert/strict';
import { createGameApi } from '../lib/server/game-api.ts';
import { createSeatClient } from '../lib/competitive-seat-client.mjs';
import { createServerGames } from '../lib/server/game-engine.ts';
import { LOBBY_LEASE_MS, LOBBY_LIFETIME_MS, normalizeLobbyView, pruneLobby, publicLobbyJoinable } from '../lib/lobby.ts';
const clone=value=>structuredClone(value);
class Store {
 docs=new Map();lastWrites=[];reads=[];
 async get(path){this.reads.push(path);return clone(this.docs.get(path)??null);}
 async find(collection,filters,limit){return [...this.docs].filter(([path,data])=>path.startsWith(collection+'/')&&filters.every(([key,op,value])=>op==='EQUAL'?data[key]===value:op==='IS_ABSENT'?data[key]===undefined:data[key]!==undefined&&data[key]<=value)).slice(0,limit).map(([path,data])=>({id:path.split('/').at(-1),data:clone(data)}));}
 async transaction(fn){const writes=new Map();const result=await fn({get:async path=>{assert.equal(writes.size,0,'all reads precede writes');return this.get(path);},set:(path,value)=>writes.set(path,clone(value)),delete:path=>writes.set(path,null)});this.lastWrites=[...writes.keys()];for(const [path,data]of writes){if(data===null)this.docs.delete(path);else this.docs.set(path,data);}return result;}
}
async function setup(mode='multiplayer',visibility='public'){
 const store=new Store();let now=1000000;const games=createServerGames(store,()=>now);
 for(const uid of ['alice','bobby','carol'])await games.profile(uid,{});
 const questions=Array.from({length:3},()=>({latexProblem:'x+1',options:['1','2','3','4'],correctIndex:0,explanation:['x=0'],topic:'integration',difficulty:'easy'}));
 const set=await games.storeQuestions('alice',mode,'integration','easy',questions);const {id}=await games.createGame('alice',set.questionSetId,mode,{visibility,settings:{winCondition:'first_to_n',targetScore:3,timeLimit:60,penalties:false}});
 return {store,games,id,advance:ms=>now+=ms,now:()=>now};
}
test('private storage is member-only under existing rules while public lobbies are discoverable',async()=>{
 const s=await setup('multiplayer','private'),game=await s.store.get(`games/${s.id}`);
 assert.equal(game.status,'private_waiting');assert.equal(normalizeLobbyView(game).status,'waiting');assert.equal((await s.games.act('alice',s.id,'view')).game.status,'waiting');assert.ok(!('lobbyPresence'in game));assert.equal(publicLobbyJoinable(game,s.now()),false);
 const p=await setup();assert.equal((await p.store.get(`games/${p.id}`)).status,'waiting');assert.equal(publicLobbyJoinable(await p.store.get(`games/${p.id}`),p.now()),true);
});
test('heartbeat extends only a waiting lease without changing reviews, replay, scores, XP or ratings',async()=>{
 const s=await setup(),profile=await s.store.get('users/alice'),before=await s.store.get(`gameSecrets/${s.id}`);s.advance(20000);
 const result=await s.games.act('alice',s.id,'heartbeat');assert.equal(result.game.lobbyExpiresAt,s.now()+LOBBY_LEASE_MS);assert.equal(result.game.status,'waiting');assert.deepEqual(await s.store.get('users/alice'),profile);
 assert.deepEqual(s.store.lastWrites.sort(),[`gameSecrets/${s.id}`,`games/${s.id}`].sort());assert.equal((await s.store.get(`gameSecrets/${s.id}`)).replaySequence,before.replaySequence);
 await assert.rejects(s.games.act('carol',s.id,'heartbeat'),e=>e.status===403);
});
test('expired guests are removed transactionally; a valid host can continue and a guest can rejoin',async()=>{
 const s=await setup();await s.games.act('bobby',s.id,'join',{mode:'multiplayer'});s.advance(60000);await s.games.act('alice',s.id,'heartbeat');s.advance(30000);
 await s.games.act('alice',s.id,'heartbeat');const game=await s.store.get(`gameSecrets/${s.id}`);assert.deepEqual(game.players,['alice']);assert.deepEqual(game.scores,{alice:0});assert.equal(await s.store.get(`games/${s.id}/reviews/bobby`),null);assert.deepEqual(game.receipts,{});
 await assert.rejects(s.games.act('bobby',s.id,'heartbeat'),e=>e.status===403);await s.games.act('bobby',s.id,'join',{mode:'multiplayer'});assert.deepEqual((await s.store.get(`gameSecrets/${s.id}`)).players,['alice','bobby']);
});
test('host loss closes the room despite a live guest; late heartbeat or join cannot revive it',async()=>{
 const s=await setup();await s.games.act('bobby',s.id,'join',{mode:'multiplayer'});s.advance(60000);await s.games.act('bobby',s.id,'heartbeat');s.advance(30000);
 assert.equal((await s.games.sweepLobbies('multiplayer')).cleaned,1);const game=await s.store.get(`gameSecrets/${s.id}`);assert.equal(game.status,'cancelled');assert.equal(game.endReason,'host_disconnected');assert.deepEqual(game.receipts,{});assert.equal((await s.store.get('users/alice')).gamesPlayed,0);
 assert.equal((await s.games.act('alice',s.id,'heartbeat')).game.status,'cancelled');await assert.rejects(s.games.act('carol',s.id,'join',{mode:'multiplayer'}),e=>e.status===409);
});
test('expiry commits even when the triggering join is rejected, and handles pre-heartbeat legacy rooms',async()=>{
 const s=await setup();s.advance(LOBBY_LEASE_MS);await assert.rejects(s.games.act('carol',s.id,'join',{mode:'multiplayer'}),e=>e.status===409);assert.equal((await s.store.get(`games/${s.id}`)).status,'cancelled');
 const legacy=await setup();for(const path of [`games/${legacy.id}`,`gameSecrets/${legacy.id}`]){const g=legacy.store.docs.get(path);delete g.lobbyPresence;delete g.lobbyExpiresAt;delete g.visibility;}legacy.advance(LOBBY_LEASE_MS);assert.equal((await legacy.games.sweepLobbies('multiplayer')).cleaned,1);
});
test('active matches ignore lobby leases and all-full/expired rooms are not joinable',async()=>{
 const s=await setup('pvp');await s.games.act('bobby',s.id,'join',{mode:'pvp'});s.advance(LOBBY_LEASE_MS+20000);const result=await s.games.act('alice',s.id,'heartbeat');assert.equal(result.game.status,'active');assert.equal((await s.games.sweepLobbies('pvp')).cleaned,0);assert.equal((await s.store.get('users/alice')).rating,0);assert.equal(publicLobbyJoinable(result.game,s.now()),false);
 const waiting={mode:'pvp',visibility:'public',status:'waiting',players:['alice'],lobbyExpiresAt:100};assert.equal(publicLobbyJoinable(waiting,99),true);assert.equal(publicLobbyJoinable(waiting,100),false);assert.equal(publicLobbyJoinable({...waiting,players:['alice','bobby']},99),false);
 const lifetime={...waiting,mode:'multiplayer',scores:{alice:0},createdAt:new Date(0),lobbyPresence:{alice:LOBBY_LIFETIME_MS-1}};pruneLobby(lifetime,LOBBY_LIFETIME_MS);assert.equal(lifetime.endReason,'lobby_expired');
});
test('fresh legacy pages gain expiry metadata so catalog cleanup drains instead of repeating the same page',async()=>{
 const s=await setup(),base=await s.store.get(`gameSecrets/${s.id}`);delete base.lobbyPresence;delete base.lobbyExpiresAt;
 for(let i=0;i<50;i++)s.store.docs.set(`gameSecrets/legacy_${i}`,clone(base));
 const first=await s.games.sweepLobbies('multiplayer');assert.equal(first.cleaned,0);assert.equal(first.hasMore,true);assert.ok((await s.store.get('gameSecrets/legacy_0')).lobbyExpiresAt>s.now());
 assert.equal((await s.games.sweepLobbies('multiplayer')).hasMore,false);
});
test('guest heartbeats read no profiles and avoid broadcasting when the next expiry is unchanged',async()=>{
 const s=await setup();await s.games.act('bobby',s.id,'join',{mode:'multiplayer'});const before=await s.store.get(`games/${s.id}`);s.advance(20000);s.store.reads=[];
 await s.games.act('bobby',s.id,'heartbeat');assert.deepEqual(s.store.reads,[`gameSecrets/${s.id}`]);assert.deepEqual(s.store.lastWrites,[`gameSecrets/${s.id}`]);assert.deepEqual(await s.store.get(`games/${s.id}`),before);
});
test('recent empty profile syncs perform no writes and explicit preferences still save',async()=>{
 const s=await setup();await s.games.profile('alice',{});assert.deepEqual(s.store.lastWrites,[]);await s.games.profile('alice',{}, {displayName:'Updated name'});assert.ok(s.store.lastWrites.includes('users/alice'));assert.equal((await s.store.get('users/alice')).displayName,'Updated name');
});

test('a delayed heartbeat cannot renew a later visit to the same competitive room', async () => {
  const store = new Store();
  let now = 1_000_000;
  const host = 'alice', guest = 'bobby', mode = 'multiplayer';
  const roomOptions = {visibility:'public',settings:{winCondition:'first_to_n',targetScore:1,timeLimit:60,penalties:false}};
  const question = {
    problemId:'sample_1', lineageId:'sample_lineage', familyId:'sample_family',
    constructionFamilyId:'sample_construction', problemRevision:1, contentHash:'a'.repeat(64),
    bankRelease:'isolated', choiceOrder:['a','b','c','d'], latexProblem:'1+1', options:['1','2','3','4'],
    correctIndex:1, explanation:['2'], topic:'integration', difficulty:'easy',
  };
  const api = createGameApi({store, now:()=>now, compactCompetitiveBank:true, verify:async token=>({sub:token}),
    quota:async()=>true, select:async()=>({questions:[question],relaxation:'none'})});
  async function call(uid,resource,body) {
    const response = await api(resource,new Request('https://isolated.invalid/api/'+resource,{
      method:'POST', headers:{'content-type':'application/json',authorization:'Bearer '+uid}, body:JSON.stringify(body),
    }));
    const result = await response.json();
    if (!response.ok) throw Object.assign(Error(result.error), {status:response.status,code:result.code});
    return result;
  }
  for (const uid of [host,guest]) await call(uid,'profile',{});
  const operationId = 'host_preparation_1';
  const {questionSetId:id} = await call(host,'questions',{mode,category:'integration',difficulty:'easy',count:1,operationId,roomOptions});
  await call(host,'games',{action:'create',questionSetId:id,mode,options:roomOptions});
  const send = (uid,action,fields={})=>call(uid,'games',{action,gameId:id,...fields});
  const first = 'guest_first_visit', second = 'guest_second_visit';
  await send(guest,'join',{mode,seatOperationId:first});
  await send(guest,'leave',{seatOperationId:first});
  await send(guest,'join',{mode,seatOperationId:second});
  now += 60_000;
  const before = clone(store.docs);
  for (const fields of [{}, {seatOperationId:first}, {seatOperationId:operationId}]) {
    await assert.rejects(send(guest,'heartbeat',fields),e=>e.status===409&&e.code==='LOBBY_VISIT_CHANGED');
    assert.deepEqual(store.docs,before);
  }
  store.reads = [];
  await send(guest,'heartbeat',{seatOperationId:second});
  assert.equal((await store.get('gameSecrets/'+id)).lobbyPresence[guest],now);
  assert.equal(store.reads.filter(p=>p.startsWith('bankRecent/')||p.startsWith('users/')).length,0);
  await send(host,'heartbeat',{seatOperationId:operationId});
  now += LOBBY_LEASE_MS;
  await assert.rejects(send(guest,'heartbeat',{seatOperationId:second}),e=>e.status===409);
  assert.equal((await store.get('games/'+id)).status,'cancelled');
  for (const uid of [host,guest]) assert.equal((await store.get('bankRecent/'+uid)).reservations.length,0);
});

test('a scheduled presence callback retains its visit and initiating account',async () => {
  const uid = 'bobby', id = 'c2'+'1'.repeat(28);
  let account = uid, visit = 'initial_visit_01';
  const sent = [], data = new Map();
  const client = createSeatClient({
    currentUid:()=>account, randomKey:()=>assert.fail('views never open seats'),
    storage:()=>({getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)}),
    command: async (action,room,fields,expectedUid)=>{
      sent.push({action,room,fields,expectedUid});
      return {game:{mode:'multiplayer',status:'waiting',players:[uid]},lobbyVisitId:visit};
    },
  });
  await client.view(uid,id);
  const first = client.departure(uid,id).seatOperationId;
  await client.heartbeat(uid,id,first);
  assert.deepEqual(sent.at(-1),{action:'heartbeat',room:id,fields:{seatOperationId:first},expectedUid:uid});
  visit = 'second_visit_001';
  await client.view(uid,id);
  const count = sent.length;
  await assert.rejects(client.heartbeat(uid,id,first));
  account = 'other';
  await assert.rejects(client.heartbeat(uid,id,visit));
  assert.equal(sent.length,count);
  account = uid;
  await client.heartbeat(uid,'legacyroom1',undefined);
  assert.deepEqual(sent.at(-1),{action:'heartbeat',room:'legacyroom1',fields:{},expectedUid:uid});
});

test('catalog and invitation transfers restore exactly the visit confirmed before navigation',async () => {
  const uid='guest', id='c2'+'3'.repeat(28), mode='multiplayer';
  const inviteKey='inv:'+'a'.repeat(64);
  for (const first of ['manual_visit_001', inviteKey]) {
    const data = new Map(), commands = [];
    let visit = first, status = 'waiting';
    const receipt = () => ({game:{mode,status,players:[uid]},...(status==='waiting'?{lobbyVisitId:visit}:{})});
    const tab = () => createSeatClient({
      currentUid:()=>uid,randomKey:()=>assert.fail('navigation cannot admit a new seat'),
      storage:()=>({getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)}),
      command:async action=>{commands.push(action);assert.equal(action,'view');return receipt();},
    });
    const previous = tab();
    await previous.view(uid,id);
    const oldDeparture = previous.departure(uid,id);
    assert.equal(previous.toRoom(uid,'historical_room_0001',mode,receipt()),'/play/multiplayer?round=historical_room_0001');
    assert.equal(previous.toRoom(uid,id,mode,receipt()),'/play/multiplayer?round='+id);
    assert.equal(previous.pagehide(uid,oldDeparture),false);
    const arrival = tab();
    assert.equal((await arrival.view(uid,id)).lobbyVisitId,first);
    assert.equal(arrival.departure(uid,id).seatOperationId,first);
    arrival.toRoom(uid,id,mode,receipt());
    visit = 'other_device_rejoin';
    const delayed = tab();
    await assert.rejects(delayed.view(uid,id),/visit has changed/);
    assert.equal(delayed.departure(uid,id),null);
    assert.equal((await delayed.view(uid,id)).lobbyVisitId,visit);
    delayed.toRoom(uid,id,mode,receipt());
    status = 'active';
    const started = tab();
    assert.equal((await started.view(uid,id)).game.status,'active');
    assert.equal(started.departure(uid,id),null);
    assert.equal(commands.length,5);
  }
});
