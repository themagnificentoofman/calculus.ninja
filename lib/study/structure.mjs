import katex from 'katex';
import {studyProseParts} from './prose.mjs';
import {normalizeMath,renderMath} from '../render-math.mjs';
import {normalizeNotation} from '../math-notation.mjs';

const assert=(condition,message)=>{if(!condition)throw Error(message);};
const text=value=>typeof value==='string'&&value.trim().length>0&&value.length<=65536&&!/[\u0000-\u0008\u000b-\u001f\u007f]/.test(value);
const identity=value=>typeof value==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
// Author modules must still describe ordinary JSON data. In particular, sparse
// arrays do not contain the objectives/hints their length appears to promise.
function jsonData(value){
 let remaining=100000;const ancestors=new Set();
 const visit=(item,depth)=>{
  assert(--remaining>=0&&depth<=48,'Study document exceeds its structure bound');
  if(item===null||typeof item==='string'||typeof item==='boolean')return;
  if(typeof item==='number'){assert(Number.isFinite(item),'Nonfinite study data');return;}
  assert(item&&typeof item==='object'&&!ancestors.has(item),'Study data must be acyclic JSON');
  ancestors.add(item);
  if(Array.isArray(item)){
   assert(item.length<=65536&&Object.keys(item).length===item.length,'Study arrays must be dense JSON arrays');
   for(let i=0;i<item.length;i++){assert(Object.hasOwn(item,i),'Study arrays must be dense JSON arrays');visit(item[i],depth+1);}
  }else{
   assert(Object.getPrototypeOf(item)===Object.prototype||Object.getPrototypeOf(item)===null,'Study data must contain plain objects');
   for(const child of Object.values(item))visit(child,depth+1);
  }
  ancestors.delete(item);
 };
 visit(value,0);
}
const shape=(value,required,optional=[])=>{
 assert(value&&typeof value==='object'&&!Array.isArray(value),'Expected a study object');
 assert(required.every(key=>Object.hasOwn(value,key))&&Object.keys(value).every(key=>required.includes(key)||optional.includes(key)),'Missing or unknown study field');
};
const plain=source=>assert(text(source)&&!/[\\$]/.test(source),'Public plain text must not contain TeX or math delimiters');
const metadata=value=>{
 if(value.review!==undefined){shape(value.review,['status'],['evidence','contentHash']);assert(['draft','reviewed'].includes(value.review.status),'Invalid review status');}
 if(value.exposureAudit!==undefined){shape(value.exposureAudit,['status'],['evidence']);assert(['pending','distinct','mapped'].includes(value.exposureAudit.status),'Invalid exposure status');}
};
const readiness=items=>{
 assert(Array.isArray(items)&&items.length<=64,'Invalid readiness checks');
 for(const item of items){shape(item,['lessonId','exerciseId','prompt']);assert(identity(item.lessonId)&&identity(item.exerciseId),'Invalid readiness identity');plain(item.prompt);}
};
export const STUDY_DIAGRAM_IDS=['cubic-tangent','signed-area','constant-slope-rows'];
/** Complete literal shape and strict rendering checks. These supplement, not
 * replace, independent mathematical, teaching and visual review. */
