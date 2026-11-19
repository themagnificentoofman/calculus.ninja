import type { GameSession } from './game-progress.ts';

export const LOBBY_HEARTBEAT_MS = 20_000;
export const LOBBY_LEASE_MS = 90_000;
export const LOBBY_LIFETIME_MS = 30 * 60_000;
export type LobbyVisibility = 'private' | 'public';
export const lobbyCapacity = (mode: string) => mode === 'pvp' ? 2 : 10;
const roomDeadline=(g:GameSession)=>Math.min(created(g)+LOBBY_LIFETIME_MS,(g.competitiveRoom?.version===2||g.competitiveRoom?.version===3)?g.competitiveRoom.deadline:Infinity);
const created = (game: GameSession) => new Date(game.createdAt as any).getTime();
export function updateLobbyExpiry(game: GameSession) {
  if (game.status !== 'waiting') { delete game.lobbyExpiresAt; return; }
  game.lobbyExpiresAt = Math.min(roomDeadline(game), ...game.players.map(uid => (game.lobbyPresence?.[uid] ?? created(game)) + LOBBY_LEASE_MS));
}
/** Server clocks alone decide expiry. A late heartbeat cannot revive a room. */
export function pruneLobby(game: GameSession, now: number) {
  const removed: string[] = [];
  if (game.status !== 'waiting') return { changed: false, removed };
  const expired = (uid: string) => (game.lobbyPresence?.[uid] ?? created(game)) + LOBBY_LEASE_MS <= now;
  if (roomDeadline(game) <= now || !game.players.length || expired(game.players[0])) {
    game.status = 'cancelled';
    game.endReason = roomDeadline(game) <= now ? 'lobby_expired' : 'host_disconnected';
    game.logicalEndAt = Math.min(roomDeadline(game), (game.lobbyPresence?.[game.players[0]] ?? created(game)) + LOBBY_LEASE_MS);
    delete game.lobbyExpiresAt;
    return { changed: true, removed };
  }
  for (const uid of game.players.slice(1)) if (expired(uid)) {
    removed.push(uid); delete game.scores[uid]; delete game.ratingSnapshot?.[uid]; delete game.lobbyPresence?.[uid];
  }
  game.players = game.players.filter(uid => !removed.includes(uid));
  updateLobbyExpiry(game);
  return { changed: removed.length > 0, removed };
}
export function normalizeLobbyView<T extends Record<string, any>>(game: T): T {
  return game.status === 'private_waiting' ? { ...game, status: 'waiting' } : game;
}
export function publicLobbyJoinable(game: Pick<GameSession, 'mode' | 'status' | 'visibility' | 'players' | 'lobbyExpiresAt'>, now: number) {
  return game.visibility === 'public' && game.status === 'waiting' && game.players.length > 0 && game.players.length < lobbyCapacity(game.mode) && (game.lobbyExpiresAt ?? 0) > now;
}
