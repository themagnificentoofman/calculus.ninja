import test from 'node:test';
import assert from 'node:assert/strict';
import {openCompact} from '../scripts/bank/compact.mjs';
import {storeAdmittedFreeResponse} from '../scripts/bank/free-response-storage.mjs';
import {initializeFreeResponseIndex,indexAdmittedFreeResponse} from '../scripts/bank/free-response-index.mjs';
import {freeResponseEligibilityPolicy,eligibleFreeResponseCatalog,MAX_FR_REGISTRATIONS} from '../lib/server/free-response-eligibility.mjs';
import {freeResponseFixture} from './fixtures/free-response.mjs';
import {sourceFixture} from './fixtures/source-bank.mjs';

const database=()=>{const db=openCompact(':memory:');initializeFreeResponseIndex(db);return db;};
const adapter=db=>({prepare:sql=>({bind:(...values)=>({all:async()=>({results:db.prepare(sql).all(...values)})})})});
const catalog=(db,admissions,input={category:'all',difficulty:'easy'})=>eligibleFreeResponseCatalog(adapter(db),input,freeResponseEligibilityPolicy(admissions));
const put=async(db,fixture)=>{
 const stored=await storeAdmittedFreeResponse(db,fixture.record,fixture);
 const indexed=await indexAdmittedFreeResponse(db,stored.recordRef,fixture);return {...stored,indexed};
};
const merged=(...fixtures)=>({version:'free-response-admission-1',checkerSourceHash:fixtures[0].admissions.checkerSourceHash,records:Object.assign({},...fixtures.map(f=>f.admissions.records))});

test('only exact registered records with matching receipts and reviewed metadata enter the eligible catalog',async()=>{
 const db=database();try{
  const f=await freeResponseFixture(),stored=await storeAdmittedFreeResponse(db,f.record,f);
  assert.deepEqual(await catalog(db,f.admissions),[]);
  const first=await indexAdmittedFreeResponse(db,stored.recordRef,f),again=await indexAdmittedFreeResponse(db,stored.recordRef,f);
  assert(first.inserted&&!again.inserted);
  const rows=await catalog(db,f.admissions);assert.equal(rows.length,1);assert.equal(rows[0].lineage_id,f.record.task.lineageId);
  assert.equal(rows[0].technique,f.record.task.pedagogy.primaryTechnique);assert(!JSON.stringify(rows).includes('2x'));
  assert.deepEqual(await catalog(db,f.admissions,{category:'integration',difficulty:'easy'}),[]);
  assert.deepEqual(await catalog(db,f.admissions,{category:'all',difficulty:'hard'}),[]);
  assert.deepEqual(await catalog(db,f.admissions,{category:'all',difficulty:'easy',tag:'chain-rule'}),[]);
  assert.equal((await catalog(db,f.admissions,{category:'differentiation',difficulty:'easy',tag:'power-rule'})).length,1);
  for(const change of [
   r=>{r.records={};},r=>{Object.values(r.records)[0].recordHash='0'.repeat(64);},
   r=>{Object.values(r.records)[0].reviewHash='0'.repeat(64);},
   r=>{r.checkerSourceHash='0'.repeat(64);Object.values(r.records)[0].checkerSourceHash=r.checkerSourceHash;},
  ]){const policy=structuredClone(f.admissions);change(policy);assert.deepEqual(await catalog(db,policy),[]);}
 }finally{db.close();}
});

test('FR policy rejects malformed, ambiguous and oversized registrations before querying',async()=>{
 const f=await freeResponseFixture();
 for(const change of [
  r=>{r.checkerSourceHash=['a'.repeat(64)];},r=>{Object.values(r.records)[0].recordHash=['a'.repeat(64)];},
  r=>{r.records={'bad-key':Object.values(r.records)[0]};},
  r=>{r.records['cn_99999999999999999999@1#fixture-contract']=Object.values(r.records)[0];},
  r=>{r.records=Object.fromEntries(Array.from({length:MAX_FR_REGISTRATIONS+1},(_,i)=>[String(i),{}]));},
 ]){const policy=structuredClone(f.admissions);change(policy);assert.throws(()=>freeResponseEligibilityPolicy(policy));}
 let queries=0;const emptyDb={prepare:()=>{queries++;throw Error('Must not query an empty policy');}};
 assert.deepEqual(await eligibleFreeResponseCatalog(emptyDb,{category:'all',difficulty:'easy'}),[]);assert.equal(queries,0);
 await assert.rejects(eligibleFreeResponseCatalog(emptyDb,{category:'invented',difficulty:'easy'}));
 await assert.rejects(eligibleFreeResponseCatalog(emptyDb,{category:'all',difficulty:'easy',tag:'* OR true'}));
});

