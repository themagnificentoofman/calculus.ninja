// Offline menu review for integer choices. The key is used only after prediction.
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {features} from './option-audit.mjs';
import {auditDisplayedMenus} from './limit-menu-audit.mjs';

export function predictLargestPositiveSquare(choices) {
  if (choices.length !== 4) return null;
  let maximum = 0n;
  let predictedId = null;
  for (const choice of choices) {
    const {integer, rationalSquare} = features(choice.math.trim().replace(/^\+(?=\d)/, ''));
    if (integer === null) return null;
    if (!rationalSquare || integer <= 0n || integer < maximum) continue;
    if (integer === maximum) {
      predictedId = null;
    } else {
      maximum = integer;
      predictedId = choice.choiceId;
    }
  }
  return predictedId;
}

export function auditSquareMenus(records) {
  return auditDisplayedMenus(records, 'largest-positive-integer-square-v1', predictLargestPositiveSquare);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) throw new Error('Supply served JSONL and a new report path.');
  const bytes = readFileSync(input);
  const records = bytes.toString('utf8').trim().split(/\r?\n/).map(line => JSON.parse(line));
  const report = {...auditSquareMenus(records), sourceSHA256: createHash('sha256').update(bytes).digest('hex')};
  writeFileSync(output, JSON.stringify(report, null, 2) + '\n', {flag: 'wx'});
}
