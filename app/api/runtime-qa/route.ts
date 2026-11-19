import { env } from 'cloudflare:workers';
import config from '@/firebase-applet-config.json';
import { authorizeRuntimeQa } from '@/lib/server/signed-runtime-qa';
import { firestoreStore, serviceAccountToken, StoreError } from '@/lib/server/firestore-admin';
import { createServerGames } from '@/lib/server/game-engine';
import { isolatedQaStore, QA_UIDS } from '@/lib/server/operator-qa';
import { consumeMutationQuota } from '@/lib/server/quota';
import {inspectReleaseFixtures,withdrawReleaseFixtures} from '@/lib/server/qa-public-profile';
import { createGameApi } from '@/lib/server/game-api';
export const dynamic = 'force-dynamic';
export const POST = async (request: Request) => {
  const operation=request.headers.get('x-qa-operation');
  const inspect=operation==='inspect-release-fixtures';
  const retire=operation==='withdraw-release-fixtures';
  const proof=request.headers.get('x-qa-proof')??'';
  if(retire&&!/^[a-f0-9]{64}$/.test(proof))return Response.json({error:'Unavailable'},{status:404});
  const cleanup=inspect||retire;
  const authorized=await authorizeRuntimeQa(request,cleanup?env.QA_WITHDRAWAL_PUBLIC_KEY:env.RUNTIME_QA_PUBLIC_KEY,
    cleanup?env.QA_WITHDRAWAL_EXPIRES_AT:env.RUNTIME_QA_EXPIRES_AT,
    retire?JSON.stringify({proof}):inspect?'{"action":"inspect-release-fixtures"}':'{}');
  if (authorized !== 200) return Response.json({ error: 'Unavailable' }, { status: authorized });
  const results: Record<string, unknown> = {};
  const check = async (name: string, action: () => Promise<unknown>) => {
    try { results[name] = { ok: true, result: await action() }; }
    catch (error) {
      const message = error instanceof Error ? error.message : '';
      results[name] = { ok: false, kind: error instanceof StoreError ? 'firestore' : /D1|SQLITE/.test(message) ? 'd1' : 'runtime', status: error instanceof StoreError ? error.status : null,
        detail: /^(D1_ERROR|SQLITE_|Invalid server identity|Server identity unavailable|Database request failed)/.test(message) ? message.slice(0,250) : 'Dependency check failed' };
    }
  };
  const base = firestoreStore(config.projectId, config.firestoreDatabaseId, () => serviceAccountToken(env.FIREBASE_SERVICE_ACCOUNT_JSON!, config.projectId));
  if(cleanup) {
    // Use bounded document listing with a name-only mask. The identity
    // verification path is read-only and can reconcile a lost write response.
    const publicIds=async()=>{
      const url=new URL(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/users_public`);
      url.searchParams.set('pageSize','100');
      url.searchParams.append('mask.fieldPaths','uid');
      const token=await serviceAccountToken(env.FIREBASE_SERVICE_ACCOUNT_JSON!,config.projectId);
      const ids:string[]=[];
      for(let page=0;page<5;page++){
        const response=await fetch(url,{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(15000)});
        if(!response.ok)throw new StoreError(response.status);
        const data=await response.json() as {documents?:{name:string}[];nextPageToken?:string};
        for(const doc of data.documents??[])ids.push(doc.name.split('/').at(-1)!);
        if(!data.nextPageToken)return ids;
        url.searchParams.set('pageToken',data.nextPageToken);
      }
      throw Error('Fixture listing reached its bound');
    };
    try {
      const result=retire?await withdrawReleaseFixtures(base,publicIds,proof):await inspectReleaseFixtures(base,publicIds);
      return Response.json(result,{headers:{'Cache-Control':'no-store'}});
    } catch(error) {
      return Response.json({error:'Fixture state could not be verified.',backendStatus:error instanceof StoreError?error.status:undefined},
        {status:503,headers:{'Cache-Control':'no-store'}});
    }
  }
  const store = isolatedQaStore(base), uid = QA_UIDS[0];
  await check('quota', () => consumeMutationQuota(env.DB!, uid));
  await check('firestoreStatus', async () => {
    const token = await serviceAccountToken(env.FIREBASE_SERVICE_ACCOUNT_JSON!, config.projectId);
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/cn_m1qa_ed08a3de_users/${uid}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000) });
    if (response.ok || response.status === 404) return { status: response.status };
    const body = await response.json() as {error?:{status?:string;message?:string}};
    return { status: response.status, code: body.error?.status, message: body.error?.message?.slice(0,1000) };
  });
  await check('databaseConfig', async () => {
    const token = await serviceAccountToken(env.FIREBASE_SERVICE_ACCOUNT_JSON!, config.projectId);
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) return { status: response.status };
    const body = await response.json() as Record<string, unknown>;
    return { status: response.status, databaseEdition: body.databaseEdition, freeTier: body.freeTier, type: body.type };
  });
  await check('profileRead', async () => { await store.get(`users/${uid}`); return true; });
  await check('profileWrite', async () => { const profile = await createServerGames(store).profile(uid, {}); return profile.uid === uid; });
  await check('profileApi', async () => {
    const api = createGameApi({ store, verify: async () => ({sub:uid}), select: async () => { throw Error('Not used by profile QA'); }, quota: async () => true, mutationQuota: actor => consumeMutationQuota(env.DB!,actor) });
    const response = await api('profile', new Request('https://calculus.ninja/api/profile', {method:'POST', headers:{'Content-Type':'application/json',Authorization:'Bearer isolated-runtime-qa'},body:'{}'}));
    const body = await response.json() as Record<string,any>;
    return {status:response.status,profileLoaded:body.profile?.uid===uid,code:body.code};
  });
  await check('lobbyQuery', async () => { const rows = await base.find('gameSecrets', [['mode','EQUAL','pvp'],['status','EQUAL','waiting'],['progressionVersion','EQUAL',3],['lobbyExpiresAt','IS_ABSENT',null]],1); return { count: rows.length }; });
  await check('cleanup', async () => { await env.DB!.prepare('DELETE FROM ai_quota WHERE key=?').bind(`mutation:${uid}:minute`).run(); await store.transaction(async tx => { tx.delete(`users/${uid}`); tx.delete(`users_public/${uid}`); }); return true; });
  return Response.json({ results }, { headers: { 'Cache-Control': 'no-store' } });
};
