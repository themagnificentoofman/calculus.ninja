import {reserveQuestionSet, reservationSnapshot, assertReservationAvailability, ReservationConflictError, MAX_RESERVED_QUESTIONS,MAX_RESERVED_ROUNDS} from '../bank/issuance-reservations.mjs';
import {recordExposures} from '../bank/exposure.ts';
import {frDigest} from '../bank/free-response-record.mjs';
import type {Data,Store,Transaction} from './firestore-admin.ts';
import type {GameQuestion,GameSession} from '../game-progress.ts';
const ttl=30*60_000;
export class CompetitiveHoldError extends Error { status=409; code?:string; }
function check(ok: unknown,message='This saved round cannot be started. Please create another room.'): asserts ok {if(!ok)throw new CompetitiveHoldError(message);}

export function knownCompetitiveRecord(value: Data | undefined | null): value is Data & {version: 2 | 3} {
  return value?.version === 2 || value?.version === 3;
}

const clock=(x:unknown)=>Number.isSafeInteger(x)&&Number(x)>=0;
export function opKey(x:unknown):string {check(typeof x==='string'&&/^[A-Za-z0-9_-]{12,96}$/.test(x),'This action needs a valid retry identifier.');return x;}
function visitKey(x:unknown){return typeof x==='string'&&/^inv:[a-f0-9]{64}$/.test(x)?x:opKey(x);}
export async function competitiveIdentity(uid:string,operation:unknown,body:Data){
 const key=opKey(operation);const operationDigest=await frDigest({kind:'competitive-room-v2',uid,key});
 const id='c2'+operationDigest.slice(0,28);
 return {version:2 as const,id,operationDigest,owner:uid,requestedRoom:body.roomOptions,requestHash:await frDigest({uid,key,body}),key};
}
export function recoverSet(set:Data|null,identity:Data){
 if(set===null)return null;
 check(knownCompetitiveRecord(set.competitiveCreation)&&set.uid===identity.owner&&set.competitiveCreation.id===identity.id&&set.competitiveCreation.operationDigest===identity.operationDigest&&set.competitiveCreation.requestHash===identity.requestHash,'This operation already belongs to a different round request.');
 check(!set.competitiveCreation.cancelled,'This request was cancelled. Start another round.');
 return {questionSetId:identity.id,questionCount:set.competitiveCreation.count};
}
export async function cancelPrivate(store:Store,uid:string,identity:Data,request:Data,time:number){
 return store.transaction(async tx=>{
  const id=identity.id,path='questionSets/'+id;
  const [set,game]=await Promise.all([tx.get(path),tx.get('gameSecrets/'+id)]);
  if(set)check(set.uid===uid&&set.mode===request.mode&&knownCompetitiveRecord(set.competitiveCreation)&&set.competitiveCreation.id===id&&set.competitiveCreation.operationDigest===identity.operationDigest&&set.competitiveCreation.requestHash===identity.requestHash,'This operation belongs to another request.');
  if(game){check(set&&game.players?.[0]===uid);return {questionSetId:id,status:game.status};} // A created waiting room closes by verified host departure.
  if(set?.competitiveCreation.cancelled)return {questionSetId:id,status:'cancelled'};
  if(set){
   const history=await tx.get('bankRecent/'+uid)||{};
   const snapshot=reservationSnapshot(history,time);
   check(!snapshot.reservations.some((r:Data)=>r.roundId===id&&r.stage!=='competitive-prepared'));
   if((history.reservations||[]).some((r:Data)=>r.roundId===id)){
    tx.set('bankRecent/'+uid,advanceHistory({...history,...snapshot,reservations:snapshot.reservations.filter((r:Data)=>r.roundId!==id)}));
   }
  }
  const saved=set?.competitiveCreation??{...identity,count:request.count};
  tx.set(path,{uid,mode:request.mode,used:true,competitiveCreation:{...saved,cancelled:true,cancelledAt:time}});
  return {questionSetId:id,status:'cancelled'};
 });
}
export function privateSet(questions:GameQuestion[],uid:string,identity:Data,at:number){
 check(clock(at)&&clock(at+ttl));
 check(Array.isArray(questions)&&questions.length>=1&&questions.length<=20&&questions.every(q=>q.responseFormat!=='free-response'&&q.problemId&&q.lineageId&&q.constructionFamilyId&&q.familyId&&q.contentHash&&q.choiceOrder?.length===4));
 return {...identity,host:uid,createdAt:at,deadline:at+ttl,count:questions.length};
}
export function preflightHost(history:Data,count:number,time:number){
 const {reservations}=assertReservationAvailability(history,time);
 if(reservations.some((r:Data)=>r.stage==='prepared'||r.stage==='competitive-prepared')||
     reservations.length+count>MAX_RESERVED_QUESTIONS||new Set(reservations.map((r:Data)=>r.roundId)).size>=MAX_RESERVED_ROUNDS)throw new ReservationConflictError();
}
export function advanceHistory(history:Data){
 const old=history.issuanceGeneration??0;
 check(clock(old)&&old<Number.MAX_SAFE_INTEGER,'This account cannot start another round.');return {...history,issuanceGeneration:old+1};
}
export function prepareSeat(history:Data,id:string,questions:GameQuestion[],at:number,deadline:number){
 check(clock(at)&&clock(deadline)&&at<deadline&&deadline-at<=ttl);
 const reserved=reserveQuestionSet(history,id,questions,'prepared',at);
 const own=reserved.reservations.filter((r:Data)=>r.roundId===id);
 check(own.length===questions.length&&own.every((r:Data)=>r.stage==='prepared'&&r.at===at));
 const reservations=reserved.reservations.map((r:Data)=>r.roundId===id?{...r,stage:'competitive-prepared',expiresAt:deadline}:r);
 return advanceHistory({...history,...reserved,reservations});
}
function requireSeat(history:Data,id:string,questions:GameQuestion[],at:number,deadline:number,time:number){
 check(clock(at)&&clock(time)&&at<=time&&time<deadline);
 const holds=assertReservationAvailability(history,time).reservations.filter((r:Data)=>r.roundId===id);
 check(holds.length===questions.length&&holds.every((r:Data)=>r.stage==='competitive-prepared'&&r.at===at&&r.expiresAt===deadline&&questions.some(q=>q.problemId===r.problemId&&q.lineageId===r.lineageId)));
}
// V2 remains byte-compatible with its saved digest. V3 also binds the
// catalog window to the exact ordered payload, choices and round snapshot.
export function competitiveSelectionHash(questions: GameQuestion[], roundSnapshot: unknown, catalogWindow?: unknown) {
 return frDigest(catalogWindow === undefined ? {questions,roundSnapshot} : {version:3,questions,roundSnapshot,catalogWindow});
}
export async function roomFromSet(set:Data,uid:string,history:Data,time:number){
 const v=set.competitiveCreation;check(!Object.hasOwn(set,'pvpGuestHoldVersion')&&knownCompetitiveRecord(v)&&v.host===uid&&v.count===set.questions?.length&&v.deadline===v.createdAt+ttl&&new Date(set.expiresAt).getTime()===v.deadline);
 check(v.selectionHash===await competitiveSelectionHash(set.questions,set.roundSnapshot,v.version===3?v.catalogWindow:undefined),'The saved question set changed.');
 requireSeat(history,v.id,set.questions,v.createdAt,v.deadline,time);
 return {version:v.version,...(v.version===3?{catalogWindow:v.catalogWindow}:{}),id:v.id,createdAt:v.createdAt,deadline:v.deadline,selectionHash:v.selectionHash,seats:{[uid]:{key:v.key,at:v.createdAt}}};
}
export function compatibleCreate(game:GameSession,input:Data){
 if(!game.competitiveRoom)return;
 check((input.visibility??'private')===game.visibility,'This retry changes the saved room settings.');
 if(game.mode==='multiplayer')check(['winCondition','targetScore','timeLimit','penalties'].every(k=>input.settings?.[k]===((game.settings??{}) as Data)[k]),'This retry changes the saved room settings.');
}
const label=(id:string,uid:string,key:string)=>frDigest({kind:'competitive-seat-v2',id,uid,key});
export async function closedSeat(tx:Transaction,id:string,uid:string,op:unknown){
 const key=visitKey(op);
 return (await tx.get('competitiveSeatReceipts/'+await label(id,uid,key)))?.key===key;
}
export async function planCompetitive(tx:Transaction,id:string,before:GameSession,game:GameSession,removed:string[],action:string,uid:string,input:Data,time:number){
 const v=game.competitiveRoom;
 if(before.status!=='waiting'||!Object.hasOwn(game,'competitiveRoom'))return null;
 check(!Object.hasOwn(game,'pvpGuestHoldVersion')&&knownCompetitiveRecord(v)&&v.id===id&&v.deadline===v.createdAt+ttl&&v.seats&&typeof v.seats==='object');
 check(before.players.length>=1&&before.players.length<=10&&Object.keys(v.seats).length===before.players.length&&before.players.every(p=>typeof v.seats[p]?.key==='string'&&clock(v.seats[p]?.at)));
 const cancelled=game.status==='cancelled',joining=action==='join'&&!game.players.includes(uid),leaving=action==='leave'&&game.players.includes(uid);
 const hostLeaving=leaving&&game.players[0]===uid;
 const closing=cancelled||hostLeaving;
 const starting=(!closing)&&((action==='start'&&uid===game.players[0]&&game.mode==='multiplayer'&&game.players.length>=2)||(joining&&game.mode==='pvp'));
 if(!closing&&(joining||starting))check(v.selectionHash===await competitiveSelectionHash(game.questions??[],game.roundSnapshot,v.version===3?v.catalogWindow:undefined),'The saved question set changed.');
 const affected=new Set(closing?before.players:removed);
 if(!closing){
  if(joining)affected.add(uid);
  if(leaving)affected.add(uid);
  if(starting)for(const p of game.players)affected.add(p);
 }
 const history=new Map<string,Data>(),pending=new Map<string,Data>();
 await Promise.all([...affected].map(async p=>history.set(p,(await tx.get('bankRecent/'+p))||{})));
 const qs=game.questions??[];
 const joiningKey=!closing&&action==='join'?(input.inviteId?'inv:'+await frDigest({kind:'competitive-seat-invitation',id:input.inviteId}):visitKey(input.seatOperationId)):null;
 const joinPath=joiningKey&&game.mode==='multiplayer'?'competitiveSeatReceipts/'+await label(id,uid,joiningKey):null;
 const previous=joining&&joinPath?await tx.get(joinPath):null;
 const closed=closing?before.players:removed;
 function release(p:string){
  const h=pending.get(p)??history.get(p);check(h);
  const saved=h.reservations??[];
  check(!saved.some((r:Data)=>r.roundId===id&&r.stage!=='competitive-prepared'));
  if(saved.some((r:Data)=>r.roundId===id)){
   const normalized=reservationSnapshot(h,time);
   pending.set(p,advanceHistory({...h,...normalized,reservations:normalized.reservations.filter((r:Data)=>r.roundId!==id)}));
  }
  delete v!.seats[p];
 }
 for(const p of closed)release(p);
 let newReceipt:Data|undefined;
 return {
  onLeave(){if(!closing){check(v!.seats[uid]?.key===visitKey(input.seatOperationId),'This action belongs to an earlier lobby visit.');release(uid);}
   else if(hostLeaving)check(before.competitiveRoom!.seats[uid].key===visitKey(input.seatOperationId),'This action belongs to an earlier lobby visit.');},
  onExistingJoin(){check(v!.seats[uid]?.key===joiningKey,'This join belongs to another visit.');},
  onJoin(){
   check(joiningKey);
   if(previous){const error=new CompetitiveHoldError('That lobby visit has ended. Start a new visit.');error.code='LOBBY_VISIT_ENDED';throw error;}
   check(!joiningKey.startsWith('inv:')||input.inviteId,'This invitation must be accepted first.');
   check(!v!.seats[uid]);
   // An expired guest can be pruned and explicitly rejoin in one transaction.
   const h=pending.get(uid)??history.get(uid);check(h);
   if(game.mode==='multiplayer')pending.set(uid,prepareSeat(h,id,qs,time,v!.deadline));
   v!.seats[uid]={key:joiningKey,at:time};
   newReceipt={version:2,id,uid,key:joiningKey,at:time};
  },
  onActivate(roster:string[]){
   check(starting&&time<v!.deadline&&roster.length>=2&&roster.length<=10&&Object.keys(v!.seats).length===roster.length);
   for(const p of roster){
    const h=pending.get(p)??history.get(p);check(h);const seat=v!.seats[p];check(seat);
    if(joining&&game.mode==='pvp'&&p===uid){
     check(!reservationSnapshot(h,time).reservations.some((r:Data)=>r.roundId===id));
    }else requireSeat(h,id,qs,seat.at,v!.deadline,time);
    const hold=reserveQuestionSet(h,id,qs,'issued',time);
    pending.set(p,recordExposures({...h,...hold},id,qs,'issued',time));
   }
   v!.issuedAt=time;
  },
  commit(){for(const [p,h] of pending)tx.set('bankRecent/'+p,h);if(newReceipt&&joinPath)tx.set(joinPath,newReceipt);}
 };
}
