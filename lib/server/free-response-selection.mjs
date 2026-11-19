// Private selection foundation. Not connected to gameplay or a publication
// pointer: passing these checks does not qualify a real pool or release.
import defaultAdmissions from './free-response-admissions.json' with {type:'json'};
import {eligibleFreeResponseCatalog,freeResponseEligibilityPolicy,MAX_FR_REGISTRATIONS} from './free-response-eligibility.mjs';
import {freeResponseSelectionHash} from '../bank/free-response-metadata.mjs';
import {decodeFreeResponseRecord} from '../bank/free-response-codec.mjs';
import {exposureWeight,MAX_EXPOSURES,MAX_SELECTION_HISTORY_IDENTITIES} from '../bank/exposure.ts';
import {reservationSnapshot,reservedIdentities} from '../bank/issuance-reservations.mjs';
import {historicalSelectionFeatures} from './selection-vocabulary.mjs';
import {BankUnavailableError} from './bank-selection.ts';

const assert=(condition,message)=>{if(!condition)throw Error(message);};
const random=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;
const unavailable=()=>new BankUnavailableError('There are not enough unseen, approved free-response problems for this round and these filters. Multiple-choice practice remains available.');
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const encoder=new TextEncoder();
const boundedText=(value,max)=>typeof value==='string'&&value.length>0&&value.length<=max&&!/[\u0000-\u001f\u007f]/.test(value)&&encoder.encode(value).length<=max;
const plainFields=(value,allowed)=>{
 if(!value||typeof value!=='object'||![Object.prototype,null].includes(Object.getPrototypeOf(value)))return false;
 return Reflect.ownKeys(value).every(key=>typeof key==='string'&&allowed.includes(key)&&Object.hasOwn(Object.getOwnPropertyDescriptor(value,key),'value')&&Object.getOwnPropertyDescriptor(value,key).enumerable);
};
const denseArray=(value,max)=>{
 if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype||value.length>max)return false;
 const keys=Reflect.ownKeys(value);return keys.length===value.length+1&&keys.every(key=>key==='length'||typeof key==='string'&&/^(0|[1-9][0-9]*)$/.test(key)&&Number(key)<value.length&&Object.hasOwn(Object.getOwnPropertyDescriptor(value,key),'value')&&Object.getOwnPropertyDescriptor(value,key).enumerable);
};
export function assertFreeResponseHistory(recent){
 assert(plainFields(recent,['version','exposures','problems','families','issuanceGeneration','reservations','reservationOverflowUntil']),'Unsupported exposure history shape');
 if(Object.hasOwn(recent,'reservations')||Object.hasOwn(recent,'reservationOverflowUntil'))reservationSnapshot(recent,0);
 assert(recent.issuanceGeneration===undefined||Number.isSafeInteger(recent.issuanceGeneration)&&recent.issuanceGeneration>=0,'Invalid issuance generation');
 assert(recent.version===undefined||recent.version===2,'Unsupported exposure history version');
 for(const key of ['problems','families'])if(recent[key]!==undefined){
  assert(denseArray(recent[key],MAX_EXPOSURES),'Unsupported historical preferences');
  for(const value of recent[key])assert(boundedText(value,256),'Invalid historical preference');
 }
 if(recent.version!==2){assert(recent.exposures===undefined,'Unversioned exposure history');return;}
 assert(denseArray(recent.exposures,MAX_EXPOSURES),'Unsupported exposure history');
 for(const e of recent.exposures){
  assert(plainFields(e,['roundId','problemId','lineageId','familyId','idea','structure','technique','combination','stage','at']),'Invalid exposure record');
  for(const key of ['roundId','problemId','familyId'])assert(boundedText(e[key],256),'Invalid exposure identity');
  if(e.lineageId!==undefined)assert(boundedText(e.lineageId,256),'Invalid exposure lineage');
  let bytes=0;for(const key of ['idea','structure','technique','combination']){assert(boundedText(e[key],1024),'Invalid exposure vocabulary');bytes+=encoder.encode(e[key]).length;}
  assert(bytes<=4096&&['issued','displayed','attempted'].includes(e.stage)&&Number.isFinite(e.at)&&e.at>=0&&e.at<=8640000000000000,'Invalid exposure stage or time');
 }
}
const weighted=(items,score,rng)=>{
 const weights=items.map(item=>Math.max(1e-8,score(item))),total=weights.reduce((a,b)=>a+b,0),draw=rng();
 assert(Number.isFinite(draw)&&draw>=0&&draw<1,'Invalid selection randomness');let value=draw*total;
 for(let i=0;i<items.length;i++){value-=weights[i];if(value<0)return items[i];}return items.at(-1);
};

/** Same stage lifetimes and reviewed historical vocabulary as MC. Retain both
 * identity and lineage so a later corrected alias cannot erase an encounter. */
