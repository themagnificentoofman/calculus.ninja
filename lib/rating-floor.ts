import { finite } from './progression.ts';

export const ratingBalance = (value: unknown) => Math.max(0, finite(value));
export function applyRatingChange(balance: unknown, change: number) {
  const before = ratingBalance(balance);
  const ratingChange = Math.max(-before, change) || 0;
  return { newRating: before + ratingChange, ratingChange };
}
// Only current balances are repaired. Historical receipts/snapshots stay immutable.
export function clampProfileRatings<T extends Record<string, any>>(profile: T): T {
  const patch: Record<string, unknown> = {};
  if (typeof profile.rating === 'number' && profile.rating < 0) patch.rating = 0;
  if (profile.topicRatings && Object.values(profile.topicRatings).some(value => typeof value === 'number' && value < 0)) {
    patch.topicRatings = Object.fromEntries(Object.entries(profile.topicRatings).map(([topic, value]) => [topic, typeof value === 'number' && value < 0 ? 0 : value]));
  }
  // Retain rated status for legacy accounts whose only evidence was a negative rating.
  if (patch.rating === 0 && finite(profile.ratedGames) <= 0) patch.ratedGames = Math.max(1, finite(profile.wins) + finite(profile.losses) + finite(profile.draws));
  return Object.keys(patch).length ? { ...profile, ...patch } : profile;
}
