import config from '@/firebase-applet-config.json';
import { verifyFirebaseIdentity } from '@/lib/server/firebase-token.mjs';
import { gameApi } from '@/lib/server/runtime-api';
import { isQaProfile } from '@/lib/server/qa-public-profile';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const token = /^Bearer ([^\s]+)$/.exec(request.headers.get('authorization') ?? '')?.[1];
  if (token && token.length <= 8192) {
    try {
      const claims = await verifyFirebaseIdentity(token, config.projectId);
      if (isQaProfile({email: claims.email})) {
        return Response.json({error: 'This account cannot create a player profile.'},
          {status: 403, headers: {'Cache-Control':'no-store'}});
      }
    } catch {
      // The normal profile handler owns the existing authentication response.
    }
  }
  return gameApi('profile', request);
}