export function freeResponseHistory(recent={},now=Date.now()){
 assertFreeResponseHistory(recent);
 assert(Number.isFinite(now),'Invalid selection time');
 const ids=reservedIdentities(recent,now),weights=new Map(),add=(key,n)=>weights.set(key,(weights.get(key)||0)+n);
 if(recent.version===2){
  assert(Array.isArray(recent.exposures)&&recent.exposures.length<=MAX_EXPOSURES,'Unsupported exposure history');
  for(const saved of recent.exposures){
   const e=historicalSelectionFeatures(saved),weight=exposureWeight(e,now);if(!weight)continue;
   for(const id of [e.problemId,e.lineageId])if(typeof id==='string'&&id.length)ids.add(id);
   add('f:'+e.familyId,weight);add('i:'+e.idea,weight);add('s:'+e.structure,weight);add('t:'+e.technique,weight);add('c:'+e.combination,weight);
  }
 }else{
  assert((recent.problems??[]).length<=MAX_EXPOSURES&&(recent.families??[]).length<=MAX_EXPOSURES,'Unsupported historical preferences');
  for(const id of recent.problems??[])ids.add(id);
  for(const family of recent.families??[])add('f:'+family,.25);
 }
 return {ids,weights};
}

const familySizes=rows=>{const counts=new Map();for(const row of rows)counts.set(row.family_id,(counts.get(row.family_id)||0)+1);return counts;};
const capacity=(sizes,rounds)=>[...sizes.values()].reduce((n,size)=>n+Math.min(size,2*rounds),0);
/** Necessary capacity only. This value never certifies independent idea
 * diversity, genuine tasks, horizon performance or instructional coverage. */
export function freeResponseCapacity(candidates,blocked=new Set(),count=20){
 assert(Number.isInteger(count)&&count>=1&&count<=20,'Invalid FR round size');
 const unseen=candidates.filter(c=>!blocked.has(c.lineage_id)&&!blocked.has(c.problem_id)),sizes=familySizes(unseen);
 let rounds=Math.floor(unseen.length/(count*1.2));
 while(rounds>0&&capacity(sizes,rounds)<count*rounds)rounds--;
 return {eligibleTasks:candidates.length,unseenTasks:unseen.length,families:sizes.size,oneRoundCapacity:capacity(sizes,1),reservedRounds:Math.max(1,rounds)};
}

/** Complete, eligibility-verified catalog only; no sampled/unsupported row can
 * contribute. Never relax history, family caps, filters or adjacency. */
export function chooseFreeResponseCandidates(candidates,input,history,rng=random){
 assert(Array.isArray(candidates)&&candidates.length<=MAX_FR_REGISTRATIONS,'Unsupported FR selection catalog');
 assert(Number.isInteger(input.count)&&input.count>=1&&input.count<=20,'Invalid FR round size');
 assert(new Set(candidates.map(c=>c.lineage_id)).size===candidates.length,'FR catalog must be normalized by exposure lineage');
 const report=freeResponseCapacity(candidates,history.ids,input.count);
 if(report.oneRoundCapacity<input.count)throw unavailable();
 const unseen=candidates.filter(c=>!history.ids.has(c.lineage_id)&&!history.ids.has(c.problem_id));
 const remaining=familySizes(unseen),counts=new Map(),selected=[],used=new Set();
 const futureCap=2*(report.reservedRounds-1),futureNeed=input.count*(report.reservedRounds-1);
 let futureCapacity=[...remaining.values()].reduce((n,size)=>n+Math.min(size,futureCap),0);
 while(selected.length<input.count){
  const eligible=unseen.filter(c=>!used.has(c.lineage_id)&&(counts.get(c.family_id)||0)<2&&
   futureCapacity-Number(remaining.get(c.family_id)<=futureCap)>=futureNeed);
  if(!eligible.length)throw unavailable();
  const groups=new Map();for(const c of eligible){const group=groups.get(c.family_id)||[];group.push(c);groups.set(c.family_id,group);}
  let families=[...groups.keys()];const last=selected.at(-1);
  if(families.some(f=>f!==last?.family_id))families=families.filter(f=>f!==last?.family_id);
  const score=c=>{
   const h=history.weights,drill=!!input.tag&&input.tag!=='*';
   const penalty=.9*(h.get('f:'+c.family_id)||0)+.45*(h.get('i:'+c.idea)||0)+.25*(h.get('s:'+c.structure)||0)+(drill?0:.15*(h.get('t:'+c.technique)||0))+.15*(h.get('c:'+c.combination)||0);
   const local=selected.slice(-3).reduce((n,p)=>n+Number(p.idea===c.idea)*1.1+Number(p.structure===c.structure)*.8+(drill?0:Number(p.technique===c.technique)*.25),0);
   return Math.exp(-Math.min(8,penalty*.16+local+(counts.get(c.family_id)||0)*.45));
  };
  // Normalize within each construction; raw parameter count is not weight.
  const family=weighted(families,f=>groups.get(f).reduce((n,c)=>n+score(c),0)/groups.get(f).length,rng);
  const item=weighted(groups.get(family),score,rng);selected.push(item);used.add(item.lineage_id);counts.set(family,(counts.get(family)||0)+1);
  const left=remaining.get(family);futureCapacity-=Number(left<=futureCap);remaining.set(family,left-1);
 }
 // A feasible completion check keeps randomized ordering from creating an
 // avoidable repeated-family pair at the end of a round.
 const pending=[...selected],ordered=[];
 while(pending.length){
  const eligible=pending.filter(choice=>{
   if(choice.family_id===ordered.at(-1)?.family_id)return false;
   const rest=familySizes(pending.filter(p=>p!==choice)),n=pending.length-1;
   return [...rest].every(([f,size])=>size<=Math.ceil(n/2)-(f===choice.family_id&&n%2===1?1:0));
  });
  if(!eligible.length)throw unavailable();
  const next=weighted(eligible,c=>Math.exp(-ordered.slice(-2).reduce((n,p)=>n+Number(p.idea===c.idea)*1.5+Number(p.structure===c.structure),0)),rng);
  ordered.push(next);pending.splice(pending.indexOf(next),1);
 }
 return {selected:ordered,capacity:report};
}

