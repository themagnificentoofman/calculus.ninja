import {competitiveStartRequest,isCompetitiveMode,isCompetitiveRoomId} from './competitive-start.mjs';
import {validateQuestionRequest} from './server/questions-policy.mjs';
import {validQuestionMix} from './round-question-config.mjs';

const ownedMessages=new WeakMap(),ownedCodes=new WeakMap();
class RoundStartMessage extends Error {constructor(message){super(message);ownedMessages.set(this,message);}}
const safe=message=>new RoundStartMessage(message);
const publicRequestMessages={
 ROUND_SELECTION_LIMIT:'Question selection limit reached. Please try again later.',
 ROUND_REQUEST_LIMIT:'Too many requests. Please wait a moment and retry.',
 INSUFFICIENT_CONTENT:'This question mix is currently unavailable. Cancel the pending start to choose another topic or mix.',
 PENDING_ROUNDS:'Finish or resume an existing round before starting another.',
 ROUND_CREATION_UNAVAILABLE:'New rounds are temporarily unavailable. Please try again later.',
 ROUND_REQUEST_CHANGED:'This pending round has different settings. Resume or cancel it before starting another.',
 ROUND_NOT_PREPARED:'This pending round is no longer available. Cancel its saved start before choosing a new round.',
 ROUND_POLICY_CHANGED:'The available problems changed. Cancel this pending start before choosing a new round.',
 ROUND_HISTORY_CHANGED:'Your recent rounds changed. Resume an existing round or cancel this pending start before trying again.',
 ROUND_TYPE_UNAVAILABLE:'This round type is currently unavailable.',
 INVALID_ROUND_REQUEST:'Choose a supported round configuration and try again.',
 SIGN_IN:'Please sign in to the same account before resuming this round.',
 BROWSER_UNSUPPORTED:'This browser cannot safely resume pending rounds. Please use a current browser version.',
};
const retryMessage='The server could not finish this round request. Please retry in this browser.';
export class RoundStartRequestError extends Error {
 constructor(code){const known=typeof code==='string'&&Object.hasOwn(publicRequestMessages,code);super(known?publicRequestMessages[code]:retryMessage);this.code=known?code:'ROUND_RETRY';ownedCodes.set(this,this.code);}
}
const frozenCopy=value=>{const copy=JSON.parse(JSON.stringify(value));const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};return freeze(copy);};
const message='Your saved round could not be read. Please try again in this browser before starting another round.';
const fail=()=>{throw safe(message);};
const id=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]{5,128}$/.test(value)&&!['constructor','prototype','__proto__'].includes(value);
const gameId=(value,mode)=>isCompetitiveMode(mode)?isCompetitiveRoomId(value):typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const operationValid=(value,mode)=>id(value)&&(!isCompetitiveMode(mode)||/^[a-zA-Z0-9_-]{12,96}$/.test(value));
const canonical=value=>JSON.stringify(value&&typeof value==='object'?(Array.isArray(value)?value.map(v=>JSON.parse(canonical(v))):Object.fromEntries(Object.keys(value).sort().map(k=>[k,JSON.parse(canonical(value[k]))]))):value);
function configuration(value,mode){
 let source;
 try{source=JSON.stringify(value);if(!source||source.length>8192)fail();}catch{fail();}
 const v=JSON.parse(source);
 if(mode===undefined)mode=v?.mode;
 if(isCompetitiveMode(mode)){const request=v?.mode===mode&&competitiveStartRequest(v);if(!request)fail();return request;}
 if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!['mode','category','difficulty','count','tag','responseFormat','questionMix','options'].includes(k))||!validateQuestionRequest(v)||!['test','rapid'].includes(mode)||v.mode!==mode)fail();
 if(v.tag!==undefined&&(typeof v.tag!=='string'||!/^[a-z][a-z0-9-]{1,63}$/.test(v.tag)))fail();
 if(v.responseFormat!==undefined&&!['multiple-choice','free-response'].includes(v.responseFormat))fail();
 if(v.questionMix!==undefined&&(mode!=='test'||v.responseFormat!==undefined||!validQuestionMix(v.questionMix,v.count)))fail();
 if(v.responseFormat==='free-response'&&mode!=='test')fail();
 const options=v.options??{};
 if(!options||typeof options!=='object'||Array.isArray(options))fail();
 if(mode==='test'?Object.keys(options).length>0:Object.keys(options).length!==1||!Object.hasOwn(options,'timeLimit')||!Number.isInteger(options.timeLimit)||options.timeLimit<30||options.timeLimit>300)fail();
 return {...v,options};
}

/** Persist the deliberate action before any request. An uncertain outcome
 * keeps its original identity/body; only an acknowledged terminal result or
 * an explicitly observed round permits clearing it. Dependencies are browser
 * storage, an exclusive per-key lock, and an account-bound transport. */
