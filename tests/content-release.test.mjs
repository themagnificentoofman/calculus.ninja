import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync,sign,createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { openCompact } from '../scripts/bank/compact.mjs';
import { contentRelease,message,steps } from '../lib/server/content-release.mjs';
import { canonical } from '../scripts/bank/admin.mjs';
const sha=s=>createHash('sha256').update(s).digest('hex');
function fixture({writer=false}={}){
 const sql=openCompact(':memory:');sql.exec(readFileSync(new URL('../drizzle/0003_operator_ledger.sql',import.meta.url),'utf8'));
 sql.exec("INSERT INTO cbank_releases VALUES ('parent','{}',1,'published'); INSERT INTO cbank_config VALUES ('active_release','parent');");
 const columns=sql.prepare('PRAGMA table_info(cbank_operator_ledger)').all();const row=Object.fromEntries(columns.filter(c=>c.notnull||c.pk).map(c=>[c.name,c.type==='TEXT'?'prior':0]));row.activated=1;row.measured_reads=3734034;row.measured_writes=1030735;row.overhead_reads=121168;row.overhead_writes=28792;
 sql.prepare(`INSERT INTO cbank_operator_ledger (${Object.keys(row).join(',')}) VALUES (${Object.keys(row).map(()=>'?').join(',')})`).run(...Object.values(row));
 let calls=0,loseCatalogAck=false,omitCatalogMetrics=false,loseUsageAck=false,omitUsageMetrics=false,sessions=0,afterCatalogCommit=null,afterUsageCommit=null;const prep=(text,values=[])=>({text,values,bind:(...v)=>prep(text,v),all:async()=>{calls++;const results=sql.prepare(text).all(...values);return {success:true,results,meta:{rows_read:results.length+1,rows_written:/^(UPDATE|INSERT|DELETE)/.test(text)?1:0,size_after:100000,duration:0}};}});
 const db={withSession(name){assert.equal(name,'first-primary');sessions++;return db;},prepare:prep,batch:async stmts=>{sql.exec('BEGIN IMMEDIATE');try{const rs=[];for(const s of stmts)rs.push(await s.all());sql.exec('COMMIT');if(writer&&rs.some(r=>r.results.some(row=>row.mutation_hash))){if(afterCatalogCommit){const hook=afterCatalogCommit;afterCatalogCommit=null;await hook();}if(loseCatalogAck){loseCatalogAck=false;throw Error('Lost catalog response');}if(omitCatalogMetrics){omitCatalogMetrics=false;delete rs[0].meta;}}if(stmts.some(s=>s.text.startsWith('INSERT INTO cbank_import_receipts')&&s.values[0]?.endsWith('/usage-v1'))){if(afterUsageCommit){const hook=afterUsageCommit;afterUsageCommit=null;await hook();}if(loseUsageAck){loseUsageAck=false;throw Error('Lost usage acknowledgement');}if(omitUsageMetrics){omitUsageMetrics=false;delete rs[0].meta;}}return rs;}catch(e){if(sql.isTransaction)sql.exec('ROLLBACK');throw e;}}};
 const sample=JSON.parse(readFileSync(new URL('./fixtures/bank/review-samples.json',import.meta.url)))[0];
 const p={...sample,familyId:'qa',topic:'integration',difficulty:'easy'};delete p.contentHash;p.contentHash=sha(canonical(p));const {problemId,problemRevision,contentHash,semanticHash,...body}=p;
 const hex=v=>"X'"+Buffer.from(v).toString('hex')+"'";
 const text=JSON.stringify(["INSERT INTO cbank_releases VALUES ('delta','{}',1,'staging')","INSERT INTO cbank_release_sources VALUES ('delta','parent')",`INSERT INTO cbank_shared VALUES (1,${hex(Buffer.from('b'.repeat(64),'hex'))},'{}')`,`INSERT INTO cbank_problems VALUES (1,'${problemId}',${problemRevision},${hex(Buffer.from(contentHash,'hex'))},${hex(Buffer.from(semanticHash,'hex'))},1,${hex(gzipSync(canonical(body)))})`,"INSERT INTO cbank_publication VALUES (1,'approved',NULL)","INSERT INTO cbank_pools VALUES (1,'delta','integration','easy','*','qa',1)","INSERT INTO cbank_slots VALUES (1,0,1)"]);
 const plan={format:'content-delta-v1',projectId:'qa',bundleId:'a'.repeat(64),priorBundleId:'prior',release:'delta',parentRelease:'parent',newCount:1,before:{problemRef:null,sharedId:null,poolId:null,parentManifestSha256:sha('{}'),parentCount:1},batches:[{sha256:sha(text),bytes:Buffer.byteLength(text),statements:7,estimatedReads:100,estimatedWrites:20}],pages:[],tableHashes:[{table:'cbank_release_sources',where:'release_id=?',args:['delta'],order:'source_release_id',count:1,sha256:sha(canonical([{release_id:'delta',source_release_id:'parent'}]))}]};
 const smokeInput={category:'integration',difficulty:'easy',count:1};plan.cells=[{input:smokeInput,sha256:sha(canonical(smokeInput))}];
 if(writer){
  for(const file of ['0008_free_response_storage.sql','0009_free_response_selection_metadata.sql','0010_round_authorizations.sql','0011_competitive_catalog_window.sql'])sql.exec(readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));
  plan.format='content-delta-v3';
  plan.catalogWriter={version:1,incarnation:'d'.repeat(64),policyHash:'e'.repeat(64),initialEpoch:7,controlVersion:2,enabled:0,costs:{imports:[{reads:100,writes:30}],activate:{reads:100,writes:30},rollback:{reads:100,writes:30}}};
  sql.prepare('INSERT INTO round_authorization_control(id,incarnation,epoch,policy_hash,control_version,enabled) VALUES(1,?,7,?,2,0)').run(Buffer.from('d'.repeat(64),'hex'),Buffer.from('e'.repeat(64),'hex'));
 }
 const {publicKey,privateKey}=generateKeyPairSync('ed25519');const config={publicKey:publicKey.export({type:'spki',format:'der'}).toString('base64'),expiresAt:Date.now()+600000,allowance:JSON.stringify({bundleId:plan.bundleId,reads:100000,writes:10000,bytes:120000000})};
 const call=async(input,override={})=>{const body=JSON.stringify(input),hash=sha(body),time=String(Date.now());const request=new Request('https://test/api/content-release',{method:'POST',headers:{'x-bank-time':time,'x-bank-body-sha256':hash,'x-bank-signature':sign(null,Buffer.from(message(plan,time,hash)),privateKey).toString('base64')},body});const response=await contentRelease(request,db,plan,{...config,...override});return {status:response.status,body:await response.json()};};
 return {sql,db,plan,text,config,call,calls:()=>calls,sessions:()=>sessions,loseAck:()=>{loseCatalogAck=true;},omitMetrics:()=>{omitCatalogMetrics=true;},afterCatalog:fn=>{afterCatalogCommit=fn;},afterUsage:fn=>{afterUsageCommit=fn;},loseUsage:()=>{loseUsageAck=true;},omitUsage:()=>{omitUsageMetrics=true;}};
}
test('delta endpoint requires explicit new allowance and authentication before database access',async()=>{const f=fixture();try{assert.equal((await f.call({op:'init'},{allowance:undefined})).status,404);assert.equal(f.calls(),0);const bad=await contentRelease(new Request('https://test/api/content-release',{method:'POST',body:'{}'}),f.db,f.plan,f.config);assert.equal(bad.status,403);assert.equal(f.calls(),0);assert.equal((await f.call({op:'init'},{allowance:JSON.stringify({bundleId:f.plan.bundleId,reads:2000000,writes:10000,bytes:120000000})})).status,409);assert.equal(f.sql.prepare('SELECT count(*) n FROM cbank_delta_ledger').get().n,0);}finally{f.sql.close();}});
test('delta is staged, sequential, checksum locked, retry safe, verified before atomic activation and reversible',async()=>{const f=fixture();try{
 assert.equal((await f.call({op:'init'})).status,200);
 assert.equal((await f.call({op:'activate'})).status,409);
 assert.equal((await f.call({op:'step',step:1})).status,409);
 assert.equal((await f.call({op:'step',step:0,text:f.text+' '})).status,400);
 const first=await f.call({op:'step',step:0,text:f.text});assert.equal(first.status,200,JSON.stringify(first));assert.equal(first.body.nextSequence,1);
 const retry=await f.call({op:'step',step:0,text:f.text});assert.equal(retry.status,200);assert.equal(retry.body.replayed,true);assert.ok(retry.body.chargedReads>first.body.chargedReads);
 assert.equal(f.sql.prepare("SELECT value FROM cbank_config WHERE key='active_release'").get().value,'parent');
 assert.equal((await f.call({op:'activate'})).status,409);
 assert.equal((await f.call({op:'step',step:1})).status,200);
 assert.equal((await f.call({op:'activate'})).status,409);
 const smoke=await f.call({op:'step',step:2});assert.equal(smoke.status,200,JSON.stringify(smoke));assert.equal(smoke.body.selection.distinctFamilies,1);
 const activation=await f.call({op:'activate'});assert.equal(activation.status,200,JSON.stringify(activation));assert.equal(activation.body.activated,1);
 assert.equal(f.sql.prepare("SELECT value FROM cbank_config WHERE key='active_release'").get().value,'delta');
 assert.equal((await f.call({op:'activate'})).body.replayed,true);
 assert.equal((await f.call({op:'rollback'})).status,200);assert.equal(f.sql.prepare("SELECT value FROM cbank_config WHERE key='active_release'").get().value,'parent');
 assert.equal(f.sql.prepare("SELECT state FROM cbank_releases WHERE release_id='delta'").get().state,'published');
 assert.equal(steps(f.plan).length,3);
}finally{f.sql.close();}});

