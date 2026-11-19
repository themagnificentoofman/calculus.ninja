import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,mkdtemp,copyFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import test from 'node:test';

test('exact historical correction survives presentation without rewriting saved grades or explanations', async () => {
  const root = await mkdtemp(join(tmpdir(), 'cn-presentation-fixture-'));
  try {
    const dir = join(root, 'lib/server/solution-reviews');
    await mkdir(dir, {recursive: true});
    for (const path of ['lib/server/solution-presentation.mjs', 'lib/server/solution-reviews/legacy.mjs', 'lib/math-notation.mjs']) {
      await copyFile(new URL('../' + path,import.meta.url),join(root,path));
    }
    const id = 'synthetic-source-for-intercept-replay';
    const hash = createHash('sha256').update(id).digest('hex');
    const savedStep = 'y=43x+-42';
    const steps = ['43','y=43x-42','-42'];
    const original = {sourceContentHash:hash,revision:7,auditId:'synthetic finite source',steps:[savedStep]};
    for (const [file,value] of Object.entries({
      'legacy-hashes':'', finite:{[id]:original}, quality:{}, 'fr-menus':{},
      'p-series-classification':{}, 'tangent-intercepts':{[id+'@7']:{sourceContentHash:hash,steps}},
    })) await writeFile(join(dir,file+'.json'), JSON.stringify(value));
    const {presentBankProblem,reviewSavedQuestion}=await import(pathToFileURL(join(root,'lib/server/solution-presentation.mjs')));
    const record={problemId:id,problemRevision:7,contentHash:hash,statement:'y=x^{43}',choices:[{choiceId:'fixture-key',math:'-42'}],answerChoiceId:'fixture-key',solutionSteps:[savedStep]};
    const shown=presentBankProblem(record);
    assert.deepEqual(shown.solutionSteps,steps);
    assert.deepEqual(shown.choices,record.choices);
    assert.equal(shown.answerChoiceId,record.answerChoiceId);
    assert.equal(shown.contentHash,record.contentHash);
    assert.deepEqual(record.solutionSteps,[savedStep]);
    const saved={...record,correctIndex:0,explanation:Object.freeze([savedStep]),solutionReviewVersion:'worked-solutions-v1'};
    assert.deepEqual(reviewSavedQuestion(saved).steps,steps);
    assert.equal(reviewSavedQuestion(saved).clarified,true);
    assert.equal(reviewSavedQuestion({...saved,explanation:steps}).clarified,false);
    for(const delta of [{contentHash:'0'.repeat(64)},{problemRevision:8},{problemId:'different-test'}]){
      assert.equal(presentBankProblem({...record,...delta}).solutionQuality,undefined);
      assert.deepEqual(reviewSavedQuestion({...saved,...delta}).steps,[savedStep]);
    }
    assert.deepEqual(saved.explanation,[savedStep]);
  } finally {await rm(root,{recursive:true,force:true});}
});
