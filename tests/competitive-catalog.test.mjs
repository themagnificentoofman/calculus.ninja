import assert from 'node:assert/strict';
import test from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync, readdirSync} from 'node:fs';
import {sqliteD1} from '../scripts/bank/sqlite-d1.mjs';
import {sourceFixture} from './fixtures/source-bank.mjs';
import {applyRoundControl} from '../scripts/milestone4/round-control.mjs';
import {createGameApi} from '../lib/server/game-api.ts';
import {selectCompetitiveQuestions} from '../lib/server/competitive-catalog.ts';
import {roundCreationPolicy} from '../lib/server/round-creation-policy.mjs';

const players = ['host-account','guest-account'];
const roomOptions = {visibility:'private',settings:{winCondition:'first_to_n',targetScore:1,timeLimit:60,penalties:false}};
const migrations = new URL('../drizzle/',import.meta.url);
const ddl = name => readFileSync(new URL(name,migrations),'utf8');
async function fixture(t, mode) {
  const sql = new DatabaseSync(':memory:');
  t.after(() => sql.close());
  for (const name of readdirSync(migrations).filter(s=>s.endsWith('.sql')).sort()) {
    if (name.startsWith('0010')) await sourceFixture(sql,{completePresentation:true});
    sql.exec(ddl(name));
  }
  const db = sqliteD1(sql);
  db.withSession = origin => {assert.equal(origin,'first-primary'); return db;};
  const documents = new Map(), read = path => structuredClone(documents.get(path) ?? null);
  let tail = Promise.resolve(), loseAck = false;
  const store = {get:async path=>read(path),find:async()=>[],transaction(run) {
    const op = tail.then(async()=>{
      const writes = new Map();
      const value = await run({get:async path=>{assert.equal(writes.size,0);return read(path);},
        set:(path,value)=>writes.set(path,structuredClone(value)), delete:path=>writes.set(path,null)});
      for (const [path,data] of writes) data === null ? documents.delete(path) : documents.set(path,data);
      if (loseAck && [...writes.keys()].some(path=>path.startsWith('gameSecrets/'))) {
        loseAck=false; throw Error('Lost acknowledgement');
      }
      return value;
    });
    tail=op.catch(()=>{});return op;
  }};
  let expected={firestore:null,catalog:null},draws=0;
  const policyHash=(await roundCreationPolicy('medium')).selectionPolicyHash;
  const transition=async action=>{expected=await applyRoundControl(store,db,{action,expected,incarnation:'a'.repeat(64),policyHash},()=>true);};
  const retire=()=>sql.exec("BEGIN; UPDATE round_authorization_control SET writing=1,writer_id=zeroblob(32); UPDATE cbank_publication SET state='retired',retirement_reason='fixture only' WHERE problem_ref=1; UPDATE round_authorization_control SET writing=0,writer_id=NULL,epoch=epoch+1; COMMIT;");
  const api = createGameApi({store,compactCompetitiveBank:true,quota:async()=>true,verify:async uid=>({sub:uid}),
    select:async()=>assert.fail('competitive selection fallback'), selectCompetitive:input=>{draws++;return selectCompetitiveQuestions(db,input);}});
  const post=async(uid,resource,body)=>{
    const res=await api(resource,new Request('https://local.example/api/'+resource,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+uid},body:JSON.stringify(body)}));
    return {status:res.status,body:await res.json()};
  };
  const ok=res=>{assert.equal(res.status,200,JSON.stringify(res));return res.body;};
  for (const uid of players) ok(await post(uid,'profile',{}));
  const options=mode==='pvp'?{visibility:'private'}:roomOptions;
  const request={operationId:'test-operation-1234',mode,category:'differentiation',count:1,difficulty:'medium',roomOptions:options};
  let id;
  const select=async()=>{const res=await post(players[0],'questions',request);if(res.status===200)id=res.body.questionSetId;return res;};
  const create=()=>post(players[0],'games',{action:'create',questionSetId:id,mode,options});
  const join=()=>post(players[1],'games',{action:'join',gameId:id,mode,seatOperationId:'guest-visit-1234'});
  const start=()=>post(players[0],'games',{action:'start',gameId:id});
  return {db,store,sql,transition,retire,select,create,join,start,ok,read,documents,id:()=>id,draws:()=>draws,lose:()=>{loseAck=true;},
    control:()=>expected,updateEpoch:()=>{expected.catalog.epoch++;}};
}