test('a composed delta carries prior charged usage and cannot reuse the old allowance',async()=>{
 const f=fixture();try{
  const cols=f.sql.prepare('PRAGMA table_info(cbank_delta_ledger)').all();
  const row=Object.fromEntries(cols.filter(c=>c.notnull||c.pk).map(c=>[c.name,c.type==='TEXT'?'settled-delta':0]));
  Object.assign(row,{bundle_id:'settled-delta',verified:1,activated:1,charged_reads:563084,charged_writes:51276,prior_reads:3855202,prior_writes:1059527,database_bytes:96092160});
  f.sql.prepare(`INSERT INTO cbank_delta_ledger (${Object.keys(row).join(',')}) VALUES (${Object.keys(row).map(()=>'?').join(',')})`).run(...Object.values(row));
  f.plan.priorOperation={kind:'delta',bundleId:'settled-delta'};
  const tooMuch=await f.call({op:'init'},{allowance:JSON.stringify({bundleId:f.plan.bundleId,reads:600000,writes:10000,bytes:120000000})});
  assert.equal(tooMuch.status,409);assert.match(tooMuch.body.error,/cumulative/);
  const ok=await f.call({op:'init'});assert.equal(ok.status,200,JSON.stringify(ok));
  assert.equal(ok.body.priorChargedReads,4418286);assert.equal(ok.body.priorChargedWrites,1110803);
 }finally{f.sql.close();}
});