test('task revision precedence precedes filters, with one lineage counted within each actual pool',async()=>{
 const db=database();try{
  const first=await freeResponseFixture();
  const revised=await freeResponseFixture({alterTask:t=>{t.problemRevision=2;t.difficulty='medium';t.statement+=' State its domain.';}});
  await put(db,first);await put(db,revised);const admissions=merged(first,revised);
  assert.deepEqual(await catalog(db,admissions),[]);
  const rows=await catalog(db,admissions,{category:'all',difficulty:'medium'});assert.equal(rows.length,1);assert.equal(rows[0].revision,2);
  // Unsupported/unregistered records cannot suppress an eligible earlier task.
  assert.equal((await catalog(db,first.admissions)).length,1);
  const alias=await freeResponseFixture({alterTask:t=>{t.problemId='cn_99999999999999999999';}});
  await put(db,alias);assert.equal((await catalog(db,merged(first,alias))).length,1);
  const corrected=await freeResponseFixture({alterTask:t=>{t.problemRevision=3;t.lineageId='corrected-lineage';t.difficulty='hard';}});
  await put(db,corrected);assert.deepEqual(await catalog(db,merged(first,revised,corrected)),[]);
  assert.deepEqual(await catalog(db,merged(first,revised,corrected),{category:'all',difficulty:'medium'}),[]);
  assert.equal((await catalog(db,merged(first,revised,corrected),{category:'all',difficulty:'hard'})).length,1);
  const mediumSibling=await freeResponseFixture({alterTask:t=>{t.problemId='cn_88888888888888888888';t.difficulty='medium';}});
  await put(db,mediumSibling);
  assert.equal((await catalog(db,merged(first,mediumSibling))).length,1);
  assert.equal((await catalog(db,merged(first,mediumSibling),{category:'all',difficulty:'medium'})).length,1);
 }finally{db.close();}
});

test('current source-bank eligibility is checked before an FR conversion is counted',async()=>{
 for(const mutation of [
  "UPDATE cbank_publication SET state='retired' WHERE problem_ref=1",
  "INSERT INTO cbank_release_exclusions VALUES('source-mc',1,'release','excluded source')",
  "INSERT INTO cbank_release_exclusions VALUES('policy-update',1,'global','withdrawn source')",
  "INSERT INTO cbank_withdrawn_families VALUES('source-mc','mc-fixture','policy-update','withdrawn family')",
  "UPDATE cbank_config SET value='policy-update' WHERE key='active_release'",
  "UPDATE cbank_problem_lineage SET lineage_id='unbound-lineage'",
  "UPDATE cbank_family_lineage SET construction_id='unbound-construction'",
  "UPDATE cbank_problems SET content_hash=zeroblob(32)",
 ]){
  const db=database();try{
   const origin=await sourceFixture(db),f=await freeResponseFixture({alterTask:t=>{t.origin=origin;}});await put(db,f);
   assert.equal((await catalog(db,f.admissions)).length,1);
   // These corruption probes deliberately remove fixture-only guards; ordinary
   // writers cannot mutate the published MC identity or reviewed lineage.
   const protectedTable=/^UPDATE (cbank_problem_lineage|cbank_family_lineage|cbank_problems) /.exec(mutation)?.[1];
   if(protectedTable)for(const trigger of db.prepare("SELECT name FROM sqlite_schema WHERE type='trigger' AND tbl_name=?").all(protectedTable)){
    assert(/^[a-z0-9_]+$/.test(trigger.name));db.exec(`DROP TRIGGER ${trigger.name}`);
   }
   db.exec(mutation);assert.deepEqual(await catalog(db,f.admissions),[]);
  }finally{db.close();}
 }
});

