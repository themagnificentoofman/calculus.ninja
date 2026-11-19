import test from 'node:test';
import assert from 'node:assert/strict';
import {isQaProfile,withdrawReleaseFixtures} from '../lib/server/qa-public-profile.ts';

test('fixture rules do not classify an ordinary player by display name',async()=>{
 assert.equal(isQaProfile({displayName:'Calculus Ninja',email:'player@example.org'}),false);
 assert.equal(isQaProfile({email:'calculus-ninja-qa-c690a3a5-0027-4e40-ba37-2ced79359f69@example.invalid'}),true);
 assert.equal(isQaProfile({qaFixture:true}),true);
 const store={find:async()=>[{id:'ordinary-uid',data:{displayName:'Calculus Ninja'}}],transaction:async()=>assert.fail('no write for a display name match')};
 assert.deepEqual(await withdrawReleaseFixtures(store),{withdrawn:0,remaining:0});
});
