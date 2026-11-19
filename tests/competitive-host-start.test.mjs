import assert from 'node:assert/strict';
import test from 'node:test';
import {createRoundStartClient} from '../lib/round-start.mjs';
import {sendCompetitiveStart} from '../lib/competitive-start.mjs';

const request = {
  mode:'multiplayer', category:'limits', difficulty:'medium', count:3,
  options:{visibility:'private', settings:{winCondition:'first_to_n', targetScore:1, timeLimit:60, penalties:false}},
};
const room = 'c2' + '8'.repeat(28);

function browser() {
  const saved = new Map(), calls = [];
  let roomExists = false, loseCreation = false;
  async function api(resource, body, uid) {
    calls.push({resource,body,uid});
    if (resource === 'games') {
      assert.equal(body.questionSetId, room);
      roomExists = true;
      if (loseCreation) { loseCreation = false; throw Error('Dropped response'); }
      return {id:room};
    }
    if (body.operation === 'cancel') return {questionSetId:room, status:roomExists?'waiting':'cancelled'};
    return {questionSetId:room, questionCount:body.count};
  }
  const client = () => createRoundStartClient({
    storage:{getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value),removeItem:key=>saved.delete(key)},
    withLock:async(_,fn)=>fn(), newId:()=>crypto.randomUUID(),
    send:(uid,body,preparedId)=>sendCompetitiveStart(api,uid,body,preparedId),
  });
  return {client, calls, drop:()=>{loseCreation=true;}};
}

test('lost host creation recovers the same room and settings across reload and cancellation', async()=>{
  const s = browser(), uid='host-account';
  s.drop();
  await assert.rejects(s.client().start(uid,request));
  await assert.rejects(s.client().start(uid,{...request,options:{...request.options,visibility:'public'}}), /different settings/);
  assert.equal(await s.client().pending('other-account','multiplayer'),null);
  assert.deepEqual(await s.client().cancel(uid,'multiplayer'),{status:'issued',roundId:room});
  assert.equal(await s.client().resume(uid,'multiplayer'),room);
  const [prepare,create,cancel]=s.calls;
  assert.deepEqual(prepare.body.roomOptions,request.options);
  assert.deepEqual(create.body.options,{category:'limits',difficulty:'medium',...request.options});
  assert.equal(cancel.body.operationId,prepare.body.operationId);
  assert.ok(s.calls.every(c=>c.uid===uid));
  await s.client().acknowledge(uid,'multiplayer',room);
  assert.equal(await s.client().pending(uid,'multiplayer'),null);
});

test('pending invitation has an immutable local recipient, isolated from gameplay settings',async()=>{
  const s=browser(), uid='host-account', start={mode:'pvp',category:'all',difficulty:'easy',count:3,options:{visibility:'private'},inviteTo:'friend-one'};
  s.drop();
  await assert.rejects(s.client().start(uid,start));
  await assert.rejects(s.client().start(uid,{...start,inviteTo:'friend-two'}),/different settings/);
  assert.equal((await s.client().pending(uid,'pvp')).request.inviteTo,'friend-one');
  assert.equal(await s.client().resume(uid,'pvp'),room);
  assert.ok(s.calls.every(c=>!JSON.stringify(c).includes('friend-one')));
});

test('invalid room settings and malformed activation identifiers are rejected',async()=>{
  const s=browser();
  for(const altered of [
    {...request,options:{...request.options,visibility:'open'}},
    {...request,options:{...request.options,settings:{...request.options.settings,timeLimit:301}}},
    {...request,inviteTo:'friend-one'}, {...request,responseFormat:'free-response'},
    {...request,options:{...request.options,settings:{...request.options.settings,extra:true}}},
  ]) await assert.rejects(s.client().start('host-account',altered));
  assert.equal(s.calls.length,0);
  await assert.rejects(sendCompetitiveStart(()=>assert.fail('unexpected call'),'host-account',{action:'activate',request,operationId:'unused-test-value'},'a'.repeat(64)));
});
