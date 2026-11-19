// Compose a first FR import with the existing signed, staged MC release program.
// Both physical input images and every prior admission must already be verified.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {copyFileSync,existsSync,mkdirSync,mkdtempSync,readFileSync,renameSync,rmSync,writeFileSync} from 'node:fs';
import {basename,dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {canonical} from '../../lib/bank/compact-codec.mjs';
import {frDigest} from '../../lib/bank/free-response-record.mjs';
import {catalogWriterPlan} from '../../lib/server/catalog-writer.mjs';
import {boundedJsonSnapshot} from '../../lib/server/bounded-json-snapshot.mjs';

import {m4ReleaseBudget,m4OperationAllowance} from '../../lib/server/content-release-budget.mjs';

const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const fileHash=file=>sha(readFileSync(file));
const readJSON=file=>JSON.parse(readFileSync(file));
const hex=v=>Buffer.from(v).toString('hex');
const tables=['frbank_records','frbank_admission_receipts','frbank_selection_metadata'];
const allTables=[...tables,'frbank_withdrawals'];

function sqlValue(value){
 if(value===null)return 'NULL';
 if(value instanceof Uint8Array)return "X'"+hex(value)+"'";
 if(typeof value==='number'){assert(Number.isSafeInteger(value));return String(value);}
 assert(typeof value==='string'&&!value.includes('\0'));
 return "'"+value.replaceAll("'","''")+"'";
}

function canonicalRow(row){
 return Object.fromEntries(Object.entries(row).map(([key,v])=>[key,v instanceof Uint8Array?hex(v):v]));
}

// This matches the reviewed writer's parameterized operation, independently of
// the literal SQL encoding used by the signed MC endpoint.
function originalQuery(table,row){
 const fields=Object.keys(row),values=Object.values(row);
 return {sql:'INSERT INTO '+table+' ('+fields.join(',')+') VALUES ('+values.map(v=>v instanceof Uint8Array?'unhex(?)':'?').join(',')+')',args:Object.values(canonicalRow(row))};
}

export async function compileFreeResponseDelta(mcDirectory,mcBindingFile,physicalFile,reviewDirectory,combinedDirectory,destination,amendment){
 const mc=readJSON(join(mcDirectory,'plan.json')),signed=readJSON(mcBindingFile);
 const joinFile=join(combinedDirectory,'combined-binding.json'),combined=readJSON(joinFile);
 const guardFile=join(combinedDirectory,'guarded-binding.json'),guard=readJSON(guardFile);
 const regFile=join(reviewDirectory,'detached-registry.json'),registry=readJSON(regFile);
 const receiptFile=join(reviewDirectory,'storage-receipt.json'),receipt=readJSON(receiptFile);
 const {bundleId,status,compression,localDatabaseBytes,...base}=mc;
 assert.equal(base.format,'content-delta-v3');assert.equal(sha(canonical(base)),bundleId);
 assert.equal(fileHash(join(mcDirectory,'plan.json')),signed.planSHA);
 assert.equal(signed.guardedBundle,bundleId);
 assert.equal(combined.mcSupplement.releaseBundle,signed.sourceStandardBundle);
 assert.equal(mc.release,combined.mcSupplement.release);
 assert.equal(mc.newCount,combined.mcSupplement.newCount);
 assert.equal(guard.combinedBindingSHA,fileHash(joinFile));
 assert.equal(guard.storageReceiptSHA256,fileHash(receiptFile));
 assert.equal(guard.registrySHA256,fileHash(regFile));
 assert.equal(combined.FRRegistry,guard.registrySHA256);
 assert.equal(guard.registryHash,await frDigest(registry));
 assert.equal(receipt.registryHash,guard.registryHash);
 assert.equal(guard.cacheKey,combined.cacheKey);
 assert(guard.allCombinedFRTablesEqualGuardedSource&&guard.allIDRecordReviewAndIndexHashesMatch);
 assert.equal(fileHash(physicalFile),combined.cacheFiles['catalog.sqlite']);
 assert.equal(guard.prepared,Object.keys(registry.records).length);
 assert.equal(guard.prepared,receipt.prepared.length);
 assert.equal(receipt.guarded.finalControlEnabled,0);
 assert.equal(receipt.guarded.planQueries,3*guard.prepared);
 assert(!existsSync(destination),'Use a new output directory');
 mkdirSync(dirname(destination),{recursive:true});
 const staging=mkdtempSync(join(dirname(destination),basename(destination)+'-pending-'));
 const db=new DatabaseSync(physicalFile,{readOnly:true});
 try{
  const batches=[...base.batches];
  for(const b of batches){
   assert.equal(b.file,basename(b.file));
   const file=join(mcDirectory,b.file);assert.equal(fileHash(file),b.sha256);
   copyFileSync(file,join(staging,b.file));
  }
  const checks=[...base.tableHashes],costs=[...base.catalogWriter.costs.imports];
  const lookups=tables.map(t=>db.prepare('SELECT * FROM '+t+' WHERE record_ref=?'));
  const indexes=tables.map(t=>db.prepare('PRAGMA index_list('+t+')').all().length);
  const refs=db.prepare('SELECT record_ref FROM frbank_records ORDER BY record_ref').all().map(r=>r.record_ref);
  assert.equal(refs.length,guard.prepared);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM frbank_withdrawals').get().n,0,'First FR release requires an approved empty withdrawal table');
  for(const t of tables)assert.equal(db.prepare('SELECT COUNT(*) AS n FROM '+t).get().n,refs.length);
  const admissions=new Set();
  let pending=[],bytes=0,writes=0;
  function flush(){
   if(!pending.length)return;
   const file='batch-'+String(batches.length).padStart(5,'0')+'.json',text=JSON.stringify(pending);
   // The request serializes this string once again. Preserve room for its envelope.
   assert(Buffer.byteLength(JSON.stringify({op:'step',step:batches.length,text}))<850000);
   writeFileSync(join(staging,file),text,{flag:'wx'});
   const rows=pending.length;
   batches.push({file,sha256:sha(text),bytes:Buffer.byteLength(text),statements:rows,rows,estimatedWrites:writes+10,estimatedReads:100+10*rows});
   costs.push({reads:48+2*rows,writes:16});
   pending=[];bytes=0;writes=0;
  }
  // First-time import must fail closed on preexisting rows. Replayed successful
  // batches are caught by the operator's paired receipt before any SQL executes.
  for(const t of allTables)pending.push('INSERT INTO cbank_import_checks SELECT 0 WHERE EXISTS(SELECT 1 FROM '+t+' LIMIT 1)');
  let cursor=0;
  for(const old of receipt.guarded.operations){
   assert.equal(old.queries%3,0);const original=[];
   for(const ref of refs.slice(cursor,cursor+old.queries/3)){
    const rows=lookups.map(statement=>statement.get(ref));
    assert(rows.every(x=>x?.record_ref===ref));
    const [record,approval,index]=rows;
    const key=record.problem_id+'@'+record.revision+'#'+record.contract_id,entry=registry.records[key];
    assert(entry&&!admissions.has(key));admissions.add(key);
    assert.equal(hex(record.record_hash),entry.recordHash);assert.equal(hex(index.record_hash),entry.recordHash);
    assert.equal(hex(approval.review_hash),entry.reviewHash);assert.equal(hex(approval.checker_source_hash),entry.checkerSourceHash);
    const literals=rows.map((row,i)=>{
     original.push(originalQuery(tables[i],row));
     const statement='INSERT INTO '+tables[i]+'('+Object.keys(row).join(',')+') VALUES('+Object.values(row).map(sqlValue).join(',')+')';
     assert(Buffer.byteLength(statement)<=90000);return statement;
    });
    const n=Buffer.byteLength(JSON.stringify(literals));
    if(pending.length+3>240||bytes+n>640000)flush();
    pending.push(...literals);bytes+=n;writes+=indexes.reduce((sum,value)=>sum+1+value,0);
   }
   assert.equal(old.sourceSHA256,await frDigest(original),'Physical source differs from the original guarded writing operation');
   cursor+=old.queries/3;
  }
  flush();assert.equal(cursor,refs.length);assert.equal(admissions.size,guard.prepared);
  for(const t of allTables){
   let low=0,range=[],size=0;
   function sealPage(){
    if(!range.length)return;
    const high=range.at(-1).record_ref;
    checks.push({table:t,where:'record_ref>? AND record_ref<=?',args:[low,high],order:'record_ref',count:range.length,sha256:sha(canonical(range))});
    low=high;range=[];size=0;
   }
   for(const value of db.prepare('SELECT * FROM '+t+' ORDER BY record_ref').iterate()){
    assert(value.record_ref>low);
    const row=canonicalRow(value),n=Buffer.byteLength(canonical(row));
    if(range.length>=320||size+n>390000)sealPage();
    range.push(row);size+=n;
   }
   sealPage();
   checks.push({table:t,where:'record_ref>?',args:[low],order:'record_ref',count:0,sha256:sha('[]')});
  }
  const catalogWriter=catalogWriterPlan({...base.catalogWriter,costs:{...base.catalogWriter.costs,imports:costs}},batches.length);
  const freeResponse={version:1,firstImport:true,records:refs.length,MCBundle:bundleId,mcApprovalFile:signed.artifactSHA,registrySHA256:guard.registrySHA256,storageReceiptSHA256:guard.storageReceiptSHA256,combinedBindingSHA256:fileHash(joinFile),guardedBindingSHA256:fileHash(guardFile)};
  if(amendment!==undefined){
   assert.equal(amendment,m4ReleaseBudget.id);
   assert.equal(base.projectId,m4ReleaseBudget.projectId);
   assert.equal(base.priorOperation?.bundleId,m4ReleaseBudget.priorBundleId);
  }
  const body={...base,catalogWriter,batches,tableHashes:checks,freeResponse,...(amendment?{format:'content-delta-v4',approvedBudget:amendment,operationAllowance:m4OperationAllowance}:{})};
  const plan={...body,bundleId:sha(canonical(body)),status,localDatabaseBytes:db.prepare('PRAGMA page_count').get().page_count*db.prepare('PRAGMA page_size').get().page_size,compression};
  boundedJsonSnapshot(plan,{maxBytes:2000000,maxNodes:60000,maxDepth:16});
  writeFileSync(join(staging,'plan.json'),JSON.stringify(plan,null,2)+'\n',{flag:'wx'});
  renameSync(staging,destination);
  return {bundleId:plan.bundleId,records:refs.length,mcImports:mc.batches.length,frImports:batches.length-mc.batches.length,frVerificationPages:checks.length-mc.tableHashes.length,operationAllowance:plan.operationAllowance};
 }finally{db.close();rmSync(staging,{recursive:true,force:true});}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2,8),amendment=process.argv[8];assert(process.argv.length<=9);assert.equal(args.length,6,'Pass MC delta dir, signed MC binding, combined physical database, FR review dir, guarded combined review dir and fresh output dir');
 console.log(await compileFreeResponseDelta(...args.map(p=>resolve(p)),amendment));
}
