import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {canonical} from '../../../lib/bank/compact-codec.mjs';
const h=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=path=>JSON.parse(readFileSync(path));
export function reviewedM4Presentation(){
 const manifest=json('docs/bank/problem-quality/presentation-m4-amendment.json');
 assert.equal(manifest.priorManifest,'docs/bank/problem-quality/presentation-final-review-amendment.json');
 assert.equal(h(readFileSync(manifest.priorManifest)),manifest.priorSHA256);
 for(const [file,hash] of Object.entries(manifest.evidence))assert.equal(h(readFileSync(file)),hash,'M4 presentation evidence changed: '+file);
 const comparison=json(manifest.historicalComparison);
 const names={'app/globals.css':['baselineStylesheet','currentStylesheet'],'components/ProblemStatement.tsx':['baselineStatementComponent','currentStatementComponent'],'lib/server/solution-presentation.mjs':['baselineModule','currentModule']};
 assert.deepEqual(Object.keys(manifest.overrides).sort(),Object.keys(names).sort());
 for(const [file,[before,after]] of Object.entries(names)){
  const v=manifest.overrides[file];assert.equal(v.priorSha256,comparison[before]);assert.equal(v.sha256,comparison[after]);assert(v.reviewedChange);
 }
 assert.equal(comparison.total,106596);assert.equal(comparison.unchanged,106576);
 const corrections=new Map();
 for(const [file,type] of [['tangent-intercepts','intercept'],['p-series-classification','series']])
  for(const [key,entry] of Object.entries(json('lib/server/solution-reviews/'+file+'.json')))corrections.set(key,{entry,type});
 assert.equal(corrections.size,20);assert.equal(comparison.changed.length,20);
 for(const row of comparison.changed){
  const key=row.id+'@'+row.revision,match=corrections.get(key);assert(match,key);
  assert.equal(row.type,match.type);assert.equal(row.hash,match.entry.sourceContentHash);
  assert.equal(row.stepDigest,h(JSON.stringify(match.entry.steps)));assert.equal(row.answer,match.entry.steps.at(-1));
  assert(row.proof&&row.savedSnapshotPreserved);corrections.delete(key);
 }
 assert.equal(corrections.size,0);
 // A menu registration can select only the exact previously adjudicated item's existing solution.
 const binding=json('scripts/bank/quality/fr-menu-bindings.json');
 assert.equal(binding.version,'reviewed-fr-menus-v1');
 const menusFile='lib/server/solution-reviews/fr-menus.json';
 const menus=json(menusFile);
 const privatePath=process.env.CALCULUS_MC_MENU_EVIDENCE;
 assert.equal(Object.keys(menus).length,binding.count);
 if(binding.presentation){
  assert.equal(binding.presentation.format,'source-bound-menu-projection-v1');
  assert.equal(h(readFileSync(menusFile)),binding.presentation.sha256);
  assert(/^[a-f0-9]{64}$/.test(binding.sha256));
  for(const [key,entry] of Object.entries(menus)){
   assert.deepEqual(Object.keys(entry).sort(),['auditId','revision','sourceContentHash']);
   assert(Number.isSafeInteger(entry.revision)&&entry.revision>0&&key.endsWith('@'+entry.revision));
   assert(/^[a-f0-9]{64}$/.test(entry.sourceContentHash)&&/^choice-review\/[a-f0-9]{64}$/.test(entry.auditId));
  }
  if(!privatePath)return manifest.overrides;
 }
 const source=readFileSync(privatePath||'scripts/bank/quality/fr-menu-reviews.json.gz');
 verifyPrivateMenuProjection(menus,binding,source);
 return manifest.overrides;
}

/** Verify the actual private math/review source before issuing a presentation digest. */
export function verifyPrivateMenuProjection(menus,binding,source){
 assert.equal(binding.version,'reviewed-fr-menus-v1');
 assert.equal(h(source),binding.sha256);
 const evidence=JSON.parse(gunzipSync(source));
 assert.equal(Object.keys(menus).length,binding.count);
 assert.deepEqual(Object.keys(menus).sort(),Object.keys(evidence).sort());
 for(const [key,entry] of Object.entries(menus)){
  const match=evidence[key],edit=match.editorial;
  assert.equal(edit.decision,'qualified');assert.deepEqual(edit.holds,[]);assert.equal(match.mathematics.status,'mathematical-pass');
  assert.equal(edit.mcSourceHash,match.mathematics.mcSourceHash);
  assert.equal(key,edit.id+'@'+entry.revision);assert(/^[0-9a-f]{64}$/.test(match.contentHash));
  assert.deepEqual(entry,{revision:entry.revision,sourceContentHash:match.contentHash,auditId:'choice-review/'+h(canonical(edit)+'\n')});
 }
}
