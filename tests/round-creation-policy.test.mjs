import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {verifyCreationPolicy,requireLiteralSource} from '../scripts/milestone4/creation-policy.mjs';
import {roundCreationPolicy} from '../lib/server/round-creation-policy.mjs';
import {ROUND_INTENT_VERSION} from '../lib/server/round-intents.ts';
import {AUTHORIZATION_VERSION} from '../lib/server/round-authorizations.mjs';
import {canonical} from '../lib/bank/compact-codec.mjs';
import manifest from '../lib/server/round-creation-policy.json' with {type:'json'};
test('protocol labels bind literal exported declarations, never comments, strings or nested decoys',()=>{
 for(const source of ['export const VERSION = 1;', '/* old export const VERSION = 2; */ export const VERSION: number = 1;', 'const note="export const VERSION = 2;"; export const VERSION=1;'])requireLiteralSource(source,'VERSION',1);
 requireLiteralSource("export const VERSION = 'round-intent-1';",'VERSION','round-intent-1');
 for(const source of [
  '// export const VERSION = 1;\nexport const VERSION=2;',
  '/* export const VERSION = 1; */ export const VERSION=2;',
  'const note="export const VERSION = 1;"; export const VERSION=2;',
  'function nested(){const VERSION=1;} export const VERSION=2;',
  'export namespace Nested {export const VERSION=1;} export const VERSION=2;',
  'const VERSION=1; export {VERSION};',
  'export let VERSION=1;', 'export declare const VERSION=1;', 'export const VERSION=1+0;',
  'export const VERSION=Number(1);', 'export const VERSION=(1);',
  'export const VERSION=1; export const VERSION=2;',
  'const VERSION=2; export const VERSION=1;',
  'export const VERSION=1; const = ;', 'export const VERSION="1";',
 ])assert.throws(()=>requireLiteralSource(source,'VERSION',1),/Review the creation-policy contract label/);
 assert.throws(()=>requireLiteralSource('export const VERSION=1;','VERSION',1,'contract.d.ts'),/Review the creation-policy contract label/);
});
test('compiled creation policy binds actual transitive source, private registry and pinned dependencies',async()=>{
 const result=await verifyCreationPolicy();assert.equal(result.digest,manifest.digest);
 for(const file of ['scripts/bank/free-response.mjs','scripts/bank/free-response-storage.mjs','scripts/bank/free-response-index.mjs','scripts/bank/checker-source.mjs','scripts/milestone4/checker-policy.mjs','lib/math-answer/checker-sources.json','lib/math-answer/versioned-grade.mjs','lib/math-answer/v2/constant-certificate.mjs','app/api/rounds/route.ts','app/api/games/route.ts','app/api/questions/route.ts','app/api/social/route.ts','firestore.rules','lib/server/round-api.ts','lib/server/runtime-api.ts','lib/server/firebase-token.mjs','lib/server/firestore-admin.ts','lib/server/quota.ts','firebase-applet-config.json','lib/server/prepared-authorization.mjs','lib/server/catalog-writer.mjs','lib/server/content-release.mjs','lib/server/initial-authorized-game.ts','lib/server/free-response-admissions.json','lib/server/legacy-eligibility.json','lib/math-answer/grade.mjs','lib/math-answer/rational.mjs','drizzle/0010_round_authorizations.sql','package-lock.json']){
  assert.equal(manifest.sourceHashes[file],createHash('sha256').update(readFileSync(new URL('../'+file,import.meta.url))).digest('hex'),file);
 }
 assert.equal(manifest.policy.intent,ROUND_INTENT_VERSION);assert.equal(manifest.policy.authorization,AUTHORIZATION_VERSION);
 const {digest,...body}=manifest;assert.notEqual(createHash('sha256').update(canonical({...body,policy:{...body.policy,familyCap:3}})).digest('hex'),digest);
 assert.equal(manifest.sourceHashes['lib/server/round-creation-policy.json'],undefined);
});
test('server policy supplies fixed scoped horizons and immutable bindings without accepting client policy choices',async()=>{
 const easy=await roundCreationPolicy('easy'),olympiad=await roundCreationPolicy('olympiad');
 assert.equal(easy.rounds,5);assert.equal(olympiad.rounds,10);assert.equal(easy.selectionPolicyHash,manifest.digest);assert.equal(easy.registryHash,manifest.registryHash);
 assert(Object.isFrozen(easy));assert.equal(easy.selectionPolicyHash,olympiad.selectionPolicyHash);
 for(const difficulty of ['invented','__proto__','constructor',null,['easy'],{toString:()=>{throw Error('coercion ran');}}])await assert.rejects(roundCreationPolicy(difficulty),/Unsupported/);
});
