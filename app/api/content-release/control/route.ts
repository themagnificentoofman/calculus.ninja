import {env} from 'cloudflare:workers';
import config from '@/firebase-applet-config.json';
import plan from '@/lib/server/content-release-plan.json';
import policy from '@/lib/server/round-creation-policy.json';
import {releaseControl} from '@/lib/server/release-control.mjs';
import {firestoreStore,serviceAccountToken} from '@/lib/server/firestore-admin';

export const dynamic='force-dynamic';
export const POST=(request:Request)=>releaseControl(request,{
 plan,policy,publicKey:env.CONTENT_RELEASE_PUBLIC_KEY,expiresAt:env.CONTENT_RELEASE_EXPIRES_AT,db:env.DB,
 store:firestoreStore(config.projectId,config.firestoreDatabaseId,()=>serviceAccountToken(env.FIREBASE_SERVICE_ACCOUNT_JSON!,config.projectId))
});
