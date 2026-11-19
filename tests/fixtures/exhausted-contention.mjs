import assert from 'node:assert/strict';
import {firestoreStore} from '../../lib/server/firestore-admin.ts';

// Only the injected store uses this marker. Ordinary callers and the competing
// request still reach the real loopback emulator with their original requests.
export function afterSixAborts(project, host, atSnapshot, run) {
  return afterSixRetryableCommits(project, host, atSnapshot, run);
}

export async function afterSixRetryableCommits(project,host,atSnapshot,run,{loseLastAcknowledgement = false} = {}) {
  assert.match(host,/^127\.0\.0\.1:\d+$/);
  const marker='https://contention-fixture.invalid',emulator='http://'+host;
  const fetchOriginal=globalThis.fetch;
  const counts={writeBegins:0,commits:0,snapshots:0,snapshotReleases:0};
  let snapshot;
  globalThis.fetch=async (url,init)=>{
    if(typeof url!=='string'||!url.startsWith(marker+'/'))return fetchOriginal(url,init);
    const actual=url.replace(marker,emulator),body=init.body?JSON.parse(init.body):{};
    if(actual.endsWith(':commit')){
      assert(counts.commits++<6,'No seventh commit is allowed');
      if (loseLastAcknowledgement && counts.commits === 6) {
        const committed = await fetchOriginal(actual, init);
        assert.equal(committed.status, 200);
        await committed.arrayBuffer();
        return Response.json({error:{code:503,status:'UNAVAILABLE'}},{status:503});
      }
      const released=await fetchOriginal(actual.replace(/:commit$/,':rollback'),{
        ...init,body:JSON.stringify({transaction:body.transaction}),
      });
      assert.equal(released.status,200);
      await released.arrayBuffer();
      return Response.json({error:{code:409,status:'ABORTED'}},{status:409});
    }
    if(actual.endsWith(':beginTransaction')){
      if(body.options.readOnly){
        assert.equal(counts.commits,6);
        counts.snapshots++;
        await atSnapshot();
        const response=await fetchOriginal(actual,init);
        snapshot=(await response.clone().json()).transaction;
        return response;
      }
      counts.writeBegins++;
    }
    if(actual.endsWith(':rollback')&&snapshot&&body.transaction===snapshot)counts.snapshotReleases++;
    return fetchOriginal(actual,init);
  };
  try {
    const result=await run(firestoreStore(project,'(default)',async()=>'owner',marker));
    assert.deepEqual(counts,{writeBegins:6,commits:6,snapshots:1,snapshotReleases:1});
    return result;
  } finally {
    globalThis.fetch=fetchOriginal;
  }
}
