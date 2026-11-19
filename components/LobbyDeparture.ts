'use client';
import { useEffect, useRef } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { auth } from '@/firebase';
import {currentLobbyDeparture,beginLobbyPagehide} from '@/lib/game-session';

/** Standard navigation closes waiting rooms; active matches retain their deadlines. */
export function useLobbyDeparture(uid: string | undefined, gameId: string | null, status: string | undefined) {
  const departure = status==='waiting'?currentLobbyDeparture(uid,gameId):null;
  const current = useRef({uid,departure});
  current.current = {uid,departure};
  useEffect(() => {
    let token = '', owner = '', stopped = false;
    const stop = onIdTokenChanged(auth, async user => {
      token = ''; owner = user?.uid || '';
      if (user) { const next = await user.getIdToken().catch(() => ''); if (!stopped && auth.currentUser?.uid === user.uid) token = next; }
    });
    const leave = () => {
      const room = current.current;
      if (!room.departure || !token || room.uid !== owner || auth.currentUser?.uid !== owner || !beginLobbyPagehide(room.uid,room.departure)) return;
      void fetch('/api/games', { method: 'POST', keepalive: true, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(room.departure) }).catch(() => {});
    };
    window.addEventListener('pagehide', leave);
    return () => { stopped = true; stop(); window.removeEventListener('pagehide', leave); };
  }, []);
}
