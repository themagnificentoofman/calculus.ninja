import type { Data, Store } from './firestore-admin.ts';

// Bound to the two hosted identities recorded in the Milestone 4 release receipts.
const retired = new Set([
  '3333aa4a12d439954838ca001b59e81b24f739b045efa5c9d120a5529f607afe',
  'cbe1d692e4382330e3419436a03e5a72ee3dac5df88af1a8e3930f01e4e9ff06',
]);

export function isQaProfile(profile: Data) {
  return profile.qaFixture === true ||
    (typeof profile.email === 'string' && /^calculus-ninja-qa-[0-9a-f-]{36}@example\.invalid$/i.test(profile.email));
}

async function digestUid(uid: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(uid));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

type FixtureCandidate = {uid:string; privateVerified:boolean};
type FindPublicIds = () => Promise<string[]>;

async function fixtureCandidates(store:Store,findPublicIds:FindPublicIds) {
  const ids=(await findPublicIds()).sort();
  const targets:FixtureCandidate[]=[];
  for(const uid of ids) {
    if (!retired.has(await digestUid(uid))) continue;
    const profile=await store.get('users/'+uid);
    targets.push({uid,privateVerified:!!profile&&profile.uid===uid&&isQaProfile(profile)});
  }
  return targets;
}

export async function inspectReleaseFixtures(store:Store,findPublicIds:FindPublicIds) {
  const targets=await fixtureCandidates(store,findPublicIds);
  return {visible:targets.length,verified:targets.filter(p=>p.privateVerified).length,
    proof:await digestUid(JSON.stringify(targets))};
}

export async function withdrawReleaseFixtures(store:Store,findPublicIds:FindPublicIds,proof:string) {
  const targets=await fixtureCandidates(store,findPublicIds);
  if(targets.some(p=>!p.privateVerified)||await digestUid(JSON.stringify(targets))!==proof)
    throw Error('Fixture state changed after inspection');
  if(!targets.length)return {withdrawn:0,remaining:0};
  const withdrawn=await store.transaction(async tx=>{
    // Reconcile both collections in the same snapshot as the writes.
    const pairs=await Promise.all(targets.map(({uid})=>Promise.all([tx.get('users/'+uid),tx.get('users_public/'+uid)])));
    if(pairs.some(([profile,projection],i)=>!projection||!profile||profile.uid!==targets[i].uid||!isQaProfile(profile)))
      throw Error('Fixture state changed after inspection');
    targets.forEach(({uid},i)=>{
      tx.set('users/'+uid,{...pairs[i][0],qaFixture:true});
      tx.delete('users_public/'+uid);
    });
    return targets.length;
  });
  const remaining=(await Promise.all(targets.map(({uid})=>store.get('users_public/'+uid)))).filter(Boolean).length;
  return {withdrawn,remaining};
}
