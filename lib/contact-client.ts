import { CONTACT_TOPICS, type ContactTopic, type ReportFields } from './contact.ts';
import { contactReturnHref } from './contact-link.mjs';

export interface ContactDraft {
  topic: ContactTopic;
  message: string;
  problemId: string;
  revision: string;
  lesson: string;
  section: string;
  requestId: string;
}
export function freshContactDraft(path: string): ContactDraft {
  const query = new URL(contactReturnHref(path) || '/contact', 'https://contact.invalid').searchParams;
  return { topic: query.get('topic') === 'problem' ? 'problem' : 'bug', message: '', problemId: query.get('problemId') || '',
    revision: query.get('revision') || '', lesson: '', section: '', requestId: '' };
}
export function readContactDraft(path: string, stored: string | null): ContactDraft {
  const initial = freshContactDraft(path);
  if (!stored || stored.length > 32000) return initial;
  try {
    const entry = JSON.parse(stored);
    if (!entry || entry.path !== path || !entry.draft || !Object.hasOwn(CONTACT_TOPICS, entry.draft.topic)) return initial;
    const d = entry.draft as ContactDraft;
    const limits = {message:4000, problemId:23, revision:16, lesson:120, section:120, requestId:36};
    for (const [key,limit] of Object.entries(limits)) {
      const value = d[key as keyof ContactDraft];
      if (typeof value !== 'string' || value.length > limit) return initial;
    }
    return {topic:d.topic, message:d.message, problemId:d.problemId, revision:d.revision, lesson:d.lesson, section:d.section, requestId:d.requestId};
  } catch { return initial; }
}
export function draftFields(d: ContactDraft): ReportFields {
  if (d.topic === 'study') return {studyLesson:d.lesson.trim(), studySection:d.section.trim()};
  if (d.topic !== 'problem') return {};
  return { ...(d.problemId && {problemId:d.problemId.trim()}), ...(d.revision && {problemRevision:/^[1-9][0-9]*$/.test(d.revision) ? Number(d.revision) : NaN}) };
}
export async function contactRequest(token: () => Promise<string>, signal: AbortSignal, body?: object, send: typeof fetch = fetch) {
  // Token retrieval cannot be aborted. Check the deadline again before sending.
  let abandon!: () => void;
  const aborted = new Promise<never>((_,reject) => { abandon = () => reject(Error('Contact request interrupted')); });
  signal.addEventListener('abort', abandon, {once:true});
  const perform = async () => {
    signal.throwIfAborted();
    const bearer = await token();
    signal.throwIfAborted();
    const res = await send('/api/contact', { method:body ? 'POST' : 'GET', headers:{ Authorization:'Bearer '+bearer, ...(body && {'Content-Type':'application/json'}) },
      ...(body && {body:JSON.stringify(body)}), signal });
    const data = await res.json().catch(() => null);
    signal.throwIfAborted();
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw Error('Invalid contact response');
    const seconds = 'retryAfter' in data ? data.retryAfter : undefined;
    const retryAfter = typeof seconds === 'number' && Number.isFinite(seconds) && seconds >= 0 ? Math.min(86400, seconds) : undefined;
    return {ok:res.ok && (body ? 'ok' in data && data.ok === true : retryAfter !== undefined), status:res.status, retryAfter};
  };
  try { return await Promise.race([perform(), aborted]); }
  finally { signal.removeEventListener('abort', abandon); }
}
