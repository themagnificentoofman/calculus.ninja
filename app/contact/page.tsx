'use client';

import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import { CheckCircle2, Clock3, Loader2, Send } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { CONTACT_COOLDOWN_SECONDS, CONTACT_DAILY_LIMIT, CONTACT_TOPICS, reportFieldError, type ContactTopic } from '@/lib/contact';
import { contactReturnHref } from '@/lib/contact-link.mjs';
import { contactRequest, draftFields, freshContactDraft, readContactDraft, type ContactDraft } from '@/lib/contact-client';

const draftKey = 'calculus-ninja:contact-sign-in-draft';
const fieldClass = 'min-h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-base text-zinc-100';
const primaryClass = 'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto';
function waitLabel(seconds: number) {
  if (seconds < 60) return seconds + 's';
  const minutes = Math.ceil(seconds / 60);
  return minutes < 60 ? minutes + ' min' : Math.ceil(minutes / 60) + ' hr';
}
export default function ContactPage() {
  const { user, loading } = useAuth();
  const [path, setPath] = useState('/contact'), [draft, setDraft] = useState(() => freshContactDraft('/contact'));
  const [hydrated, setHydrated] = useState(false), loadedPath = useRef('');
  const [error, setError] = useState(''), [sent, setSent] = useState(false), [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false), [needsSignIn, setNeedsSignIn] = useState(false), [statusAttempt, setStatusAttempt] = useState(0);
  const [remaining, setRemaining] = useState(0), readyAt = useRef(0), pending = useRef<AbortController | null>(null);
  const fields = draftFields(draft), fieldError = reportFieldError(draft.topic, {...fields});
  useEffect(() => {
    const restore = () => {
      const next = contactReturnHref(window.location.pathname + window.location.search) || '/contact';
      if (loadedPath.current === next) return;
      loadedPath.current = next;
      let stored = null;
      try { stored = sessionStorage.getItem(draftKey); } catch { stored = null; }
      setPath(next); setDraft(readContactDraft(next, stored)); setHydrated(true);
      try {
        if (stored && JSON.parse(stored)?.path === next) sessionStorage.removeItem(draftKey);
      } catch { /* The draft is already in memory. */ }
      setError(''); setSent(false);
    };
    restore(); window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);
  useEffect(() => {
    if (!remaining) return;
    const timer = setInterval(() => setRemaining(Math.max(0, Math.ceil((readyAt.current - Date.now()) / 1000))), 1000);
    return () => clearInterval(timer);
  }, [remaining]);
  function cooldown(seconds: number | undefined) {
    if (seconds === undefined) return;
    readyAt.current = Date.now() + seconds * 1000; setRemaining(Math.ceil(seconds));
  }
  useEffect(() => {
    setReady(false); setError(''); setSent(false); setNeedsSignIn(false); cooldown(0); setBusy(false);
    if (!user) return;
    const controller = new AbortController(), signal = AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]);
    void contactRequest(() => user.getIdToken(), signal).then(result => {
      if (controller.signal.aborted) return;
      if (result.ok) { cooldown(result.retryAfter); setReady(true); }
      else if (result.status === 401) { setNeedsSignIn(true); setError('Sign in again to send your message.'); }
      else setError('Contact is temporarily unavailable. Please retry.');
    }).catch(() => { if (!controller.signal.aborted) setError('Contact is temporarily unavailable. Please retry.'); });
    return () => { controller.abort(); pending.current?.abort(); pending.current = null; };
  }, [user, statusAttempt]);
  function update<K extends keyof ContactDraft>(key: K, value: ContactDraft[K]) {
    setDraft(previous => ({ ...previous, [key]:value, ...(key === 'problemId' && {revision:''}), requestId:'' }));
    setSent(false);
  }
  function preserveBeforeSignIn(event: MouseEvent<HTMLAnchorElement>) {
    try { sessionStorage.setItem(draftKey, JSON.stringify({path, draft})); }
    catch {
      if (JSON.stringify(draft) !== JSON.stringify(freshContactDraft(path))) {
        event.preventDefault(); setError('This tab could not save your draft for sign-in. Enable session storage or copy your message before signing in.');
      }
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !ready || !hydrated || pending.current || remaining > 0 || fieldError || draft.message.trim().length < 10) return;
    const controller = new AbortController(), signal = AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]);
    pending.current = controller; setBusy(true); setError(''); setSent(false);
    const requestId = draft.requestId || crypto.randomUUID();
    setDraft(previous => ({...previous, requestId}));
    try {
      const result = await contactRequest(() => user.getIdToken(), signal, {topic:draft.topic, message:draft.message, requestId, ...fields});
      if (controller.signal.aborted) return;
      cooldown(result.retryAfter);
      if (result.ok) { setDraft(previous => ({...previous, message:'', requestId:''})); setSent(true); }
      else if (result.status === 401) { setNeedsSignIn(true); setReady(false); setError('Sign in again to send your message.'); }
      else if (result.status === 429) setError((result.retryAfter || 0) > 60 ? 'The daily contact limit has been reached. Please try again later.' : 'Please wait before sending another message.');
      else setError(result.status === 400 ? 'Check the topic, report details and message, then try again.' : 'Delivery could not be confirmed. Your draft is still here.');
    } catch { if (!controller.signal.aborted) setError('Delivery could not be confirmed. Your draft is still here.'); }
    finally { if (pending.current === controller) { pending.current = null; setBusy(false); } }
  }
  const signIn = !user || needsSignIn;
  return <main className="min-h-screen px-4 py-12 text-zinc-50 selection:bg-emerald-500/30 sm:px-6"><div className="mx-auto max-w-2xl">
    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact Us</h1>
    <p className="mt-3 text-base leading-relaxed text-zinc-400 sm:text-lg">Report a problem, ask a question, or share feedback with Zach.</p>
    <div className="mt-6 flex items-start gap-3 rounded-xl border border-zinc-800/50 bg-zinc-900/90 px-4 py-3 text-sm leading-relaxed text-zinc-400">
      <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
      <p>Please wait {CONTACT_COOLDOWN_SECONDS} seconds between messages. Each account can send up to {CONTACT_DAILY_LIMIT} messages per day.</p>
    </div>
    {loading || !hydrated ? <p role="status" className="mt-8 text-sm text-zinc-400">Loading your account…</p> :
      <form onSubmit={submit} className="mt-6 space-y-5 rounded-3xl border border-zinc-800/50 bg-zinc-900/90 p-5 sm:p-7">
        <div><label htmlFor="contact-topic" className="mb-2 block text-sm font-medium">Topic</label>
          <select id="contact-topic" value={draft.topic} disabled={busy} onChange={e => update('topic', e.target.value as ContactTopic)} className={fieldClass}>
            {Object.entries(CONTACT_TOPICS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select><p className="mt-2 text-sm text-zinc-400">Choose Other if your message does not fit another category.</p>
        </div>
        {draft.topic === 'problem' && <fieldset className="space-y-3"><legend className="mb-2 font-semibold">Problem details</legend>
          <label className="block text-sm" htmlFor="contact-id">Problem ID, if available</label>
          <input id="contact-id" className={fieldClass} disabled={busy} maxLength={23} value={draft.problemId} onChange={e => update('problemId', e.target.value)} spellCheck={false}/>
          <label className="block text-sm" htmlFor="contact-revision">Saved revision, if available</label>
          <input id="contact-revision" className={fieldClass} disabled={busy || !draft.problemId.trim()} value={draft.revision} onChange={e => update('revision',e.target.value)} inputMode="numeric" maxLength={16}/>
        </fieldset>}
        {draft.topic === 'study' && <fieldset className="space-y-3"><legend className="mb-2 font-semibold">Study Guide location</legend>
          <p className="text-sm text-zinc-400">Enter the exact lesson and section where you found the issue.</p>
          <label className="block text-sm" htmlFor="contact-lesson">Lesson title</label><input id="contact-lesson" className={fieldClass} value={draft.lesson} disabled={busy} required maxLength={120} onChange={e => update('lesson', e.target.value)}/>
          <label className="block text-sm" htmlFor="contact-section">Section heading</label><input id="contact-section" className={fieldClass} value={draft.section} disabled={busy} required maxLength={120} onChange={e => update('section',e.target.value)}/>
        </fieldset>}
        <div><label htmlFor="contact-message" className="mb-2 block text-sm font-medium">Your message</label>
          <textarea id="contact-message" value={draft.message} onChange={e => update('message', e.target.value)} disabled={busy} required minLength={10} maxLength={4000} rows={7} aria-describedby="contact-hint" className="min-h-44 w-full resize-y rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-base leading-relaxed"/>
          <p id="contact-hint" className="mt-2 flex justify-between gap-4 text-xs text-zinc-400"><span>10–4,000 characters</span><span>{draft.message.length.toLocaleString()} / 4,000</span></p>
        </div>
        {signIn ? <p className="text-sm leading-relaxed text-zinc-400">Sign in to send your message. Your draft will be here when you return.</p> : <p className="break-words text-sm leading-relaxed text-zinc-400">Zach will receive your message and can reply to {user?.email}.</p>}
        {fieldError && (draft.problemId || draft.revision) && draft.topic === 'problem' && <p role="status" className="text-sm text-amber-300">{fieldError}</p>}
        {error && <div role="alert" className="rounded-xl border border-red-500/30 p-3 text-sm text-red-300">{error}{!ready && !signIn && <button type="button" onClick={() => setStatusAttempt(n => n+1)} className="ml-2 min-h-11 px-3 underline">Retry</button>}</div>}
        {sent && <div role="status" className="flex items-center gap-2 text-sm text-emerald-300"><CheckCircle2 className="h-5 w-5" aria-hidden="true"/>Message sent.</div>}
        {remaining > 0 && <p className="text-sm text-zinc-300">You can send another message in <span role="timer" aria-live="off">{waitLabel(remaining)}</span>.</p>}
        {signIn ? <a href={'/auth?' + new URLSearchParams({next:path})} onClick={preserveBeforeSignIn} className={primaryClass}>Sign in to send</a> :
          <button type="submit" disabled={!ready || busy || remaining > 0 || Boolean(fieldError) || draft.message.trim().length < 10} className={primaryClass}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true"/> : <Send className="h-4 w-4" aria-hidden="true"/>}
            {busy ? 'Sending…' : remaining > 0 ? 'Please wait' : !ready && !error ? 'Checking availability…' : 'Send message'}
          </button>}
      </form>}
  </div></main>;
}
