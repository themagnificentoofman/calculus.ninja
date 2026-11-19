'use client';
import { useState } from 'react';
import { problemReportHref } from '@/lib/contact-link.mjs';

export function ProblemReference({ problemId, problemRevision }: { problemId?: string; problemRevision?: number }) {
  const [copied, setCopied] = useState(''), [manual, setManual] = useState('');
  const reference = problemId ? problemId + (problemRevision ? '@' + problemRevision : '') : '';
  async function copy() {
    try { await navigator.clipboard.writeText(reference); setCopied(reference); setManual(''); }
    catch { setManual(reference); }
  }
  return <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 text-xs text-zinc-400">
    {reference && <button type="button" className="min-h-11 min-w-0 break-all text-left font-mono underline focus-visible:outline-emerald-400" onClick={copy}>{copied === reference ? 'Copied: ' : 'Copy problem ID: '}{reference}</button>}
    <a href={problemReportHref(problemId, problemRevision)} className="ml-auto inline-flex min-h-11 shrink-0 items-center rounded px-1 text-emerald-300 underline underline-offset-4 focus-visible:outline-emerald-400">Report Issue</a>
    {reference && manual === reference && <p role="status" className="w-full">Select and copy the ID manually.</p>}
  </div>;
}
