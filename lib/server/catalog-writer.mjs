// Private reviewed-plan boundary. Never construct this from request-selected
// SQL, control state or authority. Caller reserves/meters budget before execute.
import {boundedJsonSnapshot} from './bounded-json-snapshot.mjs';
import {canonical,hex} from '../bank/compact-codec.mjs';
const encoder=new TextEncoder(),digest=async v=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(canonical(v))));
const bytes=h=>Uint8Array.from(h.match(/../g),p=>parseInt(p,16));
const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
const integer=(v,min=0,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
const exact=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));
const check=(ok,message)=>{if(!ok)throw Error(message);};
const pairSql=`SELECT CASE WHEN m.mutation_id IS NULL THEN NULL ELSE lower(hex(m.mutation_hash)) END AS mutation_hash,
 CASE WHEN m.mutation_id IS NULL THEN NULL ELSE lower(hex(m.incarnation)) END AS incarnation,m.before_epoch,m.after_epoch,r.sha256 AS original_hash
 FROM (SELECT 1) s LEFT JOIN round_catalog_mutations m ON m.mutation_id=? LEFT JOIN cbank_import_receipts r ON r.batch_id=?`;

/** A compiled future delta fixes its authority and epoch sequence. Reading a
 * newer live row must never silently rebase a stale reviewed operation. */
export function catalogWriterPlan(value,batches){
 const v=boundedJsonSnapshot(value,{maxBytes:200000,maxNodes:12000,maxDepth:5});
 check(exact(v,['version','incarnation','policyHash','initialEpoch','controlVersion','enabled','costs'])&&v.version===1&&hash(v.incarnation)&&hash(v.policyHash)&&integer(v.initialEpoch,1,Number.MAX_SAFE_INTEGER-batches-2)&&integer(v.controlVersion,1)&&v.enabled===0,'Invalid compiled catalog writer authority');
 check(exact(v.costs,['imports','activate','rollback'])&&Array.isArray(v.costs.imports)&&v.costs.imports.length===batches,'Missing reviewed catalog writer costs');
 for(const cost of [...v.costs.imports,v.costs.activate,v.costs.rollback])check(exact(cost,['reads','writes'])&&integer(cost.reads,1)&&integer(cost.writes,3),'Invalid reviewed catalog writer costs');
 return v;
}

