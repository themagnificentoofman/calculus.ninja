import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {authorizationIdentity,authorizeRound,recoverRoundAuthorization,verifyAuthorizationReceipt,planAuthorizationCollection,collectRoundAuthorizations,AUTHORIZATION_CLOCK_SQL,AUTHORIZATION_GC_BATCH} from '../lib/server/round-authorizations.mjs';
const schema=readFileSync(new URL('../drizzle/0010_round_authorizations.sql',import.meta.url),'utf8');
const tables='cbank_shared cbank_problems cbank_publication cbank_releases cbank_pools cbank_slots cbank_config cbank_release_sources cbank_selection_features cbank_family_lineage cbank_problem_lineage cbank_release_exclusions cbank_withdrawn_families frbank_records frbank_admission_receipts frbank_selection_metadata frbank_withdrawals'.split(' ');
const H=s=>createHash('sha256').update(s).digest('hex'),blob=h=>Buffer.from(h,'hex');
function fixture(){
 const sql=new DatabaseSync(':memory:');let now=1794412800123,loseAck=false,calls=0;
 sql.function('unixepoch',{varargs:true},()=>Math.floor(now/1000));
 sql.function('strftime',{varargs:true},()=>`${String(Math.floor(now/1000)%60).padStart(2,'0')}.${String(now%1000).padStart(3,'0')}`);
 for(const table of tables)sql.exec(`CREATE TABLE ${table}(id INTEGER PRIMARY KEY, value TEXT); INSERT INTO ${table} VALUES(1,'before');`);
 sql.exec(schema);
 const control=()=>sql.prepare('SELECT *,lower(hex(incarnation)) AS incarnation,lower(hex(policy_hash)) AS policy_hash FROM round_authorization_control').get();
 const initialize=()=>sql.prepare('INSERT INTO round_authorization_control(id,incarnation,epoch,policy_hash,control_version,enabled) VALUES(1,?,1,?,1,1)').run(blob(H('incarnation')),blob(H('policy')));
 initialize();
 const prepared=(text,values=[])=>({bind:(...args)=>prepared(text,args),first:async()=>{calls++;return sql.prepare(text).get(...values)??null;},all:async()=>execute(text,values),text,values});
 // D1 meta.changes includes trigger writes. Direct affected rows are obtained
 // from RETURNING, not from this metering field.
 const execute=(text,values)=>{calls++;const before=sql.prepare('SELECT total_changes() AS n').get().n;const result=sql.prepare(text).all(...values);return {results:result,meta:{changes:sql.prepare('SELECT total_changes() AS n').get().n-before}};};
 const db={prepare:prepared,batch:async statements=>{sql.exec('BEGIN IMMEDIATE');try{const result=statements.map(s=>execute(s.text,s.values));sql.exec('COMMIT');if(loseAck){loseAck=false;throw Error('lost acknowledgement');}return result;}catch(error){if(sql.isTransaction)sql.exec('ROLLBACK');throw error;}}};
 const identity=(name='one',extra={})=>({intent_id:H(name),binding:H(name+'binding'),request_hash:H('request'),selection_hash:H('selection'),policy_hash:H('policy'),control_version:1,intent_expires:now+1800000,...extra});
 const proof=(extra={})=>({history_token:H('history'),incarnation:H('incarnation'),epoch:1,authorization_deadline:now+20000,...extra});
 return{sql,db,identity,proof,control,now:()=>now,time:value=>{now=value;},advance:ms=>{now+=ms;},loseAck:()=>{loseAck=true;},calls:()=>calls,close:()=>sql.close()};
}
test('D1 ticket binds exact identity and first history; recovery precedes current eligibility',async()=>{
 const f=fixture();try{
  const input=f.identity(),result=await authorizeRound(f.db,input,()=>f.proof());assert.equal(result.status,'authorized');assert(Object.isFrozen(result.receipt));
  f.sql.exec('UPDATE round_authorization_control SET epoch=2,enabled=0,control_version=2');
  const recovered=await authorizeRound(f.db,input,()=>{throw Error('withdrawn or changed current catalog');});
  assert.equal(recovered.status,'recovered');assert.deepEqual(recovered.receipt,result.receipt);assert.equal(f.control().ticket_count,1);
  for(const [key,value]of [['selection_hash',H('wrong')],['binding',H('wrong')],['control_version',2],['intent_expires',input.intent_expires+1]])await assert.rejects(recoverRoundAuthorization(f.db,{...input,[key]:value}),/identity conflict/);
 }finally{f.close();}
});
test('unknown, hidden, accessor, symbol and oversized authorization inputs fail before SQL',async()=>{
 const f=fixture();try{
  const bad=[{...f.identity(),extra:1},{...f.identity(),control_version:0},{...f.identity(),intent_expires:Infinity},{...f.identity(),intent_id:'x'.repeat(15000)},Object.assign(Object.create({inherited:true}),f.identity())];
  for(const kind of ['hidden','getter','symbol']){const value=f.identity();if(kind==='hidden')Object.defineProperty(value,'extra',{value:1});if(kind==='getter')Object.defineProperty(value,'binding',{enumerable:true,get(){throw Error('getter ran');}});if(kind==='symbol')value[Symbol('extra')]=1;bad.push(value);}
  for(const value of bad)await assert.rejects(recoverRoundAuthorization(f.db,value),/bounded|Invalid/);assert.equal(f.calls(),0);
 }finally{f.close();}
});
test('inputs detach before async reads; first successful duplicate preserves its original guard',async()=>{
 const f=fixture();try{
  const input=f.identity(),pending=authorizeRound(f.db,input,()=>f.proof());input.selection_hash=H('mutated');
  const first=await pending;assert.equal(first.receipt.selection_hash,H('selection'));
  const racers=await Promise.all([H('a'),H('b')].map(history_token=>authorizeRound(f.db,f.identity('race'),()=>f.proof({history_token}))));
  assert.deepEqual(racers[0].receipt,racers[1].receipt);assert.equal(f.control().ticket_count,2);
 }finally{f.close();}
});
test('lost authorization acknowledgement recovers without a new deadline or history token',async()=>{
 const f=fixture();try{
  const input=f.identity();f.loseAck();await assert.rejects(authorizeRound(f.db,input,()=>f.proof()),/lost acknowledgement/);
  const old=await recoverRoundAuthorization(f.db,input);f.advance(60000);
  assert.deepEqual((await authorizeRound(f.db,input,()=>{throw Error('no new proof');})).receipt,old);assert.equal(f.control().ticket_count,1);
 }finally{f.close();}
});
test('coherent epoch, incarnation, policy, gate, writer, capacity and deadline are conditional',async()=>{
 const changes=["epoch=2","incarnation=X'"+H('new-inc')+"',epoch=2,control_version=2,enabled=0","policy_hash=X'"+H('new-policy')+"',epoch=2,control_version=2","enabled=0,epoch=2,control_version=2","writing=1,writer_id=X'"+H('writer')+"'","ticket_count=10000","retired_before=8640000000000000"];
 for(const change of changes){const f=fixture();try{f.sql.exec(`UPDATE round_authorization_control SET ${change}`);assert.equal((await authorizeRound(f.db,f.identity(),()=>f.proof())).status,'unavailable');}finally{f.close();}}
 for(const offset of [-1,0,30001]){const f=fixture();try{assert.equal((await authorizeRound(f.db,f.identity(),()=>f.proof({authorization_deadline:f.now()+offset}))).status,'unavailable');}finally{f.close();}}
 const f=fixture();try{await assert.rejects(authorizeRound(f.db,f.identity('short',{intent_expires:f.now()+10}),()=>f.proof()),/Invalid authorization proof/);}finally{f.close();}
});
test('SQL clock preserves milliseconds and deadline equality rejects',async()=>{
 const f=fixture();try{
  assert.equal(f.sql.prepare(`SELECT ${AUTHORIZATION_CLOCK_SQL} AS t`).get().t,f.now());
  const result=await authorizeRound(f.db,f.identity(),()=>f.proof({authorization_deadline:f.now()+1}));assert.equal(result.status,'authorized');assert.equal(result.receipt.authorized_at%1000,123);
 }finally{f.close();}
});
test('receipt corruption and unknown versions cannot become authority',async()=>{
 const f=fixture();try{
  const input=f.identity(),{receipt}=await authorizeRound(f.db,input,()=>f.proof());
  for(const patch of [{epoch:2},{incarnation:H('other')},{history_token:H('other')},{protocol_version:2},{authorized_at:receipt.authorization_deadline},{extra:1},{body_hash:H('bad')}])await assert.rejects(verifyAuthorizationReceipt({...receipt,...patch},input),/Invalid|integrity/);
 }finally{f.close();}
});
test('tickets reject UPDATE, DELETE and REPLACE, including with recursive triggers off',async()=>{
 const f=fixture();try{
  await authorizeRound(f.db,f.identity(),()=>f.proof());
  for(const recursive of [0,1]){f.sql.exec(`PRAGMA recursive_triggers=${recursive}`);for(const sql of ['UPDATE round_authorizations SET epoch=2','DELETE FROM round_authorizations','INSERT OR REPLACE INTO round_authorizations SELECT * FROM round_authorizations'])assert.throws(()=>f.sql.exec(sql),/Retain|retired/);}
  assert.equal(f.control().ticket_count,1);
 }finally{f.close();}
});
test('all 17 selection tables require the catalog writer for every ordinary mutation',()=>{
 const f=fixture();try{for(const table of tables)for(const statement of [`INSERT INTO ${table} VALUES(2,'new')`,`UPDATE ${table} SET value='changed'`,`DELETE FROM ${table}`])assert.throws(()=>f.sql.exec(statement),/writer envelope/);}finally{f.close();}
});
test('control versions, policy changes and collection watermark move only forward',()=>{
 const f=fixture();try{
  for(const statement of ['UPDATE round_authorization_control SET enabled=0','UPDATE round_authorization_control SET policy_hash=zeroblob(32)','DELETE FROM round_authorization_control','INSERT OR REPLACE INTO round_authorization_control SELECT * FROM round_authorization_control'])assert.throws(()=>f.sql.exec(statement),/advance|Retain/);
  f.sql.exec('UPDATE round_authorization_control SET retired_before=1000,epoch=2,control_version=2');
  for(const statement of ['UPDATE round_authorization_control SET retired_before=999','UPDATE round_authorization_control SET epoch=1','UPDATE round_authorization_control SET control_version=1'])assert.throws(()=>f.sql.exec(statement),/advance/);
 }finally{f.close();}
});
test('fixed bounded collection only deletes expired tickets and maintains exact counts on retry',async()=>{
 const f=fixture();try{
  const identities=[];for(let i=0;i<AUTHORIZATION_GC_BATCH+3;i++){const input=f.identity('old'+i);identities.push(input);await authorizeRound(f.db,input,()=>f.proof());}
  f.advance(1800000+3600000);const live=f.identity('live');await authorizeRound(f.db,live,()=>f.proof());
  const plan=await planAuthorizationCollection(f.db);assert.equal(plan.intent_ids.length,AUTHORIZATION_GC_BATCH);assert(Object.isFrozen(plan.intent_ids));
  const first=await collectRoundAuthorizations(f.db,plan);assert.equal(first.deleted,AUTHORIZATION_GC_BATCH);assert.equal(first.ticket_count,4);
  const again=await collectRoundAuthorizations(f.db,plan);assert.equal(again.deleted,0);assert.equal(again.ticket_count,4);assert(await recoverRoundAuthorization(f.db,live));
  const rest=await planAuthorizationCollection(f.db);assert.equal(rest.intent_ids.length,3);assert.equal((await collectRoundAuthorizations(f.db,rest)).ticket_count,1);
 }finally{f.close();}
});
test('retirement watermark prevents old ticket recreation even after a SQL clock rollback',async()=>{
 const f=fixture();try{
  const input=f.identity(),originalTime=f.now();await authorizeRound(f.db,input,()=>f.proof());f.advance(5400000);
  const plan=await planAuthorizationCollection(f.db);await collectRoundAuthorizations(f.db,plan);assert.equal(await recoverRoundAuthorization(f.db,input),null);
  f.time(originalTime);assert.equal((await authorizeRound(f.db,input,()=>f.proof())).status,'unavailable');assert.equal(f.control().ticket_count,0);
 }finally{f.close();}
});
test('collection lost acknowledgement and failed batch neither double-decrement nor open the guard',async()=>{
 const f=fixture();try{
  await authorizeRound(f.db,f.identity(),()=>f.proof());f.advance(5400000);const plan=await planAuthorizationCollection(f.db);
  f.loseAck();await assert.rejects(collectRoundAuthorizations(f.db,plan),/lost acknowledgement/);assert.equal(f.control().gc_active,0);assert.equal((await collectRoundAuthorizations(f.db,plan)).deleted,0);
  const before=f.control();await assert.rejects(collectRoundAuthorizations(f.db,{...plan,retire_before:f.now()+1}),/CHECK/);assert.deepEqual(f.control(),before);
 }finally{f.close();}
});
test('collection cannot cross an incarnation, include unexpired targets, or exceed bounds',async()=>{
 const f=fixture();try{
  const old=f.identity();await authorizeRound(f.db,old,()=>f.proof());f.advance(5400000);const live=f.identity('live');await authorizeRound(f.db,live,()=>f.proof());
  const plan=await planAuthorizationCollection(f.db);await assert.rejects(collectRoundAuthorizations(f.db,{...plan,incarnation:H('restored')}),/CHECK/);
  assert.equal((await collectRoundAuthorizations(f.db,{...plan,intent_ids:[old.intent_id,live.intent_id]})).deleted,1);assert(await recoverRoundAuthorization(f.db,live));
  await assert.rejects(collectRoundAuthorizations(f.db,{...plan,intent_ids:Array.from({length:65},(_,i)=>H(String(i)))}),/Invalid/);
  await assert.rejects(collectRoundAuthorizations(f.db,{...plan,intent_ids:[old.intent_id,old.intent_id]}),/Invalid/);
 }finally{f.close();}
});
test('an empty collection advances the permanent expiry boundary without changing live count',async()=>{
 const f=fixture();try{const plan=await planAuthorizationCollection(f.db);assert.equal(plan.intent_ids.length,0);const result=await collectRoundAuthorizations(f.db,plan);assert.equal(result.deleted,0);assert.equal(result.ticket_count,0);assert.equal(result.retired_before,plan.retire_before);}finally{f.close();}
});
