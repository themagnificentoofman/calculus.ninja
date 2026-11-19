import {canonical,hex} from '../bank/compact-codec.mjs';
import {studyContentHash} from './admission.mjs';

// A published editorial decision belongs to the exact lesson and row reviewed.
// Keep learner progress and measured assessment results outside this projection.
export async function reviewedStudyEditorial(lesson, document, bindings) {
  if (document?.version !== 1 || !Object.hasOwn(document.lessons, lesson.id) ||
      !Object.hasOwn(bindings, lesson.id)) return null;
  const row = document.lessons[lesson.id];
  const binding = bindings[lesson.id];
  if (row.revision !== lesson.revision || await studyContentHash(lesson) !== binding.lessonContentHash) return null;
  const bytes = new TextEncoder().encode(canonical(row));
  const rowHash = hex(await crypto.subtle.digest('SHA-256',bytes));
  return rowHash === binding.editorialHash ? row : null;
}
