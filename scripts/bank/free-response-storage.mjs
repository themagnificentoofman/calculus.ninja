// Local private preparation only. This module neither publishes nor activates a pool.
import {readFileSync} from 'node:fs';
import {gzipSync,gunzipSync} from 'node:zlib';
import {canonical,decodeCompact,hex} from '../../lib/bank/compact-codec.mjs';
import {decodeFreeResponseRecord} from '../../lib/bank/free-response-codec.mjs';
import {isLegacyProblem} from '../../lib/bank/legacy-origin.mjs';
import {verifyFreeResponseAdmission,immutableReviewSnapshot} from './free-response.mjs';

const assert=(condition,message)=>{if(!condition)throw Error(message);};
export function initializeFreeResponseStorage(db){
 db.exec('PRAGMA foreign_keys=ON');
 // SQLite ignores this PRAGMA inside an existing transaction. Never report a
 // usable schema while this connection can still create orphaned records.
 assert(db.prepare('PRAGMA foreign_keys').get().foreign_keys===1,'FR storage requires enabled foreign keys outside an active transaction');
 const schema=readFileSync(new URL('../../drizzle/0008_free_response_storage.sql',import.meta.url),'utf8');
 if(!db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name='frbank_records'").get()){
  db.exec('BEGIN IMMEDIATE');
  try{db.exec(schema);db.exec('COMMIT');}catch(error){db.exec('ROLLBACK');throw error;}
 }
 // Never silently accept an earlier local draft schema lacking the current
 // immutable guards. Upgrades need a reviewed migration, not an implicit edit.
 const normalize=sql=>sql.trim().replace(/;$/,'').replace(/\s+/g,' ');
 for(const match of schema.matchAll(/CREATE (?:TRIGGER\s+(\w+)[\s\S]*?END;|(?:TABLE|INDEX)\s+(\w+)[\s\S]*?;)/g)){
  const name=match[1]??match[2],actual=db.prepare('SELECT sql FROM sqlite_schema WHERE name=?').get(name);
  assert(actual&&normalize(actual.sql)===normalize(match[0]),'FR schema differs from the reviewed migration; prepare an explicit upgrade');
 }
}

// Exact source membership and current exclusions are checked before storage.
// The same policy must also be applied before future serving/capacity queries.
export const FR_SOURCE_SQL=`WITH context AS (
 SELECT c.value AS active_release FROM cbank_config c JOIN cbank_releases r ON r.release_id=c.value
 WHERE c.key='active_release' AND r.state='published'
)
 SELECT b.*,m.metadata_json,p.family_id AS source_family,p.difficulty AS source_difficulty,
 COALESCE(fl.construction_id,p.family_id) AS construction_id,COALESCE(pl.lineage_id,b.problem_id) AS lineage_id
 FROM cbank_problems b JOIN cbank_shared m USING(shared_id) JOIN cbank_publication u USING(problem_ref)
 JOIN cbank_slots s USING(problem_ref) JOIN cbank_pools p USING(pool_id)
 JOIN cbank_releases r ON r.release_id=p.release_id
 LEFT JOIN cbank_family_lineage fl ON fl.family_id=p.family_id
 LEFT JOIN cbank_problem_lineage pl ON pl.problem_id=b.problem_id
 WHERE b.problem_id=? AND b.revision=? AND b.content_hash=? AND p.release_id=? AND p.family_id=? AND p.difficulty=?
 AND p.tag='*' AND u.state='approved' AND r.state='published'
 AND p.release_id IN (SELECT active_release FROM context UNION SELECT source_release_id FROM cbank_release_sources WHERE release_id=(SELECT active_release FROM context))
 AND NOT EXISTS(SELECT 1 FROM cbank_release_exclusions e JOIN cbank_releases er ON er.release_id=e.release_id
 WHERE e.problem_ref=b.problem_ref AND (e.release_id=(SELECT active_release FROM context) OR e.scope='global' AND er.state='published'))
 AND NOT EXISTS(SELECT 1 FROM cbank_withdrawn_families w JOIN cbank_releases wr ON wr.release_id=w.introduced_by
 WHERE w.source_release_id=p.release_id AND w.family_id=p.family_id AND (wr.state='published' OR w.introduced_by=(SELECT active_release FROM context)))
 LIMIT 2`;
function sourceRow(db,origin){
 const rows=db.prepare(FR_SOURCE_SQL).all(origin.problemId,origin.problemRevision,Buffer.from(origin.contentHash,'hex'),origin.bankRelease,origin.familyId,origin.mcDifficulty);
 assert(rows.length===1,'Source MC revision is unavailable, excluded or ambiguous');
 const row=rows[0];
 assert(row.construction_id===origin.constructionFamilyId&&row.lineage_id===origin.lineageId,'Source MC mathematical lineage changed');
 return row;
}
async function checkedSource(db,task){
 if(task.origin.kind==='original')return null;
 const row=sourceRow(db,task.origin),source=await decodeCompact(row);
 assert(!isLegacyProblem(source),'Legacy source cannot enter FR storage');
 assert(source.problemId===task.origin.problemId&&source.problemRevision===task.origin.problemRevision&&source.contentHash===task.origin.contentHash&&source.familyId===task.origin.familyId&&source.difficulty===task.origin.mcDifficulty,'Source MC payload differs from the bound origin');
 return row;
}

