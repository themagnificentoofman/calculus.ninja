import {selectBankQuestions} from './compact-bank-selection.ts';
import {roundCreationPolicy} from './round-creation-policy.mjs';
import {CompetitiveHoldError} from './competitive-lifecycle.ts';
import type {Transaction} from './firestore-admin.ts';

export type CompetitiveCatalogWindow = {
  version: number;
  epoch: number;
  incarnation: string;
  policyHash: string;
};

function available(condition: unknown): asserts condition {
  if (!condition) throw new CompetitiveHoldError('The problem catalog changed or is unavailable. Please start a new room.');
}

async function readWindow(db: Pick<D1Database, 'prepare'>, policyHash: string) {
  const {results} = await db.prepare('SELECT version, epoch, incarnation, policyHash FROM round_competitive_catalog_window').all<CompetitiveCatalogWindow>();
  const row = results[0];
  available(results.length === 1 && Number.isSafeInteger(row.version) && row.version > 1 &&
    Number.isSafeInteger(row.epoch) && row.epoch > 1 && /^[a-f0-9]{64}$/.test(row.incarnation) && row.policyHash === policyHash);
  return row;
}

export async function selectCompetitiveQuestions(database: D1Database, input: Parameters<typeof selectBankQuestions>[1]) {
  available(input.includeLegacy === false);
  const {selectionPolicyHash} = await roundCreationPolicy(input.difficulty);
  const db = database.withSession('first-primary');
  const window = await readWindow(db, selectionPolicyHash);
  const selected = await selectBankQuestions(db, input, {});
  const end = await readWindow(db, selectionPolicyHash);
  available(end.version === window.version && end.epoch === window.epoch && end.incarnation === window.incarnation);
  return {...selected, catalogWindow: window};
}

// This read participates in the SAME Firestore transaction as the transition.
// A disable is committed to Firestore before D1 permits its catalog writer.
export async function requireCompetitiveWindow(tx: Transaction, window: CompetitiveCatalogWindow | undefined, difficulty: string) {
  const {selectionPolicyHash} = await roundCreationPolicy(difficulty);
  available(window && window.policyHash === selectionPolicyHash && Number.isSafeInteger(window.version) && window.version > 1);
  const [gate, receipt] = await Promise.all([
    tx.get('roundCreation/control'), tx.get('roundCreationChanges/v' + window.version),
  ]);
  const prior = receipt?.expected?.catalog;
  available(gate?.enabled === true && gate.version === window.version && receipt?.action === 'enable' &&
    receipt.incarnation === window.incarnation && receipt.policyHash === window.policyHash &&
    prior?.incarnation === window.incarnation && prior.policyHash === window.policyHash &&
    prior.enabled === false && prior.version === window.version - 1 && prior.epoch === window.epoch - 1 &&
    receipt.expected.firestore?.enabled === false && receipt.expected.firestore.version === prior.version);
}
