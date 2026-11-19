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

export async function withdrawReleaseFixtures(store: Store) {
  const rows = await store.find('users_public', [['displayName', 'EQUAL', 'Calculus Ninja']], 50);
  if (rows.length === 50) throw Error('Fixture lookup reached its bound');
  const targets = (await Promise.all(rows.map(async row => ({
    uid: row.id, known: retired.has(await digestUid(row.id)),
  })))).filter(row => row.known);
  if (!targets.length) return {withdrawn: 0, remaining: 0};

  const withdrawn = await store.transaction(async tx => {
    const profiles = await Promise.all(targets.map(({uid}) => tx.get('users/'+uid)));
    if (profiles.some((profile, index) => !profile || profile.uid !== targets[index].uid || !isQaProfile(profile)))
      throw Error('Fixture provenance could not be verified');
    targets.forEach(({uid}, index) => {
      tx.set('users/'+uid, {...profiles[index], qaFixture:true});
      tx.delete('users_public/'+uid);
    });
    return targets.length;
  });
  const remaining = (await Promise.all(targets.map(({uid}) => store.get('users_public/'+uid)))).filter(Boolean).length;
  return {withdrawn, remaining};
}