export async function prepareCatalogWrite(value){
 const v=boundedJsonSnapshot(value,{maxBytes:1400000,maxNodes:16000,maxDepth:8});
 check(exact(v,['projectId','binding','bundleId','authority','expected','operation'])&&typeof v.projectId==='string'&&v.projectId.length>0&&v.projectId.length<=128&&v.binding==='DB'&&hash(v.bundleId),'Invalid catalog writer scope');
 const a=v.authority,c=v.expected,op=v.operation;
 check(exact(a,['incarnation','policyHash'])&&hash(a.incarnation)&&hash(a.policyHash),'Invalid fixed catalog authority');
 check(exact(c,['epoch','controlVersion','enabled'])&&integer(c.epoch,1,Number.MAX_SAFE_INTEGER-1)&&integer(c.controlVersion,1)&&c.enabled===0,'Invalid expected catalog state');
 check(exact(op,['kind','receiptId','receiptHash','queries','checkpoint'])&&['import','activate','rollback'].includes(op.kind)&&typeof op.receiptId==='string'&&op.receiptId.startsWith(v.bundleId+'/')&&op.receiptId.length<=128&&hash(op.receiptHash)&&Array.isArray(op.queries)&&op.queries.length>0&&op.queries.length<=1000,'Invalid reviewed catalog operation');
 for(const q of op.queries)check(exact(q,['sql','args'])&&typeof q.sql==='string'&&q.sql.length>0&&encoder.encode(q.sql).length<=90000&&Array.isArray(q.args)&&q.args.length<=100&&q.args.every(arg=>arg===null||typeof arg==='string'||typeof arg==='number'&&Number.isFinite(arg)),'Invalid reviewed catalog statement');
 check(exact(op.checkpoint,['sequence','verified','activated'])&&integer(op.checkpoint.sequence)&&[0,1].includes(op.checkpoint.verified)&&[0,1,2].includes(op.checkpoint.activated),'Invalid catalog checkpoint');
 const scope={protocol:'catalog-plan-writer-v1',projectId:v.projectId,binding:v.binding,bundleId:v.bundleId,receiptId:op.receiptId};
 const mutationId=await digest(scope),mutationHash=await digest({scope,authority:a,operation:op});
 function receipt(rows){
  check(Array.isArray(rows)&&rows.length===1,'Invalid paired catalog receipt response');const row=rows[0];
  check(exact(row,['mutation_hash','incarnation','before_epoch','after_epoch','original_hash']),'Invalid paired catalog receipt fields');
  if(row.mutation_hash===null&&row.original_hash===null){check(row.incarnation===null&&row.before_epoch===null&&row.after_epoch===null,'Invalid absent catalog receipt');return null;}
  check(row.mutation_hash!==null&&row.original_hash!==null,'Unpaired catalog receipt; reconcile writer cutover');
  check(row.mutation_hash===mutationHash&&row.incarnation===a.incarnation&&row.original_hash===op.receiptHash&&integer(row.before_epoch,1,Number.MAX_SAFE_INTEGER-1)&&row.after_epoch===row.before_epoch+1,'Catalog receipt identity conflict');
  return boundedJsonSnapshot(row,{maxBytes:1000,maxNodes:12,maxDepth:2});
 }
 const read=async(db,observe=()=>{})=>{const r=await db.prepare(pairSql).bind(bytes(mutationId),op.receiptId).all();observe(r);check(r.success!==false,'Catalog receipt lookup failed');return receipt(r.results);};
 return Object.freeze({
  mutationId,read,
  async execute(db,leaseValue,observe=()=>{}){
   const lease=boundedJsonSnapshot(leaseValue,{maxBytes:1024,maxNodes:12,maxDepth:2});
   check(exact(lease,['nonce','bodyHash','stamp'])&&typeof lease.nonce==='string'&&lease.nonce.length>0&&lease.nonce.length<=128&&hash(lease.bodyHash)&&typeof lease.stamp==='string'&&Number.isFinite(Date.parse(lease.stamp)),'Invalid operator lease');
   const state='id=1 AND incarnation=? AND epoch=? AND policy_hash=? AND control_version=? AND enabled=? AND writing=0 AND writer_id IS NULL AND gc_active=0';
   const params=[bytes(a.incarnation),c.epoch,bytes(a.policyHash),c.controlVersion,c.enabled];
   const statements=[
    db.prepare('INSERT INTO cbank_import_checks SELECT 0 WHERE NOT EXISTS(SELECT 1 FROM cbank_delta_ledger WHERE bundle_id=? AND pending_id=? AND pending_hash=?)').bind(v.bundleId,lease.nonce,lease.bodyHash),
    db.prepare(`INSERT INTO round_authorization_assert SELECT 0 WHERE NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE ${state})`).bind(...params),
    db.prepare(`UPDATE round_authorization_control SET writing=1,writer_id=? WHERE ${state}`).bind(bytes(mutationId),...params),
    ...op.queries.map(q=>db.prepare(q.sql).bind(...q.args)),
    db.prepare('INSERT INTO cbank_import_receipts(batch_id,sha256) VALUES(?,?)').bind(op.receiptId,op.receiptHash),
    // Keep the accounting fence after the data commit. The exact owning
    // request releases it only after its usage has been durably settled.
    db.prepare('UPDATE cbank_delta_ledger SET next_sequence=?,verified=?,activated=?,updated_at=? WHERE bundle_id=? AND pending_id=? AND pending_hash=?').bind(op.checkpoint.sequence,op.checkpoint.verified,op.checkpoint.activated,lease.stamp,v.bundleId,lease.nonce,lease.bodyHash),
    db.prepare('INSERT INTO round_catalog_mutations(mutation_id,mutation_hash,incarnation,before_epoch,after_epoch) VALUES(?,?,?,?,?)').bind(bytes(mutationId),bytes(mutationHash),bytes(a.incarnation),c.epoch,c.epoch+1),
    db.prepare('UPDATE round_authorization_control SET epoch=epoch+1,writing=0,writer_id=NULL WHERE id=1 AND incarnation=? AND epoch=? AND policy_hash=? AND control_version=? AND enabled=? AND writing=1 AND writer_id=? AND gc_active=0').bind(...params,bytes(mutationId)),
    db.prepare('INSERT INTO round_authorization_assert SELECT 0 WHERE NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND incarnation=? AND epoch=? AND policy_hash=? AND control_version=? AND enabled=? AND writing=0 AND writer_id IS NULL AND gc_active=0)').bind(bytes(a.incarnation),c.epoch+1,bytes(a.policyHash),c.controlVersion,c.enabled),
    db.prepare(pairSql).bind(bytes(mutationId),op.receiptId)
   ];
   let result;
   try{result=await db.batch(statements);}catch(error){
    // At most one reserved read, never an automatic mutation retry. A recovered
    // commit does not recover missing provider counters or refund its charge.
    const saved=await read(db,observe);if(saved)return {status:'recovered-after-error',receipt:saved,unmeasuredAttempt:true};throw error;
   }
   // Metering/response validation failures after commit must remain failures.
   observe(result);
   check(Array.isArray(result)&&result.length===statements.length&&result.every(r=>r.success!==false),'Invalid catalog writer response');
   const saved=receipt(result.at(-1).results);check(saved,'Missing committed catalog receipt');
   return {status:'committed',receipt:saved,unmeasuredAttempt:false};
  }
 });
}
