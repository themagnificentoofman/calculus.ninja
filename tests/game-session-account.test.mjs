import test from 'node:test';
import assert from 'node:assert/strict';
import {compileFunction} from 'node:vm';
import {build} from 'esbuild';
import {observeReplay, registerCapture} from '../lib/replay/browser-events.ts';

test('a pending game action keeps the player who initiated it', async t => {
  const auth = {currentUser: {uid: 'second-player', getIdToken: async () => 'local-session'}};
  const actions = [];
  t.mock.method(globalThis, 'fetch', async (_url, init) => {
    actions.push(JSON.parse(init.body).action);
    return Response.json({id: 'round-id', receipt: {}});
  });
  const {outputFiles} = await build({
    entryPoints: ['lib/game-session.ts'], bundle: true, write: false, format: 'cjs', platform: 'node',
    external: ['@/firebase', 'firebase/firestore'],
  });
  const module = {exports: {}};
  const require = id => {
    if (id === '@/firebase') return {auth};
    if (id === 'firebase/firestore') return {};
    assert.fail('Unexpected browser dependency ' + id);
  };
  compileFunction(outputFiles[0].text, ['require', 'module', 'exports'])(require, module, module.exports);
  const game = module.exports.gameProgress;
  const operations = uid => [
    () => game.createGame(uid, 'test', {questionSetId: 'round-id'}, {}),
    () => game.submitAnswer('round-id', uid, 0, 1),
    () => game.submitFreeResponse('round-id', uid, 0, 'fr-submit', 'x'),
    () => game.submitFreeResponse('round-id', uid, 0, 'fr-skip', ''),
    () => game.submitFreeResponse('round-id', uid, 0, 'fr-reveal', ''),
    () => game.completeGame('round-id', uid),
    () => game.claimResult('round-id', uid),
    () => game.syncPendingResults(uid),
  ];

  for (const send of operations('first-player')) await assert.rejects(send(), e => e.code === 'SIGN_IN');
  assert.deepEqual(actions, []);
  for (const send of operations('second-player')) await send();
  assert.deepEqual(actions, ['create', 'answer', 'fr-submit', 'fr-skip', 'fr-reveal', 'complete', 'claim', 'sync']);
});

test('a late answer callback cannot enter the replacement player’s replay', () => {
  const events = [];
  const first = registerCapture('round-id', 'first-player', () => assert.fail('Superseded observer'));
  const second = registerCapture('round-id', 'second-player', kind => events.push(kind));
  first();
  observeReplay('round-id', 'answer_response', {}, 'first-player');
  observeReplay('round-id', 'answer_response', {}, 'second-player');
  second();
  assert.deepEqual(events, ['answer_response']);
});
