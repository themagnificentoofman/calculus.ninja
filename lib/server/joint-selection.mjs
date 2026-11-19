// Private finite joint-selection algorithm. No payloads or pool admission.
// Input rows must be current, source-verified and filtered by the catalog layer.
// Derived from independently reviewed joint-selection-prototype/v2; owner delta
// validates every history weight and the direct decomposition boundary.
import {boundedJsonSnapshot} from './bounded-json-snapshot.mjs';
export const LIMITS=Object.freeze({rows:12000,lineages:12000,families:12000,roundSize:20,horizon:10,textBytes:2048});
const enc=new TextEncoder(),assert=(v,m)=>{if(!v)throw Error(m);};
const text=v=>typeof v==='string'&&v.length>0&&v.length<=256&&!/[\u0000-\u001f\u007f]/.test(v)&&enc.encode(v).length<=256;
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export function cryptoIndex(n){assert(Number.isInteger(n)&&n>=1&&n<=65536,'Unsupported integer draw bound');const limit=Math.floor(4294967296/n)*n;let x;do{x=crypto.getRandomValues(new Uint32Array(1))[0];}while(x>=limit);return x%n;}
const cryptoFloat=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;
function shuffled(items,index){const out=[...items];for(let i=out.length-1;i>0;i--){const j=index(i+1);assert(Number.isInteger(j)&&j>=0&&j<=i,'Invalid integer randomness');[out[i],out[j]]=[out[j],out[i]];}return out;}
function weighted(items,score,rng){assert(items.length,'Empty weighted choice');const weights=items.map(x=>score(x)),total=weights.reduce((a,b)=>a+b,0),r=rng();assert(weights.every(x=>Number.isFinite(x)&&x>0)&&Number.isFinite(r)&&r>=0&&r<1,'Invalid weighted randomness or score');let value=r*total;for(let i=0;i<items.length;i++){value-=weights[i];if(value<0)return items[i];}return items.at(-1);}
const fmtBit=f=>f==='mcq'?1:2;
export function requestCounts(mix){assert(mix&&Number.isInteger(mix.multipleChoice)&&mix.multipleChoice>=0&&Number.isInteger(mix.freeResponse)&&mix.freeResponse>=0&&mix.multipleChoice+mix.freeResponse>=1&&mix.multipleChoice+mix.freeResponse<=LIMITS.roundSize,'Invalid requested counts');return [mix.multipleChoice,mix.freeResponse];}

/** One lineage can have one current choice in each format. Format records are
 * not two independent exposures. Conflicting construction ownership rejects. */
