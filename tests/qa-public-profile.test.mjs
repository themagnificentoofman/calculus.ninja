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
