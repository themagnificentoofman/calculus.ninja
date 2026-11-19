import { collection, onSnapshot, query, where, type Firestore } from 'firebase/firestore';
import type { GameSession } from './game-progress.ts';
export type PublicLobby = GameSession & { id: string };
/** A live query is required for catalog membership; intentionally no result cap. */
export function watchPublicLobbies(db: Firestore, mode: 'pvp' | 'multiplayer', next: (rooms: PublicLobby[]) => void, error: () => void) {
  return onSnapshot(query(collection(db, 'games'), where('mode', '==', mode), where('status', '==', 'waiting'), where('visibility', '==', 'public'), where('progressionVersion', '==', 3)), snapshot => {
    next(snapshot.docs.map(row => ({ ...row.data(), id: row.id } as PublicLobby)));
  }, error);
}
