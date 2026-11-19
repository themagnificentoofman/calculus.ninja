import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {copyFile, mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import test from 'node:test';
import registry from '../lib/bank/reviewed-technique-tags.json' with {type:'json'};
import {reviewedPracticeTags} from '../lib/bank/practice-technique-tags.mjs';

test('exact task and menu identities share only their admitted lookup, including retained aliases', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'cn-practice-tag-fixture-'));
  try {
    const identity = name => createHash('sha256').update('synthetic binding test: ' + name).digest('hex');
    const taskHash = identity('task'), menuHash = identity('menu'), historical = identity('historical alias');
    const fixture = {
      version: 1, byContentHash: {[taskHash]:0, [menuHash]:0, [historical]:1},
      sets: [['telescoping'], ['signed-area', 'split-at-zero']],
    };
    await copyFile(new URL('../lib/bank/practice-technique-tags.mjs', import.meta.url), join(directory, 'practice-technique-tags.mjs'));
    await writeFile(join(directory, 'reviewed-technique-tags.json'), JSON.stringify(fixture));
    const lookup = await import(pathToFileURL(join(directory, 'practice-technique-tags.mjs')).href);
    const method = 'A synthetic human-readable method';
    const task = {content_hash: taskHash, technique: method};
    const menu = {contentHash: menuHash, techniqueTags: [method]};
    assert(lookup.matchesFreeResponsePracticeTag(task, 'telescoping'));
    assert.equal(lookup.matchesFreeResponsePracticeTag(task, 'geometric-series'), false);
    assert.deepEqual(lookup.indexedPracticeTags(menu), [method, 'telescoping']);
    assert.deepEqual(menu.techniqueTags, [method]);
    assert.deepEqual(lookup.reviewedPracticeTags(historical), fixture.sets[1]);
    assert.deepEqual(lookup.reviewedPracticeTags(identity('changed task')), []);
    assert.equal(lookup.matchesFreeResponsePracticeTag({content_hash:identity('changed task'),technique:method}, 'telescoping'), false);
    assert(Object.isFrozen(lookup.reviewedPracticeTags(taskHash)));
  } finally { await rm(directory,{recursive:true,force:true}); }
});

test('every installed entry names a valid frozen set', () => {
  assert.equal(registry.version,1);
  for(const tags of registry.sets){
    assert(tags.length>0);
    assert.equal(new Set(tags).size,tags.length);
    assert(tags.every(tag=>/^[a-z][a-z0-9-]{1,63}$/.test(tag)));
  }
  for(const [hash,i] of Object.entries(registry.byContentHash)){
    assert.match(hash,/^[a-f0-9]{64}$/);
    assert(Number.isInteger(i)&&i>=0&&i<registry.sets.length);
    assert.deepEqual(reviewedPracticeTags(hash),registry.sets[i]);
    assert(Object.isFrozen(reviewedPracticeTags(hash)));
  }
});
