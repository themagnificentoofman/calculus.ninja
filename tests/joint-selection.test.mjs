import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeJointCatalog,aggregateFeasibility,selectJointMetadata,decomposeRounds} from '../lib/server/joint-selection.mjs';
const mix={multipleChoice:1,freeResponse:1};
function catalog(masks,families){return{complete:true,sourceBinding:'isolated-synthetic',rows:masks.flatMap((mask,i)=>['mcq','frq'].flatMap((format,k)=>mask&(1<<k)?[{format,key:format+i,taskId:format+i,revision:1,lineage:'l'+i,family:'f'+families[i],weight:1,idea:'i',structure:'s',technique:'t',combination:'c'}]:[]))};}
// Independent round-by-round assignment, with no aggregate-cut formula.
function brute(masks,families,rounds){
 const used=new Set();
 function round(r){if(r===rounds)return true;for(let m=0;m<masks.length;m++)if(!used.has(m)&&(masks[m]&1)){used.add(m);for(let f=0;f<masks.length;f++)if(!used.has(f)&&(masks[f]&2)){used.add(f);if(round(r+1))return true;used.delete(f);}used.delete(m);}return false;}
 // This oracle requests two items/round, so construction cap two is automatic.
 return round(0);
}
test('joint exact feasibility matches independent assignments and every returned horizon preserves counts/lineages/caps',()=>{
 for(let code=0;code<243;code++){
  let n=code;const masks=Array.from({length:5},()=>{const v=n%3+1;n=Math.floor(n/3);return v;});
  const families=[0,0,1,1,2],c=catalog(masks,families),norm=normalizeJointCatalog(c);
  for(const rounds of [1,2]){
   const expected=brute(masks,families,rounds);assert.equal(aggregateFeasibility(norm,rounds,rounds,2*rounds).feasible,expected);
   if(!expected){assert.throws(()=>selectJointMetadata(c,mix,{rounds}),/infeasible/);continue;}
   const result=selectJointMetadata(c,mix,{rounds,rng:()=>.371,index:n=>n-1}),all=[result.selected,...result.futureWitness];
   assert.equal(new Set(all.flat().map(r=>r.lineage)).size,rounds*2);
   for(const rows of all){assert.deepEqual(rows.map(r=>r.format).sort(),['frq','mcq']);const counts=new Map();for(const r of rows)counts.set(r.family,(counts.get(r.family)||0)+1);assert(Math.max(...counts.values())<=2);}
  }
 }
});
test('joint caps reject a concentrated catalog even when raw format counts suffice',()=>{
 const c=catalog(Array(12).fill(3),Array(12).fill(0)),n=normalizeJointCatalog(c);
 assert.equal(aggregateFeasibility(n,4,4,4).feasible,false);
 assert.throws(()=>selectJointMetadata(c,{multipleChoice:2,freeResponse:2},{rounds:2}),/infeasible/);
});
test('all history weights including unused keys are strict bounded numbers',()=>{
 const c=catalog([3,3,3,3],[0,0,1,1]);
 for(const value of [NaN,null,undefined,'2',-1,Infinity,513,{}])for(const key of ['f:f0','i:unused'])assert.throws(()=>selectJointMetadata(c,mix,{rounds:1,historyWeights:new Map([[key,value]])}),/history weight/);
 for(const key of ['wrong:key','f:','f:a\u0000','i:'+'x'.repeat(1025)])assert.throws(()=>selectJointMetadata(c,mix,{rounds:1,historyWeights:new Map([[key,1]])}),/history weight/);
 for(const value of [0,512])assert.equal(selectJointMetadata(c,mix,{rounds:1,historyWeights:new Map([['f:f0',value]])}).selected.length,2);
});
test('decomposition validates its direct bounded boundary and explicit horizons are required',()=>{
 const c=catalog([3,3],[0,1]);assert.throws(()=>selectJointMetadata(c,mix),/horizon/);
 const rows=selectJointMetadata(c,mix,{rounds:1}).selected;
 for(const r of [0,-1,1.5,11,Infinity])assert.throws(()=>decomposeRounds(rows,mix,r),/horizon/);
 assert.throws(()=>decomposeRounds([rows[0],rows[0]],mix,1),/aggregate metadata/);
 assert.throws(()=>decomposeRounds([{...rows[0],format:'unknown'},rows[1]],mix,1),/aggregate metadata/);
});
test('decomposition owns aggregate rows before invoking a caller randomness callback',()=>{
 const rows=Array.from({length:3},(_,i)=>({format:'mcq',lineage:'l'+i,family:'f'+i}));let called=false;
 const result=decomposeRounds(rows,{multipleChoice:3,freeResponse:0},1,n=>{if(!called){called=true;for(const r of rows)r.family='same';rows[0].lineage=rows[1].lineage;}return n-1;});
 assert.equal(new Set(result.rounds[0].map(r=>r.lineage)).size,3);assert.equal(new Set(result.rounds[0].map(r=>r.family)).size,3);
});

import {selectJointMetadataV2} from '../lib/server/joint-selection-v2.mjs';
test('repair a two-item family collision while retaining exact counts and future capacity',()=>{
 const c=catalog([1,2,1,2,1,2],[0,0,0,0,1,1]);
 let fixed=0;
 for(let seed=1;seed<=40;seed++){
  const options=()=>{let x=seed;const rng=()=>((x=(Math.imul(x,1664525)+1013904223)>>>0)/4294967296);return {rng,index:n=>Math.floor(rng()*n),rounds:2};};
  const grouped={...mix,order:'mcq-first'},old=selectJointMetadata(c,grouped,options()),plan=selectJointMetadataV2(c,grouped,options());
  if(old.selected[0].family===old.selected[1].family)fixed++;
  assert.notEqual(plan.selected[0].family,plan.selected[1].family);
  assert.equal(new Set([plan.selected,...plan.futureWitness].flat().map(r=>r.lineage)).size,4);
  assert.deepEqual(plan.futureWitness[0].map(r=>r.format).sort(),['frq','mcq']);
  const uniform={...mix,order:'uniform'};
  assert.deepEqual(selectJointMetadataV2(c,uniform,options()),selectJointMetadata(c,uniform,options()));
 }
 assert(fixed>0);
 const tiny=catalog([1,2],[0,0]),unavoidable=selectJointMetadataV2(tiny,{...mix,order:'frq-first'},{rounds:1});
 assert.deepEqual(unavoidable.selected.map(r=>r.family),['f0','f0']);
});
