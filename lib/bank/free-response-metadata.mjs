import {canonical,hex} from './compact-codec.mjs';
export const MAX_FR_METADATA_FIELD_BYTES=256,MAX_FR_METADATA_TEXT_BYTES=1536;
export const FR_SELECTION_FIELDS=['problem_id','revision','contract_id','content_hash','contract_hash','topic','difficulty','source_family','family_id','lineage_id','idea','structure','technique','combination','source_release_id','source_family_id','source_difficulty','source_problem_id','source_revision','source_content_hash'];
const encoder=new TextEncoder();
const assert=(condition,message)=>{if(!condition)throw Error(message);};
export function boundedFreeResponseSelectionContent(row){
 let bytes=0;const content={};
 for(const key of FR_SELECTION_FIELDS){
  assert(Object.hasOwn(row,key),'Missing FR selection field');const value=row[key];content[key]=value;
  if(value===null){assert(key.startsWith('source_')&&key!=='source_family','Missing FR selection value');continue;}
  if(key==='revision'||key==='source_revision'){assert(Number.isSafeInteger(value)&&value>0,'Invalid FR selection revision');continue;}
  assert(typeof value==='string'&&value.length>0&&!/[\u0000-\u001f\u007f]/.test(value),'Invalid FR selection vocabulary');
  const length=encoder.encode(value).length;assert(length<=MAX_FR_METADATA_FIELD_BYTES,'FR selection field exceeds its byte bound');bytes+=length;
 }
 assert(bytes<=MAX_FR_METADATA_TEXT_BYTES,'FR selection metadata exceeds its byte bound');return content;
}
export async function freeResponseSelectionContentHash(content){
 return hex(await crypto.subtle.digest('SHA-256',encoder.encode(canonical(boundedFreeResponseSelectionContent(content)))));
}
export function freeResponseSelectionContent(record){
 const {task:t,contract:c}=record;
 const {record_ref,record_hash,...metadata}=freeResponseSelectionMetadata(record,0,'');
 return boundedFreeResponseSelectionContent({problem_id:t.problemId,revision:t.problemRevision,contract_id:c.contractId,content_hash:t.contentHash,contract_hash:c.contractHash,
  topic:t.topic,difficulty:t.difficulty,source_family:t.familyId,family_id:t.constructionFamilyId,lineage_id:t.lineageId,...metadata});
}
export const freeResponseSelectionHash=record=>freeResponseSelectionContentHash(freeResponseSelectionContent(record));

/** Derived only from a fully verified immutable task. This is private serving
 * metadata, never a public question projection or an admission certificate. */
export function freeResponseSelectionMetadata(record,recordRef,recordHash){
 const {task}=record,{pedagogy:p,origin}=task;
 return {record_ref:recordRef,record_hash:recordHash,idea:p.relatedIdeaGroupId,structure:p.structuralSignature,
  technique:p.primaryTechnique,combination:[...p.reasoningDemand].sort().join('+')+':'+p.primaryTechnique,
  source_release_id:origin.kind==='bank'?origin.bankRelease:null,
  source_family_id:origin.kind==='bank'?origin.familyId:null,
  source_difficulty:origin.kind==='bank'?origin.mcDifficulty:null,
  source_problem_id:origin.kind==='bank'?origin.problemId:null,
  source_revision:origin.kind==='bank'?origin.problemRevision:null,
  source_content_hash:origin.kind==='bank'?origin.contentHash:null};
}
