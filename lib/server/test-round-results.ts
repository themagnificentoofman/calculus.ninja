import type {GameSession} from '../game-progress.ts';
import type {Data} from './firestore-admin.ts';
import {finite} from '../progression.ts';
/** Same completion for an MCQ or FRQ final question. Called in the transaction
 * only on the active -> finished transition; per-answer XP is already saved. */
export function finishTestWithFreeResponse(game:GameSession,uid:string,profile:Data,at:number){
 if(game.status!=='active'||game.mode!=='test'||game.players.length!==1||!['free-response','mixed'].includes(game.responseFormat||''))throw Error('Invalid mixed-format completion');
 const answers=Object.values(game.answers?.[uid]||{}),mc=answers.filter(a=>a.responseFormat!=='free-response').length;
 game.status='finished';game.finishedAt=at;game.logicalEndAt=at;game.endReason='all_finalized';game.completedPlayers=[uid];game.pendingClaims=[];
 const stats={...profile.freeResponseStats};stats.rounds=finite(stats.rounds)+1;profile.freeResponseStats=stats;
 if(mc)profile.gamesPlayed=finite(profile.gamesPlayed)+1;
 game.receipts||={};game.receipts[uid]={ratingChange:0,newRating:finite(profile.rating),topicChanges:{},outcome:'completed',rank:1,rated:false,counted:mc>0,statisticsKind:mc?'mixed':'free-response'};
}
