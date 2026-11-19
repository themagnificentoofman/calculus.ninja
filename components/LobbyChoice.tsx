'use client';
import { useState } from 'react';
import {competitiveSignInReturn} from '@/lib/round-url.mjs';
import { ArrowLeft, Globe, LockKeyhole, Users } from 'lucide-react';
export function LobbySignIn({ mode }: { mode: 'pvp' | 'multiplayer' }) {
  const path = '/play/'+mode;
  const next = competitiveSignInReturn(path+(typeof window === 'undefined' ? '' : window.location.search)) ?? path;
  return <main className="mx-auto max-w-xl px-4 py-12">
    <h1 className="text-3xl font-bold">{mode === 'pvp' ? 'PvP' : 'Multiplayer'}</h1>
    <a href={'/auth?next='+encodeURIComponent(next)} className="mt-4 inline-flex min-h-11 items-center text-emerald-400">Sign in to play</a>
  </main>;
}

export function LobbyChoice({ mode, error, onPrivate, onJoin }: { mode: 'pvp' | 'multiplayer'; error: string; onPrivate: () => void; onJoin: (id: string) => void }) {
  const [code, setCode] = useState('');
  const name = mode === 'pvp' ? 'PvP' : 'Multiplayer';
  return <main className="mx-auto min-h-screen max-w-3xl px-4 py-12">
    <a href="/" className="mb-10 inline-flex min-h-11 items-center gap-2 text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" />Dashboard</a>
    <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-400">Play together</p>
    <h1 className="text-4xl font-bold sm:text-5xl">{name} lobbies</h1>
    <p className="mt-4 text-lg text-zinc-400">Play with friends or find a room in the public catalog.</p>
    {error && <p role="alert" className="mt-6 rounded-xl border border-red-500/30 p-4 text-red-300">{error}</p>}
    <div className="mt-9 grid gap-4 sm:grid-cols-2">
      <button onClick={onPrivate} className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6 text-left hover:border-emerald-500 focus-visible:outline-2 focus-visible:outline-emerald-400">
        <LockKeyhole className="mb-5 h-7 w-7 text-emerald-400" /><span className="block text-xl font-bold">Private Lobby</span><span className="mt-2 block text-sm leading-6 text-zinc-400">Choose your settings, then share a code or invite a friend. Your room stays out of the catalog.</span>
      </button>
      <a href={`/play/${mode}/lobbies`} className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6 hover:border-emerald-500 focus-visible:outline-2 focus-visible:outline-emerald-400">
        <Globe className="mb-5 h-7 w-7 text-emerald-400" /><span className="block text-xl font-bold">Public Lobby</span><span className="mt-2 block text-sm leading-6 text-zinc-400">Browse live rooms, compare settings and join, or host a public room of your own.</span>
      </a>
    </div>
    <form className="mt-8 rounded-2xl border border-zinc-800 p-5" onSubmit={e => { e.preventDefault(); if (code.trim()) onJoin(code); }}>
      <label htmlFor="lobby-code" className="flex items-center gap-2 font-semibold"><Users className="h-4 w-4" />Have a lobby code?</label>
      <div className="mt-3 flex gap-3"><input id="lobby-code" value={code} onChange={e => setCode(e.target.value)} placeholder="Paste lobby code" autoComplete="off" className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-mono" /><button disabled={!code.trim()} className="min-h-11 rounded-xl bg-zinc-800 px-5 font-bold hover:bg-zinc-700 disabled:opacity-50">Join</button></div>
    </form>
  </main>;
}