test('composed MC membership remains eligible while release-local exclusions do not leak globally',async()=>{
 const db=database();try{
  const origin=await sourceFixture(db),f=await freeResponseFixture({alterTask:t=>{t.origin=origin;}});await put(db,f);
  db.exec("INSERT INTO cbank_release_sources VALUES('policy-update','source-mc'); UPDATE cbank_config SET value='policy-update' WHERE key='active_release'; INSERT INTO cbank_release_exclusions VALUES('source-mc',1,'release','old release only')");
  assert.equal((await catalog(db,f.admissions)).length,1);
  db.exec("INSERT INTO cbank_release_exclusions VALUES('policy-update',1,'release','current release')");
  assert.deepEqual(await catalog(db,f.admissions),[]);
 }finally{db.close();}
});

test('append-only FR withdrawals and immutable index guards retain historical data',async()=>{
 const db=database();try{
  const f=await freeResponseFixture(),stored=await put(db,f);db.exec('PRAGMA recursive_triggers=OFF');
  for(const sql of ['UPDATE frbank_selection_metadata SET idea=\'forged\'','DELETE FROM frbank_selection_metadata','INSERT OR REPLACE INTO frbank_selection_metadata SELECT * FROM frbank_selection_metadata'])assert.throws(()=>db.exec(sql),/Retain/);
  db.prepare('INSERT INTO frbank_withdrawals VALUES(?,?,?)').run(stored.recordRef,'Reviewed withdrawal fixture',1);
  assert.deepEqual(await catalog(db,f.admissions),[]);
  for(const sql of ['UPDATE frbank_withdrawals SET reason=\'forged\'','DELETE FROM frbank_withdrawals','INSERT OR REPLACE INTO frbank_withdrawals SELECT * FROM frbank_withdrawals'])assert.throws(()=>db.exec(sql),/Retain/);
  assert.equal(db.prepare('SELECT count(*) AS n FROM frbank_records').get().n,1);
  assert.equal(db.prepare('SELECT count(*) AS n FROM frbank_admission_receipts').get().n,1);
  assert.equal(db.prepare('SELECT count(*) AS n FROM frbank_selection_metadata').get().n,1);
 }finally{db.close();}
});

test('index preparation rejects a forged derived value or an unreviewed existing schema',async()=>{
 const db=database();try{
  const f=await freeResponseFixture(),stored=await put(db,f);
  // Preserve the legitimate schema except for a deliberate corruption fixture.
  db.exec('DROP TRIGGER frbank_metadata_immutable');db.exec("UPDATE frbank_selection_metadata SET idea='forged'");
  await assert.rejects(catalog(db,f.admissions),/Unbound/);
  await assert.rejects(indexAdmittedFreeResponse(db,stored.recordRef,f),/metadata changed/);
  assert.throws(()=>initializeFreeResponseIndex(db),/explicit reviewed upgrade/);
 }finally{db.close();}
});
test('a fabricated first index insert cannot invent technique eligibility or return oversized metadata',async()=>{
 const source=database();try{
  const f=await freeResponseFixture();await put(source,f);
  const metadata=source.prepare('SELECT * FROM frbank_selection_metadata').get();
  for(const changed of [{idea:'invented'},{technique:'invented-method'},{idea:'x'.repeat(8000)}]){
   const db=database();try{
    await storeAdmittedFreeResponse(db,f.record,f);
    const row={...metadata,...changed},columns=Object.keys(row);
    db.prepare(`INSERT INTO frbank_selection_metadata(${columns.join(',')}) VALUES(${columns.map(()=>'?').join(',')})`).run(...columns.map(k=>row[k]));
    await assert.rejects(catalog(db,f.admissions,{category:'all',difficulty:'easy',tag:'invented-method'}),/Unbound or oversized/);
   }finally{db.close();}
  }
 }finally{source.close();}
});
test('superseded contract ambiguity cannot depend on insertion order',async()=>{
 const first=await freeResponseFixture(),oldAlternative=await freeResponseFixture({alterContract:c=>{c.contractId='alternate-old-contract';}}),latest=await freeResponseFixture({alterTask:t=>{t.problemRevision=2;}});
 for(const order of [[first,oldAlternative,latest],[latest,first,oldAlternative]]){
  const db=database();try{
   for(const f of order)await put(db,f);
   const rows=await catalog(db,merged(first,oldAlternative,latest));assert.equal(rows.length,1);assert.equal(rows[0].revision,2);
   await assert.rejects(catalog(db,merged(first,oldAlternative)),/Ambiguous current/);
  }finally{db.close();}
 }
});
