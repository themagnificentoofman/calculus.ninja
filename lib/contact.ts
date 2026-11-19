import { validReportProblemId, validReportRevision } from './contact-link.mjs';
export const CONTACT_COOLDOWN_SECONDS = 60;
export const CONTACT_DAILY_LIMIT = 10;
export const CONTACT_TOPICS = {
  bug: 'Bug report',
  balance: 'Balance feedback',
  question: 'Question or suggestion',
  problem: 'Problem Issue',
  study: 'Study Guide Issue',
  other: 'Other',
} as const;
export type ContactTopic = keyof typeof CONTACT_TOPICS;
export interface ReportFields {
  problemId?: string;
  problemRevision?: number;
  studyLesson?: string;
  studySection?: string;
}

export function reportFieldError(topic: ContactTopic, values: Record<string, unknown>): string | null {
  const {problemId, problemRevision, studyLesson, studySection} = values;
  if (problemId !== undefined || problemRevision !== undefined) {
    if (topic !== 'problem' || !validReportProblemId(problemId)) return 'Enter a valid problem ID or leave it blank.';
    if (problemRevision !== undefined && !validReportRevision(problemRevision)) return 'Enter a positive whole-number problem revision.';
  }
  if (topic === 'study') {
    const valid = (value: unknown) => typeof value === 'string' && value.trim().length > 0 && value.length <= 120 && !/[\x00-\x1f\x7f]/.test(value);
    if (!valid(studyLesson) || !valid(studySection)) return 'Enter the lesson and section where you found the issue.';
  } else if (studyLesson !== undefined || studySection !== undefined) return 'Choose Study Guide Issue to enter a lesson and section.';
  return null;
}
