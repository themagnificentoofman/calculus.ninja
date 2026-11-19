import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign,createHash} from 'node:crypto';
import {releaseControl,controlMessage} from '../lib/server/release-control.mjs';
import {m4ReleaseBudget} from '../lib/server/content-release-budget.mjs';

const route='https://unit.example/api/content-release/control';
const {publicKey,privateKey}=generateKeyPairSync('ed25519');
const policy={digest:'1'.repeat(64)};
const plan={format:'content-delta-v4',projectId:m4ReleaseBudget.projectId,approvedBudget:m4ReleaseBudget.id,
 priorOperation:{bundleId:m4ReleaseBudget.priorBundleId},bundleId:'3'.repeat(64),freeResponse:{firstImport:true},
 catalogWriter:{policyHash:policy.digest,incarnation:'2'.repeat(64),enabled:0,controlVersion:1,initialEpoch:1},release:'m4',batches:[{}],pages:[],tableHashes:[],cells:[]};
function signed(action='inspect',{body=JSON.stringify({action}),signedBody=body,bundle=plan.bundleId,origin}={}){
 const time=String(Date.now()),hash=createHash('sha256').update(signedBody).digest('hex');
 const signature=sign(null,Buffer.from(controlMessage(bundle,time,hash)),privateKey).toString('base64');
 const headers={'x-bank-time':time,'x-bank-body-sha256':hash,'x-bank-signature':signature,...(origin?{origin}:{})};
 return new Request(route,{method:'POST',body,headers});
}
test('round release control binds action, exact bytes, bundle, server policy and expiry before either store',async()=>{
 let reads=0;
 const env={plan,policy,publicKey:publicKey.export({type:'spki',format:'der'}).toString('base64'),expiresAt:String(Date.now()+60000),
  db:{prepare:()=>({all:async()=>{reads++;return {results:[]};}})},store:{get:async()=>{reads++;return null;}}};
 assert.equal((await releaseControl(signed(),{...env,publicKey:''})).status,404);
 assert.equal((await releaseControl(signed(),{...env,expiresAt:'0'})).status,404);
 assert.equal((await releaseControl(signed(),{...env,policy:{digest:'x'}})).status,404);
 for(const req of [signed('arbitrary'),signed('inspect',{bundle:'wrong'}),signed('inspect',{origin:'https://example.com'}),signed('inspect',{body:'{"action":"disable"}',signedBody:'{"action":"inspect"}'})])
  assert.equal((await releaseControl(req,env)).status,403);
 assert.equal(reads,0);
 const result=await releaseControl(signed(),env);assert.equal(result.status,200);
 assert.deepEqual((await result.json()).control,{firestore:null,catalog:null});assert.equal(reads,2);
});
test('enable requires the exact content activation and settled receipts',async()=>{
 let transactions=0;
 const env={plan,policy,publicKey:publicKey.export({type:'spki',format:'der'}).toString('base64'),expiresAt:String(Date.now()+60000),
  db:{prepare:()=>({bind:()=>({all:async()=>({results:[{verified:1,activated:0,halted:null,pending_id:null,release:'m4',next_sequence:1}]})})})},
  store:{transaction:async()=>{transactions++;}}};
 assert.equal((await releaseControl(signed('enable'),env)).status,409);assert.equal(transactions,0);
});