export function normalizeJointCatalog(catalog,blocked=new Set()){
 assert(catalog?.complete===true&&typeof catalog.sourceBinding==='string'&&catalog.sourceBinding,'A complete source-bound catalog is required');
 assert(Array.isArray(catalog.rows)&&catalog.rows.length<=LIMITS.rows,'Unsupported complete joint catalog size');
 assert(blocked instanceof Set,'Resolved retained history IDs required');
 const latest=new Map(),keys=new Map(),maxRevision=new Map();
 for(const input of catalog.rows){
  assert(input&&typeof input==='object'&&!Array.isArray(input),'Invalid catalog metadata');
  const {format,key,taskId,revision,lineage,family,weight,idea,structure,technique,combination}=input;
  assert(['mcq','frq'].includes(format)&&[key,taskId,lineage,family,idea,structure,technique,combination].every(text)&&Number.isSafeInteger(revision)&&revision>0&&Number.isFinite(weight)&&weight>0&&weight<=1000,'Invalid catalog identity/features');
  const row={format,key,taskId,revision,lineage,family,weight,idea,structure,technique,combination};
  assert(enc.encode(JSON.stringify(row)).length<=LIMITS.textBytes,'Oversized catalog row');
  if(keys.has(key)){assert(JSON.stringify(keys.get(key))===JSON.stringify(row),'Conflicting duplicate record key');continue;}keys.set(key,row);
  const taskKey=format+':'+taskId;maxRevision.set(taskKey,Math.max(revision,maxRevision.get(taskKey)??0));
 }
 for(const row of keys.values())if(row.revision===maxRevision.get(row.format+':'+row.taskId)){
  const taskKey=row.format+':'+row.taskId;assert(!latest.has(taskKey),'Ambiguous same-format current task record');latest.set(taskKey,row);
 }
 // Resolve known current/historical input identities to all of their supplied
 // lineage aliases as well. Owner DB resolution is still required for aliases
 // absent from the current eligible catalog (including the other format).
 const resolvedBlocked=new Set(blocked);for(const row of keys.values())if(blocked.has(row.taskId))resolvedBlocked.add(row.lineage);
 const groups=new Map();
 for(const row of latest.values()){
  if(resolvedBlocked.has(row.taskId)||resolvedBlocked.has(row.lineage))continue;
  let group=groups.get(row.lineage);
  if(!group){group={lineage:row.lineage,family:row.family,choices:{}};groups.set(row.lineage,group);}
  assert(group.family===row.family,'Conflicting canonical construction for one lineage');
  const old=group.choices[row.format];
  // Equivalent same-format tasks are one exposure opportunity, matching current
  // revision preference; stable key breaks a tie between distinct task IDs.
  if(!old||row.revision>old.revision||row.revision===old.revision&&row.key<old.key)group.choices[row.format]=row;
 }
 const lineages=[...groups.values()].sort((a,b)=>a.family.localeCompare(b.family)||a.lineage.localeCompare(b.lineage));
 for(const g of lineages)g.mask=(g.choices.mcq?1:0)|(g.choices.frq?2:0);
 assert(lineages.length<=LIMITS.lineages&&new Set(lineages.map(g=>g.family)).size<=LIMITS.families,'Unsupported normalized joint catalog');
 return freeze({sourceBinding:catalog.sourceBinding,lineages,rawRows:catalog.rows.length});
}
function familyState(lineages,cap){const map=new Map();for(const g of lineages){let f=map.get(g.family);if(!f){f={id:g.family,counts:[0,0,0,0],cap,used:0,bins:[[],[],[],[]]};map.set(g.family,f);}f.counts[g.mask]++;f.bins[g.mask].push(g);}return [...map.values()];}
export function familyRank(counts,cap){const [,a,b,d]=counts;return [Math.min(cap,a+d),Math.min(cap,b+d),Math.min(cap,a+b+d)];}
const addRank=(a,b,sign=1)=>a.map((v,i)=>v+sign*b[i]);
const demandFits=(r,m,f)=>m>=0&&f>=0&&m<=r[0]&&f<=r[1]&&m+f<=r[2];
export function aggregateFeasibility(normalized,multipleChoice,freeResponse,cap){
 assert(Number.isInteger(multipleChoice)&&multipleChoice>=0&&Number.isInteger(freeResponse)&&freeResponse>=0&&Number.isInteger(cap)&&cap>=0,'Invalid aggregate demand');
 const families=familyState(normalized.lineages,cap),rank=families.reduce((sum,f)=>addRank(sum,familyRank(f.counts,f.cap)),[0,0,0]);
 return {feasible:demandFits(rank,multipleChoice,freeResponse),rank,demand:[multipleChoice,freeResponse],familyCap:cap};
}
export function horizonCapacity(normalized,mix,maxHorizon=LIMITS.horizon){
 const [m,f]=requestCounts(mix);assert(Number.isInteger(maxHorizon)&&maxHorizon>=1&&maxHorizon<=LIMITS.horizon,'Unsupported horizon');
 const checks=[];for(let r=1;r<=maxHorizon;r++)checks.push({rounds:r,...aggregateFeasibility(normalized,m*r,f*r,2*r)});
 return {maxFeasible:checks.filter(c=>c.feasible).at(-1)?.rounds??0,checks};
}

/** Two Fenwick prefix sums represent each family weight A+B*p, where
 * p is the remaining MC proportion. The sum is nonnegative for 0<=p<=1.
 * Rebuild only when a global feasibility regime changes; otherwise update
 * only the consumed family. No payloads or historical identities live here. */
class FamilyWeights {
 constructor(families){this.families=families;this.a=new Float64Array(families.length+1);this.b=new Float64Array(families.length+1);}
 build(){this.a.fill(0);this.b.fill(0);for(let i=1;i<this.a.length;i++){this.a[i]+=this.families[i-1].coefficient[0];this.b[i]+=this.families[i-1].coefficient[1];const j=i+(i&-i);if(j<this.a.length){this.a[j]+=this.a[i];this.b[j]+=this.b[i];}}}
 update(index,old){const next=this.families[index].coefficient;for(let i=index+1;i<this.a.length;i+=i&-i){this.a[i]+=next[0]-old[0];this.b[i]+=next[1]-old[1];}}
 total(p){let a=0,b=0;for(let i=this.families.length;i;i-=i&-i){a+=this.a[i];b+=this.b[i];}return a+p*b;}
 choose(p,draw){const total=this.total(p);if(!Number.isFinite(total)||total<=0)return -1;let target=draw*total,index=0,bit=1;while(bit*2<=this.families.length)bit*=2;for(;bit;bit=Math.floor(bit/2)){const next=index+bit;if(next<=this.families.length){const mass=this.a[next]+p*this.b[next];if(mass<=target){index=next;target-=mass;}}}return index;}
}