for (const mode of ['pvp','multiplayer']) {
  test(mode+' issuance is fenced through retirement, including after disabling and reopening',async t=>{
    const f=await fixture(t,mode);
    assert.equal((await f.select()).status,409);
    await f.transition('install-disabled'); await f.transition('enable');
    f.ok(await f.select()); f.ok(await f.create());
    if(mode==='multiplayer') f.ok(await f.join());
    const issue=mode==='pvp'?f.join:f.start;
    const before=f.read('gameSecrets/'+f.id()), held=players.map(p=>f.read('bankRecent/'+p));
    assert.equal(before.competitiveRoom.version,3);
    assert.throws(()=>f.sql.exec('UPDATE round_authorization_control SET writing=1,writer_id=zeroblob(32)'),/Close creation/);
    await f.transition('disable'); assert.equal((await issue()).status,409);
    f.retire(); f.updateEpoch(); await f.transition('enable');
    assert.equal((await issue()).status,409);
    assert.deepEqual(f.read('gameSecrets/'+f.id()),before);
    assert.deepEqual(players.map(p=>f.read('bankRecent/'+p)),held);
    assert.equal(f.read('games/'+f.id()).questions.length,0);
  });
  test(mode+' an issued game recovers after a lost commit acknowledgement and later closure',async t=>{
    const f=await fixture(t,mode);
    await f.transition('install-disabled');await f.transition('enable');
    f.ok(await f.select());f.ok(await f.create());
    if(mode==='multiplayer') f.ok(await f.join());
    const issue=mode==='pvp'?f.join:f.start; f.lose();
    assert.equal((await issue()).status,503);
    const issued=f.read('gameSecrets/'+f.id()),history=players.map(p=>f.read('bankRecent/'+p));
    assert.equal(issued.status,'active');
    await f.transition('disable'); f.ok(await issue());
    assert.deepEqual(f.read('gameSecrets/'+f.id()),issued);
    assert.deepEqual(players.map(p=>f.read('bankRecent/'+p)),history);
    f.ok(await f.select());assert.equal(f.draws(),1);
  });
}
test('a retired private set, a substituted window and a missing enable receipt fail closed',async t=>{
  const f=await fixture(t,'pvp');await f.transition('install-disabled');await f.transition('enable');f.ok(await f.select());
  const path='questionSets/'+f.id(),record=f.read(path);
  const receipt=f.read('roundCreationChanges/v2');f.documents.delete('roundCreationChanges/v2');
  assert.equal((await f.create()).status,409);f.documents.set('roundCreationChanges/v2',receipt);
  f.documents.set(path,{...record,competitiveCreation:{...record.competitiveCreation,version:2}});
  assert.equal((await f.create()).status,409);f.documents.set(path,record);
  await f.transition('disable');assert.equal((await f.create()).status,409);
  await f.transition('enable');const next=f.control().catalog;
  record.competitiveCreation.catalogWindow={version:next.version,epoch:next.epoch,incarnation:next.incarnation,policyHash:next.policyHash};
  f.documents.set(path,record);assert.equal((await f.create()).status,409);assert.equal(f.read('gameSecrets/'+f.id()),null);
});

// Interpose after a real local D1 read, without changing its result. Operations
// performed in the callback use the normal game and control entry points.
function afterReadOnce(db, matches, callback) {
  const prepare = db.prepare.bind(db);
  db.prepare = sql => {
    const statement = prepare(sql);
    if (matches(sql)) {
      db.prepare = prepare;
      const all = statement.all.bind(statement);
      statement.all = async () => {
        const result = await all();
        await callback();
        return result;
      };
    }
    return statement;
  };
}

test('selection spanning a complete close and reopen cannot save its old window', async t => {
  const f = await fixture(t,'pvp');
  await f.transition('install-disabled'); await f.transition('enable');
  let interleaved = false;
  afterReadOnce(f.db, sql => sql.includes('FROM round_competitive_catalog_window'), async () => {
    await f.transition('disable'); await f.transition('enable');
    interleaved = true;
  });
  assert.equal((await f.select()).status,409);
  assert(interleaved);
  assert.equal(f.read('bankRecent/'+players[0]),null);
  assert(![...f.documents.keys()].some(k=>k.startsWith('questionSets/')));
  f.ok(await f.select());
});

test('selection cannot commit while D1 has opened and Firestore has not', async t => {
  const f = await fixture(t,'pvp'); await f.transition('install-disabled');
  const tx = f.store.transaction.bind(f.store);
  let probe;
  f.store.transaction = async run => {
    f.store.transaction = tx;
    assert.equal(f.sql.prepare('SELECT enabled FROM round_authorization_control').get().enabled,1);
    assert.equal(f.read('roundCreation/control').enabled,false);
    probe = await f.select();
    return tx(run);
  };
  await f.transition('enable');
  assert.equal(probe.status,409);
  assert.equal(f.read('bankRecent/'+players[0]),null);
  f.ok(await f.select());
});

test('a guest cannot issue while Firestore has closed and D1 is still open', async t => {
  const f = await fixture(t,'pvp');
  await f.transition('install-disabled'); await f.transition('enable');
  f.ok(await f.select()); f.ok(await f.create());
  let probe;
  afterReadOnce(f.db,sql=>sql.includes('FROM round_authorization_control WHERE id=1'),async()=>{
    assert.equal(f.sql.prepare('SELECT enabled FROM round_authorization_control').get().enabled,1);
    assert.equal(f.read('roundCreation/control').enabled,false);
    probe = await f.join();
  });
  await f.transition('disable');
  assert.equal(probe.status,409);
  assert.equal(f.read('gameSecrets/'+f.id()).status,'waiting');
  assert.equal(f.read('bankRecent/'+players[1]),null);
});