test('new-protocol delta wraps data, receipts and checkpoint in one epoch; read-only work and replay preserve it',async()=>{
 const f=fixture({writer:true});try{
  const epoch=()=>f.sql.prepare('SELECT epoch FROM round_authorization_control').get().epoch;
  assert.equal((await f.call({op:'init'})).status,200);assert.equal(epoch(),7);
  const imported=await f.call({op:'step',step:0,text:f.text});assert.equal(imported.status,200,JSON.stringify(imported));assert.equal(epoch(),8);
  assert.equal(f.sql.prepare('SELECT count(*) n FROM round_catalog_mutations').get().n,1);
  const replay=await f.call({op:'step',step:0,text:f.text});assert.equal(replay.body.replayed,true);assert.equal(replay.body.catalogReceipt.before_epoch,7);assert.equal(epoch(),8);
  assert.equal((await f.call({op:'step',step:1})).status,200);assert.equal(epoch(),8);
  assert.equal((await f.call({op:'step',step:2})).status,200);assert.equal(epoch(),8);
  assert.equal((await f.call({op:'activate'})).status,200);assert.equal(epoch(),9);
  assert.equal((await f.call({op:'activate'})).body.replayed,true);assert.equal(epoch(),9);
  assert.equal((await f.call({op:'rollback'})).status,200);assert.equal(epoch(),10);
  assert.equal(f.sql.prepare('SELECT count(*) n FROM round_catalog_mutations').get().n,3);
  assert.equal(f.sql.prepare('SELECT writing,gc_active FROM round_authorization_control').get().writing,0);
  assert.equal(f.sessions(),8);
  // Completion recovers independently of subsequent gate/policy changes.
  f.sql.exec('UPDATE round_authorization_control SET epoch=11,control_version=3,enabled=1');
  assert.equal((await f.call({op:'rollback'})).body.replayed,true);assert.equal(epoch(),11);
 }finally{f.sql.close();}
});
test('new-protocol delta fails closed on stale authority, changed SQL and unpaired cutover receipts',async()=>{
 for(const kind of ['epoch','policy','incarnation','version','enabled','gc','abandoned','unpaired']){
  const f=fixture({writer:true});try{
   assert.equal((await f.call({op:'init'})).status,200);
   if(kind==='epoch')f.sql.exec('UPDATE round_authorization_control SET epoch=8');
   if(kind==='policy')f.sql.exec("UPDATE round_authorization_control SET policy_hash=zeroblob(32),epoch=8,control_version=3");
   if(kind==='incarnation')f.sql.exec("UPDATE round_authorization_control SET incarnation=zeroblob(32),epoch=8,control_version=3");
   if(kind==='version')f.sql.exec('UPDATE round_authorization_control SET control_version=3');
   if(kind==='enabled')f.sql.exec('UPDATE round_authorization_control SET enabled=1,epoch=8,control_version=3');
   if(kind==='gc')f.sql.exec('UPDATE round_authorization_control SET gc_active=1');
   if(kind==='abandoned')f.sql.exec('UPDATE round_authorization_control SET writing=1,writer_id=zeroblob(32)');
   if(kind==='unpaired')f.sql.prepare('INSERT INTO cbank_import_receipts VALUES(?,?)').run(f.plan.bundleId+'/0',f.plan.batches[0].sha256);
   const before=f.sql.prepare('SELECT * FROM round_authorization_control').get();
   assert.equal((await f.call({op:'step',step:0,text:f.text+' '})).status,400);
   const result=await f.call({op:'step',step:0,text:f.text});assert.equal(result.status,409,kind);
   assert.equal(f.sql.prepare("SELECT count(*) n FROM cbank_releases WHERE release_id='delta'").get().n,0);
   assert.equal(f.sql.prepare('SELECT count(*) n FROM round_catalog_mutations').get().n,0);
   assert.deepEqual(f.sql.prepare('SELECT * FROM round_authorization_control').get(),before);
   assert.equal(f.sql.prepare('SELECT next_sequence FROM cbank_delta_ledger').get().next_sequence,0);
  }finally{f.sql.close();}
 }
});
test('lost catalog acknowledgement and missing counters retain completion and halt accounting without replaying data',async()=>{
 for(const kind of ['lost','metrics']){
  const f=fixture({writer:true});try{
   await f.call({op:'init'});kind==='lost'?f.loseAck():f.omitMetrics();
   const first=await f.call({op:'step',step:0,text:f.text});assert.equal(first.status,409,JSON.stringify(first));assert.match(first.body.halted,/reconciliation/);
   assert.equal(first.body.nextSequence,1);assert.equal(f.sql.prepare('SELECT epoch FROM round_authorization_control').get().epoch,8);
   assert.equal(f.sql.prepare('SELECT count(*) n FROM round_catalog_mutations').get().n,1);
   const retry=await f.call({op:'step',step:0,text:f.text});assert.equal(retry.status,409);assert.equal(retry.body.replayed,true);assert.equal(retry.body.accountingPending,true);assert.match(retry.body.halted,/reconciliation/);
   assert(retry.body.chargedReads>=first.body.chargedReads);assert.equal(f.sql.prepare('SELECT epoch FROM round_authorization_control').get().epoch,8);
   assert.equal((await f.call({op:'step',step:1})).status,409);
  }finally{f.sql.close();}
 }
});
test('catalog commit retains its accounting fence until settlement, including long-delayed attempts',async()=>{
 for(const missing of [false,true]){
  const f=fixture({writer:true});try{
   await f.call({op:'init'});let concurrent;
   f.afterCatalog(async()=>{
    // Old timestamp must not permit a new-protocol lease takeover.
    f.sql.exec("UPDATE cbank_delta_ledger SET updated_at='2000-01-01T00:00:00.000Z'");
    concurrent=await f.call({op:'step',step:1});
    assert.equal(concurrent.status,409);assert.equal(concurrent.body.accountingPending,true);
    assert.equal(f.sql.prepare('SELECT next_sequence FROM cbank_delta_ledger').get().next_sequence,1);
    if(missing)f.omitMetrics();
   });
   const first=await f.call({op:'step',step:0,text:f.text});assert.equal(first.status,missing?409:200);
   assert.equal(first.body.accountingPending,missing);
   assert.equal((await f.call({op:'step',step:1})).status,missing?409:200);
  }finally{f.sql.close();}
 }
});
test('settlement never clears an existing halt and recovers its own lost response without double charges',async()=>{
 const halted=fixture({writer:true});try{
  await halted.call({op:'init'});
  halted.afterCatalog(()=>{halted.sql.exec("UPDATE cbank_delta_ledger SET halted='Independent accounting failure'");});
  const result=await halted.call({op:'step',step:0,text:halted.text});assert.equal(result.body.halted,'Independent accounting failure');
  assert.equal((await halted.call({op:'step',step:1})).status,409);
 }finally{halted.sql.close();}
 for(const kind of ['lost','metrics']){
  const f=fixture({writer:true});try{
   await f.call({op:'init'});let afterSettlement;
   f.afterUsage(()=>{afterSettlement=f.sql.prepare('SELECT measured_reads,measured_writes FROM cbank_delta_ledger').get();});
   kind==='lost'?f.loseUsage():f.omitUsage();
   const result=await f.call({op:'step',step:0,text:f.text});assert.equal(result.status,200,JSON.stringify(result));
   assert.equal(result.body.settlementRecovered,true);assert.equal(result.body.halted,null);assert.equal(result.body.accountingPending,false);
   assert.deepEqual(f.sql.prepare('SELECT measured_reads,measured_writes FROM cbank_delta_ledger').get(),afterSettlement);
   assert.equal(f.sql.prepare("SELECT count(*) n FROM cbank_import_receipts WHERE batch_id LIKE '%/usage-v1'").get().n,2);
   assert.equal((await f.call({op:'step',step:1})).status,200);
  }finally{f.sql.close();}
 }
});
test('a late settlement acknowledgement cannot halt a later completed operation',async()=>{
 const f=fixture({writer:true});try{
  await f.call({op:'init'});
  f.afterUsage(async()=>{
   const later=await f.call({op:'step',step:1});assert.equal(later.status,200);assert.equal(later.body.accountingPending,false);
   throw Error('Lost first settlement response after the next operation completed');
  });
  const first=await f.call({op:'step',step:0,text:f.text});assert.equal(first.status,200,JSON.stringify(first));assert.equal(first.body.settlementRecovered,true);
  assert.equal(first.body.halted,null);assert.equal(first.body.nextSequence,2);assert.equal(first.body.accountingPending,false);
  assert.equal(f.sql.prepare("SELECT count(*) n FROM cbank_import_receipts WHERE batch_id LIKE '%/usage-v1'").get().n,3);
 }finally{f.sql.close();}
});


