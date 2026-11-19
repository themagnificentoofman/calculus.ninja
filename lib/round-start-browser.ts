'use client';
import {isCompetitiveMode,sendCompetitiveStart} from './competitive-start.mjs';
import {createRoundStartClient,RoundStartRequestError} from './round-start.mjs';
import {apiRequest,ApiRequestError} from './game-session';

// Access browser globals only during an action, so importing a play screen
// during server rendering cannot read storage or start a request.
export const pendingRoundStart=createRoundStartClient({
 storage:{
  getItem:(key:string)=>localStorage.getItem(key),
  setItem:(key:string,value:string)=>localStorage.setItem(key,value),
  removeItem:(key:string)=>localStorage.removeItem(key),
 },
 withLock:<T>(key:string,callback:()=>Promise<T>|T)=>{
  if(typeof navigator==='undefined'||!navigator.locks)throw new RoundStartRequestError('BROWSER_UNSUPPORTED');
  return navigator.locks.request(key,callback);
 },
 send:async(uid:string,body:any,preparedId?:string)=>{
  try{return isCompetitiveMode(body.request?.mode) ? await sendCompetitiveStart(apiRequest,uid,body,preparedId) : await apiRequest('rounds',body,uid);}
  catch(error){throw new RoundStartRequestError(error instanceof ApiRequestError?(error.status===401?'SIGN_IN':error.code):'ROUND_RETRY');}
 },
 newId:()=>crypto.randomUUID(),
});
