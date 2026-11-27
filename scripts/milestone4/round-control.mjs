// Private operator workflow. Only the deployment owner supplies database access
// and the final release qualification callback. No player API imports this module.
import { canonical } from '../../lib/bank/compact-codec.mjs';
import { boundedJsonSnapshot } from '../../lib/server/bounded-json-snapshot.mjs';

const controlPath = 'roundCreation/control';
const columnList = `lower(hex(incarnation)) AS incarnation, lower(hex(policy_hash)) AS policyHash,
  epoch, control_version AS version, enabled, writing, gc_active AS collecting`;
const integer = value => Number.isSafeInteger(value) && value >= 1;
const digest = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const same = (left, right) => canonical(left) === canonical(right);
const exact = (value, fields) => value && typeof value === 'object' &&
  !Array.isArray(value) && Object.keys(value).length === fields.length &&
  fields.every(key => Object.hasOwn(value, key));
const gate = value => exact(value, ['version', 'enabled']) && integer(value.version) &&
  typeof value.enabled === 'boolean';
const snapshot = value => boundedJsonSnapshot(value, {maxBytes: 4096, maxNodes: 64, maxDepth: 5});
const session = db => db.withSession ? db.withSession('first-primary') : db;
function requireState(condition, message) {
  if (!condition) throw Error(message);
}

function checkCatalog(value) {
  requireState(exact(value, ['incarnation', 'policyHash', 'epoch', 'version', 'enabled']) &&
    digest(value.incarnation) && digest(value.policyHash) && integer(value.epoch) &&
    gate({version: value.version, enabled: value.enabled}), 'Invalid catalog control');
}

async function readCatalog(db) {
  const {results} = await db.prepare('SELECT ' + columnList + ' FROM round_authorization_control WHERE id=1').all();
  const [row] = results;
  if (row === undefined) return null;
  requireState(row.writing === 0 && row.collecting === 0, 'Catalog writer or collection in progress');
  requireState([0, 1].includes(row.enabled), 'Invalid catalog flag');
  const {writing, collecting, ...fields} = row;
  const state = {...fields, enabled: row.enabled === 1};
  checkCatalog(state);
  return state;
}

export async function inspectRoundControl(store, database) {
  const [firestore, catalog] = await Promise.all([store.get(controlPath), readCatalog(session(database))]);
  requireState(firestore === null || gate(firestore), 'Invalid Firestore control');
  return {firestore, catalog};
}

// Keep this exact input with an interrupted operation. A new plan created
// from a partially advanced control describes a different transition.
function transition(input) {
  const plan = snapshot(input);
  requireState(exact(plan, ['action', 'expected', 'incarnation', 'policyHash']) &&
    ['install-disabled', 'disable', 'enable'].includes(plan.action) &&
    digest(plan.incarnation) && digest(plan.policyHash) &&
    exact(plan.expected, ['firestore', 'catalog']), 'Invalid round control plan');
  const {firestore, catalog} = plan.expected;
  if (plan.action === 'install-disabled') {
    requireState(firestore === null && catalog === null, 'Installation requires a pristine control pair');
  } else {
    requireState(gate(firestore), 'Missing or malformed permanent Firestore fence');
    checkCatalog(catalog);
    requireState(plan.incarnation === catalog.incarnation && plan.policyHash === catalog.policyHash,
      'Restore or policy replacement requires its own reviewed migration');
    if (plan.action === 'enable') {
      requireState(!firestore.enabled && !catalog.enabled && firestore.version === catalog.version,
        'Enabling requires matching disabled controls');
    }
  }
  const version = Math.max(firestore?.version ?? 0, catalog?.version ?? 0) + 1;
  const epoch = (catalog?.epoch ?? 0) + 1;
  if (plan.action !== 'disable') requireState(integer(version), 'Round control version exhausted');
  if (plan.action === 'enable') {
    requireState(version < Number.MAX_SAFE_INTEGER && epoch < Number.MAX_SAFE_INTEGER,
      'Insufficient counter space for a subsequent disable');
  }
  const next = {version, enabled: plan.action === 'enable'};
  return {plan, next, target: {...next, epoch, incarnation: plan.incarnation, policyHash: plan.policyHash}};
}