test('a catalog write planned for an open issuance window is rejected before reserving budget', async () => {
  const f = fixture({writer:true});
  try {
    f.plan.catalogWriter.enabled = 1;
    const result = await f.call({op:'init'});
    assert.equal(result.status, 404);
    assert.equal(f.calls(), 0);
    assert.equal(f.sql.prepare('SELECT count(*) AS n FROM cbank_delta_ledger').get().n, 0);
  } finally { f.sql.close(); }
});

test('only the approved M4 first import can use its higher cumulative allowance',async()=>{
 const {m4ReleaseBudget:budget,m4OperationAllowance:allowance}=await import('../lib/server/content-release-budget.mjs');
 const f=fixture({writer:true});
 try{
  f.plan.projectId=budget.projectId;
  f.sql.prepare('UPDATE cbank_operator_ledger SET measured_reads=4970200,overhead_reads=0,measured_writes=1176228,overhead_writes=0').run();
  const permit={bundleId:f.plan.bundleId,...allowance};
  const config={allowance:JSON.stringify(permit)};
  assert.match((await f.call({op:'init'},config)).body.error,/cumulative operating ceiling/);
  Object.assign(f.plan,{format:'content-delta-v4',approvedBudget:budget.id,freeResponse:{version:1,firstImport:true},operationAllowance:allowance});
  assert.equal((await f.call({op:'init'},config)).status,404);
  // The release at the boundary is the settled content-delta predecessor.
  f.plan.priorOperation={kind:'delta',bundleId:budget.priorBundleId};
  f.sql.prepare('INSERT INTO cbank_delta_ledger(bundle_id,measured_reads,measured_writes,charged_reads,charged_writes,prior_reads,prior_writes,database_bytes,next_sequence,verified,activated,updated_at) VALUES(?,0,0,4970200,1176228,0,0,100000,1,1,1,?)').run(budget.priorBundleId,new Date().toISOString());
  for(const k of ['reads','writes','bytes']){
   assert.equal((await f.call({op:'init'},{allowance:JSON.stringify({...permit,[k]:permit[k]+1})})).status,404);
  }
  f.plan.approvedBudget+='unknown';assert.equal((await f.call({op:'init'},config)).status,404);
  f.plan.approvedBudget=budget.id;f.plan.freeResponse.firstImport=false;assert.equal((await f.call({op:'init'},config)).status,404);
  f.plan.freeResponse.firstImport=true;
  const init=await f.call({op:'init'},config);
  assert.equal(init.status,200);
  assert.equal(init.body.priorChargedReads,4970200);assert.equal(init.body.priorChargedWrites,1176228);
 }finally{f.sql.close();}
});
