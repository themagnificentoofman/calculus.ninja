import assert from 'node:assert/strict';
import test from 'node:test';
import {reviewSavedQuestion} from '../lib/server/solution-presentation.mjs';

test('p-series clarification preserves saved wording and requires its exact source', () => {
 const samples = [
  ['cn_e1d676a9408b97eb8635','038cdb922855adc4eb3fec30cba1c6e1bf972f7353d8cc2f13ff9bc50ca384b2','converges','diverges'],
  ['cn_408fe505c0913c6b5f67','70c43b95c189ee2d4ea4ff4f15504ed152ec44d8ffd2b6444c9dd74e7b498fc4','diverges','converges'],
 ];
 for (const [problemId,contentHash,first,second] of samples) {
  const old = `\\textnormal{The first series is ${first} and the second is ${second}.}`;
  const explanation = Object.freeze([old]);
  const saved = Object.freeze({problemId,contentHash,problemRevision:1,explanation});
  const review = reviewSavedQuestion(saved);
  assert.equal(review.clarified,true);
  assert.equal(review.steps[3],`\\textnormal{The first series ${first} and the second ${second}.}`);
  assert.deepEqual(saved.explanation,[old]);
  assert.equal(reviewSavedQuestion({...saved,contentHash:'f'.repeat(64)}),null);
  assert.equal(reviewSavedQuestion({...saved,problemRevision:2}),null);
  assert.equal(reviewSavedQuestion({...saved,solutionReviewVersion:review.version,explanation:review.steps}).clarified,false);
 }
});
