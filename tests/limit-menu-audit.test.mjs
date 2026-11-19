import test from 'node:test';
import assert from 'node:assert/strict';
import {auditLimitMenus, predictLimitMenu} from '../scripts/bank/quality/limit-menu-audit.mjs';

const choices = values => values.map((math, index) => ({math, choiceId: String(index)}));

test('the fourth integer predicts one of two limiting values without a stem or an answer', () => {
  const even = choices(['2', '\\infty', '1', '0']);
  const odd = choices(['0', '1', '\\frac{9}{3}', '+\\infty']);
  assert.equal(predictLimitMenu(even), '3');
  assert.equal(predictLimitMenu(even.toReversed()), '3');
  assert.equal(predictLimitMenu(odd), '3');
  assert.equal(predictLimitMenu(choices(['0', '1', '9007199254740993', '∞'])), '3');
  for (const other of ['1', '\\frac{3}{2}', '\\frac{3}{0}', '-3', '2x', '-\\infty']) {
    assert.equal(predictLimitMenu(choices(['0', '1', '\\infty', other])), null);
  }
});

test('the report binds mistakes and abstentions to an independently supplied catalog', () => {
  const row = {problemId:'audit-a', problemRevision:1, contentHash:'f'.repeat(64),
    familyId:'fixture', choices:choices(['0','1','2','\\infty']), answerChoiceId:'3'};
  const unsupported = {...row, problemId:'audit-b', choices:choices(['0','1','x','\\infty'])};
  const report = auditLimitMenus([row,unsupported]);
  assert.equal(report.abstentions, 1);
  assert.deepEqual(report.predictions.map(r => [r.problemId,r.prediction,r.matched]), [['audit-a','0',false]]);
  assert.throws(() => auditLimitMenus([row,row]), /Invalid source/);
});
