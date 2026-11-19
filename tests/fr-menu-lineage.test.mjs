import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {canonical} from '../lib/bank/compact-codec.mjs';
import {admissionKey} from '../lib/bank/free-response-record.mjs';
import {freeResponseSelectionContent} from '../lib/bank/free-response-metadata.mjs';
import {versionedFreeResponseFixture} from './fixtures/free-response.mjs';
import {menuArchiveForRegistry,validateMenuLineage} from '../scripts/bank/quality/fr-menu-lineage.mjs';

test('a choice conversion preserves the exact registered free-response origin across formats', async () => {
  const {record, admissions} = await versionedFreeResponseFixture();
  const {task} = record;
  const key = admissionKey(record);
  const entry = admissions.records[key];
  const problem = {
    contentHash: '1'.repeat(64),
    topic: task.topic, familyId: task.constructionFamilyId,
    validation: {evidence: {sourceTaskHash: task.contentHash}},
    pedagogy: {sourceRecordIds: [task.problemId + '@' + task.problemRevision]},
  };
  const link = {
    admission: key, menuHash: problem.contentHash, recordHash: entry.recordHash,
    reviewHash: entry.reviewHash, selection: freeResponseSelectionContent(record),
  };
  const verify = (target, origin, evidence, registry) => validateMenuLineage(target, origin, evidence, registry);
  assert.equal(verify(problem, task.lineageId, link, admissions), task.lineageId);
  for (const [field, value] of [['lineage_id', 'invented'], ['revision', 2], ['family_id','unrelated'], ['content_hash','a'.repeat(64)]]) {
    assert.throws(() => verify(problem, task.lineageId, {...link,selection:{...link.selection,[field]:value}},admissions), /Unbound/);
  }
  assert.throws(() => verify(problem, 'other', link, admissions), /Unbound/);
  assert.throws(() => verify({...problem, contentHash:'2'.repeat(64)}, task.lineageId, link, admissions), /Unbound/);
  assert.throws(() => verify(problem, task.lineageId, {...link,reviewHash:'3'.repeat(64)}, admissions), /Unbound/);
  assert.throws(() => verify(problem, task.lineageId, link, {...admissions,records:{}}), /Unbound/);
});

test('only a source omitted for roster capacity can supply an archived choice origin', async () => {
  const {record, admissions} = await versionedFreeResponseFixture();
  const {task} = record;
  const key = admissionKey(record);
  const entry = admissions.records[key];
  const problem = {
    contentHash: '1'.repeat(64), topic: task.topic, familyId: task.constructionFamilyId,
    validation: {evidence: {sourceTaskHash: task.contentHash}},
    pedagogy: {sourceRecordIds: [task.problemId + '@' + task.problemRevision]},
  };
  const link = {
    admission: key, menuHash: problem.contentHash, recordHash: entry.recordHash,
    reviewHash: entry.reviewHash, selection: freeResponseSelectionContent(record),
  };
  const current = {...admissions, records: {}};
  const bytes = Buffer.from(JSON.stringify(current));
  const original = {entry, reason: 'omitted-by-per-cell-FR-roster',
    dispositionHash: 'd'.repeat(64), sourceTaskHash: task.contentHash};
  const archive = {activeRegistrySHA256: createHash('sha256').update(bytes).digest('hex'),
    records: {[key]: original}};
  const verify = (registry, retained) => validateMenuLineage(problem, task.lineageId, link, registry, retained);
  assert.equal(verify(current, menuArchiveForRegistry(archive, bytes)), task.lineageId);
  assert.throws(() => verify(admissions, archive), /Unbound/);
  assert.throws(() => verify(current, menuArchiveForRegistry(archive, Buffer.from(JSON.stringify(admissions)))), /Unbound/);
  for (const altered of [{reason:'mathematics-unverified'}, {dispositionHash:''}, {sourceTaskHash:'e'.repeat(64)}]) {
    assert.throws(() => verify(current, {...archive, records:{[key]:{...original,...altered}}}), /Unbound/);
  }
  assert.throws(() => verify(current, {...archive, records:{}}), /Unbound/);
});


test('an independently admitted non-serving origin requires its exact current roster and guarded review proof', async () => {
  const {record, admissions} = await versionedFreeResponseFixture();
  const {task} = record, admission = admissionKey(record), entry = admissions.records[admission];
  const problem = {contentHash:'1'.repeat(64),topic:task.topic,familyId:task.constructionFamilyId,
    validation:{evidence:{sourceTaskHash:task.contentHash}},
    pedagogy:{sourceRecordIds:[task.problemId+'@'+task.problemRevision]}};
  const link = {admission,menuHash:problem.contentHash,recordHash:entry.recordHash,
    reviewHash:entry.reviewHash,selection:freeResponseSelectionContent(record)};
  const current = {...admissions,records:{}};
  const bytes = Buffer.from(JSON.stringify(current));
  const hash = data => createHash('sha256').update(data).digest('hex');
  const activeRegistrySHA256 = hash(bytes);
  const sourceOnly = {registrySHA256:'2'.repeat(64),storageReceiptSHA256:'3'.repeat(64),eligibilitySHA256:'4'.repeat(64)};
  const proof = {activeRegistry:activeRegistrySHA256,admission,menu:link.menuHash,
    record:link.recordHash,sourceTask:task.contentHash,registry:sourceOnly.registrySHA256,
    storage:sourceOnly.storageReceiptSHA256,eligibility:sourceOnly.eligibilitySHA256};
  const retained = {reason:'admitted-for-choice-origin-only',sourceTaskHash:task.contentHash,
    entry,sourceOnly,dispositionHash:hash(canonical(proof))};
  const archive = value => ({activeRegistrySHA256,records:{[admission]:value}});
  const verify = value => validateMenuLineage(problem,task.lineageId,link,current,menuArchiveForRegistry(archive(value),bytes));
  assert.equal(verify(retained),task.lineageId);
  for (const field of Object.keys(sourceOnly)) {
    assert.throws(()=>verify({...retained,sourceOnly:{...sourceOnly,[field]:'5'.repeat(64)}}),/Unbound/);
  }
  assert.throws(()=>verify({...retained,reason:'unreviewed-source'}),/Unbound/);
  assert.throws(()=>verify({...retained,reason:'omitted-by-per-cell-FR-roster'}),/Unbound/);
  assert.throws(()=>verify({...retained,sourceOnly:undefined}),/Unbound/);
  assert.throws(()=>verify({...retained,dispositionHash:'0'.repeat(64)}),/Unbound/);
  assert.throws(()=>validateMenuLineage(problem,task.lineageId,link,admissions,archive(retained)),/Unbound/);
  assert.throws(()=>validateMenuLineage(problem,task.lineageId,link,current,menuArchiveForRegistry(archive(retained),Buffer.from('{}'))),/Unbound/);
});
