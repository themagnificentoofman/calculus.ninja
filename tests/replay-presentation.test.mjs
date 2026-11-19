import test from 'node:test';
import assert from 'node:assert/strict';
import {recordedEndLabel,recordedSettingRows} from '../lib/replay/presentation.ts';
test('recorded settings show readable values without exposing or changing stored version metadata',()=>{
 const manifest={mode:'multiplayer',replayVersion:2,appVersion:'milestone-4-fr-1',rulesVersion:'progression-3-bank-1',bankReleases:['internal-release'],questionCount:5,settings:{category:'all',difficulty:'hard',questionMix:{multipleChoice:2,freeResponse:3,order:'uniform'},winCondition:'first_to_n',targetScore:7,penalties:false,timeLimit:90,developmentNote:'internal-draft'}};
 const before=structuredClone(manifest),rows=recordedSettingRows(manifest),text=JSON.stringify(rows);
 assert.match(text,/2 multiple choice · 3 free response/);assert.match(text,/Uniformly shuffled/);assert.doesNotMatch(text,/90 seconds/);
 assert.deepEqual(recordedSettingRows({...manifest,mode:'rapid'}).find(([name])=>name==='Time limit'),['Time limit','90 seconds']);
 assert.deepEqual(recordedSettingRows({...manifest,settings:{...manifest.settings,winCondition:'time_limit'}}).find(([name])=>name==='Time limit'),['Time limit','90 seconds']);
 assert.deepEqual(rows.find(([name])=>name==='Target score'),['Target score','7']);
 assert.doesNotMatch(text,/milestone|progression|internal|developmentNote|questionMix/);assert.deepEqual(manifest,before);
 assert.equal(recordedEndLabel('target_reached','finished'),'Target score reached');
 assert.equal(recordedEndLabel('all_answered','finished'),'All questions answered');
});
test('unknown historic settings remain unknown and raw future status names are not echoed',()=>{
 const rows=recordedSettingRows({replayVersion:2,questionCount:4,settings:{category:'internal-draft',difficulty:'future-tier',questionMix:{multipleChoice:2,freeResponse:3,order:'uniform'}}});
 assert.deepEqual(rows.find(([name])=>name==='Question types'),['Question types','Not recorded']);
 assert.doesNotMatch(JSON.stringify(rows),/internal-draft|future-tier/);
 assert.equal(recordedEndLabel('internal_future_reason','finished'),'Finished');
 assert.equal(recordedEndLabel('internal_future_reason','internal_status'),'End reason unavailable');
 assert.deepEqual(recordedSettingRows({replayVersion:1,questionCount:4,settings:{}}).at(-1),['Question types','Multiple choice']);
});
