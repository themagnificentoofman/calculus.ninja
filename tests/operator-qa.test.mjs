import test from 'node:test';
import assert from 'node:assert/strict';
import {isolatedQaStore,operatorQa} from '../lib/server/operator-qa.ts';
import {firestoreStore} from '../lib/server/firestore-admin.ts';
import {verifyNamespacedGameplay} from '../scripts/bank/operator-gameplay.mjs';
import {sqliteD1} from '../scripts/bank/sqlite-d1.mjs';
import {openOperatorTestBank,operatorTestRelease} from './fixtures/operator-bank.mjs';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
test('hosted QA prefixes every read, write, query and deletion without exposing player collections',async()=>{
  const seen=[],base={get:async p=>{seen.push(p);return null;},find:async p=>{seen.push(p);return [];},transaction:async fn=>fn({get:baseGet,set:p=>seen.push(p),delete:p=>seen.push(p)})};
  async function baseGet(p){seen.push(p);return null;}
  const qa=isolatedQaStore(base);await qa.get('users/fixedqa');await qa.find('games',[],3);
  await qa.transaction(async tx=>{await tx.get('gameSecrets/fixture');tx.set('games/fixture/reviews/fixedqa',{});tx.delete('users_public/fixedqa');});
  assert.deepEqual(seen,['users/fixedqa','games','gameSecrets/fixture','games/fixture/reviews/fixedqa','users_public/fixedqa'].map(p=>'cn_m1qa_ed08a3de_'+p));
  await qa.get('roundCreation/control');
  assert.equal(seen.at(-1),'cn_m1qa_ed08a3de_roundCreation/control');
  await qa.transaction(async tx=>{await tx.get('replayContent/fixture');tx.set('competitiveSeatReceipts/fixture',{});tx.delete('replayServer/fixture_000001');});
  assert.deepEqual(seen.slice(-3),['replayContent/fixture','competitiveSeatReceipts/fixture','replayServer/fixture_000001'].map(p=>'cn_m1qa_ed08a3de_'+p));
  assert.throws(()=>qa.get('other/real'),/Unsupported/);
  assert.throws(()=>qa.get('roundCreationChanges/v2'),/Unsupported/);
  await assert.rejects(qa.transaction(async tx=>tx.set('roundCreation/control',{})),/Unsupported/);
});
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
test('four-mode namespaced MC operator uses a reproducible bank and cleans replay, seats and rewards',{skip:!/^127\.0\.0\.1:\d+$/.test(emulatorHost??''),timeout:180000},async()=>{
  const dir=mkdtempSync(join(tmpdir(),'operator-qa-')),bankPath=join(dir,'fixture.sqlite');
  const sql=openOperatorTestBank(bankPath);
  const store=firestoreStore('demo-calculus-rendering','(default)',async()=>'owner','http://'+emulatorHost);
  const source={bankPath,release:operatorTestRelease},local=sqliteD1(sql);
  let saved,interrupted=false;
  const save=value=>{saved=structuredClone(value);};
  const call=async input=>{
    if(input.action==='snapshot' && input.gameId===saved?.modes?.pvp?.id){
      await assert.rejects(operatorQa({...input,actor:2},local,store),/membership required/);
    }
    const result=await operatorQa(input,local,store);
    if(!interrupted && input.resource==='questions' && input.body.mode==='pvp' && result.status===200){
      interrupted=true; throw Error('Interrupted after durable set creation');
    }
    return {qa:result};
  };
  try{
    await assert.rejects(verifyNamespacedGameplay(call,save,{},source),/Interrupted after durable set creation/);
    assert(saved.modes.pvp.operationId);
    const result=await verifyNamespacedGameplay(call,save,saved,source);
    assert.equal(result.passed,true); assert.equal(result.modes,4);
    assert.equal((await verifyNamespacedGameplay(()=>assert.fail('Cleaned run issued new activity'),save,saved,source)).passed,true);
    for(const collection of ['users','questionSets','gameSecrets','games','bankRecent','competitiveSeatReceipts','replayContent','replayManifests','replayServer']){
      assert.deepEqual(await isolatedQaStore(store).find(collection,[],1),[],collection);
    }
    assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM ai_quota').get().n,0);
  }finally{sql.close();rmSync(dir,{recursive:true,force:true});}
});
