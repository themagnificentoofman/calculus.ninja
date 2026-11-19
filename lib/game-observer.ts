import type { GameSession } from './game-progress.ts';

type Listener = (value: any) => void;
/** Terminal and membership updates must never wait for a separate review stream. */
export function observeGameState(
  uid: string,
  subscribeGame: (next: Listener, error: Listener) => () => void,
  subscribeProgress: (next: Listener, error: Listener) => () => void,
  emit: (game: GameSession, progress: any) => void,
  onError: Listener,
  onUnavailable: () => void = () => onError(new Error('This room is no longer available.')),
) {
  let game: GameSession | null = null, progress: any, stopped = false, unavailable = false;
  const removed = () => { if (!stopped && !unavailable) { unavailable = true; onUnavailable(); } };
  const error = (cause: any) => {
    if (stopped || unavailable) return;
    if (cause?.code === 'permission-denied') removed();
    else onError(cause);
  };
  const update = () => {
    if (stopped || unavailable || !game) return;
    if (!game.players.includes(uid)) { removed(); return; }
    if (game.status === 'cancelled' || game.status === 'waiting') { emit(game, {}); return; }
    if (!progress) return;
    const committed = Object.keys(game.answers?.[uid] || {}), reviewed = Object.keys(progress.answers || {});
    if (committed.length !== reviewed.length || committed.some(i => !progress.answers?.[i])) return;
    emit(game, progress);
  };
  const a = subscribeGame(value => { if (!value) { removed(); return; } game = value; update(); }, error);
  const b = subscribeProgress(value => { progress = value || {}; update(); }, error);
  return () => { stopped = true; a(); b(); };
}
