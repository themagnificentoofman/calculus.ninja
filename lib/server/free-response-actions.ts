import {finishTestWithFreeResponse} from './test-round-results.ts';
import type {Store,Transaction,Data} from './firestore-admin.ts';
import type {GameSession,FreeResponseQuestion,FreeResponseAnswer} from '../game-progress.ts';
import {nextUnanswered} from '../game-progress.ts';
import {gradeAnswer} from '../math-answer/versioned-grade.mjs';
import type {Verdict} from '../math-answer/versioned-contracts.ts';
import {recordAttemptedExposures} from '../bank/exposure.ts';
import {recordTransition} from './replay-recording.ts';
import {calculateProblemXp,finite} from '../progression.ts';
export class FreeResponseError extends Error {status:number;constructor(message:string,status=400){super(message);this.status=status;}}
const fail=(message:string,status=400):never=>{throw new FreeResponseError(message,status);};
const digest=async(value:unknown)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value)))),x=>x.toString(16).padStart(2,'0')).join('');
type Dependencies={store:Store;now:()=>number;view:(g:GameSession,uid:string)=>any;saveGame:(tx:Transaction,id:string,g:GameSession)=>void;saveProfile:(tx:Transaction,uid:string,p:Data)=>void};
const check=(g:GameSession|undefined,uid:string,index:number):{game:GameSession;question:FreeResponseQuestion}=>{
 if(!g||!g.players.includes(uid))return fail('This round does not belong to you.',403);
 if(g.mode!=='test'||!['free-response','mixed'].includes(g.responseFormat||'')||g.players.length!==1||g.replayVersion!==2)return fail('Free response is available only in its individual Test rounds.',409);
 const q=g.questions?.[index];if(q?.responseFormat!=='free-response'||!q.freeResponse||q.answerContractHash!==q.freeResponse.contractHash)return fail('This answer cannot be submitted for the saved question. Reload the round and try again.',409);
 return {game:g,question:q};
};
/** Grading is outside the callback: Firestore may retry the transaction six times. */
export async function actFreeResponse(deps:Dependencies,uid:string,id:string,action:string,input:Data){
 const {store,now}=deps,index=input.index,submissionId=input.requestId;
 if(!Number.isInteger(index)||index<0||index>19||typeof submissionId!=='string'||!/^[a-zA-Z0-9_-]{5,128}$/.test(submissionId)||['__proto__','prototype','constructor'].includes(submissionId))return fail('Send a valid question and submission reference.');
 const source=action==='fr-submit'?input.source:'';if(typeof source!=='string'||source.length>2048)return fail('Keep the submitted answer under 2,048 characters. Your draft is retained.');
 const receiptPath=`frSubmissions/${uid}_${id}_${submissionId}`;
 const [snapshot,saved,profileBefore]=await Promise.all([store.get(`gameSecrets/${id}`),store.get(receiptPath),store.get(`users/${uid}`)]);
 const prepared=check(snapshot as GameSession|undefined,uid,index),q=prepared.question;
 const bodyHash=await digest({uid,id,index,problemId:q.problemId,revision:q.problemRevision,contentHash:q.contentHash,contractHash:q.answerContractHash,graderVersion:q.graderVersion,parserVersion:q.parserVersion,action,source});
 if(saved&&saved.bodyHash!==bodyHash)return fail('This submission reference was already used for different content.',409);
 const final=prepared.game.answers?.[uid]?.[index];
 if(action==='fr-submit'&&!saved&&!final){
  if((profileBefore?.frRecentSubmissionAt||[]).filter((t:number)=>t>now()-60000).length>=12)return fail('Please wait before sending another answer. Your draft is retained.',429);
  if(finite(prepared.game.frAttemptCounts?.[index])>=16)return fail('This question has reached its retry limit. You can skip or reveal without a wrong-answer penalty.',429);
 }
 const evaluated:Verdict|null=action==='fr-submit'&&!saved&&!final?gradeAnswer(q.freeResponse,source) as Verdict:null;
 const operationId=crypto.randomUUID(),receivedAt=now(),binding=await digest(q);
 const duplicate=(game:GameSession,old:Data)=>{
  if(old.bodyHash!==bodyHash)return fail('This submission reference was already used for different content.',409);
  return {...deps.view(game,uid),verdict:old.outcome,answer:game.answers?.[uid]?.[index]||null,duplicate:true,serverNow:now()};
 };
 return store.transaction(async tx=>{
  const current=check(await tx.get(`gameSecrets/${id}`) as GameSession|undefined,uid,index),game=current.game,question=current.question;
  // Hash comparison covers the whole immutable saved statement/contract as well
  // as its declared identifiers. No client policy is accepted.
  if(await digest(question)!==binding)return fail('The saved question changed. Reload before trying again.',409);
  const old=await tx.get(receiptPath);if(old)return duplicate(game,old);
  const settled=game.answers?.[uid]?.[index];if(settled)return {...deps.view(game,uid),answer:settled,duplicate:true,serverNow:now()};
  if(game.status!=='active'||now()<(game.startTime||0)||nextUnanswered(game,uid)!==index)return fail('Please use the current unfinished question.',409);
  const [profile,recent]=await Promise.all([tx.get(`users/${uid}`),tx.get(`bankRecent/${uid}`)]);if(!profile)return fail('Your profile is unavailable.',409);
  const at=now(),recentRequests=(profile.frRecentSubmissionAt||[]).filter((t:number)=>t>at-60000);
  if(action==='fr-submit'&&recentRequests.length>=12)return fail('Please wait before sending another answer. Your draft is retained.',429);
  if(action==='fr-submit'&&finite(game.frAttemptCounts?.[index])>=16)return fail('This question has reached its retry limit. You can skip or reveal without a wrong-answer penalty.',429);
  const before=structuredClone(game),verdict=evaluated||saved?.outcome;
  if(action==='fr-submit'&&!verdict)return fail('Please retry this submission.',409);
  const finalization=action==='fr-skip'?'skipped':action==='fr-reveal'?'revealed':'graded';
  const outcome=verdict?.outcome,graded=action==='fr-submit'&&(outcome==='correct'||outcome==='incorrect');
  if(action==='fr-submit'){
   tx.set(receiptPath,{uid,roundId:id,requestId:submissionId,bodyHash,index,contractHash:q.answerContractHash,outcome:verdict!,source,action,at});
   (game.frAttemptCounts||={})[index]=finite(game.frAttemptCounts?.[index])+1;profile.frRecentSubmissionAt=[...recentRequests,at].slice(-12);
   game.frLastSubmission={requestId:submissionId,index,contractHash:q.answerContractHash,outcome:verdict!,source,at};
   if(!graded){const stats={...profile.freeResponseStats};stats.ungraded=finite(stats.ungraded)+1;profile.freeResponseStats=stats;deps.saveProfile(tx,uid,profile);recordTransition(tx,id,before,game,uid,submissionId,receivedAt,at,undefined,operationId);deps.saveGame(tx,id,game);return {...deps.view(game,uid),verdict,answer:null,duplicate:false,serverNow:at};}
  }
  if(action!=='fr-submit')tx.set(receiptPath,{uid,roundId:id,requestId:submissionId,bodyHash,index,contractHash:q.answerContractHash,outcome:null,source:'',action,at});
  const correct=graded?outcome==='correct':undefined,xp=correct?calculateProblemXp('test',question.difficulty):0;
  const answer:FreeResponseAnswer={responseFormat:'free-response',finalization,outcome:graded?outcome!:finalization as 'skipped'|'revealed',...(graded?{correct}:{}),source:action==='fr-submit'?source:'',interpretation:action==='fr-submit'?verdict!.interpretation:'',contractHash:question.answerContractHash,graderVersion:question.graderVersion,submissionId,feedback:graded?verdict!.feedback:finalization==='revealed'?'Solution revealed without answer credit.':'Skipped without answer credit.',xp,timeMs:at-(game.startTime||at)};
  (game.answers![uid]||={})[index]=answer;
  // Explicit skip/reveal finalizes exposure without inventing a graded error.
  tx.set(`bankRecent/${uid}`,recordAttemptedExposures(recent||{},id,[question],at));
  const stats={...profile.freeResponseStats};stats.finalized=finite(stats.finalized)+1;stats[graded?'graded':finalization]=finite(stats[graded?'graded':finalization])+1;if(correct)stats.correct=finite(stats.correct)+1;profile.freeResponseStats=stats;
  profile.xp=finite(profile.xp)+xp;profile.topicXp={...profile.topicXp,[question.topic]:finite(profile.topicXp?.[question.topic])+xp};game.scores[uid]=finite(game.scores[uid])+Number(correct===true);
  if(nextUnanswered(game,uid)===game.questions!.length)finishTestWithFreeResponse(game,uid,profile,at);
  recordTransition(tx,id,before,game,uid,submissionId,receivedAt,at,undefined,operationId);deps.saveProfile(tx,uid,profile);deps.saveGame(tx,id,game);
  return {...deps.view(game,uid),verdict:graded?verdict:null,answer,duplicate:false,receipt:game.receipts?.[uid]||null,serverNow:at};
 },async get=>{
  const [old,raw]=await Promise.all([get(receiptPath),get(`gameSecrets/${id}`)]);
  if(!old)return null;
  const {game,question}=check(raw as GameSession|undefined,uid,index);
  if(await digest(question)!==binding)return fail('The saved question changed. Reload before trying again.',409);
  return duplicate(game,old);
 });
}
