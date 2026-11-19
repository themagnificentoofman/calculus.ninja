// Private construction only; the caller must atomically commit the authorized
// intent, reservations and replay. No public route calls this helper directly.
import type {Data} from './firestore-admin.ts';
import type {GameSession,GameQuestion} from '../game-progress.ts';
import type {RoundSnapshot} from '../bank/contracts.ts';
import {finite,TOPICS} from '../progression.ts';
import {questionOrderMatches} from '../round-question-config.mjs';
export function initialAuthorizedGame(uid:string,request:Data,set:Data,profile:Data,at:number):GameSession{
 const questions=set.questions as GameQuestion[],mode=request.mode;
 if(!['test','rapid'].includes(mode))throw Error('Competitive authorized activation is not implemented.');
 const free=questions.some(q=>q.responseFormat==='free-response'),mixed=free&&questions.some(q=>q.responseFormat!=='free-response');
 if(free&&mode!=='test')throw Error('Free response requires individual Test practice.');
 if(request.questionMix&&!questionOrderMatches(questions,request.questionMix))throw Error('Saved question order changed.');
 const refs=questions.map((q,ordinal)=>({ordinal,problemId:q.problemId!,problemRevision:q.problemRevision!,contentHash:q.contentHash!,bankRelease:q.bankRelease!,familyId:q.familyId!,lineageId:q.lineageId!,constructionFamilyId:q.constructionFamilyId!,...(q.responseFormat==='free-response'?{responseFormat:'free-response' as const,answerContractId:q.answerContractId,answerContractHash:q.answerContractHash,graderVersion:q.graderVersion,parserVersion:q.parserVersion}:{choiceOrder:q.choiceOrder!})}));
 const roundSnapshot:RoundSnapshot={schemaVersion:free?3:2,selectionPolicy:set.diagnostics?.policy??'unrecorded-v1',relaxation:set.relaxation,questions:refs,...(set.diagnostics!==undefined?{diagnostics:set.diagnostics}:{})};
 const startTime=at+(mode==='rapid'?3000:0),timeLimit=mode==='rapid'?request.options.timeLimit:undefined;
 return {mode,status:'active',progressionVersion:3,replayVersion:free?2:1,...(free?{responseFormat:mixed?'mixed':'free-response'}:{}),...(request.questionMix?{questionMix:request.questionMix}:{}),...(timeLimit!==undefined?{originalTimeLimit:timeLimit,deadline:startTime+timeLimit*1000}:{}),players:[uid],scores:{[uid]:0},questions,roundSnapshot,category:request.category,difficulty:request.difficulty,answers:{},completedPlayers:[],pendingClaims:[],receipts:{},ratingSnapshot:{[uid]:{rating:finite(profile.rating),topicRatings:Object.fromEntries(TOPICS.map(t=>[t,finite(profile.topicRatings?.[t])]))}},createdAt:new Date(at),startTime};
}
