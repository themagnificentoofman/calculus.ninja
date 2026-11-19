// The release gate always requires the full historical and per-menu audit for any restored positive data.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {reviewedM4Presentation} from './verify-m4-presentation.mjs';
const read=path=>JSON.parse(readFileSync(path));
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
export function checkSourcePresentation(){
  const corrections=read('lib/server/solution-reviews/tangent-intercepts.json');
  const admissions=read('lib/server/free-response-admissions.json');
  const menus=read('lib/server/solution-reviews/fr-menus.json');
  const study=read('lib/server/study-admissions.json');
  if ([corrections,admissions.records,menus,study.documents].some(v=>Object.keys(v).length) || process.env.CALCULUS_MC_MENU_EVIDENCE) return reviewedM4Presentation();
  // This source-only profile has zero positive release entries. Check its negative data and the exact public overrides.
  const amendment=read('docs/bank/problem-quality/presentation-m4-amendment.json');
  assert.equal(hash(amendment.priorManifest),amendment.priorSHA256);
  assert.equal(hash('scripts/bank/solution-review/compare-m4.mjs'),amendment.evidence['scripts/bank/solution-review/compare-m4.mjs']);
  assert.equal(hash('lib/server/solution-reviews/p-series-classification.json'),amendment.evidence['lib/server/solution-reviews/p-series-classification.json']);
  assert.deepEqual(Object.keys(amendment.overrides).sort(), ['app/globals.css','components/ProblemStatement.tsx','lib/server/solution-presentation.mjs']);
  for(const [path,claims] of Object.entries(amendment.overrides))assert.equal(hash(path),claims.sha256);
  assert.deepEqual(read('scripts/bank/quality/fr-menu-lineage.json'),{});
  assert.deepEqual(read('scripts/bank/quality/fr-menu-archive.json').records,{});
  assert.deepEqual(JSON.parse(gunzipSync(readFileSync('scripts/bank/quality/fr-menu-reviews.json.gz'))),{});
  assert.deepEqual(read('lib/bank/reviewed-technique-tags.json'),{version:1,byContentHash:{},sets:[]});
  assert.deepEqual(read('lib/server/study-practice-activation.json'),{version:1,control:null,formats:{}});
  const binding=read('scripts/bank/quality/fr-menu-bindings.json');assert.equal(binding.count,0);assert.equal(binding.version,'reviewed-fr-menus-v1');
  assert.equal(hash('scripts/bank/quality/fr-menu-reviews.json.gz'),binding.sha256);
  console.log('Verified inactive public presentation; positive data requires the complete release review.');
  return amendment.overrides;
}
