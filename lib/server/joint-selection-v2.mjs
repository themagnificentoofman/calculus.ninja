// The original joint sampler supplies the random horizon. With grouped
// presentation, a two-item block can receive both copies of one construction.
// Repair an avoidable contact only when the remaining horizon still fits.
import {selectJointMetadata,normalizeJointCatalog,chooseAggregate,decomposeRounds,familyRank,cryptoIndex} from './joint-selection.mjs';
import {orderedFamilyBlocks,adjacentFamilyContacts} from '../round-question-config.mjs';
const family=row=>row.family;
function contacts(rows,first){
 const ordered=orderedFamilyBlocks(rows.filter(r=>r.format===first),rows.filter(r=>r.format!==first),family);
 return adjacentFamilyContacts(ordered,family);
}
function familyCounts(rows){
 const counts=new Map();
 for(const row of rows)counts.set(row.family,(counts.get(row.family)??0)+1);
 return counts;
}
function exchange(rows,normalized,first,mix,rounds,index){
 const original=contacts(rows,first);
 if(!original)return false;
 const cap=2*(rounds-1),current=new Set(rows.map(row=>row.lineage)),counts=familyCounts(rows);
 const byId=new Map(),bins=new Map(),rank=[0,0,0];
 for(const group of normalized.lineages){
  byId.set(group.lineage,group);
  if(!bins.has(group.family))bins.set(group.family,[0,0,0,0]);
  if(!current.has(group.lineage))bins.get(group.family)[group.mask]++;
 }
 for(const bin of bins.values())familyRank(bin,cap).forEach((v,i)=>rank[i]+=v);
 const demand=[mix.multipleChoice,mix.freeResponse,mix.multipleChoice+mix.freeResponse].map(x=>x*(rounds-1));
 const change=(id,mask,delta)=>{
  const bin=bins.get(id),changed=[...bin];changed[mask]+=delta;
  const before=familyRank(bin,cap);
  return familyRank(changed,cap).map((v,i)=>v-before[i]);
 };
 const start=index(normalized.lineages.length),groups=normalized.lineages;
 if(!Number.isInteger(start)||start<0||start>=groups.length)throw Error('Invalid exchange draw');
 for(const [position,old] of rows.entries()){
  if(counts.get(old.family)<2)continue;
  const released=change(old.family,byId.get(old.lineage).mask,1),seen=new Set();
  for(let offset=0;offset<groups.length;offset++){
   const group=groups[(offset+start)%groups.length],candidate=group.choices[old.format];
   if(!candidate||current.has(group.lineage)||group.family===old.family||(counts.get(group.family)??0)>=2)continue;
   // For a given family/mask, ordering and every residual rank cut agree.
   const equivalence=JSON.stringify([group.family,group.mask]);
   if(seen.has(equivalence))continue;
   seen.add(equivalence);
   const consumed=change(group.family,group.mask,-1);
   if(demand.some((v,i)=>rank[i]+released[i]+consumed[i]<v))continue;
   const next=[...rows];next[position]=candidate;
   if(contacts(next,first)<original){rows[position]=candidate;return true;}
  }
 }
 return false;
}
export function selectJointMetadataV2(catalog,mix,options={}){
 const plan=selectJointMetadata(catalog,mix,options);
 if(mix.order==='uniform')return plan;
 const first=mix.order==='frq-first'?'frq':'mcq',selected=[...plan.selected];
 if(!contacts(selected,first))return plan;
 const {blocked=new Set(),rounds,index=cryptoIndex}=options,normalized=normalizeJointCatalog(catalog,blocked);
 let exchanges=0;
 while(exchange(selected,normalized,first,mix,rounds,index))exchanges++;
 if(!exchanges)return plan;
 const consumed=new Set(selected.map(q=>q.lineage));
 const remaining={...normalized,lineages:normalized.lineages.filter(g=>!consumed.has(g.lineage))};
 const future=rounds>1?chooseAggregate(remaining,mix,rounds-1,options).selected:[];
 const witness=rounds>1?decomposeRounds(future,mix,rounds-1,index).rounds:[];
 return {...plan,selected,futureWitness:witness,horizonAggregate:[...selected,...future],diagnostics:{...plan.diagnostics,orderingExchanges:exchanges}};
}
