import { env } from 'cloudflare:workers';
import config from '../../firebase-applet-config.json';
import { verifyFirebaseIdentity } from './firebase-token.mjs';
import { firestoreStore, serviceAccountToken } from './firestore-admin';
import { createGameApi } from './game-api';
import { selectBankQuestions, assertBankSetPlayable } from './compact-bank-selection';
import { consumeBankReadQuota, consumeMutationQuota } from './quota';
import {selectCompetitiveQuestions} from './competitive-catalog';
import {createRoundApi} from './round-api';
import {createRoundCreation} from './round-creation.mjs';
export function gameApi(resource: 'games' | 'profile' | 'questions' | 'social', request: Request) {
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON || !env.DB) return Response.json({ error: 'Online play is temporarily unavailable. Please try again later.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  const store = firestoreStore(config.projectId, config.firestoreDatabaseId, () => serviceAccountToken(env.FIREBASE_SERVICE_ACCOUNT_JSON!, config.projectId));
  return createGameApi({ store, compactCompetitiveBank:true, verify: token => verifyFirebaseIdentity(token, config.projectId),
    select: (input, recent) => selectBankQuestions(env.DB!, input, recent),
    selectCompetitive: input => selectCompetitiveQuestions(env.DB!, input),
    checkPlayable: questions => assertBankSetPlayable(env.DB!, questions),
    mutationQuota: uid => consumeMutationQuota(env.DB!, uid),
    quota: uid => consumeBankReadQuota(env.DB!, uid) })(resource, request);
}

export function roundApi(request:Request){
  if(!env.FIREBASE_SERVICE_ACCOUNT_JSON||!env.DB)return Response.json({error:'Practice is temporarily unavailable. Please try again later.'},{status:503,headers:{'Cache-Control':'no-store'}});
  const store=firestoreStore(config.projectId,config.firestoreDatabaseId,()=>serviceAccountToken(env.FIREBASE_SERVICE_ACCOUNT_JSON!,config.projectId));
  return createRoundApi({verify:token=>verifyFirebaseIdentity(token,config.projectId),
    mutationQuota:uid=>consumeMutationQuota(env.DB!,uid),
    workflow:createRoundCreation({store,database:env.DB!,takeSelectionQuota:(uid:string)=>consumeBankReadQuota(env.DB!,uid)})})(request);
}
