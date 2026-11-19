// Local preparation only. Adding metadata never authorizes an FR offering.
import {readFileSync} from 'node:fs';
import {initializeFreeResponseStorage} from './free-response-storage.mjs';
import {decodeFreeResponseRecord} from '../../lib/bank/free-response-codec.mjs';
import {verifyFreeResponseAdmission,immutableReviewSnapshot} from './free-response.mjs';
import {freeResponseSelectionMetadata} from '../../lib/bank/free-response-metadata.mjs';
import {canonical,hex} from '../../lib/bank/compact-codec.mjs';
const assert=(condition,message)=>{if(!condition)throw Error(message);};
export function initializeFreeResponseIndex(db){
 initializeFreeResponseStorage(db);
 const schema=readFileSync(new URL('../../drizzle/0009_free_response_selection_metadata.sql',import.meta.url),'utf8');
 if(!db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name='frbank_selection_metadata'").get()){
  db.exec('BEGIN IMMEDIATE');try{db.exec(schema);db.exec('COMMIT');}catch(error){db.exec('ROLLBACK');throw error;}
 }
 const normalize=sql=>sql.trim().replace(/;$/,'').replace(/\s+/g,' ');
 for(const match of schema.matchAll(/CREATE (?:TRIGGER\s+(\w+)[\s\S]*?END;|(?:TABLE|INDEX)\s+(\w+)[\s\S]*?;)/g)){
  const actual=db.prepare('SELECT sql FROM sqlite_schema WHERE name=?').get(match[1]??match[2]);
  assert(actual&&normalize(actual.sql)===normalize(match[0]),'FR selection schema requires an explicit reviewed upgrade');
 }
}
export async function indexAdmittedFreeResponse(db,recordRef,options){
 assert(Number.isSafeInteger(recordRef)&&recordRef>0,'Invalid FR record reference');
 const row=db.prepare('SELECT * FROM frbank_records WHERE record_ref=?').get(recordRef);
 assert(row,'Missing FR record');
 const record=immutableReviewSnapshot(await decodeFreeResponseRecord(row));
 const admission=await verifyFreeResponseAdmission(record,options);
 const metadata=freeResponseSelectionMetadata(record,recordRef,admission.recordHash);
 db.exec('BEGIN IMMEDIATE');
 try{
  const receipt=db.prepare('SELECT 1 FROM frbank_admission_receipts WHERE record_ref=? AND review_hash=? AND checker_source_hash=?').get(recordRef,Buffer.from(admission.reviewHash,'hex'),Buffer.from(admission.checkerSourceHash,'hex'));
  assert(receipt,'FR indexing requires the exact stored admission receipt');
  const existing=db.prepare('SELECT * FROM frbank_selection_metadata WHERE record_ref=?').get(recordRef);
  if(existing)assert(canonical({...existing,record_hash:hex(existing.record_hash)})===canonical(metadata),'Stored FR selection metadata changed');
  else {
   const keys=Object.keys(metadata),values=keys.map(key=>key==='record_hash'?Buffer.from(metadata[key],'hex'):metadata[key]);
   db.prepare(`INSERT INTO frbank_selection_metadata(${keys.join(',')}) VALUES(${keys.map(()=>'?').join(',')})`).run(...values);
  }
  db.exec('COMMIT');return {recordRef,recordHash:admission.recordHash,inserted:!existing};
 }catch(error){db.exec('ROLLBACK');throw error;}
}
