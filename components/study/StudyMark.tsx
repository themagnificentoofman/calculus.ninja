
'use client';

import {useCallback, useContext, useState, useSyncExternalStore} from 'react';
import {BookOpen, Circle, Star, CheckCircle2, PencilLine} from 'lucide-react';
import {StudyLearnerContext} from '@/lib/study/learner-context';
import {studyMarkKey, studyStatuses, readStudyMark, writeStudyMark} from '@/lib/study/marks.mjs';

type Kind = 'module' | 'reading' | 'exercise';
const listeners = new Map<string, Set<() => void>>();
let count = 0;

function notify(key: string | null) {
  if (key) listeners.get(key)?.forEach(update => update());
  else listeners.forEach(entries => entries.forEach(update => update()));
}

function storageChanged(event: StorageEvent) {
  notify(event.key);
}

function listen(key: string | null, callback: () => void) {
  if (!key) return () => {};
  const callbacks = listeners.get(key) ?? new Set();
  callbacks.add(callback);
  listeners.set(key, callbacks);
  if (++count === 1) window.addEventListener('storage', storageChanged);
  return () => {
    callbacks.delete(callback);
    if (!callbacks.size) listeners.delete(key);
    if (--count === 0) window.removeEventListener('storage', storageChanged);
  };
}

export function StudyMark({kind, resource, title}: {kind: Kind; resource:string; title:string}) {
  const {uid, loading} = useContext(StudyLearnerContext);
  const key = loading ? null : studyMarkKey(uid, kind, resource);
  const initial = studyStatuses[kind][0];
  const subscribe = useCallback((update: () => void) => listen(key, update), [key]);
  const snapshot = useCallback(() => {
    try { return readStudyMark(window.localStorage, key, kind); } catch { return initial; }
  }, [initial, key, kind]);
  const value = useSyncExternalStore(subscribe, snapshot, () => initial);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const Icon = value === 'Read' || value === 'Complete' || value === 'Solved' ? CheckCircle2
    : value === initial ? Circle : kind === 'reading' ? BookOpen : PencilLine;
  return <span className="inline-flex min-w-0 flex-wrap items-center gap-2 text-sm text-zinc-300">
    <label className="inline-flex min-h-11 items-center gap-2">
      <Icon size={16} aria-hidden="true" className="shrink-0 text-emerald-300"/>
      <span className="sr-only">My {kind} status for {title}</span>
      <select disabled={!key} value={value}
        className="min-h-11 max-w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-200 focus-visible:outline-emerald-300"
        onChange={event => {
          let saved = false;
          try { saved = writeStudyMark(window.localStorage, key, kind, event.target.value); } catch {}
          if (saved) { setFailedKey(null); notify(key); } else setFailedKey(key);
        }}>
        {studyStatuses[kind].map((state: string) => <option key={state}>{state}</option>)}
      </select>
    </label>
    {key && failedKey === key && <span role="alert">Your browser could not save this mark.</span>}
  </span>;
}

export function StudyRecommendation({optional=false}: {optional?:boolean}) {
  return optional ? <span className="text-sm text-zinc-400">Optional reading</span> :
    <span className="inline-flex items-center gap-1 text-sm text-amber-200"><Star aria-hidden="true" size={15}/>Recommended</span>;
}

export function StudyMarkLegend() {
  return <p className="text-sm leading-relaxed text-zinc-400">Use the status menu to mark your own progress on this device. Choose the first status to clear a mark. A star identifies a recommended resource. Study marks and graded practice results are recorded separately.</p>;
}

