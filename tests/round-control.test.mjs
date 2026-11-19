import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync, readdirSync} from 'node:fs';
import {sqliteD1} from '../scripts/bank/sqlite-d1.mjs';
import {applyRoundControl, inspectRoundControl} from '../scripts/milestone4/round-control.mjs';

const authority = {incarnation: 'a'.repeat(64), policyHash: 'b'.repeat(64)};
const empty = {firestore: null, catalog: null};
const plan = (action, expected) => ({action, expected, ...authority});
const install = plan('install-disabled', empty);
const migrationDir = new URL('../drizzle/', import.meta.url);
const migrations = readdirSync(migrationDir).filter(name => name.endsWith('.sql')).sort()
  .map(name => readFileSync(new URL(name, migrationDir), 'utf8'));

function fixture(t) {
  const sql = new DatabaseSync(':memory:');
  t.after(() => sql.close());
  for (const migration of migrations) sql.exec(migration);
  const db = sqliteD1(sql);
  const documents = new Map();
  const get = async path => structuredClone(documents.get(path) ?? null);
  let tail = Promise.resolve();
  const store = {get, transaction(run) {
    const result = tail.then(async () => {
      const writes = new Map();
      await run({get, set: (path, value) => writes.set(path, structuredClone(value))});
      for (const [path, value] of writes) documents.set(path, value);
    });
    tail = result.catch(() => {});
    return result;
  }};
  return {db, store, documents, sql, apply: (p, qualify) => applyRoundControl(store, db, p, qualify),
    inspect: () => inspectRoundControl(store, db)};
}

test('install fences legacy creation and exact retries preserve the receipt and both counters', async t => {
  const f = fixture(t);
  assert.deepEqual(await f.inspect(), empty);
  const initial = await f.apply(install);
  assert.deepEqual(initial, await f.inspect());
  assert.deepEqual(await f.apply(install), initial);
  assert.deepEqual(await f.store.get('roundCreationChanges/v1'), install);
  assert.equal(initial.catalog.epoch, 1);
  assert.deepEqual(initial.firestore, {version: 1, enabled: false});
  assert.equal(f.documents.size, 2);
});

test('enable requires a qualified exact target and leaves a later disable available', async t => {
  const f = fixture(t);
  const before = await f.apply(install);
  const start = plan('enable', before);
  for (const qualify of [undefined, () => false, () => 'true']) {
    await assert.rejects(f.apply(start, qualify), /qualification/);
    assert.deepEqual(await f.inspect(), before);
  }
  const on = await f.apply(start, target => {
    assert.deepEqual(target, {...authority, version: 2, enabled: true, epoch: 2});
    return true;
  });
  assert.deepEqual(on, await f.inspect());
  const off = await f.apply(plan('disable', on));
  assert.equal(off.firestore.version, 3);
  assert.equal(off.catalog.enabled, false);
  await assert.rejects(f.apply(start, () => true), /changed|superseded/);
  assert.deepEqual(await f.inspect(), off);
});

test('lost Firestore acknowledgements on disable leave a fence; the same operation recovers', async t => {
  const f = fixture(t);
  const before = await f.apply(plan('enable', await f.apply(install)), () => true);
  const stop = plan('disable', before);
  const lossy = {...f.store, async transaction(fn) {
    await f.store.transaction(fn);
    throw Error('lost acknowledgement');
  }};
  await assert.rejects(applyRoundControl(lossy, f.db, stop), /lost acknowledgement/);
  assert.deepEqual(await f.inspect(), {firestore: {version: 3, enabled: false}, catalog: before.catalog});
  const after = await f.apply(stop);
  assert.deepEqual(after, await f.inspect());
  assert.deepEqual(await f.apply(stop), after);
});

test('partial D1 enable stays fenced and can be superseded without resurrecting tickets', async t => {
  const f = fixture(t);
  const prior = await f.apply(install);
  const enable = plan('enable', prior);
  const down = {...f.store, transaction() { throw Error('Firestore unavailable'); }};
  await assert.rejects(applyRoundControl(down, f.db, enable, () => true), /unavailable/);
  const partial = await f.inspect();
  assert.equal(partial.catalog.enabled, true);
  assert.equal(partial.firestore.enabled, false);
  const final = await f.apply(plan('disable', partial));
  assert.deepEqual(final.firestore, {version: 3, enabled: false});
  await assert.rejects(f.apply(enable, () => true), /changed|superseded/);
  assert.deepEqual(await f.inspect(), final);
});

test('disable revokes before a busy or unavailable catalog; GC and live ticket state are preserved', async t => {
  const f = fixture(t);
  const prior = await f.apply(plan('enable', await f.apply(install)), () => true);
  const disable = plan('disable', prior);
  f.sql.exec('UPDATE round_authorization_control SET gc_active=1,retired_before=123');
  await assert.rejects(f.apply(disable), /in progress/);
  assert.deepEqual(await f.store.get('roundCreation/control'), {version: 3, enabled: false});
  f.sql.exec('UPDATE round_authorization_control SET gc_active=0');
  await f.apply(disable);
  const row = f.sql.prepare('SELECT retired_before, ticket_count FROM round_authorization_control').get();
  assert.equal(row.retired_before, 123);
  assert.equal(row.ticket_count, 0);
});

