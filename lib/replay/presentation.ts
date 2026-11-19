import type {ReplayManifest} from './contracts.ts';
import type {ClientEventType,ServerEventType} from './contracts.ts';
import {validQuestionMix} from '../round-question-config.mjs';
const topics:Record<string,string>={all:'Mixed topics',integration:'Integration',differentiation:'Differentiation',limits:'Limits',series:'Series','differential equations':'Differential equations',multivariable:'Multivariable calculus'};
const tiers:Record<string,string>={easy:'Easy',medium:'Medium',hard:'Hard',olympiad:'Olympiad'};
const endings:Record<string,string>={all_answered:'All questions answered',target_reached:'Target score reached',timeout:'Time expired',lobby_expired:'Lobby expired',lobby_cancelled:'Lobby cancelled',cancelled:'Round cancelled'};
const statuses:Record<string,string>={waiting:'Waiting for players',starting:'Starting',active:'In progress',finished:'Finished',cancelled:'Cancelled'};
const lookup=(labels:Record<string,string>,key:unknown)=>typeof key==='string'&&Object.hasOwn(labels,key)?labels[key]:undefined;
export const recordedEndLabel=(reason:unknown,status:unknown)=>lookup(endings,reason)||lookup(statuses,status)||'End reason unavailable';
export const recordedStateLabel=(status:unknown)=>lookup(statuses,status)||'State unavailable';
export const recordedResultLabel=(outcome:unknown,status:unknown)=>lookup({win:'Win',loss:'Loss',draw:'Draw',completed:'Completed'},outcome)||recordedStateLabel(status);
export const recordedSubmissionLabel=(status:unknown)=>lookup({idle:'Not submitted',pending:'Sending',accepted:'Saved',rejected:'Response not confirmed'},status)||'Status unavailable';
const events:Record<ClientEventType|ServerEventType,string>={
 session_open:'Recording started',question_displayed:'Question shown',selection_changed:'Choice changed',submission_started:'Answer submission started',submission_rejected:'Submission not confirmed',answer_response:'Answer response received',feedback_displayed:'Feedback shown',next:'Next question requested',automatic_advance:'Advanced to next question',visibility_hidden:'Page hidden',visibility_visible:'Page visible',disconnect:'Connection lost',reconnect:'Connection restored',page_leave:'Page left',session_closed:'Recording ended',result_displayed:'Result shown',capture_gap:'Recording gap',
 round_created:'Round created',participant_joined:'Player joined',participant_left:'Player left',countdown_start:'Countdown started',round_start:'Round started',answer_accepted:'Answer saved',answer_rejected:'Answer not accepted',answer_ungraded:'Answer saved without grading',answer_finalized:'Answer finalized',score_progress:'Score and progress recorded',deadline_changed:'Time remaining changed',round_end:'Round ended',final_result:'Final result saved',
};
export const recordedEventLabel=(type:unknown)=>lookup(events,type)||'Recorded activity';
export function recordedDeviceSessions(events:{source?:unknown;segmentId?:unknown}[]){
 const sessions=new Map<string,number>();
 for(const event of events)if(event.source==='client'&&typeof event.segmentId==='string'&&event.segmentId&&!sessions.has(event.segmentId))sessions.set(event.segmentId,sessions.size+1);
 return sessions;
}
export function recordedSourceLabel(event:{source?:unknown;segmentId?:unknown},sessions:Map<string,number>){
 if(event.source==='server')return 'Server';
 if(event.source!=='client')return 'Recording source unavailable';
 const number=typeof event.segmentId==='string'?sessions.get(event.segmentId):undefined;
 return number?`Your device · Recording ${number}`:'Your device';
}
/** Display recorded user settings without serializing internal/version fields.
 * Missing historic fields stay unknown; no current preference is substituted. */
export function recordedSettingRows(manifest:ReplayManifest):[string,string][]{
 const settings=manifest.settings||{},count=manifest.questionCount,mix=settings.questionMix;
 const rows:[string,string][]=[['Topic',lookup(topics,settings.category)||'Not recorded'],['Difficulty',lookup(tiers,settings.difficulty)||'Not recorded'],['Questions',Number.isSafeInteger(count)&&count>=0?String(count):'Not recorded']];
 if(validQuestionMix(mix,count)){
  rows.push(['Question types',`${mix.multipleChoice} multiple choice · ${mix.freeResponse} free response`]);
  rows.push(['Question order',mix.order==='mcq-first'?'Multiple choice first':mix.order==='frq-first'?'Free response first':'Uniformly shuffled']);
 }else rows.push(['Question types',manifest.replayVersion===1?'Multiple choice':'Not recorded']);
 // First-to-score settings retain the unused timer preference. Do not present
 // that value as the duration of the recorded target-score round.
 if((manifest.mode==='rapid'||manifest.mode==='multiplayer'&&settings.winCondition==='time_limit')&&typeof settings.timeLimit==='number'&&Number.isFinite(settings.timeLimit)&&settings.timeLimit>0)rows.push(['Time limit',`${settings.timeLimit} seconds`]);
 if(settings.winCondition==='time_limit')rows.push(['Win condition','Highest score when time expires']);
 if(settings.winCondition==='first_to_n'){
  rows.push(['Win condition','First to the target score']);
  if(Number.isSafeInteger(settings.targetScore)&&settings.targetScore>0)rows.push(['Target score',String(settings.targetScore)]);
 }
 if(typeof settings.penalties==='boolean')rows.push(['Answer penalties',settings.penalties?'Enabled':'Disabled']);
 return rows;
}