async function writeFirestore(store, plan, next, expected = plan.expected.firestore, interimFence = false) {
  // Private, immutable per-version receipt. Keeps retries of divergent plans
  // from adopting another operator's identical-looking Firestore transition.
  const receiptPath = 'roundCreationChanges/v' + next.version;
  return store.transaction(async tx => {
    const [current, receipt] = await Promise.all([tx.get(controlPath), tx.get(receiptPath)]);
    if (receipt !== null) {
      if (interimFence && receipt.action === 'disable' && same(receipt.expected?.firestore, expected)) {
        // If only the control document was restored, its original immutable
        // disable receipt may survive. Replay solely that one-version revoke.
        const historical = transition(receipt);
        requireState(historical.next.version >= next.version && expected.enabled && !next.enabled &&
          next.version === expected.version + 1, 'Invalid historical disable receipt');
        if (same(current, expected)) tx.set(controlPath, next);
        else requireState(same(current, next), 'Historical disable has been superseded');
        return;
      }
      requireState(same(receipt, plan) && same(current, next), 'Firestore transition superseded or conflicting');
      return;
    }
    requireState(same(current, expected), 'Firestore precondition changed');
    tx.set(controlPath, next);
    tx.set(receiptPath, plan);
  });
}

async function writeCatalog(db, before, target) {
  const observed = await readCatalog(db);
  if (same(observed, target)) return;
  requireState(same(observed, before), 'Catalog precondition changed');
  const sql = before === null
    ? `INSERT INTO round_authorization_control(id,incarnation,policy_hash,epoch,control_version,enabled)
       SELECT 1, unhex(?), unhex(?), ?, ?, ? WHERE NOT EXISTS
       (SELECT 1 FROM round_authorization_control WHERE id=1) RETURNING id`
    : `UPDATE round_authorization_control SET epoch=?, control_version=?, enabled=?, policy_hash=unhex(?)
       WHERE id=1 AND incarnation=unhex(?) AND policy_hash=unhex(?) AND epoch=?
       AND control_version=? AND enabled=? AND writing=0 AND gc_active=0 RETURNING id`;
  const args = before === null
    ? [target.incarnation, target.policyHash, target.epoch, target.version, Number(target.enabled)]
    : [target.epoch, target.version, Number(target.enabled), target.policyHash, before.incarnation, before.policyHash,
      before.epoch, before.version, Number(before.enabled)];
  const {results} = await db.prepare(sql).bind(...args).all();
  if (results.length !== 1) {
    requireState(same(await readCatalog(db), target), 'Catalog control changed concurrently');
  }
}

// Installation deliberately fences legacy solo creation even when disabled.
// verifyRelease is an operator dependency, never a value in the plan or a
// player-controlled field. Without it activation has no side effects.
export async function applyRoundControl(store, database, input, verifyRelease) {
  const {plan, next, target} = transition(input);
  const db = session(database);
  if (plan.action === 'enable') {
    requireState(typeof verifyRelease === 'function' && await verifyRelease(snapshot(target)) === true,
      'Missing release qualification for this catalog and policy');
    const observed = await store.get(controlPath);
    if (same(observed, next)) {
      // Firestore is always the second enable commit. Reconstructing a missing
      // earlier D1 commit here could re-enable a restored, stale incarnation.
      const receipt = await store.get('roundCreationChanges/v' + next.version);
      requireState(same(receipt, plan) && same(await readCatalog(db), target),
        'Enabled controls disagree with the committed transition');
      return {firestore: next, catalog: target};
    }
    requireState(same(observed, plan.expected.firestore), 'Firestore precondition changed');
    await writeCatalog(db, plan.expected.catalog, target);
    await writeFirestore(store, plan, next);
  } else {
    let expectedFirestore = plan.expected.firestore;
    if (plan.action === 'disable' && plan.expected.catalog.version > expectedFirestore.version) {
      if (expectedFirestore.enabled) {
        // Restore drift can leave an older enabled Firestore control opposite
        // a higher, unavailable catalog. Revoke old tickets before any D1 I/O.
        const fence = {version: expectedFirestore.version + 1, enabled: false};
        requireState(integer(fence.version), 'Firestore version exhausted');
        if (!same(await store.get(controlPath), next)) await writeFirestore(store, plan, fence, expectedFirestore, true);
        expectedFirestore = fence;
      }
      // A partial enable may have advanced D1 first. Verify the actual high
      // watermark before using it to advance the permanent Firestore fence.
      const observed = await readCatalog(db);
      requireState(same(observed, plan.expected.catalog) || same(observed, target),
        'Unverified catalog high watermark');
    }
    if (plan.action === 'install-disabled') {
      const observed = await readCatalog(db);
      if (observed !== null) {
        requireState(same(observed, target) && same(await store.get(controlPath), next),
          'Existing catalog cannot bootstrap a missing Firestore fence');
      }
    }
    // Emergency disable fences activation even if D1 is currently offline.
    requireState(integer(next.version), 'Round control version exhausted');
    await writeFirestore(store, plan, next, expectedFirestore);
    requireState(integer(target.epoch), 'Firestore fenced; catalog epoch exhausted');
    await writeCatalog(db, plan.expected.catalog, target);
  }
  return {firestore: next, catalog: target};
}

