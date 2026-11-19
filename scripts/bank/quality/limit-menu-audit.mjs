// Offline supplement to the versioned option audit. Predictions see displayed choices only.
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

function literalValue(math) {
  const text = math.trim();
  if (['\\infty', '+\\infty', '∞', '+∞'].includes(text)) return 'infinity';
  if (/^\+?\d+$/.test(text)) return BigInt(text);
  const ratio = /^\\(?:d?frac)\{(\d+)\}\{(\d+)\}$/.exec(text);
  if (!ratio) return null;
  const top = BigInt(ratio[1]), bottom = BigInt(ratio[2]);
  return bottom > 0n && top % bottom === 0n ? top / bottom : null;
}

export function predictLimitMenu(choices) {
  if (choices.length !== 4) return null;
  const values = choices.map(choice => literalValue(choice.math));
  if (new Set(values).size !== 4 || !values.includes(0n) ||
      !values.includes(1n) || !values.includes('infinity')) return null;
  const parameter = values.find(value => typeof value === 'bigint' && value > 1n);
  if (parameter === undefined) return null;
  const target = parameter % 2n === 0n ? 0n : 'infinity';
  return choices[values.indexOf(target)].choiceId;
}

export function auditLimitMenus(records) {
  const predictions = [], seen = new Set();
  for (const record of records) {
    const {problemId, problemRevision, contentHash, familyId, choices, answerChoiceId} = record;
    const key = problemId + '@' + problemRevision;
    const ids = new Set(choices.map(c => c.choiceId));
    if (!problemId || !Number.isSafeInteger(problemRevision) || problemRevision < 1 ||
        !/^[a-f0-9]{64}$/.test(contentHash) || seen.has(key) ||
        ids.size !== choices.length || !ids.has(answerChoiceId)) {
      throw new Error('Invalid source or answer identity for ' + key);
    }
    seen.add(key);
    const prediction = predictLimitMenu(choices);
    if (prediction !== null) {
      predictions.push({problemId, problemRevision, contentHash, familyId, prediction,
        answerChoiceId, matched: prediction === answerChoiceId});
    }
  }
  return {rule: 'zero-one-infinity-fourth-integer-parity-v1', records: seen.size,
    abstentions: seen.size - predictions.length, predictions};
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) throw new Error('Supply served JSONL and a new result path.');
  const bytes = readFileSync(input);
  const records = bytes.toString('utf8').trim().split(/\r?\n/).map(line => JSON.parse(line));
  const report = {...auditLimitMenus(records), sourceSHA256: createHash('sha256').update(bytes).digest('hex')};
  writeFileSync(output, JSON.stringify(report, null, 2) + '\n', {flag: 'wx'});
}
