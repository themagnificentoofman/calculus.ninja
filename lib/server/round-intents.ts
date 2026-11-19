// Private preparation lifecycle. Activation must additionally obtain and bind
// a current D1 authorization and commit the game/replay in one transaction.
// This service is not exposed by runtime-api until that protocol is complete.
import type {Store, Data} from './firestore-admin.ts';
import {boundedJsonSnapshot} from './bounded-json-snapshot.mjs';
import {canonical,hex} from '../bank/compact-codec.mjs';
import {selectionHistorySnapshot,selectionHistoryToken} from './selection-history-token.mjs';
import {reserveQuestionSet,cancelPreparedReservation,assertReservationAvailability,RESERVATION_LIFETIMES} from '../bank/issuance-reservations.mjs';
import {validateQuestionRequest,validQuestionResponse} from './questions-policy.mjs';
import {validQuestionMix,questionOrderMatches} from '../round-question-config.mjs';
import {verifyAuthorizationReceipt} from './round-authorizations.mjs';
import {initialAuthorizedGame} from './initial-authorized-game.ts';
import {playerView,saveGame} from './game-engine.ts';
import {recordTransition,serverChunkPath} from './replay-recording.ts';
import {recordExposures} from '../bank/exposure.ts';
import type {GameSession} from '../game-progress.ts';

export const ROUND_INTENT_VERSION='round-intent-1';
export const ROUND_CREATION_CONTROL='roundCreation/control';
const hash=async(value:unknown)=>hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical(value))));
const clock=(value:unknown):value is number=>Number.isSafeInteger(value)&&Number(value)>=0&&Number(value)<=8640000000000000;
const id=(value:unknown):value is string=>typeof value==='string'&&/^[a-zA-Z0-9_-]{5,128}$/.test(value)&&!['__proto__','constructor','prototype'].includes(value);
const digest=(value:unknown):value is string=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
export class RoundIntentError extends Error {
  status:number;code:string;
  constructor(message:string,code='INVALID_ROUND_REQUEST',status=400){super(message);this.name='RoundIntentError';this.status=status;this.code=code;}
}
const check=(condition:unknown,message:string,code='INVALID_ROUND_REQUEST',status=400)=>{if(!condition)throw new RoundIntentError(message,code,status);};
const conflict=()=>new RoundIntentError('This round request was already used with different settings. Start a new round.','ROUND_REQUEST_CHANGED',409);
const owns=(value:Data,allowed:string[])=>Object.keys(value).every(key=>allowed.includes(key));
export interface RoundIdentity { id:string;uid:string;operationId:string;request:Data;requestHash:string }
export interface RoundSummary {questionSetId:string;questionCount:number;status:'PREPARED'|'ISSUED'|'CANCELLED'|'EXPIRED'}

/** The client supplies one operation ID for one deliberate start action.
 * Server-only preferences/policies belong to the selected binding, so a retry
 * after a preference change still recovers the original exact operation. */
