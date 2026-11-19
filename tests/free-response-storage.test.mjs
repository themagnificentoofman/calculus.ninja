import test from 'node:test';
import assert from 'node:assert/strict';
import {gzipSync} from 'node:zlib';
import {openCompact} from '../scripts/bank/compact.mjs';
import {initializeFreeResponseStorage,storeAdmittedFreeResponse,exportFreeResponseRecords} from '../scripts/bank/free-response-storage.mjs';
import {decodeFreeResponseRecord} from '../lib/bank/free-response-codec.mjs';
import {frDigest} from '../lib/bank/free-response-record.mjs';
import {canonical} from '../lib/bank/compact-codec.mjs';
import {freeResponseFixture} from './fixtures/free-response.mjs';
import {sourceFixture} from './fixtures/source-bank.mjs';

const database=()=>{const db=openCompact(':memory:');initializeFreeResponseStorage(db);return db;};
const rows=db=>db.prepare('SELECT * FROM frbank_records ORDER BY record_ref').all();
async function exportRows(db){const result=[];for await(const row of exportFreeResponseRecords(db))result.push(row);return result;}


test('FR storage reconstructs exact canonical bytes, appends receipts and is idempotent',async()=>{
 const db=database();try{
  const f=await freeResponseFixture(),first=await storeAdmittedFreeResponse(db,f.record,f),second=await storeAdmittedFreeResponse(db,f.record,f);
  assert(first.inserted&&first.receiptInserted);assert(!second.inserted&&!second.receiptInserted);assert.equal(first.recordRef,second.recordRef);
  assert.equal(canonical(await decodeFreeResponseRecord(rows(db)[0],{admissions:f.admissions})),canonical(f.record));
  const exported=await exportRows(db);assert.equal(exported.length,1);assert.deepEqual(exported[0].record,f.record);assert.equal(exported[0].recordHash,first.recordHash);assert.equal(exported[0].receipts[0].reviewHash,first.reviewHash);
  assert.equal(db.prepare('SELECT count(*) AS n FROM cbank_config').get().n,0);
  assert.equal(db.prepare('PRAGMA foreign_key_check').all().length,0);
 }finally{db.close();}
});
test('FR storage cannot admit a research file, rewrite an identity, or delete history',async()=>{
 const db=database();try{
  const f=await freeResponseFixture();await assert.rejects(storeAdmittedFreeResponse(db,f.record,{readEvidence:f.readEvidence}),/checker changed/);assert.equal(rows(db).length,0);
  await storeAdmittedFreeResponse(db,f.record,f);
  const conflict=await freeResponseFixture({alterTask:t=>{t.statement+=' State the domain.';}});
  await assert.rejects(storeAdmittedFreeResponse(db,conflict.record,conflict),/identity conflict/);
  const renamed=await freeResponseFixture({alterTask:t=>{t.statement+=' State the domain.';},alterContract:c=>{c.contractId='fixture-revised-contract';}});
  await assert.rejects(storeAdmittedFreeResponse(db,renamed.record,renamed),/new FR task revision/);
  for(const sql of ['UPDATE frbank_records SET revision=2','DELETE FROM frbank_records','UPDATE frbank_admission_receipts SET review_hash=zeroblob(32)','DELETE FROM frbank_admission_receipts'])assert.throws(()=>db.exec(sql),/Retain|reviewed admission/);
  assert.equal(rows(db).length,1);assert.equal(db.prepare('SELECT count(*) AS n FROM frbank_admission_receipts').get().n,1);
  const revision=await freeResponseFixture({alterTask:t=>{t.problemRevision=2;t.statement+=' State the domain.';}});await storeAdmittedFreeResponse(db,revision.record,revision);assert.equal(rows(db).length,2);
 }finally{db.close();}
});
test('compressed FR reconstruction rejects bombs, invalid bytes, and tampered indexed identities',async()=>{
 const db=database();try{
  const f=await freeResponseFixture();await storeAdmittedFreeResponse(db,f.record,f);const row=rows(db)[0];
  for(const changed of [{payload_gzip:gzipSync('x'.repeat(65537))},{payload_gzip:gzipSync(Buffer.from([0xc3,0x28]))},{payload_gzip:Buffer.alloc(65537)},{revision:2},{topic:'integration'},{family_id:'renamed'},{record_hash:Buffer.alloc(32)},{contract_hash:Buffer.alloc(32)},{content_hash:Buffer.alloc(32)},{mc_problem_ref:1}])await assert.rejects(decodeFreeResponseRecord({...row,...changed}));
  const noncanonical=gzipSync(JSON.stringify(f.record));await assert.rejects(decodeFreeResponseRecord({...row,payload_gzip:noncanonical}),/canonical/);
 }finally{db.close();}
});
test('an existing record hash does not excuse corrupt bytes or mismatched index columns',async()=>{
 const source=database();try{
  const f=await freeResponseFixture();await storeAdmittedFreeResponse(source,f.record,f);const stored=rows(source)[0];
  for(const mutation of [{payload_gzip:gzipSync('{}')},{topic:'integration'},{lineage_id:'forged-lineage'},{content_hash:Buffer.alloc(32)}]){
   const target=database();try{
    const row={...stored,...mutation},columns=Object.keys(row);
    target.prepare(`INSERT INTO frbank_records(${columns.join(',')}) VALUES(${columns.map(()=>'?').join(',')})`).run(...columns.map(c=>row[c]));
    await assert.rejects(storeAdmittedFreeResponse(target,f.record,f),/Stored FR/);
    assert.equal(target.prepare('SELECT count(*) AS n FROM frbank_admission_receipts').get().n,0);
   }finally{target.close();}
  }
 }finally{source.close();}
});
test('source payload reconstruction is verified, not just its indexed content hash',async()=>{
 const db=database();try{
  const origin=await sourceFixture(db,{corruptPayload:true}),f=await freeResponseFixture({alterTask:t=>{t.origin=origin;}});
  await assert.rejects(storeAdmittedFreeResponse(db,f.record,f),/Immutable bank hash mismatch/);assert.equal(rows(db).length,0);
 }finally{db.close();}
});
test('MC conversion storage binds the literal source identity and current eligibility',async()=>{
 for(const mutation of [
  "UPDATE cbank_publication SET state='retired' WHERE problem_ref=1",
  "INSERT INTO cbank_release_exclusions VALUES('source-mc',1,'release','scope test')",
  "INSERT INTO cbank_release_exclusions VALUES('policy-update',1,'global','withdrawn source')",
  "INSERT INTO cbank_withdrawn_families VALUES('source-mc','mc-fixture','policy-update','withdrawn family')",
  "UPDATE cbank_config SET value='policy-update' WHERE key='active_release'",
 ]){
  const db=database();try{
   const origin=await sourceFixture(db),f=await freeResponseFixture({alterTask:t=>{t.origin=origin;}});
   await storeAdmittedFreeResponse(db,f.record,f);assert.equal(rows(db)[0].mc_problem_ref,1);
   db.exec(mutation);await assert.rejects(storeAdmittedFreeResponse(db,f.record,f),/Source MC revision/);
   assert.deepEqual((await exportRows(db))[0].record,f.record,'withdrawal must not rewrite the saved task or contract');
  }finally{db.close();}
 }
});
test('composed active MC membership is accepted while forged origin metadata is rejected',async()=>{
 const db=database();try{
  const origin=await sourceFixture(db);
  db.exec("INSERT INTO cbank_release_sources VALUES('policy-update','source-mc'); UPDATE cbank_config SET value='policy-update' WHERE key='active_release'");
  const f=await freeResponseFixture({alterTask:t=>{t.origin=origin;}});await storeAdmittedFreeResponse(db,f.record,f);
  for(const changes of [{familyId:'wrong-family'},{mcDifficulty:'hard'},{contentHash:'0'.repeat(64)},{bankRelease:'wrong-release'}]){
   const invalid=await freeResponseFixture({alterTask:t=>{t.origin={...origin,...changes};}});await assert.rejects(storeAdmittedFreeResponse(db,invalid.record,invalid),/Source MC revision/);
  }
  const lost=await freeResponseFixture({alterTask:t=>{t.origin={...origin,lineageId:'wrong-lineage'};t.lineageId='wrong-lineage';}});await assert.rejects(storeAdmittedFreeResponse(db,lost.record,lost),/mathematical lineage/);
 }finally{db.close();}
});

