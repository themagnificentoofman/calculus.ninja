// Offline only. Install the resulting JSON alongside its exact reviewed registry.
import {readFileSync,writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {admissionKey,assertRegisteredFreeResponse} from '../../lib/bank/free-response-record.mjs';
import {assertNoHeldAssessmentRevisions} from '../../lib/bank/free-response-assessment-holds.mjs';
import {topics,difficulties} from '../../lib/server/questions-policy.mjs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

export async function compilePracticeCells(records,registry) {
 assertNoHeldAssessmentRevisions(registry);
 const cells={},seen=new Set();
 for(const record of records){
  const key=admissionKey(record);
  if(!Object.hasOwn(registry.records,key))continue;
  if(seen.has(key))throw Error('Duplicate reviewed practice record');
  seen.add(key);
  const entry=await assertRegisteredFreeResponse(record,registry);
  const {topic,difficulty}=record.task;
  if(!topics.includes(topic)||!difficulties.includes(difficulty)||Object.hasOwn(cells,entry.selectionHash))throw Error('Invalid or ambiguous practice cell');
  cells[entry.selectionHash]=[topic,difficulty];
 }
 if(seen.size!==Object.keys(registry.records).length)throw Error('Missing registered practice record');
 return {version:1,cells:Object.fromEntries(Object.entries(cells).sort(([a],[b])=>a.localeCompare(b)))};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [records,registry,out]=process.argv.slice(2);
 const result=await compilePracticeCells(JSON.parse(gunzipSync(readFileSync(records))),JSON.parse(readFileSync(registry)));
 writeFileSync(out,JSON.stringify(result)+'\n',{flag:'wx'});
 console.log(Object.keys(result.cells).length,'verified practice cells');
}
