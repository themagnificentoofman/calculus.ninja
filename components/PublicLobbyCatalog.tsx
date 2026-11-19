'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Globe, Plus, Users } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { db } from '@/firebase';
import { gameProgress } from '@/lib/game-session';
import { lobbyCapacity, publicLobbyJoinable } from '@/lib/lobby';
import { watchPublicLobbies, type PublicLobby as Room } from '@/lib/lobby-catalog';
export function PublicLobbyCatalog({ mode }: { mode: 'pvp' | 'multiplayer' }) {
  const { user, loading: authLoading } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState(''), [joining, setJoining] = useState<string | null>(null);
  const [clock, setClock] = useState(Date.now()), [offset, setOffset] = useState(0), [topic, setTopic] = useState('all'), [difficulty, setDifficulty] = useState('all');
  const sweepRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (!user) return;
    // Real-time snapshots are required here: joins, starts and departures update
    // the catalog without refreshing. No limit silently omits joinable rooms.
    return watchPublicLobbies(db, mode, rows => {
      setRooms(rows); setLoading(false); setError('');
    }, () => { setLoading(false); setError('Live lobby updates are unavailable. Reconnect to refresh the catalog.'); });
  }, [mode, user?.uid]);
  useEffect(() => { const timer = setInterval(() => setClock(Date.now()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => {
    if (!user) return;
    let stopped = false, busy = false, failures = 0, retry: ReturnType<typeof setTimeout> | undefined;
    const sweep = async () => {
      if (stopped || busy) return; busy = true;
      try { let more = true; while (more && !stopped) { const result = await gameProgress.sweepLobbies(mode); if (!stopped) setOffset(value => Math.abs(value - (result.serverNow - Date.now())) > 1000 ? result.serverNow - Date.now() : value); more = result.hasMore; } failures = 0; }
      catch { failures++; clearTimeout(retry); if (!stopped) retry = setTimeout(sweep, Math.min(300000, 15000 * 2 ** Math.min(5, failures))); }
      finally { busy = false; }
    };
    sweepRef.current = () => { void sweep(); };
    void sweep();
    window.addEventListener('online', sweep);
    return () => { stopped = true; clearTimeout(retry); window.removeEventListener('online', sweep); };
  }, [mode, user?.uid]);
  useEffect(() => {
    const expiry = Math.min(...rooms.map(room => room.lobbyExpiresAt ?? Infinity));
    if (!Number.isFinite(expiry)) return;
    const timer = setTimeout(() => sweepRef.current(), Math.max(1000, expiry - Date.now() - offset + 100));
    return () => clearTimeout(timer);
  }, [rooms, offset]);
  const visible = useMemo(() => rooms.filter(room => publicLobbyJoinable(room, clock + offset) && (topic === 'all' || room.category === topic) && (difficulty === 'all' || room.difficulty === difficulty)).sort((a,b) => a.id.localeCompare(b.id)), [rooms, clock, offset, topic, difficulty]);
  const join = async (room: Room) => {
    if (!user || joining) return; setJoining(room.id); setError('');
    try {
      const joined = await gameProgress.joinGame(room.id,user.uid,mode);
      location.assign(gameProgress.roomDestination(user.uid,room.id,mode,joined));
    }
    catch (cause) { setJoining(null); setError(cause instanceof Error ? cause.message : 'This room is no longer joinable. Choose another room.'); }
  };
  if (authLoading) return <main className="p-8 text-center text-zinc-400" role="status">Loading your account…</main>;
  if (!user) return <main className="mx-auto max-w-xl p-8"><h1 className="text-2xl font-bold">Public Lobby</h1><p className="mt-4 text-zinc-400">Sign in to browse and join lobbies.</p><a className="mt-4 inline-flex min-h-11 items-center text-emerald-400" href={'/auth?next='+encodeURIComponent('/play/'+mode+'/lobbies')}>Sign in</a></main>;
  return <main className="mx-auto min-h-screen max-w-5xl px-4 py-10">
    <a href={`/play/${mode}`} className="mb-8 inline-flex min-h-11 items-center gap-2 text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" />{mode === 'pvp' ? 'PvP' : 'Multiplayer'} lobbies</a>
    <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-emerald-400"><Globe className="h-4 w-4" />Public Lobby</p><h1 className="text-4xl font-bold">Find your next room</h1><p className="mt-3 text-zinc-400">Joinable rooms update live as players arrive, leave and start matches.</p></div><a href={`/play/${mode}?host=public`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-500"><Plus className="h-4 w-4" />Host public lobby</a></div>
    <div className="my-7 flex flex-wrap gap-3"><select aria-label="Filter lobbies by topic" value={topic} onChange={e=>setTopic(e.target.value)} className="min-h-11 rounded-xl border border-zinc-700 bg-zinc-900 px-4"><option value="all">Every topic</option>{['integration','differentiation','limits','series','differential equations','multivariable'].map(t=><option key={t} value={t}>{t}</option>)}</select><select aria-label="Filter lobbies by difficulty" value={difficulty} onChange={e=>setDifficulty(e.target.value)} className="min-h-11 rounded-xl border border-zinc-700 bg-zinc-900 px-4"><option value="all">Every difficulty</option>{['easy','medium','hard','olympiad'].map(t=><option key={t} value={t}>{t}</option>)}</select><p className="ml-auto self-center text-sm text-zinc-400" role="status">{loading ? 'Connecting…' : `${visible.length} joinable ${visible.length === 1 ? 'room' : 'rooms'} · Live`}</p></div>
    {error && <p role="alert" className="mb-5 rounded-xl border border-red-500/30 p-4 text-red-300">{error}</p>}
    {!loading && !visible.length && <div className="rounded-2xl border border-dashed border-zinc-700 p-10 text-center"><Users className="mx-auto mb-4 h-8 w-8 text-zinc-500" /><h2 className="text-xl font-bold">No joinable rooms right now</h2><p className="mt-2 text-zinc-400">Try different filters or host a public lobby. New rooms appear here automatically.</p></div>}
    <div className="grid gap-4 md:grid-cols-2">{visible.map(room=><article key={room.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold capitalize">{room.category === 'all' ? 'Mixed calculus' : room.category}</h2><span className="flex shrink-0 items-center gap-2 rounded-full bg-zinc-800 px-3 py-1 text-sm"><Users className="h-4 w-4" />{room.players.length}/{lobbyCapacity(mode)}</span></div><p className="mt-3 text-sm capitalize text-zinc-300">{room.difficulty} · {room.questionCount} questions</p><p className="mt-2 text-sm text-zinc-400">{mode === 'pvp' ? 'Head-to-head · Starts when an opponent joins' : `${room.settings?.winCondition === 'time_limit' ? `${room.settings.timeLimit}s round` : `First to ${room.settings?.targetScore} points`} · ${room.settings?.penalties ? 'Wrong-answer penalties' : 'No penalties'}`}</p><p className="mt-3 truncate font-mono text-xs text-zinc-500">Room {room.id}</p><button disabled={!!joining} onClick={()=>void join(room)} className="mt-5 min-h-11 w-full rounded-xl bg-zinc-800 py-3 font-bold hover:bg-zinc-700 disabled:opacity-50">{joining === room.id ? 'Joining…' : room.players.includes(user.uid) ? 'Return to lobby' : 'Join'}</button></article>)}</div>
  </main>;
}
