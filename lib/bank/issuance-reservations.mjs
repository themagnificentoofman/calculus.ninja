// Private, bounded pending/issued/displayed identity holds. Selection and
// observation consumers are connected locally; preparation/activation still
// require the complete issuance protocol. Attempted-history limits stay intact.
import {boundedJsonSnapshot} from '../server/bounded-json-snapshot.mjs';

export const MAX_RESERVED_QUESTIONS=80,MAX_RESERVED_ROUNDS=4;
export const RESERVATION_LIFETIMES=Object.freeze({prepared:30*60000,issued:10*60000,displayed:86400000});
const prep=s=>s==='prepared'||s==='competitive-prepared';
const rank={prepared:0,'competitive-prepared':0,issued:1,displayed:2};
const assert=(ok,message)=>{if(!ok)throw Error(message);};
const identity=x=>typeof x==='string'&&x.length>0&&new TextEncoder().encode(x).length<=256;
const time=x=>Number.isSafeInteger(x)&&x>=0&&x<=8640000000000000;
// Older replay capture stored valid fractional millisecond exposure times.
// Retained-history validation accepts them without rewriting those records;
// reservation clocks themselves still require safe integer milliseconds.
const historicalTime=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=8640000000000000;
const overlap=(a,b)=>a.problemId===b.problemId||a.lineageId===b.lineageId||a.problemId===b.lineageId||a.lineageId===b.problemId;
export class ReservationConflictError extends Error{
 constructor(code='pending-rounds'){
  super(code==='reserved-question'?'Another unfinished round already contains one of these problems. Resume that round or choose different problems.':'Finish or resume an existing round before starting another.');
  this.name='ReservationConflictError';this.code=code;this.status=409;
 }
}
/** Own and validate the bounded field before interpreting its clock or IDs. */
export function reservationSnapshot(value={},asOf=Date.now()){
 assert(time(asOf),'Invalid reservation clock');
 const owned=boundedJsonSnapshot(value,{maxBytes:3000000,maxNodes:12000,maxDepth:8});
 assert(owned&&typeof owned==='object'&&!Array.isArray(owned),'Invalid reservation history');
 const snapshot=boundedJsonSnapshot({reservations:Object.hasOwn(owned,'reservations')?owned.reservations:[],reservationOverflowUntil:Object.hasOwn(owned,'reservationOverflowUntil')?owned.reservationOverflowUntil:0},{maxBytes:100000,maxNodes:1000,maxDepth:5});
 assert(time(snapshot.reservationOverflowUntil),'Invalid reservation overflow deadline');
 assert(Array.isArray(snapshot.reservations)&&snapshot.reservations.length<=MAX_RESERVED_QUESTIONS,'Oversized reservation history');
 const keys=new Set(),rounds=new Set(),prepared=new Set(),byRound=new Map();
 for(const r of snapshot.reservations){
  assert(r&&typeof r==='object'&&!Array.isArray(r)&&Object.keys(r).length===6&&['roundId','problemId','lineageId','stage','at','expiresAt'].every(k=>Object.hasOwn(r,k)),'Invalid reservation fields');
  assert(identity(r.roundId)&&identity(r.problemId)&&identity(r.lineageId)&&Object.hasOwn(rank,r.stage),'Invalid reservation identity or stage');
  assert(time(r.at)&&time(r.expiresAt)&&(r.stage==='competitive-prepared'?r.expiresAt>r.at&&r.expiresAt-r.at<=RESERVATION_LIFETIMES.prepared:r.expiresAt-r.at===RESERVATION_LIFETIMES[r.stage]),'Invalid reservation lifetime');
  const key=JSON.stringify([r.roundId,r.problemId]);assert(!keys.has(key),'Duplicate reservation');keys.add(key);rounds.add(r.roundId);if(prep(r.stage))prepared.add(r.roundId);
  const sameRound=byRound.get(r.roundId)||[];
  assert(!sameRound.some(p=>overlap(p,r)),'Overlapping reserved identities within a round');
  sameRound.push(r);byRound.set(r.roundId,sameRound);
 }
 assert(rounds.size<=MAX_RESERVED_ROUNDS&&prepared.size<=1,'Too many reserved rounds');
 return {reservations:snapshot.reservations.filter(r=>r.expiresAt>asOf),reservationOverflowUntil:snapshot.reservationOverflowUntil>asOf?snapshot.reservationOverflowUntil:0};
}
export function assertReservationAvailability(value,asOf=Date.now()){
 const state=reservationSnapshot(value,asOf);
 if(state.reservationOverflowUntil)throw new ReservationConflictError();
 return state;
}
export function reservedIdentities(value,asOf=Date.now()){
 return new Set(assertReservationAvailability(value,asOf).reservations.flatMap(r=>[r.problemId,r.lineageId]));
}
function identities(questions){
 assert(Array.isArray(questions)&&questions.length>=1&&questions.length<=20,'Invalid reserved question count');
 const owned=boundedJsonSnapshot(questions,{maxBytes:2000000,maxNodes:180000,maxDepth:40});
 assert(owned.every(q=>q&&typeof q==='object'&&!Array.isArray(q)),'Invalid reserved question');
 const data=owned.map(q=>({problemId:q.problemId,lineageId:q.lineageId===undefined?q.problemId:q.lineageId}));
 assert(data.length>=1&&data.length<=20&&data.every(q=>identity(q.problemId)&&identity(q.lineageId)),'Invalid reserved question set');
 assert(data.every((q,i)=>!data.slice(0,i).some(p=>overlap(p,q))),'Overlapping reserved question identities');
 return data;
}
function retainedAttemptProof(value,asOf){
 const proof=boundedJsonSnapshot(value,{maxBytes:3000000,maxNodes:12000,maxDepth:4});
 assert(Array.isArray(proof)&&proof.length<=512,'Invalid retained exposure proof');
 const allowed=['roundId','problemId','lineageId','familyId','idea','structure','technique','combination','stage','at'];
 for(const e of proof){
  assert(e&&typeof e==='object'&&!Array.isArray(e)&&Object.keys(e).every(k=>allowed.includes(k)),'Invalid retained exposure fields');
  assert(['roundId','problemId','familyId'].every(k=>identity(e[k]))&&(e.lineageId===undefined||identity(e.lineageId)),'Invalid retained exposure identity');
  assert(['idea','structure','technique','combination'].every(k=>typeof e[k]==='string'&&e[k].length>0&&new TextEncoder().encode(e[k]).length<=1024),'Invalid retained exposure vocabulary');
  assert(['issued','displayed','attempted'].includes(e.stage)&&historicalTime(e.at)&&e.at<=asOf,'Invalid retained exposure stage or time');
 }
 return proof.filter(e=>e.stage==='attempted'&&asOf-e.at<=14*86400000);
}
/** Preparation/activation is atomic with its private intent in the caller's
 * Firestore transaction. Exact retry/body checks are the caller's obligation. */
