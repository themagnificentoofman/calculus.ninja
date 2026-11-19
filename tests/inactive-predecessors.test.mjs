import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {gzipSync} from 'node:zlib';
import {archivedPredecessors,insertInactivePredecessor} from '../scripts/bank/inactive-predecessors.mjs';
import {canonical,openDatabase} from '../scripts/bank/admin.mjs';

const sha=data=>createHash('sha256').update(data).digest('hex');
const id='cn_'+'1'.repeat(20);
function signed(directory,name,bytes){writeFileSync(join(directory,name),bytes);return sha(bytes);}
function fixture(directory,{duplicate=false,wrongRow=false,missingEvidence=false}={}){
 const body={schemaVersion:2,problemId:id,problemRevision:1,semanticHash:'2'.repeat(64),familyId:'test-family',topic:'limits',difficulty:'easy'};
 const record={...body,contentHash:sha(canonical(body))},raw=canonical(record)+'\n';
 const successor={problemId:id,problemRevision:2,contentHash:'3'.repeat(64)},approvedHash=sha(canonical(successor)+'\n');
 const snapshotHash=sha(raw),source={snapshotHash,file:'source.gz',bindingFile:'old.json'};
 source.gzipHash=signed(directory,source.file,gzipSync(raw));source.bindingHash=signed(directory,source.bindingFile,JSON.stringify({approved:snapshotHash}));
 const evidence={sourceSHA256:snapshotHash,rowSHA256:wrongRow?'0'.repeat(64):sha(raw)};
 const predecessor={revision:1,contentHash:record.contentHash,sourceRows:[evidence]};
 const history={priorSnapshots:[{sha256:snapshotHash,bindingSHA256:source.bindingHash}],destinations:[{problemId:id,destinationRevision:2,destinationContentHash:successor.contentHash,predecessors:duplicate?[predecessor,predecessor]:[predecessor]}]};
 const historyHash=signed(directory,'history.json',JSON.stringify(history));
 const reviewHash=signed(directory,'new.json',JSON.stringify({approved:approvedHash,predecessorReceiptSHA256:historyHash}));
 const proof={version:1,sources:missingEvidence?[]:[source],reviewFile:'new.json',reviewHash,historyFile:'history.json',historyHash,predecessors:[{problemId:id,revision:1,contentHash:record.contentHash,destinationHash:successor.contentHash,destinationRevision:2,observations:[{source:snapshotHash,row:evidence.rowSHA256}]}]};
 const descriptor={version:1,file:'proof.json',sha256:signed(directory,'proof.json',JSON.stringify(proof)),count:1};
 return {descriptor,approvedHash,successor,record};
}

test('a hash-verified archived predecessor is retired immediately and has no pool membership',()=>{
 const dir=mkdtempSync(join(tmpdir(),'mc-archived-')),db=openDatabase(':memory:');
 try{
  const f=fixture(dir);const rows=archivedPredecessors(dir,f.descriptor,[f.successor],f.approvedHash);
  assert.deepEqual([...rows.values()],[f.record]);insertInactivePredecessor(db,rows.get(id+'@1'));
  assert.equal(db.prepare('SELECT state FROM bank_publication WHERE problem_id=? AND revision=1').get(id).state,'retired');
  assert.equal(db.prepare('SELECT count(*) AS n FROM bank_slots').get().n,0);
  assert.deepEqual([...archivedPredecessors(dir,undefined,[f.successor],f.approvedHash)],[]);
  assert.throws(()=>archivedPredecessors(dir,f.descriptor,[{...f.successor,contentHash:'9'.repeat(64)}],f.approvedHash),/differs from the successor/);
  writeFileSync(join(dir,'source.gz'),gzipSync('changed archive\n'));
  assert.throws(()=>archivedPredecessors(dir,f.descriptor,[f.successor],f.approvedHash),/Changed predecessor artifact/);
 }finally{db.close();rmSync(dir,{recursive:true,force:true});}
});
test('conflicting revision history, omitted archives and incorrect row hashes fail closed',()=>{
 const dir=mkdtempSync(join(tmpdir(),'mc-archived-invalid-'));
 try{
  for(const [options,pattern] of [[{duplicate:true},/Ambiguous archived predecessor/],[{wrongRow:true},/Unexpected earlier predecessor observation/],[{missingEvidence:true},/Invalid predecessor source set/]]){
   const f=fixture(dir,options);assert.throws(()=>archivedPredecessors(dir,f.descriptor,[f.successor],f.approvedHash),pattern);
  }
 }finally{rmSync(dir,{recursive:true,force:true});}
});
