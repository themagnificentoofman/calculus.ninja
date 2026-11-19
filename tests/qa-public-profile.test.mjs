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
