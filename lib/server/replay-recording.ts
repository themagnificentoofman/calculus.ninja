import type {GameSession} from '../game-progress.ts';
import type {Transaction} from './firestore-admin.ts';
import type {ReplayEvent,ReplayManifest,ServerEventType} from '../replay/contracts.ts';
import {RULES_VERSION} from '../replay/contracts.ts';
import {initialState} from '../replay/engine.ts';
const progress=(game:GameSession)=>Object.fromEntries(game.players.map(uid=>[uid,Object.keys(game.answers?.[uid]||{}).length]));
const timeOf=(value:unknown)=>value instanceof Date?value.getTime():typeof value==='number'?value:Date.parse(String(value));
export const serverChunkPath=(id:string,n:number)=>`replayServer/${id}_${String(n).padStart(6,'0')}`;
/** Called only inside the SAME transaction that persists game state and rewards. */
export function recordTransition(tx:Transaction,id:string,before:GameSession|null,game:GameSession,actor:string,requestId:string,receivedAt:number,acceptedAt:number,rejected?:{index:number;selectedOption:number;reason:string},eventPrefix=requestId){
  if(game.replayVersion!==1&&game.replayVersion!==2)return;
  const events:ReplayEvent[]=[];
  let sequence=game.replaySequence||0;
  const add=(type:ServerEventType,data:Record<string,any>,at=acceptedAt,playerId=actor)=>{
    const event:ReplayEvent={schemaVersion:game.replayVersion!,eventId:`${eventPrefix}_${events.length}`,roundId:id,playerId,source:'server',type,sequence:++sequence,at,receivedAt,requestId,data};events.push(event);return event;
  };
  if(rejected)add('answer_rejected',rejected);
  if(!before){
    add('round_created',{status:game.status,scores:game.scores,progress:progress(game)});
    const questions=structuredClone(game.questions||[]);
    tx.set(`replayContent/${id}`,{replayVersion:game.replayVersion,roundId:id,questions,initial:initialState(timeOf(game.createdAt)),contextMissing:questions.some(q=>!q.problemId||(q.responseFormat==='free-response'?(!q.answerContractHash||!q.freeResponse):(!q.context||!q.choiceOrder)))});
  }
  for(const uid of game.players)if(before&&!before.players.includes(uid))add('participant_joined',{playerId:uid},acceptedAt,uid);
  for(const uid of before?.players||[])if(!game.players.includes(uid))add('participant_left',{playerId:uid},acceptedAt,uid);
  if(game.startTime&&game.startTime!==before?.startTime){
    add('countdown_start',{startTime:game.startTime,deadline:game.deadline??null});
    add('round_start',{startTime:game.startTime,deadline:game.deadline??null},game.startTime);
  }
  for(const uid of game.players)for(const [index,answer] of Object.entries(game.answers?.[uid]||{}))if(!before?.answers?.[uid]?.[index]){
    const payload=answer.responseFormat==='free-response'?{index:Number(index),responseFormat:answer.responseFormat,source:answer.source,interpretation:answer.interpretation,contractHash:answer.contractHash,graderVersion:answer.graderVersion,finalization:answer.finalization,outcome:answer.outcome,feedback:answer.feedback,...(typeof answer.correct==='boolean'?{correct:answer.correct}:{}),xp:answer.xp,timeMs:answer.timeMs}:{index:Number(index),selectedOption:answer.selectedOption,correct:answer.correct,xp:answer.xp,timeMs:answer.timeMs};
    const event=add(answer.responseFormat==='free-response'?'answer_finalized':'answer_accepted',payload,acceptedAt,uid);
    answer.serverEventId=event.eventId;answer.requestId=requestId;answer.acceptedAt=acceptedAt;
  }
  const item=game.frLastSubmission;if(item&&item.requestId!==before?.frLastSubmission?.requestId&&!['correct','incorrect'].includes(item.outcome.outcome))add('answer_ungraded',{index:item.index,source:item.source,interpretation:item.outcome.interpretation,outcome:item.outcome.outcome,feedback:item.outcome.feedback,contractHash:item.contractHash,graderVersion:item.outcome.version},acceptedAt,actor);
  if(!before||JSON.stringify(game.scores)!==JSON.stringify(before.scores)||JSON.stringify(progress(game))!==JSON.stringify(progress(before)))add('score_progress',{scores:game.scores,progress:progress(game)});
  if(before&&game.deadline!==before.deadline)add('deadline_changed',{previous:before.deadline??null,deadline:game.deadline??null,penaltyMs:game.mode==='rapid'?5000:0});
  if(['finished','cancelled'].includes(game.status)&&game.status!==before?.status){
    add('round_end',{status:game.status,logicalEndAt:game.logicalEndAt??acceptedAt,settledAt:acceptedAt,reason:game.endReason??'cancelled'},game.logicalEndAt??acceptedAt);
    for(const uid of game.players)if(game.receipts?.[uid])add('final_result',{receipt:game.receipts[uid]},acceptedAt,uid);
  }
  if(!events.length)return;
  if(events.length>32)throw Error('Authoritative replay chunk bound exceeded');
  const chunkIndex=game.replayChunkCount||0;game.replaySequence=sequence;game.replayChunkCount=chunkIndex+1;
  const manifest:ReplayManifest={replayVersion:game.replayVersion!,roundId:id,mode:game.mode,settings:{...game.settings,...(game.questionMix?{questionMix:game.questionMix}:{}),category:game.category,difficulty:game.difficulty,questionCount:game.questions?.length||0,timeLimit:game.mode==='rapid'&&game.startTime?(game.originalTimeLimit??((game.deadline??game.startTime)-game.startTime)/1000):(game.settings?.timeLimit??null)},participants:[...game.players],appVersion:game.replayVersion===2?'milestone-4-fr-1':'milestone-2-replay-1',rulesVersion:RULES_VERSION,bankReleases:[...new Set((game.questions||[]).map(q=>q.bankRelease).filter((v):v is string=>Boolean(v)))],createdAt:timeOf(game.createdAt),startTime:game.startTime??null,deadline:game.deadline??null,logicalEndAt:game.logicalEndAt??null,settledAt:game.finishedAt??null,endReason:game.endReason??null,status:game.status,sequence,chunkCount:chunkIndex+1,questionCount:game.questions?.length||0,scores:{...game.scores},progress:progress(game),receipts:{...game.receipts}};
  tx.set(serverChunkPath(id,chunkIndex),{roundId:id,chunkIndex,firstSequence:events[0].sequence,lastSequence:sequence,events,checkpoint:{sequence,at:acceptedAt,status:game.status,scores:manifest.scores,progress:manifest.progress,startTime:manifest.startTime,deadline:manifest.deadline,logicalEndAt:manifest.logicalEndAt}});
  tx.set(`replayManifests/${id}`,manifest);
}
