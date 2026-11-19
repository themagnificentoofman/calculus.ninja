'use client';
import { useEffect, useState } from 'react';
import { currentLobbyDeparture, gameProgress } from '@/lib/game-session';
import { LOBBY_HEARTBEAT_MS } from '@/lib/lobby';

export function useLobbyPresence(uid: string | undefined, id: string | null, status: string | undefined) {
  const [error, setError] = useState('');
  const visit = status === 'waiting' ? currentLobbyDeparture(uid,id) : null;
  const ready = Boolean(visit), visitKey = visit?.seatOperationId;
  useEffect(() => {
    setError('');
    if (!uid || !id || !ready) return;
    let stopped = false, busy = false;
    const tick = async () => {
      if (stopped || busy) return;
      busy = true;
      try { await gameProgress.heartbeatGame(id,uid,visitKey); if (!stopped) setError(''); }
      catch (cause) {
        if (stopped) return;
        if (cause && typeof cause === 'object' && 'code' in cause && cause.code === 'LOBBY_VISIT_CHANGED') {
          stopped = true;
          clearInterval(timer);
          setError('This lobby visit changed. Reopen the room to reconnect.');
        } else setError('Reconnecting to the lobby… Your place is held briefly while we retry.');
      }
      finally { busy = false; }
    };
    const visible = () => { if (!document.hidden) void tick(); };
    const timer = setInterval(tick, LOBBY_HEARTBEAT_MS);
    void tick();
    window.addEventListener('online', tick); document.addEventListener('visibilitychange', visible);
    return () => { stopped = true; clearInterval(timer); window.removeEventListener('online', tick); document.removeEventListener('visibilitychange', visible); };
  }, [uid, id, ready, visitKey]);
  return status === 'waiting' ? error : '';
}