export async function roundIdentity(uid:string,operationId:string,value:unknown):Promise<RoundIdentity>{
  check(id(uid)&&id(operationId),'Invalid round request identifier.');
  const request=boundedJsonSnapshot(value,{maxBytes:8192,maxNodes:100,maxDepth:4}) as Data;
  check(request&&typeof request==='object'&&!Array.isArray(request)&&owns(request,['mode','category','difficulty','count','tag','responseFormat','questionMix','options']),'Invalid round request fields.');
  const input=validateQuestionRequest(request);
  check(input&&['test','rapid','pvp','multiplayer'].includes(request.mode),'Choose a supported round configuration.');
  check(request.tag===undefined||typeof request.tag==='string'&&/^[a-z][a-z0-9-]{1,63}$/.test(request.tag),'Invalid topic filter.');
  check(request.responseFormat===undefined||['multiple-choice','free-response'].includes(request.responseFormat),'Invalid answer format.');
  if(request.questionMix!==undefined)check(request.mode==='test'&&request.responseFormat===undefined&&validQuestionMix(request.questionMix,request.count),'Invalid question mix.');
  if(request.responseFormat==='free-response')check(request.mode==='test','Free response is available only in individual Test practice.');
  // Bind meaningful mode options at preparation, including timed and shared
  // rounds. Irrelevant options are rejected, not silently rebound at activation.
  const options=request.options??{};
  check(options&&typeof options==='object'&&!Array.isArray(options),'Invalid round settings.');
  const integer=(n:unknown,min:number,max:number)=>Number.isInteger(n)&&Number(n)>=min&&Number(n)<=max;
  if(request.mode==='rapid')check(owns(options,['timeLimit'])&&integer(options.timeLimit,30,300),'Choose a 30–300 second time limit.');
  else if(request.mode==='multiplayer')check(owns(options,['winCondition','targetScore','timeLimit','penalties'])&&['first_to_n','time_limit'].includes(options.winCondition)&&integer(options.targetScore,1,20)&&integer(options.timeLimit,30,300)&&typeof options.penalties==='boolean','Invalid multiplayer settings.');
  else check(Object.keys(options).length===0,'This round does not accept additional settings.');
  const normalized=Object.freeze({...request,options:Object.freeze(options)});
  const requestHash=await hash(normalized),key=await hash({version:ROUND_INTENT_VERSION,uid,operationId});
  return Object.freeze({id:key,uid,operationId,request:normalized,requestHash});
}
async function checkedIdentity(identity:RoundIdentity){
  const owned=boundedJsonSnapshot(identity,{maxBytes:10000,maxNodes:120,maxDepth:5});
  check(owned&&owns(owned,['id','uid','operationId','request','requestHash']),'Invalid round identity.');
  const expected=await roundIdentity(owned.uid,owned.operationId,owned.request);
  check(owned.id===expected.id&&owned.requestHash===expected.requestHash,'Invalid round identity binding.');
  return expected;
}
export function creationControl(value:unknown){
  const control=boundedJsonSnapshot(value,{maxBytes:1024,maxNodes:12,maxDepth:2}) as Data;
  check(control&&typeof control==='object'&&!Array.isArray(control)&&owns(control,['version','enabled'])&&Number.isSafeInteger(control.version)&&control.version>=1&&typeof control.enabled==='boolean','Round creation is currently unavailable.','ROUND_CREATION_UNAVAILABLE',409);
  return control as {version:number;enabled:boolean};
}
function advance(history:Data){
  const generation=history.issuanceGeneration??0;
  check(Number.isSafeInteger(generation)&&generation>=0&&generation<Number.MAX_SAFE_INTEGER,'The round history cannot accept a new operation.','ROUND_HISTORY_UNAVAILABLE',409);
  return {...history,issuanceGeneration:generation+1};
}
function readIntent(raw:Data|null,identity:RoundIdentity):Data|null {
  if(raw===null)return null;
  const intent=boundedJsonSnapshot(raw,{maxBytes:12000,maxNodes:150,maxDepth:6});
  check(intent.version===ROUND_INTENT_VERSION&&owns(intent,['version','id','uid','operationId','request','requestHash','state','count','createdAt','expiresAt','terminalAt','binding','controlVersion','selectionHash','preparedHistoryToken']),'Invalid saved round intent.','ROUND_STATE_UNAVAILABLE',409);
  if(intent.id!==identity.id||intent.uid!==identity.uid||intent.operationId!==identity.operationId||intent.requestHash!==identity.requestHash||canonical(intent.request)!==canonical(identity.request))throw conflict();
  check(['PREPARED','ISSUED','CANCELLED','EXPIRED'].includes(intent.state)&&intent.count===identity.request.count&&clock(intent.createdAt)&&clock(intent.expiresAt)&&intent.expiresAt-intent.createdAt===RESERVATION_LIFETIMES.prepared,'Invalid saved round lifetime.','ROUND_STATE_UNAVAILABLE',409);
  if(intent.state==='PREPARED'||intent.state==='ISSUED')check(digest(intent.binding)&&digest(intent.selectionHash)&&digest(intent.preparedHistoryToken)&&Number.isSafeInteger(intent.controlVersion)&&intent.controlVersion>=1,'Invalid saved round binding.','ROUND_STATE_UNAVAILABLE',409);
  if(intent.state==='CANCELLED'||intent.state==='EXPIRED')check(clock(intent.terminalAt)&&intent.terminalAt>=intent.createdAt,'Invalid terminal round state.','ROUND_STATE_UNAVAILABLE',409);
  return intent;
}
const summary=(intent:Data):RoundSummary=>({questionSetId:intent.id,questionCount:intent.count,status:intent.state});
function terminal(intent:Data,state:'CANCELLED'|'EXPIRED',at:number){
  // Retain identity/body/binding permanently for now. There is no TTL deletion
  // or ID reuse. Removing unserved payloads does not remove historical games.
  check(at>=intent.createdAt,'This round is temporarily unavailable. Please try again.','ROUND_CLOCK_UNAVAILABLE',409);
  return {...intent,state,terminalAt:at};
}

