import {withCurrentReviews} from './solution-review-view.mjs';
import {observeReplay} from './replay/browser-events';
import {observeGameState} from './game-observer';
import {normalizeLobbyView} from './lobby';
import { auth, db } from '@/firebase';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import type { GameMode } from './progression';
import type { GameSession } from './game-progress';
import {createSeatClient} from './competitive-seat-client.mjs';
import {createApiRequest} from './api-request.mjs';
export {ApiRequestError} from './api-request.mjs';
export const apiRequest: (resource:string,body:Record<string,unknown>,expectedUid?:string)=>Promise<Record<string,any>> = createApiRequest({currentUser:()=>auth.currentUser});
export function gameView(game: any, progress: any = {}) {
  game = normalizeLobbyView(game);
  return { ...game, ...(['free-response','mixed'].includes(game.responseFormat)&&progress.freeResponseSummary?{freeResponseSummary:progress.freeResponseSummary}:{}), questions: (game.questions || []).map((q: any, index: number) => ({ ...q,...(q.responseFormat==='free-response'?{}:{correctIndex:-1}), explanation: [], ...progress.reviews?.[index] })),
    answers: { ...game.answers, ...(auth.currentUser && progress.answers ? { [auth.currentUser.uid]: progress.answers } : {}) } } as GameSession;
}
const currentReviews=new Map<string,Record<string,any>>();
const reviewKey=(uid:string,id:string)=>uid+':'+id;
const command = async (action: string, gameId?: string, data = {}, expectedUid?: string) => {
  const result = await apiRequest('games', { action, ...(gameId ? { gameId } : {}), ...data },expectedUid);
  if(gameId&&auth.currentUser&&result.progress?.reviews){
    currentReviews.set(reviewKey(auth.currentUser.uid,gameId),result.progress.reviews);
    if(currentReviews.size>32)currentReviews.delete(currentReviews.keys().next().value!);
  }
  if (result.game) result.game = gameView(result.game, result.progress);
  return result;
};
const seats=createSeatClient({command,currentUid:()=>auth.currentUser?.uid,storage:()=>sessionStorage,randomKey:()=>crypto.randomUUID()});
export const beginLobbyPagehide=(uid:string|undefined,body:ReturnType<typeof currentLobbyDeparture>)=>seats.pagehide(uid,body);
export const currentLobbyDeparture=(uid:string|undefined,id:string|null)=>seats.departure(uid,id);
export const gameProgress = {
  async createGame(_uid: string, mode: GameMode, set: { questionSetId: string }, options: any) {
    return (await apiRequest('games', { action: 'create', mode, questionSetId: set.questionSetId, options })).id as string;
  },
  async getGame(id: string, uid=auth.currentUser?.uid) { return (await seats.view(uid,id)).game as GameSession; },
  roomDestination: (uid:string,id:string,mode:string,result:Record<string,any>) => seats.toRoom(uid,id,mode,result),
  joinGame: (id: string, uid: string, mode: string, source:'manual'|'link'='manual') => seats.join(uid,id,mode,source),
  leaveGame: (id: string, uid:string) => seats.leave(uid,id),
  heartbeatGame: (id: string, uid: string, key?: string) => seats.heartbeat(uid,id,key),
  sweepLobbies: (mode: string) => apiRequest('games', { action: 'sweep', mode }),
  startGame: (id: string, uid: string) => command('start', id, {}, uid),
  async submitAnswer(id:string,uid:string,index:number,selectedOption:number){
    const key=`answer-request:${uid}:${id}:${index}`;let requestId:string=crypto.randomUUID();
    try{requestId=sessionStorage.getItem(key)||requestId;sessionStorage.setItem(key,requestId);}catch{}
    observeReplay(id,'submission_started',{questionIndex:index,selectedOption,requestId});
    try{const result=await command('answer',id,{index,selectedOption,requestId});observeReplay(id,'answer_response',{questionIndex:index,requestId,serverEventId:result.answer?.serverEventId});return result;}
    catch(error){observeReplay(id,'submission_rejected',{questionIndex:index,requestId,reason:'transport-uncertain'});throw error;}
  },
  async submitFreeResponse(id:string,uid:string,index:number,action:'fr-submit'|'fr-skip'|'fr-reveal',source:string){
    const body={index,...(action==='fr-submit'?{source}:{})},key=`fr-request:${uid}:${id}:${index}`,identity=JSON.stringify({action,...body});let requestId=crypto.randomUUID();
    try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved?.identity===identity&&typeof saved.requestId==='string')requestId=saved.requestId;localStorage.setItem(key,JSON.stringify({identity,requestId}));}catch{}
    observeReplay(id,'submission_started',{questionIndex:index,requestId});
    try{const result=await command(action,id,{...body,requestId});observeReplay(id,'answer_response',{questionIndex:index,requestId,serverEventId:result.answer?.serverEventId});return result;}
    catch(error){observeReplay(id,'submission_rejected',{questionIndex:index,requestId,reason:'transport-uncertain'});throw error;}
  },
  completeGame: (id: string, _uid: string) => command('complete', id),
  async claimResult(id: string, _uid: string) { return (await command('claim', id)).receipt; },
  syncPendingResults: (_uid: string) => command('sync'),
  watchGame(id: string, uid: string, callback: (game: GameSession) => void, onError: (error: unknown) => void, onUnavailable?: () => void) {
    return observeGameState(uid,
      (next, error) => onSnapshot(doc(db, 'games', id), s => { if (s.exists()) next(normalizeLobbyView(s.data())); else if (!s.metadata.fromCache) next(null); }, error),
      (next, error) => onSnapshot(doc(db, 'games', id, 'reviews', uid), s => next(s.data()), error),
      (game, progress) => callback(gameView(game, withCurrentReviews(progress,currentReviews.get(reviewKey(uid,id))))),
      onError, onUnavailable);
  },
  watchPendingResults(uid: string, onError: (error: unknown) => void) {
    let stopped = false, syncing = false, expired = false, retry: ReturnType<typeof setTimeout> | undefined;
    const sync = async () => { if (stopped || syncing || !expired) return; syncing = true; clearTimeout(retry); try { await command('sync'); } catch (e) { if (!stopped) { onError(e); retry = setTimeout(sync,60000); } } finally { syncing = false; } };
    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    const stop = onSnapshot(query(collection(db, 'games'), where('players', 'array-contains', uid), where('status', '==', 'active')), snapshot => {
      for (const timer of timers.values()) clearTimeout(timer); timers.clear();
      expired = false;
      for (const row of snapshot.docs) { const g = row.data(); if (g.progressionVersion === 3 && g.deadline) {
        if (g.deadline <= Date.now()) expired = true;
        timers.set(row.id, setTimeout(() => { expired = true; void sync(); }, Math.max(0, g.deadline - Date.now()) + 50));
      } }
      if (!snapshot.docs.length) clearTimeout(retry);
    }, onError);
    window.addEventListener('online', sync);
    return () => { stopped = true; stop(); clearTimeout(retry); window.removeEventListener('online', sync); for (const timer of timers.values()) clearTimeout(timer); };
  },
};
