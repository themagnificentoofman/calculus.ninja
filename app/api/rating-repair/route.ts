import { env } from 'cloudflare:workers';
import config from '@/firebase-applet-config.json';
import { firestoreStore, serviceAccountToken } from '@/lib/server/firestore-admin';
import { ratingRepairApi } from '@/lib/server/rating-repair';
export const dynamic = 'force-dynamic';
export const POST = (request: Request) => {
  const token = () => serviceAccountToken(env.FIREBASE_SERVICE_ACCOUNT_JSON!, config.projectId);
  return ratingRepairApi({ publicKey: env.RATING_REPAIR_PUBLIC_KEY, expiresAt: env.RATING_REPAIR_EXPIRES_AT,
    store: firestoreStore(config.projectId, config.firestoreDatabaseId, token),
    page: async cursor => {
      const url = new URL(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/users`);
      url.searchParams.set('pageSize', '25'); url.searchParams.append('mask.fieldPaths', 'rating');
      if (cursor) url.searchParams.set('pageToken', cursor);
      const response = await fetch(url, { headers: { Authorization: `Bearer ${await token()}` }, signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw Error('Profile listing failed');
      const page = await response.json() as { documents?: { name: string }[]; nextPageToken?: string };
      return { ids: (page.documents || []).map(d => d.name.split('/').at(-1)!), nextCursor: page.nextPageToken || null };
    },
  })(request);
};