export function reviewLessonStructure(lesson){
 const errors=[];let renderedExpressions=0;
 try{
  jsonData(lesson);
  shape(lesson,['id','revision','title','summary','objectives','prerequisites','sections','worked','contrast','mistakes','exercises','alternatives','related','next','references'],['readiness','review','exposureAudit']);metadata(lesson);
  assert(lesson&&identity(lesson.id)&&Number.isSafeInteger(lesson.revision)&&lesson.revision>0,'Invalid lesson identity');
  const render=(source,displayMode=false)=>{
   assert(text(source),'Missing mathematical source');
   assert(normalizeNotation(normalizeMath(source))===source,'Study mathematics must use canonical served notation');
   katex.renderToString(source,{displayMode,throwOnError:true,strict:'error',trust:false,maxSize:20,maxExpand:1000});
   renderMath(source,displayMode);renderedExpressions++;
  };
  const prose=source=>{
   assert(text(source),'Missing or invalid prose');
   for(const part of studyProseParts(source))if(part.kind==='math')render(part.value);
   else assert(!/[\\$]/.test(part.value),'TeX command or unmatched delimiter outside a math span');
  };
  const blocks=items=>{
   assert(Array.isArray(items)&&items.length>0&&items.length<=128,'Lesson blocks required');
   for(const block of items){
    assert(block&&typeof block==='object','Invalid lesson block');
    if(block.kind==='math'){shape(block,['kind','latex']);render(block.latex,true);}
    else if(block.kind==='prose'){shape(block,['kind','text']);prose(block.text);}
    else {shape(block,['kind','id']);assert(block.kind==='diagram'&&STUDY_DIAGRAM_IDS.includes(block.id),'Unknown diagram or lesson block');}
   }
  };
  plain(lesson.title);plain(lesson.summary);
  if(lesson.readiness!==undefined)readiness(lesson.readiness);
  assert(Array.isArray(lesson.objectives)&&lesson.objectives.length>=2&&lesson.objectives.length<=32,'Learning objectives required');lesson.objectives.forEach(prose);
  assert(Array.isArray(lesson.mistakes)&&lesson.mistakes.length>0,'Common mistakes required');lesson.mistakes.forEach(prose);
  const anchors=new Set(['worked-examples','practice','further-reading','boundary-cases','lesson-tier-use','lesson-objectives','lesson-readiness']);
  const unique=id=>{assert(identity(id)&&!anchors.has(id),'Invalid or duplicate lesson anchor');anchors.add(id);};
  assert(Array.isArray(lesson.sections)&&lesson.sections.length>=2&&lesson.sections.length<=64,'Substantive sections required');
  for(const section of lesson.sections){shape(section,['id','title','body']);unique(section.id);plain(section.title);blocks(section.body);}
  for(const [kind,examples]of [['example',lesson.worked],['exercise',lesson.exercises]]){
   assert(Array.isArray(examples)&&examples.length>0&&examples.length<=64,'Worked and transfer examples required');
   for(const example of examples){
    shape(example,['id','revision','title','problem','solution','verification',...(kind==='exercise'?['hints']:[])]);
    assert(identity(example.id)&&Number.isSafeInteger(example.revision)&&example.revision>0,'Invalid example identity');unique(`${kind}-${example.id}`);plain(example.title);
    blocks(example.problem);blocks(example.solution);
    assert(Array.isArray(example.verification)&&example.verification.length>0&&example.verification.every(text),'Example verification record required');
    if(kind==='exercise'){assert(Array.isArray(example.hints)&&example.hints.length>=2&&example.hints.length<=8,'Progressive hints required');example.hints.forEach(blocks);}
   }
  }
  blocks(lesson.contrast);blocks(lesson.alternatives);
  for(const relation of ['prerequisites','related','next'])assert(Array.isArray(lesson[relation])&&lesson[relation].every(identity)&&new Set(lesson[relation]).size===lesson[relation].length,'Invalid lesson relations');
  assert(Array.isArray(lesson.references)&&lesson.references.length>0,'Source references required');
  for(const reference of lesson.references){shape(reference,['sourceId','url','use']);assert(identity(reference.sourceId)&&reference.use==='reference-only'&&text(reference.url)&&reference.url.length<=4096&&new URL(reference.url).protocol==='https:','Invalid source reference');}
 }catch(error){errors.push({lesson:lesson?.id??null,error:error.message});}
 return {passed:errors.length===0,renderedExpressions,errors};
}

/** These overviews currently render plain text, so embedded TeX is rejected
 * rather than silently shown as source. Their exposure review is still needed. */
export function reviewStudyPublicDocument(kind,value){
 if(kind==='lesson')return reviewLessonStructure(value);
 const errors=[];
 try{
  jsonData(value);
  assert(identity(value.id)&&Number.isSafeInteger(value.revision)&&value.revision>0,'Invalid public study identity');
  metadata(value);
  if(kind==='relationships'){
   shape(value,['id','revision','mappings'],['review','exposureAudit']);
   assert(value.mappings&&typeof value.mappings==='object'&&!Array.isArray(value.mappings),'Difficulty mappings required');
   for(const uses of Object.values(value.mappings)){assert(Array.isArray(uses)&&uses.length>0,'Difficulty uses required');for(const use of uses){shape(use,['tier','topic','concept','role','explanation','anchors']);plain(use.explanation);}}
  }else{
   plain(value.title);plain(value.summary);
   if(kind==='path'){
    shape(value,['id','revision','kind','title','summary','objectives','steps','readiness'],['review','exposureAudit']);
    assert(['foundation','core','division'].includes(value.kind),'Invalid pathway kind');
    assert(Array.isArray(value.objectives)&&value.objectives.length>0,'Pathway objectives required');value.objectives.forEach(plain);
    assert(Array.isArray(value.steps)&&value.steps.length>0&&Array.isArray(value.readiness)&&value.readiness.length>0,'Pathway steps and readiness required');
    value.steps.forEach(step=>{shape(step,['lessonId','purpose']);plain(step.purpose);});readiness(value.readiness);
   }else{
    assert(kind==='tier','Unknown study document type');
    shape(value,['id','revision','title','summary','prerequisites','reasoning','progression','topics'],['review','exposureAudit']);
    assert(Array.isArray(value.prerequisites)&&value.prerequisites.length>0,'Tier prerequisites required');value.prerequisites.forEach(plain);plain(value.reasoning);plain(value.progression);
    assert(Array.isArray(value.topics)&&value.topics.length>0,'Tier topics required');
    for(const topic of value.topics){shape(topic,['id','title','concepts']);plain(topic.title);assert(Array.isArray(topic.concepts)&&topic.concepts.length>0,'Tier concepts required');topic.concepts.forEach(concept=>{shape(concept,['id','title']);plain(concept.title);});}
   }
  }
 }catch(error){errors.push({kind,id:value?.id??null,error:error.message});}
 return {passed:errors.length===0,errors,renderedExpressions:0};
}
