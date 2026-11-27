import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign,createHash} from 'node:crypto';
import {authorizeRuntimeQa,runtimeQaMessage} from '../lib/server/signed-runtime-qa.ts';
test('runtime checks require an expiring signed request and accept no caller-controlled operation or identity',async()=>{
 const {privateKey,publicKey}=generateKeyPairSync('ed25519'),key=publicKey.export({format:'der',type:'spki'}).toString('base64'),expiry=String(Date.now()+60000);
 const make=(body='{}',changes={})=>{const time=String(Date.now()),hash=createHash('sha256').update(body).digest('hex');return new Request('https://calculus.ninja/api/runtime-qa',{method:'POST',body,headers:{'x-qa-time':time,'x-qa-hash':hash,'x-qa-signature':sign(null,Buffer.from(runtimeQaMessage(time,hash)),privateKey).toString('base64'),...changes}});};
 assert.equal(await authorizeRuntimeQa(make(),key,expiry),200);
 assert.equal(await authorizeRuntimeQa(make(),undefined,expiry),404);assert.equal(await authorizeRuntimeQa(make(),key,'1'),404);
 assert.equal(await authorizeRuntimeQa(make('{}',{'x-qa-hash':'0'.repeat(64)}),key,expiry),403);
 assert.equal(await authorizeRuntimeQa(make('{}',{origin:'https://calculus.ninja'}),key,expiry),403);
 assert.equal(await authorizeRuntimeQa(make('{"uid":"other"}'),key,expiry),403);assert.equal(await authorizeRuntimeQa(make('x'.repeat(101)),key,expiry),403);
});

test('withdrawal proof fits the same expiring authenticated request bound', async()=>{
 const {privateKey,publicKey}=generateKeyPairSync('ed25519'),time=String(Date.now());
 const key=publicKey.export({format:'der',type:'spki'}).toString('base64');
 const body=JSON.stringify({proof:'a'.repeat(64)}),hash=createHash('sha256').update(body).digest('hex');
 const req=new Request('https://calculus.ninja/api/runtime-qa',{method:'POST',body,headers:{'x-qa-time':time,'x-qa-hash':hash,'x-qa-signature':sign(null,Buffer.from(runtimeQaMessage(time,hash)),privateKey).toString('base64')}});
 assert.equal(await authorizeRuntimeQa(req,key,String(Date.now()+60000),body),200);
});

test('runtime QA rechecks the credential window after reading the signed body', async t => {
  const start = Date.now();
  t.mock.timers.enable({apis: ['Date'], now: start});
  const {privateKey, publicKey} = generateKeyPairSync('ed25519');
  const key = publicKey.export({format: 'der', type: 'spki'}).toString('base64');
  const time = String(start);
  const hash = createHash('sha256').update('{}').digest('hex');
  const signature = sign(null, Buffer.from(runtimeQaMessage(time, hash)), privateKey).toString('base64');
  const body = new ReadableStream({
    pull(controller) {
      controller.enqueue(new TextEncoder().encode('{}'));
      controller.close();
      t.mock.timers.setTime(start + 1000);
    },
  }, {highWaterMark: 0});
  const request = new Request('https://example.test/api/runtime-qa', {
    method: 'POST', body, duplex: 'half',
    headers: {'x-qa-time': time, 'x-qa-hash': hash, 'x-qa-signature': signature},
  });
  assert.equal(await authorizeRuntimeQa(request, key, String(start + 1000)), 403);
});
