
export const studyStatuses = Object.freeze({
  module: ['Not started', 'Reading', 'Practicing', 'Complete', 'Reviewing', 'Skipped'],
  exercise: ['Not attempted', 'Solving', 'Solved', 'Reviewing', 'Skipped'],
  reading: ['Unread', 'Reading', 'Read'],
});

export function studyMarkKey(account, kind, resource) {
  if (!Object.hasOwn(studyStatuses, kind) || !resource) return null;
  const scope = account ? 'user/' + encodeURIComponent(account) : 'guest';
  return 'calculus-ninja/study/v1/' + scope + '/' + kind + '/' + encodeURIComponent(resource);
}

export function readStudyMark(storage, key, kind) {
  const statuses = studyStatuses[kind];
  if (!statuses) throw new RangeError('Unknown Study item');
  if (!key) return statuses[0];
  try {
    const saved = storage.getItem(key);
    return statuses.includes(saved) ? saved : statuses[0];
  } catch {
    return statuses[0];
  }
}

export function writeStudyMark(storage, key, kind, value) {
  const statuses = studyStatuses[kind];
  if (!key || !statuses?.includes(value)) return false;
  try {
    if (value === statuses[0]) storage.removeItem(key);
    else storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

// Reading anchors and local marks identify a reference by its full canonical
// URL. Reordering another lesson's references cannot retarget an old deep link.
export function studyReadingAnchor(url) {
  return 'reading-' + Array.from(new TextEncoder().encode(url), byte => byte.toString(16).padStart(2, '0')).join('');
}