export function createRoundStartClient({storage,withLock,send,newId}){
 const key=(uid,mode)=>{if(!id(uid)||(!['test','rapid'].includes(mode)&&!isCompetitiveMode(mode)))fail();return `round-start-1:${uid}:${mode}`;};
 function read(uid,mode){
  let raw;
  try{raw=storage.getItem(key(uid,mode));}catch{fail();}
  if(raw===null)return null;
  try{
   if(typeof raw!=='string'||raw.length>10000)fail();const v=JSON.parse(raw);
   if(!v||typeof v!=='object'||Array.isArray(v)||v.version!==1||!operationValid(v.operationId,mode)||!['pending','issued'].includes(v.stage)||Object.keys(v).some(k=>!['version','operationId','request','stage','roundId'].includes(k))||(v.stage==='issued'?!gameId(v.roundId,mode):Object.hasOwn(v,'roundId')))fail();
   return {...v,request:configuration(v.request,mode)};
  }catch{fail();}
 }
 const write=(uid,mode,value)=>{try{const raw=JSON.stringify(value);storage.setItem(key(uid,mode),raw);if(storage.getItem(key(uid,mode))!==raw)fail();}catch{throw safe('This browser could not save the pending start. Please retry in this browser.');}};
 const remove=(uid,mode)=>{try{storage.removeItem(key(uid,mode));if(storage.getItem(key(uid,mode))!==null)fail();}catch{throw safe('This browser could not clear the pending start. Please retry.');}};
 const locked=async(uid,mode,callback)=>{try{return await withLock(key(uid,mode),callback);}catch(error){if(ownedMessages.has(error))throw safe(ownedMessages.get(error));if(ownedCodes.has(error))throw new RoundStartRequestError(ownedCodes.get(error));throw safe('This browser could not resume the pending start. Please retry.');}};
 const callServer=async(uid,body,preparedId=undefined)=>{try{return await send(uid,frozenCopy(body),preparedId);}catch(error){throw new RoundStartRequestError(ownedCodes.get(error)||'ROUND_RETRY');}};
 const summary=(value,count,mode)=>{if(!value||!gameId(value.questionSetId,mode)||value.questionCount!==count||!['PREPARED','ISSUED','CANCELLED','EXPIRED'].includes(value.status))throw safe('The round response could not be read. Please retry.');return {questionSetId:value.questionSetId,questionCount:value.questionCount,status:value.status};};
 async function startSaved(uid,mode,saved){
  if(saved.stage==='issued')return saved.roundId;
  const body={operationId:saved.operationId,request:saved.request};
  const prepared=summary(await callServer(uid,{action:'prepare',...body}),saved.request.count,mode);
  if(['CANCELLED','EXPIRED'].includes(prepared.status))throw safe('This pending round has ended. Cancel its saved start before choosing a new round.');
  const result=await callServer(uid,{action:'activate',...body},prepared.questionSetId);
  if(!gameId(result?.id,mode)||result.id!==prepared.questionSetId)throw safe('The round response could not be read. Please retry.');
  write(uid,mode,{...saved,stage:'issued',roundId:result.id});
  return result.id;
 }
 return Object.freeze({
  async pending(uid,mode){return locked(uid,mode,()=>{const v=read(uid,mode);return v?{request:v.request,issued:v.stage==='issued',...(v.roundId?{roundId:v.roundId}:{})}:null;});},
  async start(uid,value){const request=configuration(value),mode=request.mode;return locked(uid,mode,async()=>{
   let saved=read(uid,mode);
   if(saved&&canonical(saved.request)!==canonical(request))throw safe('A round with different settings is pending. Resume or cancel it before starting another.');
   if(!saved){const operationId=newId();if(!operationValid(operationId,mode))fail();saved={version:1,operationId,request,stage:'pending'};write(uid,mode,saved);}
   return startSaved(uid,mode,saved);
  });},
  async resume(uid,mode){return locked(uid,mode,()=>{const saved=read(uid,mode);if(!saved)throw safe('There is no saved round to resume. Choose your settings and start a round.');return startSaved(uid,mode,saved);});},
  async cancel(uid,mode){return locked(uid,mode,async()=>{
   const saved=read(uid,mode);if(!saved)return {status:'cleared'};
   const result=summary(await callServer(uid,{action:'cancel',operationId:saved.operationId,request:saved.request}),saved.request.count,mode);
   if(saved.stage==='issued'&&(result.status!=='ISSUED'||result.questionSetId!==saved.roundId))throw safe('The round response did not match the saved round. Please retry to resume it.');
   if(result.status==='ISSUED'){
    write(uid,mode,{...saved,stage:'issued',roundId:result.questionSetId});return {status:'issued',roundId:result.questionSetId};
   }
   if(!['CANCELLED','EXPIRED'].includes(result.status))throw safe('This pending round could not be cancelled yet. Please retry.');
   remove(uid,mode);return {status:'cleared'};
  });},
  async acknowledge(uid,mode,roundId){return locked(uid,mode,()=>{
   const saved=read(uid,mode);if(!saved)return;
   if(saved.stage!=='issued'||saved.roundId!==roundId)throw safe('A different round is still pending. Resume it before starting another.');
   remove(uid,mode);
  });},
 });
}