// A private release operation, separate from the signed first-import endpoint.
// The release owner verifies the precise source, settled budget and intake drain
// using the dossier identified in the immutable Firestore change receipt.
export async function replaceDisabledRoundPolicy(store, database, input, verifyTransition) {
  const plan = snapshot(input);
  requireState(exact(plan, ['action', 'expected', 'policyHash', 'evidenceHash']) &&
    plan.action === 'replace-disabled-policy' && digest(plan.policyHash) && digest(plan.evidenceHash) &&
    exact(plan.expected, ['firestore', 'catalog']), 'Invalid replacement plan');
  const {firestore, catalog} = plan.expected;
  checkCatalog(catalog);
  requireState(gate(firestore) && !firestore.enabled && !catalog.enabled &&
    firestore.version === catalog.version, 'Policy replacement requires matching disabled controls');
  requireState(plan.policyHash !== catalog.policyHash, 'Replacement must identify a different policy');
  // Reserve a later enable and emergency disable, including at the epoch ceiling.
  requireState(Math.max(catalog.version, catalog.epoch) <= Number.MAX_SAFE_INTEGER - 3,
    'Insufficient counter space for replacement');
  const next = {version: firestore.version + 1, enabled: false};
  const target = {...catalog, ...next, epoch: catalog.epoch + 1, policyHash: plan.policyHash};
  requireState(typeof verifyTransition === 'function' &&
    await verifyTransition(plan, snapshot(target)) === true, 'Missing policy transition qualification');
  const db = session(database);
  const observed = await store.get(controlPath);
  if (same(observed, next)) {
    const receipt = await store.get('roundCreationChanges/v' + next.version);
    requireState(same(receipt, plan) && same(await readCatalog(db), target),
      'Committed replacement differs from the stored controls or receipt');
  } else {
    requireState(same(observed, firestore), 'Firestore precondition changed');
    const beforeWrite = await readCatalog(db);
    requireState(same(beforeWrite, catalog) || same(beforeWrite, target), 'Catalog precondition changed');
    // Reserve this exact transition before D1 changes. Two dossiers for the
    // same pair of policy hashes must not claim one another's interrupted write.
    const claimPath = 'roundPolicyReplacements/v' + next.version;
    await store.transaction(async tx => {
      const [current, claim] = await Promise.all([tx.get(controlPath), tx.get(claimPath)]);
      requireState(same(current, firestore) || same(current, next) && same(claim, plan),
        'Firestore precondition changed');
      requireState(claim === null || same(claim, plan), 'Conflicting policy replacement claim');
      if (claim === null) tx.set(claimPath, plan);
    });
    // Both sides stay disabled. A lost D1 acknowledgement is recovered from
    // the exact target before committing the Firestore gate and plan receipt.
    await writeCatalog(db, catalog, target);
    await writeFirestore(store, plan, next);
  }
  return {firestore: next, catalog: target};
}
