import test from 'node:test';
import assert from 'node:assert/strict';
import {studyLessons} from '../content/study/catalog.mjs';
import {foundationPaths} from '../content/study/foundation-paths.mjs';
import {studyPaths} from '../content/study/path-catalog.mjs';
import {reviewPathStructure} from '../lib/study/pathways.mjs';

test('authored foundation sequences teach every prerequisite before use and link real readiness exercises',()=>{
 const report=reviewPathStructure(studyLessons,foundationPaths);assert.equal(report.pathCount,4);assert.deepEqual(report.errors,[]);
});
test('every current lesson belongs to an authored route with its prerequisite closure and real exercises',()=>{
 const report=reviewPathStructure(studyLessons,studyPaths);assert.deepEqual(report.errors,[]);
 const used=new Set(studyPaths.flatMap(p=>p.steps.map(s=>s.lessonId)));
 assert.deepEqual(studyLessons.filter(l=>!used.has(l.id)).map(l=>l.id),[]);
});
test('preparation checks must be real exercises in the prerequisite closure',()=>{
 const lessons=[{id:'algebra',prerequisites:[],exercises:[{id:'equation'}]},{id:'limit',prerequisites:['algebra'],exercises:[{id:'limit-check'}],readiness:[{lessonId:'algebra',exerciseId:'equation',prompt:'Solve the rational equation and preserve its excluded values.'}]}];
 assert.deepEqual(reviewPathStructure(lessons,[]).errors,[]);
 lessons[1].readiness[0].exerciseId='unwritten';assert(reviewPathStructure(lessons,[]).errors.some(e=>e.kind==='invalid-preparation-exercise'));
 lessons[1].readiness[0].exerciseId='equation';lessons[1].prerequisites=[];assert(reviewPathStructure(lessons,[]).errors.some(e=>e.kind==='invalid-preparation-exercise'));
 lessons[1].prerequisites=['unwritten'];assert(reviewPathStructure(lessons,[]).errors.some(e=>e.kind==='missing-prerequisite'));
});
test('broken pathways fail instead of silently sorting, dropping prerequisites or hiding missing exercises',()=>{
 const lessons=[{id:'algebra',prerequisites:[],exercises:[{id:'equation'}]},{id:'limit',prerequisites:['algebra'],exercises:[{id:'limit-check'}]}];
 const path={id:'fixture',steps:[{lessonId:'limit',purpose:'Use algebra to establish a nearby limit.'},{lessonId:'algebra',purpose:'Review the required equation operations.'}],readiness:[{lessonId:'limit',exerciseId:'not-written'}]};
 const result=reviewPathStructure(lessons,[path]);assert(result.errors.some(e=>e.kind==='untaught-prerequisite'));assert(result.errors.some(e=>e.kind==='untaught-readiness'));
 lessons[0].prerequisites=['limit'];assert(reviewPathStructure(lessons,[path]).errors.some(e=>e.kind==='prerequisite-cycle'));
 path.steps.push({lessonId:'missing',purpose:'Not an authored lesson.'});assert(reviewPathStructure(lessons,[path]).errors.some(e=>e.kind==='missing-lesson'));
});

test('division roadmaps match every current rank name and retain the ordinary source-bound path gate',async()=>{
 const {readFileSync}=await import('node:fs');const {divisionPaths}=await import('../content/study/division-paths.mjs');
 const {reviewStudyPublicDocument}=await import('../lib/study/structure.mjs');const {registeredStudyDocument}=await import('../lib/study/admission.mjs');
 const source=readFileSync(new URL('../components/RankDisplay.tsx',import.meta.url),'utf8'),declaration=source.match(/export type RankName = ([^;]+);/)[1],names=[...declaration.matchAll(/'([^']+)'/g)].map(m=>m[1]);
 assert.deepEqual(divisionPaths.map(p=>p.title.split(':')[0]).sort(),names.sort());
 assert.deepEqual(reviewPathStructure(studyLessons,divisionPaths).errors,[]);
 for(const path of divisionPaths){assert.equal(path.kind,'division');assert(reviewStudyPublicDocument('path',path).passed);assert.equal(await registeredStudyDocument('path',path,{version:'study-admission-1',documents:{}}),false);}
 assert.equal(reviewStudyPublicDocument('path',{...divisionPaths[0],kind:'rank-gated'}).passed,false);
});
