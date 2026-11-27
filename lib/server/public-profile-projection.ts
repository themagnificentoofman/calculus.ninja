import type { Data, Transaction } from './firestore-admin.ts';
import { publicProfile } from './game-engine.ts';
import { isQaProfile } from './qa-public-profile.ts';

// The private record carries fixture provenance. Inspect it before selecting
// the fields that other players may see in search and rankings.
export function writePublicProfile(tx: Transaction, uid: string, profile: Data) {
  const path = `users_public/${uid}`;
  if (isQaProfile(profile)) tx.delete(path);
  else tx.set(path, publicProfile({ ...profile, uid }));
}
