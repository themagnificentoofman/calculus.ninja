import {reviewStudyPublicDocument,STUDY_DIAGRAM_IDS} from '../../lib/study/structure.mjs';
import {readFileSync,writeFileSync,existsSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import katex from 'katex';
import {studyLessons} from '../../content/study/catalog.mjs';
import {studyProseParts} from '../../lib/study/prose.mjs';
import {studyPaths} from '../../content/study/path-catalog.mjs';
import {reviewPathStructure} from '../../lib/study/pathways.mjs';
import {studyTiers} from '../../content/study/tiers.mjs';
import {lessonTierUse,lessonTierUseReview} from '../../content/study/lesson-tier-use.mjs';
import {reviewTierStructure} from '../../lib/study/tier-structure.mjs';
import {studyContentHash} from '../../lib/study/admission.mjs';
import {verifyStudyAdmissions,studyEvidenceEnvironment,STUDY_PRESENTATION_FILES} from './verify-study-admissions.mjs';

import {reviewedStudyEditorial} from '../../lib/study/editorial.mjs';
const editorialDocument=JSON.parse(readFileSync('content/study/editorial.json'));
const editorialBindings=JSON.parse(readFileSync('lib/server/study-editorial-bindings.json'));
const referenceTitles=JSON.parse(readFileSync('content/study/reference-titles.json'));
assert.deepEqual(Object.keys(editorialDocument.lessons).sort(),Object.keys(editorialBindings).sort());
for(const id of Object.keys(editorialDocument.lessons)){
 const lesson=studyLessons.find(l=>l.id===id);
 assert.ok(lesson,'Unknown editorial lesson '+id);
 const row=await reviewedStudyEditorial(lesson,editorialDocument,editorialBindings);
 assert.ok(row,'Editorial review differs from the current lesson or source row: '+id);
 for(const r of row.readings){
  assert.ok(lesson.references.some(ref=>ref.url===r.url&&ref.sourceId===r.sourceId)&&referenceTitles[r.url]===r.title,'Reading source or title changed: '+id);
  assert.ok(['recommended','optional'].includes(r.role)&&(r.role!=='recommended'||r.why?.trim()),'Incomplete editorial reading: '+id);
 }
 for(const [exerciseId,e] of Object.entries(row.exercises)){
  assert.ok(lesson.exercises.some(x=>x.id===exerciseId&&x.revision===e.revision),'Exercise source changed: '+id);
  assert.ok(['easy','medium','hard','olympiad'].includes(e.difficulty)&&typeof e.recommended==='boolean'&&(!e.recommended||e.why?.trim()),'Incomplete editorial exercise: '+id);
 }
}
const release=process.argv.includes('--release');
const hash=value=>createHash('sha256').update(value).digest('hex');
const report={version:'study-structure-render-v1',scope:'Structural and complete-math rendering checks; not an independent mathematics or exposure review',lessons:[],renderedExpressions:0,unresolvedLinks:[],errors:[]};
const known=new Set(studyLessons.map(l=>l.id));
assert.equal(known.size,studyLessons.length,'Duplicate lesson ID');
const render=(latex,label)=>{
 try {katex.renderToString(latex,{throwOnError:true,strict:'error',trust:false,maxExpand:1000});report.renderedExpressions++;}
 catch(error){report.errors.push({label,error:error.message});}
};
const blocks=(items,label)=>{
 assert(Array.isArray(items)&&items.length>0,`${label}: blocks required`);
 for(const [i,block] of items.entries()){
  if(block.kind==='math')render(block.latex,`${label}[${i}]`);
  else if(block.kind==='prose'){
   assert.equal(typeof block.text,'string');
   assert(!/[\u0000-\u0008\u000b-\u001f\u007f]/.test(block.text),`${label}: control character`);
   assert(block.text.trim().length>0,`${label}: empty prose`);
   const parts=studyProseParts(block.text);
   for(const part of parts)if(part.kind==='math')render(part.value,`${label}[${i}] inline`);
   else {
    assert(!/\\[()]/.test(part.value),`${label}: unmatched inline math delimiter`);
    assert(!/\\[a-zA-Z]+/.test(part.value),`${label}: TeX command outside a math span`);
   }
  }else assert(STUDY_DIAGRAM_IDS.includes(block.id),`${label}: unknown diagram`);
 }
};
for(const lesson of studyLessons){
 const fullShape=reviewStudyPublicDocument('lesson',lesson);assert(fullShape.passed,JSON.stringify(fullShape.errors));
 assert(/^[a-z0-9-]+$/.test(lesson.id));assert(Number.isInteger(lesson.revision)&&lesson.revision>0);
 const {review,exposureAudit}=lesson;
 const contentHash=await studyContentHash(lesson);
 const ids=new Set();
 const unique=(id)=>{assert(!ids.has(id),`${lesson.id}: duplicate anchor ${id}`);ids.add(id);};
 assert(lesson.title&&lesson.summary&&lesson.objectives.length>=2&&lesson.sections.length>=2);
 blocks([lesson.summary,...lesson.objectives,...lesson.mistakes].map(text=>({kind:'prose',text})),`${lesson.id}/reading-text`);
 for(const section of lesson.sections){unique(section.id);blocks(section.body,`${lesson.id}/${section.id}`);}
 for(const reserved of ['worked-examples','practice','further-reading','boundary-cases'])unique(reserved);
 assert(lesson.worked.length>0&&lesson.exercises.length>0&&lesson.mistakes.length>0);
 for(const example of [...lesson.worked,...lesson.exercises]){
  unique(`${'hints'in example?'exercise':'example'}-${example.id}`);
  assert(example.title&&Number.isInteger(example.revision)&&example.revision>0&&example.verification.length>0);
  blocks(example.problem,`${lesson.id}/${example.id}/problem`);blocks(example.solution,`${lesson.id}/${example.id}/solution`);
  if('hints'in example){assert(example.hints.length>=2);example.hints.forEach((hint,i)=>blocks(hint,`${lesson.id}/${example.id}/hint${i+1}`));}
 }
 blocks(lesson.contrast,`${lesson.id}/contrast`);blocks(lesson.alternatives,`${lesson.id}/alternatives`);
 for(const relation of ['prerequisites','related','next'])for(const id of lesson[relation])if(!known.has(id))report.unresolvedLinks.push({from:lesson.id,relation,to:id});
 assert(lesson.references.length>0);
 for(const source of lesson.references){assert.equal(new URL(source.url).protocol,'https:');assert.equal(source.use,'reference-only');}
 report.lessons.push({id:lesson.id,revision:lesson.revision,contentHash,review:review.status,exposure:exposureAudit.status});
}
if(release)assert.equal(report.unresolvedLinks.length,0,'Unresolved lesson links');
for(const [kind,values]of Object.entries({path:studyPaths,tier:studyTiers,relationships:[{id:'lesson-tier-use',revision:lessonTierUseReview.revision,mappings:lessonTierUse}]}))for(const value of values){const check=reviewStudyPublicDocument(kind,value);assert(check.passed,JSON.stringify(check.errors));}
report.pathways=reviewPathStructure(studyLessons,studyPaths);
assert(report.pathways.passed,JSON.stringify(report.pathways.errors));
report.tierRelationships=reviewTierStructure(studyLessons,studyTiers,lessonTierUse);
assert(report.tierRelationships.passed,JSON.stringify(report.tierRelationships.errors));
report.admission=await verifyStudyAdmissions({...studyEvidenceEnvironment(),requireComplete:release});
report.sourceHashes=Object.fromEntries([...new Set([...readdirSync('content/study',{recursive:true}).filter(p=>/\.(mjs|json)$/.test(p)).sort().map(p=>`content/study/${p}`),'lib/study/pathways.mjs','lib/study/tier-structure.mjs','lib/study/structure.mjs','lib/study/admission.mjs',...STUDY_PRESENTATION_FILES])].map(p=>[p,hash(readFileSync(p))]));
const outputIndex=process.argv.indexOf('--out');
if(outputIndex>=0){const path=process.argv[outputIndex+1];assert(path&&!existsSync(path),'Provide a fresh evidence output path');writeFileSync(path,JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({lessons:report.lessons.length,renderedExpressions:report.renderedExpressions,unresolvedLinks:report.unresolvedLinks.length,errors:report.errors,releaseGate:release},null,2));
assert.equal(report.errors.length,0,'Strict rendering errors');