/** Existing identical rows are idempotent; conflicts require new immutable IDs.
 * The caller supplies private evidence, while production registration defaults
 * to the external hash-only registry in the admission module. */
export async function storeAdmittedFreeResponse(db,record,options){
 record=immutableReviewSnapshot(record);
 const admission=await verifyFreeResponseAdmission(record,options);
 const source=await checkedSource(db,record.task),serialized=canonical(record),payload=gzipSync(serialized,{level:9});
 assert(payload.length>0&&payload.length<=65536,'Compressed FR payload exceeds the storage bound');
 const {task,contract}=record;
 db.exec('BEGIN IMMEDIATE');
 try{
  // Only immutable bytes were inspected above. Recheck mutable eligibility
  // after taking the transaction, with no asynchronous work before commit.
  if(source)assert(sourceRow(db,task.origin).problem_ref===source.problem_ref,'Source MC eligibility changed during preparation');
  let row=db.prepare('SELECT * FROM frbank_records WHERE problem_id=? AND revision=? AND contract_id=?').get(task.problemId,task.problemRevision,contract.contractId);
  let inserted=false;
  if(row){
   assert(hex(row.record_hash)===admission.recordHash,'Immutable FR identity conflict');
   assert(row.mc_problem_ref===(source?.problem_ref??null),'Immutable FR source reference conflict');
   assert(new TextDecoder('utf-8',{fatal:true}).decode(gunzipSync(row.payload_gzip,{maxOutputLength:65536}))===serialized,'Stored FR bytes conflict with the reviewed record');
   for(const [column,value] of Object.entries({topic:task.topic,difficulty:task.difficulty,family_id:task.familyId,construction_id:task.constructionFamilyId,lineage_id:task.lineageId}))assert(row[column]===value,'Stored FR index conflicts with the reviewed record');
   assert(hex(row.content_hash)===task.contentHash&&hex(row.contract_hash)===contract.contractHash,'Stored FR content/contract hash conflict');
  }else{
   const result=db.prepare(`INSERT INTO frbank_records(problem_id,revision,contract_id,content_hash,contract_hash,record_hash,topic,difficulty,family_id,construction_id,lineage_id,mc_problem_ref,payload_gzip)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(task.problemId,task.problemRevision,contract.contractId,Buffer.from(task.contentHash,'hex'),Buffer.from(contract.contractHash,'hex'),Buffer.from(admission.recordHash,'hex'),task.topic,task.difficulty,task.familyId,task.constructionFamilyId,task.lineageId,source?.problem_ref??null,payload);
   row={record_ref:Number(result.lastInsertRowid)};inserted=true;
  }
  const receiptArgs=[row.record_ref,Buffer.from(admission.reviewHash,'hex'),Buffer.from(admission.checkerSourceHash,'hex')];
  const existingReceipt=db.prepare('SELECT 1 FROM frbank_admission_receipts WHERE record_ref=? AND review_hash=? AND checker_source_hash=?').get(...receiptArgs);
  if(!existingReceipt)db.prepare('INSERT INTO frbank_admission_receipts(record_ref,review_hash,checker_source_hash) VALUES(?,?,?)').run(...receiptArgs);
  db.exec('COMMIT');
  return {...admission,recordRef:row.record_ref,inserted,receiptInserted:!existingReceipt,canonicalBytes:Buffer.byteLength(serialized),compressedBytes:payload.length};
 }catch(error){db.exec('ROLLBACK');throw error;}
}

/** Historical export preserves stored records even when their source is now
 * withdrawn. It is integrity reconstruction, never a serving decision. */
export async function* exportFreeResponseRecords(db){
 for(const row of db.prepare('SELECT * FROM frbank_records ORDER BY problem_id,revision,contract_id').iterate()){
  const record=await decodeFreeResponseRecord(row);
  // Withdrawal affects eligibility, not the immutable source identity. Resolve
  // the database-local foreign key even for historical reconstruction.
  if(record.task.origin.kind==='bank'){
   const origin=record.task.origin;
   const sourceRow=db.prepare('SELECT b.*,m.metadata_json FROM cbank_problems b JOIN cbank_shared m USING(shared_id) WHERE b.problem_ref=?').get(row.mc_problem_ref);
   assert(sourceRow,'Stored FR source reference is missing');
   const source=await decodeCompact(sourceRow);
   assert(source.problemId===origin.problemId&&source.problemRevision===origin.problemRevision&&source.contentHash===origin.contentHash&&source.familyId===origin.familyId&&source.difficulty===origin.mcDifficulty,'Stored FR source reference differs from its bound origin');
  }
  const receipts=db.prepare('SELECT review_hash,checker_source_hash FROM frbank_admission_receipts WHERE record_ref=? ORDER BY review_hash,checker_source_hash').all(row.record_ref);
  assert(receipts.length>0,'Stored FR record is missing its admission receipt');
  yield {record,recordHash:hex(row.record_hash),receipts:receipts.map(r=>({reviewHash:hex(r.review_hash),checkerSourceHash:hex(r.checker_source_hash)}))};
 }
}
