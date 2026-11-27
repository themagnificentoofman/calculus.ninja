import test from 'node:test';
import assert from 'node:assert/strict';
import {isQaProfile,inspectReleaseFixtures,withdrawReleaseFixtures} from '../lib/server/qa-public-profile.ts';

test('fixture rules do not classify an ordinary player by display name',async()=>{
 assert.equal(isQaProfile({displayName:'Calculus Ninja',email:'player@example.org'}),false);
 assert.equal(isQaProfile({email:'calculus-ninja-qa-c690a3a5-0027-4e40-ba37-2ced79359f69@example.invalid'}),true);
 assert.equal(isQaProfile({qaFixture:true}),true);
 const store={transaction:async()=>assert.fail('no write for a display name match')};
 const publicIds=async()=>['ordinary-uid'];
 const before=await inspectReleaseFixtures(store,publicIds);
 assert.equal(before.visible,0);
 assert.deepEqual(await withdrawReleaseFixtures(store,publicIds,before.proof),{withdrawn:0,remaining:0});
 await assert.rejects(withdrawReleaseFixtures(store,publicIds,'0'.repeat(64)),/changed after inspection/);
});

test('the projection writer used by backfill and rating repair keeps fixtures out of player search', async () => {
  const {writePublicProfile} = await import('../lib/server/public-profile-projection.ts');
  const docs = new Map();
  const tx = {
    set: (path, data) => docs.set(path, data),
    delete: path => docs.delete(path),
  };
  const player = {displayName: 'Calculus Ninja', email: 'player@example.org', xp: 17};
  writePublicProfile(tx, 'ordinary-user', player);
  assert.deepEqual(docs.get('users_public/ordinary-user'), {uid: 'ordinary-user', displayName: 'Calculus Ninja', xp: 17});

  for (const fixture of [{...player, qaFixture: true}, {...player, email: 'calculus-ninja-qa-c690a3a5-0027-4e40-ba37-2ced79359f69@example.invalid'}]) {
    docs.set('users_public/test-account', {uid: 'test-account'});
    writePublicProfile(tx, 'test-account', fixture);
    assert.equal(docs.has('users_public/test-account'), false);
    writePublicProfile(tx, 'test-account', fixture);
    assert.equal(docs.has('users_public/test-account'), false);
  }
  assert.equal(docs.size, 1);
});

test('profile writes keep verified fixtures private and publish ordinary players with the same name', async () => {
  const {createGameApi} = await import('../lib/server/game-api.ts');
  const {repairRatingPage} = await import('../lib/server/rating-repair.ts');
  const docs = new Map();
  const store = {
    get: async path => structuredClone(docs.get(path) ?? null),
    transaction: async action => {
      const staged = new Map();
      const result = await action({
        get: store.get,
        set: (path, data) => staged.set(path, structuredClone(data)),
        delete: path => staged.set(path, null),
      });
      for (const [path, data] of staged) {
        if (data === null) docs.delete(path);
        else docs.set(path, data);
      }
      return result;
    },
  };
  let claims = {sub: 'player-one', name: 'Calculus Ninja', email: 'player@example.org'};
  let verified = 0;
  let charged = 0;
  const api = createGameApi({
    store,
    verify: async () => { verified++; return claims; },
    mutationQuota: async () => { charged++; return true; },
    quota: async () => assert.fail('Profile writes never select questions'),
    select: async () => assert.fail('Profile writes never select questions'),
  });
  const update = () => api('profile', new Request('https://example.test/api/profile', {
    method: 'POST',
    headers: {Authorization: 'Bearer local-fixture', 'Content-Type': 'application/json'},
    body: JSON.stringify({patch: {displayName: 'Calculus Ninja'}}),
  }));

  assert.equal((await update()).status, 200);
  assert.equal(verified, 1);
  const publicPlayer = docs.get('users_public/player-one');
  assert.equal(publicPlayer.displayName, 'Calculus Ninja');
  assert.equal('email' in publicPlayer, false);

  claims = {sub: 'fixture-one', email: 'calculus-ninja-qa-c690a3a5-0027-4e40-ba37-2ced79359f69@example.invalid'};
  assert.equal((await update()).status, 403);
  assert.equal(verified, 2);
  assert.equal(charged, 1);
  assert.equal(docs.has('users/fixture-one'), false);

  // A retained private marker still applies when the sign-in email has changed.
  claims.email = 'different@example.org';
  const retained = {...docs.get('users/player-one'), uid: claims.sub, qaFixture: true, xp: 17};
  docs.set('users/fixture-one', retained);
  docs.set('users_public/fixture-one', {uid: claims.sub});
  for (let retry = 0; retry < 2; retry++) {
    assert.equal((await update()).status, 200);
    assert.equal(docs.has('users_public/fixture-one'), false);
    assert.equal(docs.get('users/fixture-one').xp, 17);
    assert.equal(docs.get('users/fixture-one').qaFixture, true);
  }
  docs.set('users/fixture-one', {...docs.get('users/fixture-one'), rating: -1});
  assert.equal((await repairRatingPage(store, [claims.sub], true)).affected, 1);
  assert.equal(docs.has('users_public/fixture-one'), false);
  assert.equal(docs.get('users/fixture-one').rating, 0);
  assert.deepEqual(docs.get('users_public/player-one'), publicPlayer);
});
