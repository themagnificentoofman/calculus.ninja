// Server-only orchestration. The authenticated API supplies uid; clients never
// supply selection policy, histories, questions or authorization receipts.
import {createRoundIntents,roundIdentity,creationControl,ROUND_CREATION_CONTROL,RoundIntentError} from './round-intents.ts';
import {roundCreationPolicy} from './round-creation-policy.mjs';
import {selectionHistorySnapshot,selectionHistoryToken} from './selection-history-token.mjs';
import {assertReservationAvailability} from '../bank/issuance-reservations.mjs';
import {boundedJsonSnapshot} from './bounded-json-snapshot.mjs';
import {includesLegacyForMode} from './legacy-selection.mjs';
import {selectMixedQuestions} from './mixed-question-selection.mjs';
import {orderConfiguredQuestionsV2} from '../round-question-config.mjs';
import {authorizeRound} from './round-authorizations.mjs';
import {validatePreparedAuthorization} from './prepared-authorization.mjs';
import admissions from './free-response-admissions.json' with {type:'json'};
import {frDigest} from '../bank/free-response-record.mjs';

export function createRoundCreation({store,database,now=Date.now,takeSelectionQuota,policyFor=roundCreationPolicy,registry=admissions,select=selectMixedQuestions}){
 const intents=createRoundIntents(store,now);
 const admitted=boundedJsonSnapshot(registry,{maxBytes:4000000,maxNodes:50000,maxDepth:8});
 if(typeof takeSelectionQuota!=='function')throw Error('Round creation needs a selection quota');
 const solo=request=>{if(!['test','rapid'].includes(request.mode))throw new RoundIntentError('This round type is currently unavailable.','ROUND_TYPE_UNAVAILABLE',409);};
 const quota=async uid=>{if(!await takeSelectionQuota(uid))throw new RoundIntentError('Question selection limit reached. Please try again later.','ROUND_SELECTION_LIMIT',429);};
 return Object.freeze({
  async prepare(uid,operationId,requestValue){
   const identity=await roundIdentity(uid,operationId,requestValue),existing=await intents.recover(identity);
   // A deliberate action owns its original body/order/lifetime, even after a
   // preference or current policy changes. No selection on an exact retry.
   if(existing)return existing;
   try{
   solo(identity.request);
   const [rawControl,rawHistory,profile]=await Promise.all([store.get(ROUND_CREATION_CONTROL),store.get(`bankRecent/${uid}`),store.get(`users/${uid}`)]);
   if(!creationControl(rawControl).enabled)throw new RoundIntentError('Round creation is currently unavailable.','ROUND_CREATION_UNAVAILABLE',409);
   if(!profile||profile.uid!==uid)throw new RoundIntentError('Your player profile is unavailable.','ROUND_STATE_UNAVAILABLE',409);
   const recent=selectionHistorySnapshot(rawHistory||{}),at=now();assertReservationAvailability(recent,at);
   const historyToken=await selectionHistoryToken(recent),policy=await policyFor(identity.request.difficulty);
   if(policy.registryHash!==await frDigest(admitted))throw new RoundIntentError('This question set is currently unavailable. Please try again later.','ROUND_POLICY_CHANGED',409);
   const includeLegacy=includesLegacyForMode(identity.request.mode,profile.settings);
   const mix=identity.request.questionMix??{multipleChoice:identity.request.responseFormat==='free-response'?0:identity.request.count,freeResponse:identity.request.responseFormat==='free-response'?identity.request.count:0,order:'mcq-first'};
   await quota(uid);
   const selected=boundedJsonSnapshot(await select(database,{...identity.request,includeLegacy,questionMix:mix},recent,{rounds:policy.rounds,admissions:admitted,now:at}),{maxBytes:2000000,maxNodes:180000,maxDepth:40});
   const questions=orderConfiguredQuestionsV2(selected.questions,mix);
   return await intents.prepare(identity,{...selected,questions},historyToken,{registryHash:policy.registryHash,selectionPolicyHash:policy.selectionPolicyHash,includeLegacy});
   }catch(error){
    // An exact concurrent caller may have committed after the initial miss,
    // including while a quota/current-gate check was failing. One recovery
    // read returns that original result; it never repeats fresh selection.
    const recovered=await intents.recover(identity);if(recovered)return recovered;throw error;
   }
  },
  async activate(uid,operationId,requestValue){
   const identity=await roundIdentity(uid,operationId,requestValue),active=await intents.recoverActive(identity);
   if(active)return active;
   try{
   solo(identity.request);
   const fixed=await intents.readAuthorizationIdentity(identity);
   // The authorizer recovers an earlier decision BEFORE this callback. A
   // missing receipt alone permits fresh eligibility/history/policy reads.
   const decision=await authorizeRound(database,fixed,async()=>{
    const context=await intents.readForAuthorization(identity),policy=await policyFor(identity.request.difficulty);
    await quota(uid);
    return validatePreparedAuthorization(database,fixed,context,{rounds:policy.rounds,policyHash:policy.selectionPolicyHash,admissions:admitted});
   });
   if(!decision.receipt)throw new RoundIntentError('This round changed before it could start. Please try again.','ROUND_AUTHORIZATION_CHANGED',409);
   return await intents.activate(identity,decision.receipt);
   }catch(error){
    const recovered=await intents.recoverActive(identity);if(recovered)return recovered;throw error;
   }
  },
  async cancel(uid,operationId,requestValue){return intents.cancel(await roundIdentity(uid,operationId,requestValue));}
 });
}