function savedPreparation(raw:Data|null){
  // Firestore timestamps are Date instances; everything else remains bounded
  // own-data JSON. Inspect descriptors before reading any property.
  check(raw&&typeof raw==='object'&&Object.getPrototypeOf(raw)===Object.prototype,'The prepared question set is unavailable.','ROUND_STATE_UNAVAILABLE',409);
  const fields=Object.getOwnPropertyDescriptors(raw!);
  check(Reflect.ownKeys(raw!).every(key=>typeof key==='string'&&fields[key].enumerable&&Object.hasOwn(fields[key],'value')),'Invalid prepared question fields.','ROUND_STATE_UNAVAILABLE',409);
  const date=fields.expiresAt?.value;
  check(date instanceof Date&&Object.getPrototypeOf(date)===Date.prototype,'Invalid prepared question expiry.','ROUND_STATE_UNAVAILABLE',409);
  const expiresAt=Date.prototype.getTime.call(date);
  const owned=boundedJsonSnapshot({...raw,expiresAt},{maxBytes:760000,maxNodes:60100,maxDepth:42}) as Data;
  check(owns(owned,['uid','mode','category','difficulty','questions','relaxation','diagnostics','questionMix','intentVersion','binding','selectionHash','policy','expiresAt'])&&clock(expiresAt),'Invalid prepared question fields.','ROUND_STATE_UNAVAILABLE',409);
  return owned;
}
async function checkedPreparation(identity:RoundIdentity,current:Data,saved:Data|null){
  const set=savedPreparation(saved),request=identity.request;
  check(set.uid===identity.uid&&set.mode===request.mode&&set.category===request.category&&set.difficulty===request.difficulty&&set.intentVersion===ROUND_INTENT_VERSION&&set.expiresAt===current.expiresAt&&set.binding===current.binding&&set.selectionHash===current.selectionHash&&canonical(set.questionMix??null)===canonical(request.questionMix??null),'The prepared round binding changed.','ROUND_STATE_UNAVAILABLE',409);
  const selected={questions:set.questions,relaxation:set.relaxation,...(set.diagnostics!==undefined?{diagnostics:set.diagnostics}:{})};
  check(await hash({selected,policy:set.policy})===current.selectionHash&&await hash({version:ROUND_INTENT_VERSION,id:identity.id,requestHash:identity.requestHash,selectionHash:current.selectionHash,controlVersion:current.controlVersion})===current.binding,'The prepared questions changed.','ROUND_STATE_UNAVAILABLE',409);
  return set;
}
function fixedAuthorization(identity:RoundIdentity,intent:Data,policy:Data){
  check(digest(policy?.selectionPolicyHash),'Invalid saved authorization policy.','ROUND_STATE_UNAVAILABLE',409);
  return {intent_id:identity.id,binding:intent.binding,request_hash:identity.requestHash,selection_hash:intent.selectionHash,policy_hash:policy.selectionPolicyHash,control_version:intent.controlVersion,intent_expires:intent.expiresAt};
}
function checkedHolds(identity:RoundIdentity,intent:Data,set:Data,recent:Data,at:number){
  const state=assertReservationAvailability(recent,at),own=state.reservations.filter((r:Data)=>r.roundId===identity.id);
  check(own.length===identity.request.count&&own.every((r:Data)=>r.stage==='prepared'&&r.at===intent.createdAt&&r.expiresAt===intent.expiresAt&&set.questions.some((q:Data)=>q.problemId===r.problemId&&q.lineageId===r.lineageId)),'The preparation hold changed or expired. Please start a new round.','ROUND_RESERVATION_CHANGED',409);
  reserveQuestionSet(recent,identity.id,set.questions,'prepared',at);
  return state;
}
async function checkedActive(identity:RoundIdentity,intent:Data|null,game:Data|null,raw:Data|null){
  if(intent?.state!=='ISSUED'){
    check(!game&&!raw,'The round activation state is inconsistent.','ROUND_STATE_UNAVAILABLE',409);
    return null;
  }
  check(game&&raw,'The active round is unavailable.','ROUND_STATE_UNAVAILABLE',409);
  const active=boundedJsonSnapshot(raw,{maxBytes:800000,maxNodes:62000,maxDepth:43}) as Data;
  check(owns(active,['version','uid','id','binding','activatedAt','policy','selection','receipt'])&&active.version===ROUND_INTENT_VERSION&&active.uid===identity.uid&&active.id===identity.id&&active.binding===intent.binding&&clock(active.activatedAt)&&active.activatedAt>=intent.createdAt&&active.activatedAt<intent.expiresAt,'Invalid saved activation.','ROUND_STATE_UNAVAILABLE',409);
  check(active.selection&&typeof active.selection==='object'&&!Array.isArray(active.selection)&&owns(active.selection,['relaxation','diagnostics'])&&typeof active.selection.relaxation==='string','Invalid saved activation selection.','ROUND_STATE_UNAVAILABLE',409);
  const receipt=await verifyAuthorizationReceipt(active.receipt,fixedAuthorization(identity,intent,active.policy));
  const request=identity.request;
  check(receipt&&game!.players?.includes(identity.uid)&&game!.mode===request.mode&&game!.category===request.category&&game!.difficulty===request.difficulty&&canonical(game!.questionMix??null)===canonical(request.questionMix??null),'The active round binding changed.','ROUND_STATE_UNAVAILABLE',409);
  const questions=boundedJsonSnapshot(game!.questions,{maxBytes:750000,maxNodes:60000,maxDepth:40});
  check(await hash({selected:{questions,...active.selection},policy:active.policy})===intent.selectionHash,'The active questions changed.','ROUND_STATE_UNAVAILABLE',409);
  return {id:identity.id,...playerView(game as GameSession,identity.uid)};
}