test('evidence callbacks and asynchronous caller edits cannot substitute a different stored record',async()=>{
 for(const mode of ['callback','caller']){
  const db=database();try{
   const f=await freeResponseFixture(),original=structuredClone(f.record);
   const replacement=await freeResponseFixture({alterContract:c=>{c.instructions='Enter a function in the stated variable.';}});
   const readEvidence=hash=>{if(mode==='callback'){f.record.task=replacement.record.task;f.record.contract=replacement.record.contract;f.admissions.records={};}return f.readEvidence(hash);};
   const pending=storeAdmittedFreeResponse(db,f.record,{...f,readEvidence});
   if(mode==='caller'){f.record.task=replacement.record.task;f.record.contract=replacement.record.contract;}
   const receipt=await pending;
   assert.deepEqual(await decodeFreeResponseRecord(rows(db)[0]),original);
   assert.equal(receipt.recordHash,await frDigest(original));
   assert.notEqual(receipt.recordHash,await frDigest(replacement.record));
  }finally{db.close();}
 }
});
test('INSERT OR REPLACE cannot bypass immutable records or receipts with recursive triggers disabled',async()=>{
 const db=database();try{
  const f=await freeResponseFixture();await storeAdmittedFreeResponse(db,f.record,f);
  db.exec('PRAGMA recursive_triggers=OFF');
  assert.equal(db.prepare('PRAGMA recursive_triggers').get().recursive_triggers,0);
  const stored=rows(db)[0],columns=Object.keys(stored);
  for(const changed of [{contract_id:'replacement-contract'},{record_ref:23},{problem_id:'cn_99999999999999999999'}]){
   const row={...stored,...changed};
   assert.throws(()=>db.prepare(`INSERT OR REPLACE INTO frbank_records(${columns.join(',')}) VALUES(${columns.map(()=>'?').join(',')})`).run(...columns.map(c=>row[c])),/no replacement/);
  }
  assert.throws(()=>db.exec('INSERT OR REPLACE INTO frbank_admission_receipts SELECT * FROM frbank_admission_receipts'),/no replacement/);
  assert.deepEqual(rows(db)[0],stored);
  assert.equal(db.prepare('SELECT count(*) AS n FROM frbank_admission_receipts').get().n,1);
 }finally{db.close();}
});
test('existing local schemas must retain every reviewed guard before preparation can continue',()=>{
 const db=database();try{
  initializeFreeResponseStorage(db);
  db.exec('DROP TRIGGER frbank_record_no_replace');
  assert.throws(()=>initializeFreeResponseStorage(db),/explicit upgrade/);
  assert.equal(db.prepare("SELECT 1 FROM sqlite_schema WHERE name='frbank_record_no_replace'").get(),undefined,'initializer must not silently rewrite an existing schema');
 }finally{db.close();}
});
test('initializer cannot succeed when a transaction prevents enabling foreign keys',()=>{
 const db=database();try{
  db.exec('PRAGMA foreign_keys=OFF');db.exec('BEGIN');
  assert.throws(()=>initializeFreeResponseStorage(db),/enabled foreign keys/);
  assert.equal(db.prepare('PRAGMA foreign_keys').get().foreign_keys,0);
  db.exec('ROLLBACK');initializeFreeResponseStorage(db);
  assert.equal(db.prepare('PRAGMA foreign_keys').get().foreign_keys,1);
  assert.throws(()=>db.prepare('INSERT INTO frbank_admission_receipts(record_ref,review_hash,checker_source_hash) VALUES(?,?,?)').run(999,Buffer.alloc(32),Buffer.alloc(32)),/FOREIGN KEY/);
 }finally{db.close();}
});