/** Select a joint horizon with exact cut feasibility and normalized family
 * probability. Only the selected family's live lineages are scanned. */
export function chooseAggregate(normalized,mix,rounds,{rng=cryptoFloat,historyWeights=new Map()}={}){
 const [perM,perF]=requestCounts(mix);assert(Number.isInteger(rounds)&&rounds>=1&&rounds<=LIMITS.horizon,'Unsupported horizon');
 assert(historyWeights instanceof Map&&historyWeights.size<=2560,'Unsupported resolved history weights');const retainedWeights=new Map(historyWeights);
 for(const [key,value]of retainedWeights)assert(typeof key==='string'&&/^[fistc]:[^\u0000-\u001f\u007f]+$/.test(key)&&enc.encode(key).length<=1026&&typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=512,'Invalid history weight');
 let m=perM*rounds,n=perF*rounds;const families=familyState(normalized.lineages,2*rounds),selected=[];let rank=families.reduce((sum,f)=>addRank(sum,familyRank(f.counts,f.cap)),[0,0,0]);
 assert(demandFits(rank,m,n),'Requested exact joint horizon is infeasible');
 let scoreEvaluations=0,candidateVisits=0,cutChecks=0,familySummaryVisits=0,regimeRebuilds=0,fallbackFamilyScans=0,numericTreeRebuilds=0,summaryScoreVisits=0;
 const score=row=>{
  scoreEvaluations++;const h=retainedWeights,penalty=.9*(h.get('f:'+row.family)??0)+.45*(h.get('i:'+row.idea)??0)+.25*(h.get('s:'+row.structure)??0)+.15*(h.get('t:'+row.technique)??0)+.15*(h.get('c:'+row.combination)??0);
  assert(Number.isFinite(penalty)&&penalty>=0,'Invalid history weight');return Math.max(1e-8,row.weight*Math.exp(-Math.min(8,penalty*.16)));
 };
 // Cached score sums let the family average depend affinely on p=m/(m+n).
 for(const [index,f]of families.entries()){
  f.index=index;f.sums=Array.from({length:4},()=>[0,0]);f.coefficient=[0,0];f.options=[[],[],[],[]];
  for(let mask=1;mask<=3;mask++)f.bins[mask]=f.bins[mask].map(group=>{const scores={};for(const format of ['mcq','frq'])if(group.choices[format]){scores[format]=score(group.choices[format]);f.sums[mask][format==='mcq'?0:1]+=scores[format];}return {group,scores};});
 }
 const state=()=>[m>0,n>0,rank[0]===m,rank[1]===n].join(':');
 function summarize(f){
  familySummaryVisits++;let a=0,b=0,count=0;f.options=[[],[],[],[]];
  if(f.cap){const old=familyRank(f.counts,f.cap);
   for(let mask=1;mask<=3;mask++)if(f.counts[mask]){
    const counts=[...f.counts];counts[mask]--;const nextRank=addRank(addRank(rank,old,-1),familyRank(counts,f.cap-1)),formats=[];
    for(const [format,bit,need]of [['mcq',1,m],['frq',2,n]])if((mask&bit)&&need){cutChecks++;if(demandFits(nextRank,m-Number(bit===1),n-Number(bit===2)))formats.push(format);}
    f.options[mask]=formats;if(!formats.length)continue;count+=f.counts[mask];
    if(formats.length===2){a+=f.sums[mask][1];b+=f.sums[mask][0]-f.sums[mask][1];}
    else a+=f.sums[mask][formats[0]==='mcq'?0:1];
   }
  }
  const factor=count?Math.exp(-f.used/(2*rounds))/count:0;f.coefficient=[a*factor,b*factor];
 }
 const tree=new FamilyWeights(families);let regime=state();const rebuild=()=>{regimeRebuilds++;families.forEach(summarize);tree.build();};rebuild();
 while(m+n){
  const p=m/(m+n),draw=rng();assert(Number.isFinite(draw)&&draw>=0&&draw<1,'Invalid weighted randomness or score');let family=families[tree.choose(p,draw)];
  // Tiny cancellation residue can remain after a floating-point tree update.
  // Never let it select a zero-capacity family; this bounded fallback retains
  // feasibility. Default integer randomness and tested score ranges did not
  // trigger it. It is reported separately and must be profiled before serving.
  if(!family||!(family.coefficient[0]+p*family.coefficient[1]>0)||!family.options.some(x=>x.length)){
   numericTreeRebuilds++;tree.build();family=families[tree.choose(p,draw)];
   if(!family||!(family.coefficient[0]+p*family.coefficient[1]>0)||!family.options.some(x=>x.length)){
    fallbackFamilyScans++;const live=families.filter(f=>f.options.some(x=>x.length));family=weighted(live,f=>Math.max(Number.MIN_VALUE,f.coefficient[0]+p*f.coefficient[1]),()=>draw);
   }
  }
  const lineages=[];
  for(let mask=1;mask<=3;mask++){
   const formats=family.options[mask];if(!formats.length)continue;
   for(const entry of family.bins[mask]){candidateVisits++;const weights=formats.map(format=>entry.scores[format]*(format==='mcq'?m:n)),mass=weights.reduce((a,b)=>a+b,0)/formats.reduce((a,format)=>a+(format==='mcq'?m:n),0);lineages.push({entry,formats,weights,mass});}
  }
  assert(lineages.length,'Cached family feasibility contradiction');
  const chosen=weighted(lineages,x=>x.mass,rng),actualFormat=chosen.formats.length===1?chosen.formats[0]:weighted(chosen.formats,f=>chosen.weights[chosen.formats.indexOf(f)],rng),group=chosen.entry.group,oldRank=familyRank(family.counts,family.cap),oldCoefficient=family.coefficient;
  family.counts[group.mask]--;family.cap--;family.used++;family.bins[group.mask].splice(family.bins[group.mask].indexOf(chosen.entry),1);
  // Sum the small affected family from live positive scores, avoiding loss
  // of a tiny remaining score when a much larger chosen score is subtracted.
  family.sums=Array.from({length:4},()=>[0,0]);for(let mask=1;mask<=3;mask++)for(const entry of family.bins[mask]){summaryScoreVisits++;for(const format of ['mcq','frq'])if(entry.scores[format]!==undefined)family.sums[mask][format==='mcq'?0:1]+=entry.scores[format];}
  rank=addRank(addRank(rank,oldRank,-1),familyRank(family.counts,family.cap));if(actualFormat==='mcq')m--;else n--;
  selected.push({...group.choices[actualFormat],lineage:group.lineage,family:group.family});
  assert(demandFits(rank,m,n),'Feasibility invariant failed');
  if(m+n){const next=state();if(next!==regime){regime=next;rebuild();}else{summarize(family);tree.update(family.index,oldCoefficient);}}
 }
 assert(regimeRebuilds<=5,'Unexpected number of global feasibility regimes');
 assert(candidateVisits<=2*rounds*normalized.lineages.length&&summaryScoreVisits<=2*rounds*normalized.lineages.length,'Selected-family scan bound exceeded');
 return {selected,diagnostics:{candidateVisits,cutChecks,scoreEvaluations,familySummaryVisits,regimeRebuilds,fallbackFamilyScans,numericTreeRebuilds,summaryScoreVisits,aggregateCount:selected.length,rounds,relaxation:'none'}};
}