export function createRoundIntents(store:Store,now:()=>number=Date.now){
  const time=()=>{const at=now();check(clock(at)&&at+RESERVATION_LIFETIMES.prepared<=8640000000000000,'Invalid round clock.');return at;};
  const paths=(identity:RoundIdentity)=>({intent:`roundIntents/${identity.id}`,set:`questionSets/${identity.id}`,history:`bankRecent/${identity.uid}`});

  /** Recover before selection or eligibility reads. Only an opaque summary
   * crosses the request boundary; no questions, keys, contracts or policy. */
  async function recover(input:RoundIdentity):Promise<RoundSummary|null>{
    const identity=await checkedIdentity(input),p=paths(identity);
    return store.transaction(async tx=>{
      const [raw,history]=await Promise.all([tx.get(p.intent),tx.get(p.history)]),intent=readIntent(raw,identity),at=time();
      if(!intent)return null;
      if(intent.state==='PREPARED'&&intent.expiresAt<=at){
        const state=terminal(intent,'EXPIRED',at),recent=selectionHistorySnapshot(history||{});
        tx.set(p.intent,state);tx.delete(p.set);
        tx.set(p.history,advance({...recent,...cancelPreparedReservation(recent,identity.id,at)}));
        return summary(state);
      }
      return summary(intent);
    });
  }

  /** The exact final order and all payloads must already be selected outside
   * this retryable transaction. The first successful preparation wins. */
  async function prepare(input:RoundIdentity,selectionValue:unknown,selectedFromHistory:string,policyValue:unknown):Promise<RoundSummary>{
    // Detach all inputs before the first await; a caller cannot change the
    // selection or policy while identity hashing is in progress.
    const selected=boundedJsonSnapshot(selectionValue,{maxBytes:750000,maxNodes:60000,maxDepth:40}) as Data;
    const policy=boundedJsonSnapshot(policyValue,{maxBytes:1024,maxNodes:12,maxDepth:2}) as Data;
    const identity=await checkedIdentity(input),p=paths(identity);
    check(selected&&typeof selected==='object'&&!Array.isArray(selected)&&owns(selected,['questions','relaxation','diagnostics']),'Invalid selected round.');
    check(selected.diagnostics===undefined||selected.diagnostics&&typeof selected.diagnostics==='object'&&!Array.isArray(selected.diagnostics),'Invalid selection diagnostics.');
    const request=identity.request;
    check(validQuestionResponse(selected.questions,{...request,responseFormat:request.responseFormat??'multiple-choice'})&&(!request.questionMix||questionOrderMatches(selected.questions,request.questionMix)),'The selected questions do not match the round request.');
    check(['none','recent-families','recent-problems','family-cap'].includes(selected.relaxation),'Invalid selection policy result.');
    if(selected.questions.some((q:Data)=>q.responseFormat==='free-response'))check(selected.relaxation==='none','Free-response rounds require the full distinct-content policy.');
    check(digest(selectedFromHistory),'Invalid selected history.');
    check(policy&&owns(policy,['registryHash','selectionPolicyHash','includeLegacy'])&&digest(policy.registryHash)&&digest(policy.selectionPolicyHash)&&typeof policy.includeLegacy==='boolean','Invalid round policy binding.');
    // All current candidates require stable identity and lineage, including MC.
    check(selected.questions.every((q:Data)=>id(q.problemId)&&typeof q.lineageId==='string'&&q.lineageId.length>0&&typeof q.familyId==='string'&&q.familyId.length>0),'The selected question identity is incomplete.');
    const selectionHash=await hash({selected,policy});
    return store.transaction(async tx=>{
      const [raw,saved,rawHistory,rawControl]=await Promise.all([tx.get(p.intent),tx.get(p.set),tx.get(p.history),tx.get(ROUND_CREATION_CONTROL)]);
      const existing=readIntent(raw,identity),at=time();
      // A concurrent identical HTTP retry may have selected a different random
      // set before either commit. Recover the FIRST committed selection.
      if(existing){
        if(existing.state==='PREPARED'&&existing.expiresAt<=at){
          const state=terminal(existing,'EXPIRED',at),recent=selectionHistorySnapshot(rawHistory||{});
          tx.set(p.intent,state);tx.delete(p.set);tx.set(p.history,advance({...recent,...cancelPreparedReservation(recent,identity.id,at)}));return summary(state);
        }
        return summary(existing);
      }
      check(!saved,'This round identifier is already in use.','ROUND_STATE_UNAVAILABLE',409);
      const control=creationControl(rawControl);
      check(control.enabled,'Round creation is currently unavailable.','ROUND_CREATION_UNAVAILABLE',409);
      const recent=selectionHistorySnapshot(rawHistory||{});
      check(selectedFromHistory===await selectionHistoryToken(recent),'Your practice history changed while selecting questions. Please request a new round.','ROUND_HISTORY_CHANGED',409);
      const held=advance({...recent,...reserveQuestionSet(recent,identity.id,selected.questions,'prepared',at)});
      const binding=await hash({version:ROUND_INTENT_VERSION,id:identity.id,requestHash:identity.requestHash,selectionHash,controlVersion:control.version});
      const intent={version:ROUND_INTENT_VERSION,...identity,state:'PREPARED',count:request.count,createdAt:at,expiresAt:at+RESERVATION_LIFETIMES.prepared,binding,controlVersion:control.version,selectionHash,preparedHistoryToken:await selectionHistoryToken(held)};
      tx.set(p.intent,intent);
      tx.set(p.set,{uid:identity.uid,mode:request.mode,category:request.category,difficulty:request.difficulty,questions:selected.questions,relaxation:selected.relaxation,...(selected.diagnostics!==undefined?{diagnostics:selected.diagnostics}:{}),...(request.questionMix?{questionMix:request.questionMix}:{}),intentVersion:ROUND_INTENT_VERSION,binding,selectionHash,policy,expiresAt:new Date(intent.expiresAt)});
      tx.set(p.history,held);
      return summary(intent);
    });
  }

  /** Unknown-ID cancellation leaves a tombstone: a preparation whose request
   * was already in flight cannot later turn that cancelled action into a game. */
  async function cancel(input:RoundIdentity):Promise<RoundSummary>{
    const identity=await checkedIdentity(input),p=paths(identity);
    return store.transaction(async tx=>{
      const [raw,history,saved]=await Promise.all([tx.get(p.intent),tx.get(p.history),tx.get(p.set)]),at=time();
      const existing=readIntent(raw,identity);
      if(existing&&existing.state!=='PREPARED')return summary(existing);
      check(existing||!saved,'This round identifier is already in use.','ROUND_STATE_UNAVAILABLE',409);
      const base=existing||{version:ROUND_INTENT_VERSION,...identity,state:'PREPARED',count:identity.request.count,createdAt:at,expiresAt:at+RESERVATION_LIFETIMES.prepared};
      const state=terminal(base,existing&&existing.expiresAt<=at?'EXPIRED':'CANCELLED',at),recent=selectionHistorySnapshot(history||{});
      tx.set(p.intent,state);if(existing)tx.delete(p.set);
      tx.set(p.history,advance({...recent,...cancelPreparedReservation(recent,identity.id,at)}));
      return summary(state);
    });
  }

  /** SERVER-ONLY material for the external eligibility/authorization step.
   * The caller must recover an already-active exact game first. This validates
   * persistence and reservation integrity, not current D1 eligibility. Never
   * serialize the returned question set to an unactivated client. */
  async function readForAuthorization(input:RoundIdentity){
    const identity=await checkedIdentity(input),p=paths(identity);
    return store.transaction(async tx=>{
      const [raw,saved,rawHistory,rawControl]=await Promise.all([tx.get(p.intent),tx.get(p.set),tx.get(p.history),tx.get(ROUND_CREATION_CONTROL)]);
      const intent=readIntent(raw,identity),at=time();
      check(intent?.state==='PREPARED'&&intent.expiresAt>at,'This round is no longer prepared. Resume it if active, or start a new round.','ROUND_NOT_PREPARED',409);
      check(at>=intent!.createdAt,'This round is temporarily unavailable. Please try again.','ROUND_CLOCK_UNAVAILABLE',409);
      const current=intent!,set=await checkedPreparation(identity,current,saved),control=creationControl(rawControl);
      check(control.enabled&&control.version===current.controlVersion,'Round creation changed while preparing this round. Please start again.','ROUND_CREATION_CHANGED',409);
      const recent=selectionHistorySnapshot(rawHistory||{}),state=checkedHolds(identity,current,set,recent,at);
      // Detect an actual late display/other hold overlapping this preparation;
      // exact own holds are checked first, so this cannot silently create them.
      const historyToken=await selectionHistoryToken(recent);
      // Revalidation excludes ONLY this operation's unserved preparation. The
      // actual stored history and the token for activation remain unchanged.
      const selectionHistory=selectionHistorySnapshot({...recent,...state,reservations:state.reservations.filter((r:Data)=>r.roundId!==identity.id)});
      return Object.freeze({identity,intent:current,set,control:Object.freeze(control),historyToken,selectionHistory,asOf:at});
    });
  }

  /** SERVER ONLY: immutable fields for looking up a previously committed D1
   * receipt, BEFORE current eligibility/history/control validation. This is no
   * activation permission. Active-game recovery comes first; terminal states
   * cannot be revived. A receipt never changes the original expiry/body. */
  async function readAuthorizationIdentity(input:RoundIdentity){
    const identity=await checkedIdentity(input),p=paths(identity);
    return store.transaction(async tx=>{
      const [raw,saved]=await Promise.all([tx.get(p.intent),tx.get(p.set)]);
      const intent=readIntent(raw,identity);
      check(intent?.state==='PREPARED','This round is no longer prepared.','ROUND_NOT_PREPARED',409);
      const current=intent!,set=await checkedPreparation(identity,current,saved);
      return Object.freeze(fixedAuthorization(identity,current,set.policy));
    });
  }
  /** Recover an exact already-issued game BEFORE D1/current creation gates.
   * Finished games remain recoverable; this never regrades or refreshes them. */
  async function recoverActive(input:RoundIdentity){
    const identity=await checkedIdentity(input),p=paths(identity);
    return store.transaction(tx=>readActive(identity,p.intent,path=>tx.get(path)));
  }
  async function readActive(identity:RoundIdentity,intentPath:string,get:Store['get']){
    const [raw,game,activation]=await Promise.all([get(intentPath),get(`gameSecrets/${identity.id}`),get(`roundActivations/${identity.id}`)]);
    return checkedActive(identity,readIntent(raw,identity),game,activation);
  }
  /** SERVER ONLY. receiptValue must come from the trusted D1 service. It is an
   * integrity-bound receipt, not a signature or a client activation credential.
   * No D1 access, selection or payload decoding occurs in this transaction. */
  async function activate(input:RoundIdentity,receiptValue:unknown){
    const receiptInput=boundedJsonSnapshot(receiptValue,{maxBytes:12000,maxNodes:160,maxDepth:3});
    const identity=await checkedIdentity(input),p=paths(identity),receivedAt=time();
    return store.transaction(async tx=>{
      const [raw,saved,rawHistory,rawControl,game,activation,profile,publicGame,content,manifest,firstChunk]=await Promise.all([
        tx.get(p.intent),tx.get(p.set),tx.get(p.history),tx.get(ROUND_CREATION_CONTROL),tx.get(`gameSecrets/${identity.id}`),tx.get(`roundActivations/${identity.id}`),tx.get(`users/${identity.uid}`),tx.get(`games/${identity.id}`),tx.get(`replayContent/${identity.id}`),tx.get(`replayManifests/${identity.id}`),tx.get(serverChunkPath(identity.id,0))
      ]);
      const intent=readIntent(raw,identity),active=await checkedActive(identity,intent,game,activation);
      if(active)return active;
      const at=time();
      check(intent?.state==='PREPARED'&&intent.expiresAt>at,'This round is no longer prepared.','ROUND_NOT_PREPARED',409);
      check(at>=intent!.createdAt&&at>=receivedAt,'This round is temporarily unavailable. Please try again.','ROUND_CLOCK_UNAVAILABLE',409);
      check(!publicGame&&!content&&!manifest&&!firstChunk,'This round already has saved gameplay data.','ROUND_STATE_UNAVAILABLE',409);
      check(profile&&profile.uid===identity.uid,'Your player profile is unavailable.','ROUND_STATE_UNAVAILABLE',409);
      const current=intent!,set=await checkedPreparation(identity,current,saved),control=creationControl(rawControl);
      check(control.enabled&&control.version===current.controlVersion,'Round creation changed while preparing this round. Please start again.','ROUND_CREATION_CHANGED',409);
      const receipt=await verifyAuthorizationReceipt(receiptInput,fixedAuthorization(identity,current,set.policy));
      check(receipt,'An exact round authorization is required.','ROUND_AUTHORIZATION_REQUIRED',409);
      const recent=selectionHistorySnapshot(rawHistory||{});
      check(await selectionHistoryToken(recent)===receipt.history_token,'Your practice history changed after authorizing this round. Please start again.','ROUND_HISTORY_CHANGED',409);
      checkedHolds(identity,current,set,recent,at);
      const held={...recent,...reserveQuestionSet(recent,identity.id,set.questions,'issued',at)};
      const history=recordExposures(held,identity.id,set.questions,'issued',at);
      const created=initialAuthorizedGame(identity.uid,identity.request,set,profile!,at);
      const {questions:_questions,...metadata}=set;
      tx.set(p.set,{...metadata,expiresAt:new Date(current.expiresAt),used:true});
      tx.set(p.intent,{...current,state:'ISSUED'});
      tx.set(p.history,history);
      tx.set(`roundActivations/${identity.id}`,{version:ROUND_INTENT_VERSION,uid:identity.uid,id:identity.id,binding:current.binding,activatedAt:at,policy:set.policy,selection:{relaxation:set.relaxation,...(set.diagnostics!==undefined?{diagnostics:set.diagnostics}:{})},receipt});
      recordTransition(tx,identity.id,null,created,identity.uid,identity.id,receivedAt,at);
      saveGame(tx,identity.id,created);
      return {id:identity.id,...playerView(created,identity.uid)};
    },get=>readActive(identity,p.intent,get));
  }
  return {recover,prepare,cancel,readForAuthorization,readAuthorizationIdentity,recoverActive,activate};
}
