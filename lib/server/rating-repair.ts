import { clampProfileRatings } from '../rating-floor.ts';
import { identifier, publicProfile } from './game-engine.ts';
import type { Store } from './firestore-admin.ts';

export async function repairRatingPage(store: Store, ids: string[], apply: boolean) {
  let affected = 0;
  for (const id of ids) {
    const uid = identifier(id);
    const changed = await store.transaction(async tx => {
      const [profile, projection] = await Promise.all([tx.get(`users/${uid}`), tx.get(`users_public/${uid}`)]);
      if (!profile) return false;
      const repaired = clampProfileRatings(profile);
      const needsRepair = repaired !== profile || !!projection && clampProfileRatings(projection) !== projection;
      if (apply && needsRepair) {
        tx.set(`users/${uid}`, repaired);
        tx.set(`users_public/${uid}`, publicProfile({ ...repaired, uid }));
      }
      return needsRepair;
    });
    affected += Number(changed);
  }
  return { scanned: ids.length, affected, applied: apply };
}

export const repairMessage = (time: string, hash: string) => `calculus-ninja-rating-floor-v1\nPOST\n/api/rating-repair\n${time}\n${hash}`;
/** Disabled by default; short-lived signed access permits only this idempotent repair. */
export function ratingRepairApi(deps: {
  publicKey?: string; expiresAt?: string; now?: () => number;
  page: (cursor: string | null) => Promise<{ ids: string[]; nextCursor: string | null }>;
  store: Store;
}) {
  return async (request: Request) => {
    const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
    const now = deps.now?.() ?? Date.now(), expires = Number(deps.expiresAt);
    if (!deps.publicKey || !Number.isFinite(expires) || expires <= now) return json({ error: 'Unavailable' }, 404);
    if (request.method !== 'POST' || request.headers.has('origin')) return json({ error: 'Forbidden' }, 403);
    let input: { cursor: string | null; apply: boolean };
    try {
      const time = request.headers.get('x-repair-time') || '', hash = request.headers.get('x-repair-hash') || '', signature = request.headers.get('x-repair-signature') || '';
      if (!/^\d{13}$/.test(time) || Math.abs(now - Number(time)) > 60000 || !/^[a-f0-9]{64}$/.test(hash) || !/^[A-Za-z0-9+/]{86}==$/.test(signature)) throw Error();
      const key = await crypto.subtle.importKey('spki', Uint8Array.from(atob(deps.publicKey), c => c.charCodeAt(0)), 'Ed25519', false, ['verify']);
      if (!await crypto.subtle.verify('Ed25519', key, Uint8Array.from(atob(signature), c => c.charCodeAt(0)), new TextEncoder().encode(repairMessage(time, hash)))) throw Error();
      const reader = request.body?.getReader(); if (!reader) throw Error();
      const chunks: Uint8Array[] = []; let size = 0;
      for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 4096) { await reader.cancel(); throw Error(); } chunks.push(value); }
      const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      const actualHash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
      if (hash !== actualHash) throw Error();
      input = JSON.parse(new TextDecoder().decode(bytes));
      if (!input || Object.keys(input).some(k => !['cursor', 'apply'].includes(k)) || typeof input.apply !== 'boolean' || input.cursor !== null && (typeof input.cursor !== 'string' || input.cursor.length > 2048)) throw Error();
    } catch { return json({ error: 'Invalid authentication or body' }, 403); }
    try {
      const page = await deps.page(input.cursor);
      if (page.ids.length > 25) throw Error();
      return json({ ...await repairRatingPage(deps.store, page.ids, input.apply), nextCursor: page.nextCursor });
    } catch { return json({ error: 'Repair did not finish. Retry the same page.' }, 503); }
  };
}
