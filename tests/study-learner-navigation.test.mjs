import test from 'node:test';
import assert from 'node:assert/strict';
import {readStudyMark,writeStudyMark,studyMarkKey,studyReadingAnchor} from '../lib/study/marks.mjs';
import {studySyllabusState,syllabusHref,withSyllabus} from '../lib/study/syllabus.mjs';
import {studyPracticeHref,readStudyPractice,afterSignIn} from '../lib/study/practice-link.mjs';

test('learner marks are isolated by account, revision and resource and can be cleared',()=>{
 const values=new Map(), storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 const guest=studyMarkKey(null,'exercise','lesson/problem@1');
 const alice=studyMarkKey('alice','exercise','lesson/problem@1');
 const bob=studyMarkKey('bob','exercise','lesson/problem@1');
 const revision=studyMarkKey('alice','exercise','lesson/problem@2');
 assert.equal(writeStudyMark(storage,alice,'exercise','Solved'),true);
 assert.equal(readStudyMark(storage,alice,'exercise'),'Solved');
 for(const key of [guest,bob,revision])assert.equal(readStudyMark(storage,key,'exercise'),'Not attempted');
 assert.equal(writeStudyMark(storage,alice,'exercise','verified'),false);
 assert.equal(writeStudyMark(storage,alice,'exercise','Not attempted'),true);
 assert.equal(values.size,0);
 assert.equal(writeStudyMark({setItem(){throw new Error();}},alice,'exercise','Solving'),false);
 assert.notEqual(studyReadingAnchor('https://example.invalid/a?x=1'),studyReadingAnchor('https://example.invalid/a?x=2'));
});

test('syllabus position, readiness and originating module survive practice and authentication',()=>{
 const state=studySyllabusState('q=power+series&kind=exercise&tier=hard&topic=series');
 const href=withSyllabus('/study/lessons/series#exercise-radius',state,'practice-series-radius');
 const lesson=new URL(href,'https://practice.invalid');
 const origin={...Object.fromEntries(lesson.searchParams),fromReadiness:'1',fromLesson:'series-limits',fromPath:'hard-series',fromSection:'lesson-readiness'};
 const play=studyPracticeHref('series','exercise-radius','hard-series','series','hard',origin);
 const resumed=afterSignIn(play+'&round=room-1');
 const context=readStudyPractice(new URL(resumed,'https://practice.invalid').search);
 const back=new URL(context.returnHref,'https://practice.invalid');
 assert.equal(back.pathname,'/study/lessons/series');assert.equal(back.hash,'#exercise-radius');
 assert.equal(back.searchParams.get('fromReadiness'),'1');assert.equal(back.searchParams.get('fromSection'),'lesson-readiness');
 assert.equal(back.searchParams.get('fromLesson'),'series-limits');
 const hub=new URL(syllabusHref(back.searchParams.get('syllabus'),back.searchParams.get('result')),'https://practice.invalid');
 assert.equal(hub.pathname,'/study');assert.equal(hub.searchParams.get('q'),'power series');assert.equal(hub.hash,'#practice-series-radius');
 assert.throws(()=>withSyllabus('https://outside.invalid/study/lessons/a',state,'x'));
 assert.equal(readStudyPractice(new URL(play+'&result=other','https://practice.invalid').search),null);
 assert.deepEqual(studySyllabusState('q=a&q=b&tier=invalid&topic=../outside'),{q:'',kind:'',tier:'',topic:''});
});


test('direct sign-in restores a bounded Study route including syllabus, module and reading anchors',()=>{
 const search='/study?q=double+integrals&kind=module&tier=hard&result=module-wedge#module-wedge';
 const reader='/study/lessons/wedge?path=hard-multivariable&syllabus=q%3Dwedge&result=module-wedge#reading-68747470';
 for(const target of [search, reader, '/study/paths/foundation#path-readiness','/study/tiers/hard#multivariable'])assert.equal(afterSignIn(target),target);
 for(const bad of ['/study/../../outside','/study/lessons/%2foutside','//study/lessons/a','/study-me','/study/lessons/a/b'])assert.equal(afterSignIn(bad),'/');
 assert.equal(afterSignIn('/study?next=https://outside.invalid#../../outside'),'/study');
 assert.equal(afterSignIn('/study/lessons/wedge?path=one&path=two#lesson-objectives'),'/study/lessons/wedge#lesson-objectives');
});
