import test from 'node:test';
import assert from 'node:assert/strict';
import {auditSquareMenus, predictLargestPositiveSquare} from '../scripts/bank/quality/square-menu-audit.mjs';

const choices = values => values.map((math, index) => ({math, choiceId: String(index)}));

test('combine square form with exact magnitude independently of displayed order', () => {
  const huge = 2n ** 53n;
  const menu = choices([String(huge ** 2n), String(huge ** 2n + 1n), '+16', '-81']);
  assert.equal(predictLargestPositiveSquare(menu), '0');
  assert.equal(predictLargestPositiveSquare(menu.toReversed()), '0');
  assert.equal(predictLargestPositiveSquare(choices(['4', '4', '9', '5'])), '2');
});

test('abstain on tied maxima, missing positive squares and unsupported choices', () => {
  for (const values of [['9','09','4','3'], ['-9','0','2','3'], ['4','9','25','x'], ['1','4'], ['9','3','2','1\\quad6'], ['9','2','3','\\left16'], ['9','2','3','1 6']]) {
    assert.equal(predictLargestPositiveSquare(choices(values)), null);
  }
});

test('keep family, source binding and misses for a repaired menu', () => {
  const row = {problemId:'review-fixture', problemRevision:1, contentHash:'a'.repeat(64),
    familyId:'example', choices:choices(['4','9','16','25']), answerChoiceId:'1'};
  const report = auditSquareMenus([row]);
  assert.equal(report.abstentions, 0);
  assert.deepEqual(report.predictions, [{problemId:row.problemId, problemRevision:1,
    contentHash:row.contentHash, familyId:'example', prediction:'3', answerChoiceId:'1', matched:false}]);
  assert.throws(() => auditSquareMenus([row,row]), /Invalid source/);
});