test('stale, malformed, mismatched and restored inputs cannot install or reopen a fence', async t => {
  const f = fixture(t);
  const before = await f.apply(install);
  for (const p of [{...install, action: 'delete'}, {...install, extra: true},
    {...plan('enable', before), policyHash: 'c'.repeat(64)}, plan('enable', empty),
    plan('disable', {...before, catalog: {...before.catalog, version: Number.MAX_SAFE_INTEGER - 1}})]) {
    await assert.rejects(f.apply(p, () => true));
    assert.deepEqual(await f.inspect(), before);
  }
  f.documents.delete('roundCreation/control'); // simulate partial administrative restore
  await assert.rejects(f.apply(install), /bootstrap/);
  assert.equal(await f.store.get('roundCreation/control'), null);
});

test('source inputs detach before awaits and concurrent duplicates advance only once', async t => {
  const f = fixture(t);
  const before = await f.apply(install);
  const start = plan('enable', structuredClone(before));
  const one = f.apply(start, async target => { assert.throws(() => { target.enabled = false; }, TypeError); return true; });
  start.expected.firestore.version = 99;
  const two = f.apply(plan('enable', before), () => true);
  const results = await Promise.all([one, two]);
  assert.deepEqual(results[0], results[1]);
  assert.deepEqual(await f.inspect(), results[0]);
  assert.equal(results[0].catalog.epoch, 2);
});

test('enabling reserves a higher version and epoch for revocation', async t => {
  const f = fixture(t);
  const before = await f.apply(install);
  const end = Number.MAX_SAFE_INTEGER - 1;
  for (const expected of [
    {catalog: {...before.catalog, epoch: end}, firestore: before.firestore},
    {catalog: {...before.catalog, version: end}, firestore: {...before.firestore, version: end}},
  ]) {
    await assert.rejects(f.apply(plan('enable', expected), () => true), /subsequent disable/);
    assert.deepEqual(await f.inspect(), before);
  }
});

test('a restored catalog cannot be enabled by retrying an already committed enable', async t => {
  const f = fixture(t);
  const disabled = await f.apply(install);
  const enable = plan('enable', disabled);
  const enabled = await f.apply(enable, () => true);
  const restored = fixture(t);
  await restored.apply(install);
  await assert.rejects(applyRoundControl(f.store, restored.db, enable, () => true), /disagree/);
  assert.deepEqual((await restored.inspect()).catalog, disabled.catalog);
  assert.deepEqual(await f.store.get('roundCreation/control'), enabled.firestore);
});

test('a restored older enabled Firestore is revoked while D1 is offline; the older receipt survives', async t => {
  const f = fixture(t);
  const v2 = await f.apply(plan('enable', await f.apply(install)), () => true);
  const v3 = await f.apply(plan('disable', v2));
  const receipt = await f.store.get('roundCreationChanges/v3');
  const v4 = await f.apply(plan('enable', v3), () => true);
  f.documents.set('roundCreation/control', v2.firestore);
  const revoke = plan('disable', {firestore: v2.firestore, catalog: v4.catalog});
  const offline = {prepare() { throw Error('offline'); }};
  await assert.rejects(applyRoundControl(f.store, offline, revoke), /offline/);
  assert.deepEqual(await f.store.get('roundCreation/control'), v3.firestore);
  assert.deepEqual(await f.store.get('roundCreationChanges/v3'), receipt);
  const completed = await f.apply(revoke);
  assert.deepEqual(completed.firestore, {enabled: false, version: 5});
  assert.deepEqual(completed, await f.inspect());
  assert.deepEqual(await f.store.get('roundCreationChanges/v3'), receipt);
});

const host = process.env.FIRESTORE_EMULATOR_HOST;
const serviceTest = process.env.M4_CONTROL_LOCAL_SERVICES === '1';
test('local workerd D1 and Enterprise Firestore commit, recover and revoke the same control', {skip: !serviceTest}, async t => {
  assert.match(host ?? '', /^127\.0\.0\.1:\d+$/);
  const {firestoreStore} = await import('../lib/server/firestore-admin.ts');
  const {Miniflare} = await import('miniflare');
  const mf = new Miniflare({modules: true, script: 'export default {fetch(){return new Response()}}',
    compatibilityDate: '2026-04-01', d1Databases: ['DB']});
  t.after(() => mf.dispose());
  const db = await mf.getD1Database('DB');
  for (const source of migrations) await db.exec(source.replace(/--[^\n]*/g, '').replaceAll('\n', ' '));
  const store = firestoreStore('demo-calculus-rendering', '(default)', async () => 'owner', 'http://' + host);
  assert.deepEqual(await inspectRoundControl(store, db), empty);
  const disabled = await applyRoundControl(store, db, install);
  const enable = plan('enable', disabled);
  const interruption = {...store, transaction() { throw Error('simulated interruption'); }};
  await assert.rejects(applyRoundControl(interruption, db, enable, () => true), /interruption/);
  const partial = await inspectRoundControl(store, db);
  assert.equal(partial.catalog.version, 2);
  assert.deepEqual(partial.firestore, disabled.firestore);
  const enabled = await applyRoundControl(store, db, enable, () => true);
  assert.deepEqual(await inspectRoundControl(store, db), enabled);
  const stop = plan('disable', enabled);
  const [a, b] = await Promise.all([applyRoundControl(store, db, stop), applyRoundControl(store, db, stop)]);
  assert.deepEqual(a, b);
  assert.deepEqual(await inspectRoundControl(store, db), a);
  assert.deepEqual(await store.get('roundCreationChanges/v3'), stop);
  assert.deepEqual(a.firestore, {version: 3, enabled: false});
  await assert.rejects(applyRoundControl(store, db, enable, () => true), /precondition|changed|superseded/);
});
