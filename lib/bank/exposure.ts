import type { GameQuestion } from '../game-progress.ts';
import legacyFeatures from './legacy-features.json' with { type: 'json' };
import {reservationSnapshot,MAX_RESERVED_QUESTIONS,observeReservedQuestions} from './issuance-reservations.mjs';

export type ExposureStage = 'issued' | 'displayed' | 'attempted';
export interface Exposure {
  roundId: string;
  problemId: string;
  lineageId?: string;
  familyId: string;
  idea: string;
  structure: string;
  technique: string;
  combination: string;
  stage: ExposureStage;
  at: number;
}
export interface ExposureHistory { version?: 2; exposures?: Exposure[]; problems?: string[]; families?: string[]; issuanceGeneration?: number; reservations?: Array<{roundId:string;problemId:string;lineageId:string;stage:'prepared'|'competitive-prepared'|'issued'|'displayed';at:number;expiresAt:number}>;reservationOverflowUntil?:number }
const rank = { issued: 0, displayed: 1, attempted: 2 };
const lifetime = { issued: 10 * 60_000, displayed: 86400_000, attempted: 14 * 86400_000 };
export const MAX_EXPOSURES = 512;
export const MAX_SELECTION_HISTORY_IDENTITIES=2*(MAX_EXPOSURES+MAX_RESERVED_QUESTIONS);

/** Client display reports are preferences, not proof of attempts or mastery. */
export function exposureWeight(exposure: Exposure, now: number): number {
  const age = Math.max(0, now - exposure.at);
  if (age > lifetime[exposure.stage]) return 0;
  return { issued: .06, displayed: .35, attempted: 1 }[exposure.stage] * Math.exp(-3 * age / lifetime[exposure.stage]);
}

export function recordExposures(history: ExposureHistory, roundId: string, questions: GameQuestion[], stage: ExposureStage, now: number, asOf=now): ExposureHistory {
  // All authoritative writers use this function. Preserve independent holds
  // even when attempted-first retention discards an ordinary issued entry.
  // Observation/activation may update holds separately in the same transaction.
  const holds=Object.hasOwn(history,'reservations')||Object.hasOwn(history,'reservationOverflowUntil')?reservationSnapshot(history,asOf):null;
  const generation = history.issuanceGeneration ?? 0;
  if (!Number.isSafeInteger(generation) || generation < 0 || (stage === 'issued' && generation === Number.MAX_SAFE_INTEGER)) throw new Error('Invalid issuance generation');
  const entries = (history.exposures || []).filter(e => exposureWeight(e, asOf) > 0);
  for (const question of questions) {
    if (!question.problemId || !question.familyId) continue;
    const key = entries.findIndex(e => e.roundId === roundId && e.problemId === question.problemId);
    if (key >= 0 && rank[entries[key].stage] >= rank[stage]) continue;
    const p = question.pedagogy, legacy = (legacyFeatures as Record<string,{idea:string;structure:string;technique:string;combination:string}>)[question.familyId];
    const entry: Exposure = { roundId, problemId: question.problemId, lineageId: question.lineageId || question.problemId, familyId: question.constructionFamilyId || question.familyId,
      idea: p?.relatedIdeaGroupId || legacy?.idea || question.familyId, structure: p?.structuralSignature || legacy?.structure || question.familyId,
      technique: p?.primaryTechnique || legacy?.technique || question.context?.techniqueTags?.[0] || question.familyId,
      combination: p ? [...p.reasoningDemand].sort().join('+') + ':' + p.primaryTechnique : legacy?.combination || question.familyId,
      stage, at: now };
    if (key >= 0) entries[key] = entry; else entries.push(entry);
  }
  // Retain attempted material first when a user abandons many generated sets.
  const kept = entries.filter(e=>exposureWeight(e,asOf)>0).sort((a,b) => rank[a.stage]-rank[b.stage] || a.at-b.at).slice(-MAX_EXPOSURES).sort((a,b) => a.at-b.at);
  // Every issuance advances an account-local generation even when all retained
  // slots belong to attempted material and the new issued entries are dropped.
  // Display/attempt updates preserve it. This is a concurrency guard, not an
  // independently retained reservation for a later fresh selection.
  return { version: 2, exposures: kept,
    ...(holds||{}),
    ...(stage === 'issued' ? {issuanceGeneration: generation + 1} : history.issuanceGeneration !== undefined ? {issuanceGeneration: generation} : {}),
    // Compatibility only; v2 selection uses stage-aware entries above.
    problems: kept.map(e=>e.problemId).slice(-100), families: kept.map(e=>e.familyId).slice(-20) };
}

/** Use only with the authoritative saved questions and the transaction's
 * current history. A hold transfers only to the actual post-retention entry. */
export function recordAttemptedExposures(history:ExposureHistory,roundId:string,questions:GameQuestion[],now:number):ExposureHistory {
 const recorded=recordExposures(history,roundId,questions,'attempted',now);
 if(!Object.hasOwn(recorded,'reservations')&&!Object.hasOwn(recorded,'reservationOverflowUntil'))return recorded;
 const identified=questions.filter(q=>q.problemId&&q.familyId);
 return identified.length?{...recorded,...observeReservedQuestions(recorded,roundId,identified,'attempted',now,now,recorded.exposures)}:recorded;
}
