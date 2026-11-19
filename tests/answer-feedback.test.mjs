import test from 'node:test';import assert from 'node:assert/strict';
import {displayVerdict} from '../lib/math-answer/feedback.mjs';
import {recordedEventLabel,recordedStateLabel,recordedSubmissionLabel,recordedDeviceSessions,recordedSourceLabel} from '../lib/replay/presentation.ts';
test('public feedback explains unavailable grading without altering saved outcomes',()=>{
 for(const feedback of ['This answer contract is not supported.','This precision contract is unavailable.','This variable contract is unavailable.']){
  const verdict={outcome:'indeterminate',feedback},before=JSON.stringify(verdict),practice=displayVerdict(verdict),replay=displayVerdict(verdict,{context:'replay'});
  assert.equal(practice.label,'Not graded');assert.match(practice.feedback,/cannot be graded/);assert.match(replay.feedback,/No correct or incorrect result/);assert.equal(replay.clarified,true);assert.equal(JSON.stringify(verdict),before);
 }
});
test('unknown diagnostic wording is never displayed and useful input guidance remains',()=>{
 for(const feedback of ['TODO fixture generator secret-schema','<script>alert(1)</script>',{},'x'.repeat(1000)])for(const outcome of ['invalid','unsupported','indeterminate',null,'private-state']){
  const value=displayVerdict({outcome,feedback});assert.equal(typeof value.feedback,'string');assert(!/TODO|fixture|generator|secret|script/.test(value.feedback));
 }
 assert.equal(displayVerdict({outcome:'invalid',feedback:'Enter 3 components in the requested order.'}).feedback,'Enter 3 components in the requested order.');
 assert.equal(displayVerdict({outcome:'invalid',feedback:'Use fewer nested groups.'}).feedback,'Use fewer nested groups.');
 assert.equal(displayVerdict({outcome:'correct',feedback:'raw diagnostic'}).label,'Correct');
});
test('recorded activity distinguishes neutral grading from transport failure',()=>{
 assert.equal(recordedEventLabel('answer_ungraded'),'Answer saved without grading');assert.equal(recordedEventLabel('submission_rejected'),'Submission not confirmed');
 assert.equal(recordedEventLabel('future_internal_token'),'Recorded activity');assert.equal(recordedStateLabel('active'),'In progress');assert.equal(recordedSubmissionLabel('rejected'),'Response not confirmed');
});
test('device recording aliases remain distinct and stable across event pages',()=>{
 const events=[{source:'client',segmentId:'private-a'},{source:'server'},{source:'client',segmentId:'private-b'},{source:'client',segmentId:'private-a'},{source:'unknown',segmentId:'private-c'}],saved=JSON.stringify(events),sessions=recordedDeviceSessions(events);
 assert.equal(recordedSourceLabel(events[0],sessions),'Your device · Recording 1');assert.equal(recordedSourceLabel(events.slice(2)[0],sessions),'Your device · Recording 2');assert.equal(recordedSourceLabel(events[3],sessions),'Your device · Recording 1');assert.equal(recordedSourceLabel(events[4],sessions),'Recording source unavailable');assert.equal(recordedSourceLabel(events[1],sessions),'Server');assert.equal(JSON.stringify(events),saved);
});
