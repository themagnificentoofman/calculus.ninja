import test from 'node:test';
import assert from 'node:assert/strict';
import {studyLessons} from '../content/study/catalog.mjs';
import {studyTiers} from '../content/study/tiers.mjs';
import {lessonTierUse} from '../content/study/lesson-tier-use.mjs';
import {reviewTierStructure} from '../lib/study/tier-structure.mjs';

test('every lesson has explicit tier concepts, a scoped explanation and actual teaching anchors',()=>{
 const result=reviewTierStructure(studyLessons,studyTiers,lessonTierUse);
 assert.equal(result.passed,true,JSON.stringify(result.errors));
 assert.equal(result.tierCount,4);assert.equal(result.topicCount,28);assert.equal(result.lessonCount,studyLessons.length);
});
test('missing tier use, fabricated concept or section, and an absent topic are rejected',()=>{
 const missing=structuredClone(lessonTierUse);delete missing.algebra;
 assert(reviewTierStructure(studyLessons,studyTiers,missing).errors.some(e=>e.kind==='missing-lesson-tier-use'));
 const bad=structuredClone(lessonTierUse);bad.algebra[0].concept='not-written';bad.algebra[0].anchors=['not-written'];
 const errors=reviewTierStructure(studyLessons,studyTiers,bad).errors;
 assert(errors.some(e=>e.kind==='unknown-tier-concept'));assert(errors.some(e=>e.kind==='unwritten-teaching-anchor'));
 const tiers=structuredClone(studyTiers);tiers[0].topics.pop();
 assert(reviewTierStructure(studyLessons,tiers,lessonTierUse).errors.some(e=>e.kind==='topic-coverage'));
});

test('the successor relationship revision grounds both integration asymptotics preparations in taught sections', async()=>{
 const {lessonTierUse:prior,lessonTierUseReview:historical}=await import('../content/study/lesson-tier-use-2026111804.mjs');
 const {lessonTierUseReview:current}=await import('../content/study/lesson-tier-use.mjs');
 assert.equal(historical.revision,2026111804);assert(current.revision>historical.revision);
 const added=[];
 for(const [id,rows]of Object.entries(lessonTierUse)){
  assert.deepEqual(rows.slice(0,prior[id].length),prior[id]);
  for(const row of rows.slice(prior[id].length)){assert.equal(row.tier,'olympiad');assert.equal(row.topic,'integration');assert.equal(row.concept,'asymptotics');assert.equal(row.role,'foundation');added.push(id);}
 }
 assert.deepEqual(added.sort(),['fourier-orthogonality','nonuniform']);
});
