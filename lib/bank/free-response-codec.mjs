// Private storage reconstruction shared by the operator and Worker.
import {canonical,hex} from './compact-codec.mjs';
import {FR_RECORD_BYTES,assertFreeResponseRecord,assertRegisteredFreeResponse,frDigest} from './free-response-record.mjs';

const encoder=new TextEncoder();
const assert=(value,message)=>{if(!value)throw Error(message);};
export async function decodeFreeResponseRecord(row,{admissions}={}){
 assert(row&&typeof row==='object','Missing FR storage row');
 const compressed=row.payload_gzip instanceof Uint8Array?row.payload_gzip:new Uint8Array(row.payload_gzip??[]);
 assert(compressed.length>0&&compressed.length<=FR_RECORD_BYTES,'Oversized or empty compressed FR payload');
 const reader=new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();
 const parts=[];let size=0;
 try{
  while(true){
   const {done,value}=await reader.read();if(done)break;
   size+=value.byteLength;if(size>FR_RECORD_BYTES){await reader.cancel();throw Error('Oversized decompressed FR payload');}parts.push(value);
  }
 }finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.byteLength;}
 const serialized=new TextDecoder('utf-8',{fatal:true}).decode(bytes),record=JSON.parse(serialized);
 assert(canonical(record)===serialized,'FR payload must preserve the canonical stored record');
 assert(encoder.encode(serialized).length<=FR_RECORD_BYTES,'Oversized canonical FR payload');
 await assertFreeResponseRecord(record);
 const {task,contract}=record;
 for(const [column,value] of Object.entries({problem_id:task.problemId,revision:task.problemRevision,contract_id:contract.contractId,topic:task.topic,difficulty:task.difficulty,family_id:task.familyId,construction_id:task.constructionFamilyId,lineage_id:task.lineageId}))assert(row[column]===value,`FR storage identity mismatch: ${column}`);
 for(const [column,value] of Object.entries({content_hash:task.contentHash,contract_hash:contract.contractHash,record_hash:await frDigest(record)}))assert(hex(row[column])===value,`FR storage hash mismatch: ${column}`);
 assert((task.origin.kind==='original'&&row.mc_problem_ref===null)||(task.origin.kind==='bank'&&Number.isSafeInteger(row.mc_problem_ref)&&row.mc_problem_ref>0),'FR source-bank reference mismatch');
 if(admissions)await assertRegisteredFreeResponse(record,admissions);
 return record;
}