// Bounded to 512 retained exposures plus 80 separate held questions, with
// at most identity + lineage for each. No attempted-history retention changes.
// Source IDs from MC and older FR revisions map into current exposure aliases.
export const FR_HISTORY_ALIASES_SQL=`WITH blocked AS (SELECT value AS id FROM json_each(?1)),aliases AS (
 SELECT lineage_id FROM cbank_problem_lineage WHERE problem_id IN (SELECT id FROM blocked)
 UNION SELECT lineage_id FROM frbank_records WHERE problem_id IN (SELECT id FROM blocked))
 SELECT CASE WHEN length(CAST(lineage_id AS BLOB))<=256 THEN lineage_id ELSE NULL END AS lineage_id
 FROM aliases LIMIT ${MAX_FR_REGISTRATIONS+1}`;

/** Reconstruct only the chosen payloads and recheck current eligibility after
 * decoding. Returns private immutable records, never a public question set. */
export async function selectFreeResponseRecords(db,input,recent={},rng=random,now=Date.now(),admissions=defaultAdmissions){
 assertFreeResponseHistory(recent); // Bound the object before cloning it.
 const request=freeze(structuredClone(input)),registry=freeze(structuredClone(admissions)),savedHistory=freeze(structuredClone(recent));
 assert(Number.isInteger(request?.count)&&request.count>=1&&request.count<=20,'Invalid FR round size');
 const policy=freeResponseEligibilityPolicy(registry);
 // A known account-wide hold barrier wins before any catalog read, including
 // when D1 is unavailable. It must not spend quota or mask the actionable 409.
 const history=freeResponseHistory(savedHistory,now);
 const candidates=await eligibleFreeResponseCatalog(db,request,policy);
 if(!candidates.length)throw unavailable();
 let statements=policy.count?1:0;
 const retainedIds=[...history.ids];
 const loadAliases=async()=>{
  if(!retainedIds.length)return new Set();
  assert(retainedIds.length<=MAX_SELECTION_HISTORY_IDENTITIES,'Unsupported exposure aliases');
  const aliases=(await db.prepare(FR_HISTORY_ALIASES_SQL).bind(JSON.stringify(retainedIds)).all()).results;statements++;
  // Each of the bounded registered tasks may have an older stored revision.
  // Avoid unbounded history expansion if the stored archive is corrupt/huge.
  assert(aliases.length<=MAX_FR_REGISTRATIONS,'Unsupported exposure alias catalog');
  const result=new Set(retainedIds);for(const alias of aliases){assert(typeof alias.lineage_id==='string'&&alias.lineage_id.length,'Invalid exposure alias');result.add(alias.lineage_id);}return result;
 };
 for(const alias of await loadAliases())history.ids.add(alias);
 const {selected,capacity:report}=chooseFreeResponseCandidates(candidates,request,history,rng);
 const rows=(await db.prepare(`SELECT * FROM frbank_records WHERE record_ref IN (${selected.map(()=>'?').join(',')})`).bind(...selected.map(c=>c.record_ref)).all()).results;statements++;
 assert(rows.length===selected.length,'Missing selected FR record');
 const byRef=new Map(rows.map(row=>[row.record_ref,row])),records=[];
 for(const selectedRow of selected){
  const record=await decodeFreeResponseRecord(byRef.get(selectedRow.record_ref),{admissions:registry});
  assert(await freeResponseSelectionHash(record)===policy.selectionHashes[selectedRow.record_hash],'Selected FR metadata changed');records.push(record);
 }
 const current=await eligibleFreeResponseCatalog(db,request,policy,retainedIds);statements++;
 // Current eligibility and all retained-ID aliases share a single DB snapshot;
 // alternating two final queries would merely move the race window.
 for(const selectedRow of selected){
  const row=current.find(c=>c.record_ref===selectedRow.record_ref&&c.record_hash===selectedRow.record_hash);
  assert(row,'Selected FR eligibility changed');assert(row.history_blocked===0,'Selected FR history alias changed');
 }
 return freeze({records,selected,capacity:report,relaxation:'none',diagnostics:{policy:'free-response-capped-v1',candidateCount:candidates.length,statements,payloadsDecoded:records.length,catalogFamilies:new Set(candidates.map(c=>c.family_id)).size,reservedRounds:report.reservedRounds}});
}
