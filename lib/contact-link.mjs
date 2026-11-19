// Saved reports may predate revision metadata. Only carry what was recorded.
export const validReportProblemId = value => typeof value === 'string' && /^cn_[a-f0-9]{20}$/.test(value);
export const validReportRevision = value => Number.isSafeInteger(value) && value >= 1;

export function problemReportHref(problemId, revision) {
  const query = new URLSearchParams({ topic: 'problem' });
  if (validReportProblemId(problemId)) {
    query.set('problemId', problemId);
    if (validReportRevision(revision)) query.set('revision', String(revision));
  }
  return '/contact?' + query;
}

export function contactReturnHref(path) {
  if (path === '/contact') return path;
  if (typeof path !== 'string' || !path.startsWith('/contact?')) return null;
  if (path.length > 180 || path.includes('#')) return '/contact';
  const query = new URLSearchParams(path.slice('/contact?'.length));
  const keys = [...query.keys()];
  if (new Set(keys).size !== keys.length || keys.some(k => !['topic', 'problemId', 'revision'].includes(k)) || query.get('topic') !== 'problem') return '/contact';
  const id = query.get('problemId'), rev = query.get('revision');
  if ((id !== null && !validReportProblemId(id)) || (rev !== null && (!id || !/^[1-9][0-9]*$/.test(rev) || !validReportRevision(Number(rev))))) return '/contact';
  return problemReportHref(id, rev === null ? undefined : Number(rev));
}