export function reserveQuestionSet(value,roundId,questions,stage,at=Date.now()){
 assert(identity(roundId)&&['prepared','issued'].includes(stage)&&time(at),'Invalid reservation request');
 const state=assertReservationAvailability(value,at),items=identities(questions);
 const own=state.reservations.filter(r=>r.roundId===roundId),others=state.reservations.filter(r=>r.roundId!==roundId);
 if(others.some(r=>items.some(q=>overlap(r,q))))throw new ReservationConflictError('reserved-question');
 if(stage==='prepared'&&others.some(r=>prep(r.stage)))throw new ReservationConflictError();
 if(own.length)assert(own.length===items.length&&own.every(r=>items.some(q=>r.problemId===q.problemId&&r.lineageId===q.lineageId)),'Changed reserved question set');
 const next=items.map(q=>{
  const previous=own.find(r=>r.problemId===q.problemId);
  if(previous&&rank[previous.stage]>=rank[stage])return previous;
  return {...q,roundId,stage,at,expiresAt:at+RESERVATION_LIFETIMES[stage]};
 });
 assert(next.every(r=>time(r.expiresAt)),'Reservation deadline exceeds supported time');
 const reservations=[...others,...next];
 if(reservations.length>MAX_RESERVED_QUESTIONS||new Set(reservations.map(r=>r.roundId)).size>MAX_RESERVED_ROUNDS)throw new ReservationConflictError();
 return {reservations,reservationOverflowUntil:state.reservationOverflowUntil};
}
/** Apply a validated ORIGINAL first-display time, never upload/retry time.
 * If a late real display cannot fit, retain an account-wide exclusion deadline
 * rather than discarding observed exposure or evicting another live hold. */
export function observeReservedQuestions(value,roundId,questions,stage,at,asOf=at,retainedExposures=[]){
 assert(identity(roundId)&&['displayed','attempted'].includes(stage)&&time(at)&&time(asOf)&&at<=asOf,'Invalid reservation observation');
 const state=reservationSnapshot(value,asOf),items=identities(questions);
 // Only the canonical, current post-retention recordExposures result supplied
 // by the authoritative transaction is evidence. Validation cannot prove its
 // provenance; callers must never substitute client-supplied exposure arrays.
 const retained=stage==='attempted'?retainedAttemptProof(retainedExposures,asOf):[];
 let reservations=[...state.reservations],reservationOverflowUntil=state.reservationOverflowUntil;
 for(const q of items){
  const previous=reservations.find(r=>r.roundId===roundId&&r.problemId===q.problemId);
  if(previous)assert(previous.lineageId===q.lineageId,'Changed observed lineage');
  if(stage==='attempted'){
   if(retained.some(e=>e.roundId===roundId&&e.problemId===q.problemId&&(e.lineageId??e.problemId)===q.lineageId))reservations=reservations.filter(r=>r!==previous);
   continue;
  }
  if(previous?.stage==='displayed')continue;
  const expiresAt=at+RESERVATION_LIFETIMES.displayed;assert(time(expiresAt),'Invalid display deadline');if(expiresAt<=asOf)continue;
  // PREPARED operations are still private; an observation must not activate one.
  assert(!prep(previous?.stage),'A prepared question cannot be displayed');
  const next={...q,roundId,stage:'displayed',at,expiresAt};
  const replacement=previous?reservations.map(r=>r===previous?next:r):[...reservations,next];
  assert(!reservations.some(r=>r!==previous&&r.roundId===roundId&&overlap(r,next)),'Overlapping observed identities within a round');
  if(replacement.length>MAX_RESERVED_QUESTIONS||new Set(replacement.map(r=>r.roundId)).size>MAX_RESERVED_ROUNDS)reservationOverflowUntil=Math.max(reservationOverflowUntil,expiresAt);
  else reservations=replacement;
 }
 return {reservations,reservationOverflowUntil};
}
export function cancelPreparedReservation(value,roundId,asOf=Date.now()){
 assert(identity(roundId),'Invalid cancelled round');
 const state=reservationSnapshot(value,asOf);
 return {...state,reservations:state.reservations.filter(r=>r.roundId!==roundId||r.stage!=='prepared')};
}