/** Construct exact per-round counts via regular bipartite edge decomposition.
 * At most 200 real edges, 200 left vertices and 2000 regularized edges for R<=10.
 * The independent verifier checks all returned assignments and matching edges. */
export function decomposeRounds(aggregate,mix,rounds,index=cryptoIndex){
 assert(Number.isInteger(rounds)&&rounds>=1&&rounds<=LIMITS.horizon,'Unsupported horizon');
 aggregate=boundedJsonSnapshot(aggregate,{maxBytes:200*LIMITS.textBytes+256,maxNodes:6000,maxDepth:3});
 assert(Array.isArray(aggregate)&&aggregate.length<=200&&aggregate.every(row=>row&&['mcq','frq'].includes(row.format)&&text(row.family)&&text(row.lineage))&&new Set(aggregate.map(row=>row.lineage)).size===aggregate.length,'Invalid aggregate metadata');
 const [m,f]=requestCounts(mix),size=m+f;assert(aggregate.length===size*rounds,'Wrong aggregate size');
 const selected=aggregate.map((row,id)=>({id,row,left:null,right:null})),byFamily=new Map();
 for(const edge of selected){const list=byFamily.get(edge.row.family)||[];list.push(edge);byFamily.set(edge.row.family,list);}
 let leftCount=0;
 for(const list of byFamily.values()){
  assert(list.length<=2*rounds,'Aggregate construction exceeds horizon cap');const order=shuffled(list,index);
  for(let start=0;start<order.length;start+=rounds){for(const edge of order.slice(start,start+rounds))edge.left=leftCount;leftCount++;}
 }
 let rightCount=0;
 for(const [format,perRound]of [['mcq',m],['frq',f]]){
  const list=shuffled(selected.filter(e=>e.row.format===format),index);assert(list.length===perRound*rounds,'Wrong aggregate format count');
  for(let start=0;start<list.length;start+=rounds){for(const edge of list.slice(start,start+rounds))edge.right=rightCount;rightCount++;}
 }
 assert(rightCount===size&&leftCount>=rightCount,'Invalid bipartite split');
 const edges=[...selected],leftDegree=Array(leftCount).fill(0);for(const e of edges)leftDegree[e.left]++;
 let dummyRight=rightCount,dummyDegree=0;
 for(let l=0;l<leftCount;l++)while(leftDegree[l]<rounds){assert(dummyRight<leftCount,'Regularization overflow');edges.push({id:edges.length,row:null,left:l,right:dummyRight});leftDegree[l]++;if(++dummyDegree===rounds){dummyRight++;dummyDegree=0;}}
 assert(dummyRight===leftCount&&dummyDegree===0,'Unfinished regularization');
 const live=new Set(edges.map(e=>e.id)),out=[];let augmentVisits=0;
 for(let color=0;color<rounds;color++){
  const adjacency=Array.from({length:leftCount},()=>[]);for(const e of edges)if(live.has(e.id))adjacency[e.left].push(e.id);for(let i=0;i<leftCount;i++)adjacency[i]=shuffled(adjacency[i],index);
  const rightMatch=Array(leftCount).fill(null);
  function augment(left,seen){for(const edgeId of adjacency[left]){augmentVisits++;const edge=edges[edgeId];if(seen.has(edge.right))continue;seen.add(edge.right);const old=rightMatch[edge.right];if(old===null||augment(edges[old].left,seen)){rightMatch[edge.right]=edgeId;return true;}}return false;}
  for(const left of shuffled(Array.from({length:leftCount},(_,i)=>i),index))assert(augment(left,new Set()),'Regular bipartite perfect matching missing');
  const real=[];for(const id of rightMatch){assert(id!==null,'Incomplete matching');live.delete(id);if(edges[id].row)real.push(edges[id].row);}
  assert(real.length===size&&real.filter(r=>r.format==='mcq').length===m,'Incorrect decomposed round');out.push(real);
 }
 assert(live.size===0,'Unconsumed decomposition edge');
 return {rounds:out,diagnostics:{verticesPerSide:leftCount,regularizedEdges:edges.length,augmentVisits}};
}
export function selectJointMetadata(catalog,mix,{rounds,blocked=new Set(),historyWeights=new Map(),rng=cryptoFloat,index=cryptoIndex}={}){
 const request={multipleChoice:mix?.multipleChoice,freeResponse:mix?.freeResponse};requestCounts(request);
 const normalized=normalizeJointCatalog(catalog,blocked),aggregate=chooseAggregate(normalized,request,rounds,{rng,historyWeights}),schedule=decomposeRounds(aggregate.selected,request,rounds,index),current=index(rounds);
 assert(Number.isInteger(current)&&current>=0&&current<rounds,'Invalid current-round draw');
 return freeze({selected:schedule.rounds[current],futureWitness:schedule.rounds.filter((_,i)=>i!==current),horizonAggregate:aggregate.selected,sourceBinding:normalized.sourceBinding,diagnostics:{...aggregate.diagnostics,...schedule.diagnostics,currentColor:current,rawRows:normalized.rawRows,lineages:normalized.lineages.length}});
}
