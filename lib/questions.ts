import { apiRequest } from './game-session';
import type { GameMode } from './progression';
export interface GeneratedQuestion { latexProblem: string; options: string[]; correctIndex: number; explanation: string[]; topic: string; difficulty: string }
// Bank selection returns an opaque, owner-bound, single-use reference. Answer keys
// and explanations stay in server-only storage until the answer is committed.
export async function selectQuestions(category: string, difficulty: string, count: number, mode: GameMode,configuration:'multiple-choice'|'free-response'|{multipleChoice:number;freeResponse:number;order:'mcq-first'|'frq-first'|'uniform'}='multiple-choice'): Promise<{ questionSetId: string; questionCount: number }> {
  const result = await apiRequest('questions', { category, difficulty, count, mode,...(typeof configuration==='object'?{questionMix:configuration}:configuration==='free-response'?{responseFormat:configuration}:{}) });
  if (typeof result.questionSetId !== 'string' || !Number.isInteger(result.questionCount)) throw new Error('Invalid question set. Please retry.');
  return { questionSetId: result.questionSetId, questionCount: result.questionCount };
}
