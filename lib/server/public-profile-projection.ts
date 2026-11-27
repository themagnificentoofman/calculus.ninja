import type { Data, Transaction } from './firestore-admin.ts';
import { isQaProfile } from './qa-public-profile.ts';

export function publicProfile(profile: Data) {
  const keys = ['uid', 'displayName', 'handle', 'photoURL', 'color', 'lastActive', 'createdAt', 'rating', 'classification', 'gamesPlayed', 'wins', 'losses', 'draws', 'ratedGames', 'xp', 'topicXp', 'topicRatings', 'topicRatedGames'];
  return Object.fromEntries(keys.filter(k => profile[k] !== undefined).map(k => [k, profile[k]]));
}

// The private record carries fixture provenance. Inspect it before selecting
// the fields that other players may see in search and rankings.
export function writePublicProfile(tx: Transaction, uid: string, profile: Data) {
  const path = `users_public/${uid}`;
  if (isQaProfile(profile)) tx.delete(path);
  else tx.set(path, publicProfile({ ...profile, uid }));
}
