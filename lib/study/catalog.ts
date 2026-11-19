import editorialDocument from '../../content/study/editorial.json';
import editorialBindings from '../server/study-editorial-bindings.json';
import {reviewedStudyEditorial} from './editorial.mjs';
import studyAdmissions from '../server/study-admissions.json';
import {admittedStudyCatalog} from './admission.mjs';
import {studySyllabusState,syllabusQuery} from './syllabus.mjs';
import {studyReadingAnchor} from './marks.mjs';
import {studyLessons} from '../../content/study/catalog.mjs';
import referenceTitles from '../../content/study/reference-titles.json';
import {studyPaths} from '../../content/study/path-catalog.mjs';
import {studyTiers} from '../../content/study/tiers.mjs';
import {lessonTierUse,lessonTierUseReview} from '../../content/study/lesson-tier-use.mjs';
import {reviewPathStructure} from './pathways.mjs';
import {publicStudyBlocks,publicStudySections,publicStudyExample} from './public-content.mjs';
import type {StudyLesson, PublicStudyLesson, StudyLink, StudySearchEntry,PublicStudyPath,StudyPathPosition,PublicStudyTier,PublicLessonTierUse,StudyTierRole} from './contracts';

// Draft content is readable only in the local development build. Admission
// requires independent review AND an exact-item exposure disposition.
const lessons = studyLessons as StudyLesson[];
const admitted = process.env.NODE_ENV === 'development'
 ? Promise.resolve({lessonIds:new Set(lessons.map(l=>l.id)),pathIds:new Set(studyPaths.map(p=>p.id)),tierIds:new Set(studyTiers.map(t=>t.id)),relationships:true})
 : admittedStudyCatalog({lessons,paths:studyPaths,tiers:studyTiers,
    tierUse:{id:'lesson-tier-use',revision:lessonTierUseReview.revision,mappings:lessonTierUse},registry:studyAdmissions});
const availableLessons=async()=>{const allowed=await admitted;return lessons.filter(l=>allowed.lessonIds.has(l.id));};
export async function studyLessonIndex():Promise<StudyLink[]> {
 return (await availableLessons()).map(({id,title,revision})=>({id,title,revision,href:`/study/lessons/${id}`}));
}
export async function studySearchIndex():Promise<StudySearchEntry[]> {
 const catalog = await availableLessons();
 const readings = new Map<string, StudySearchEntry>();
 const results: StudySearchEntry[] = [];
 for (const lesson of [...catalog].sort((a,b)=>a.id.localeCompare(b.id))) {
  const href = '/study/lessons/' + lesson.id;
  const location = {id:lesson.id, title:lesson.title};
  const editorial = await reviewedStudyEditorial(lesson, editorialDocument, editorialBindings);
  results.push({id:lesson.id, kind:'module', resultAnchor:'module-'+lesson.id, resource:lesson.id+'@'+lesson.revision, title:lesson.title, href,
   locations:[location], summary:lesson.summary, searchText:[lesson.title,lesson.summary,...lesson.objectives,...lesson.sections.flatMap(section=>[section.title,...section.body.flatMap(block=>block.kind==='prose'?[block.text]:[])])].join(' ')});
  for (const exercise of lesson.exercises) {
   const reviewed = editorial?.exercises[exercise.id];
   const meta = reviewed?.revision===exercise.revision ? reviewed : undefined;
   const resource=lesson.id+'/'+exercise.id+'@'+exercise.revision;
   results.push({id:resource,kind:'exercise',resource,resultAnchor:'practice-'+lesson.id+'-'+exercise.id,title:exercise.title,href:href+'#exercise-'+exercise.id,
    locations:[location],summary:'Self-study exercise',searchText:[exercise.title, lesson.title,...exercise.problem.flatMap(block=>block.kind==='prose'?[block.text]:[])].join(' '),
    ...(meta ? {difficulty:meta.difficulty, ...(meta.recommended ? {recommendation:'recommended' as const} : {})} : {})});
  }
  for (const reference of lesson.references) {
   const existing=readings.get(reference.url);
   if (existing) { if(!existing.locations.some(l=>l.id===lesson.id))existing.locations.push(location); continue; }
   const title=(referenceTitles as Record<string,string>)[reference.url]??sourceTitles[reference.sourceId]??'Further reading';
   const reviewed=editorial?.readings.find((r:{url:string;sourceId:string;title:string})=>r.url===reference.url&&r.sourceId===reference.sourceId&&r.title===title);
   const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(reference.url)));
   const resultAnchor='reading-'+Array.from(digest,byte=>byte.toString(16).padStart(2,'0')).join('');
   readings.set(reference.url,{resultAnchor,id:reference.url,kind:'reading',resource:reference.url,title,href:href+'#'+studyReadingAnchor(reference.url),
    locations:[location],summary:sourceTitles[reference.sourceId]??'Further reading',searchText:title,
    ...(reviewed ? {recommendation:reviewed.role} : {})});
  }
 }
 return [...results,...readings.values()];
}
export async function studyPathIndex():Promise<PublicStudyPath[]>{
 const available=await studyLessonIndex();
 const allowed=await admitted;
 return studyPaths.flatMap(path=>{
  if(!allowed.pathIds.has(path.id))return [];
  if(!reviewPathStructure(lessons,[path]).passed||path.steps.some((s:{lessonId:string})=>!available.some(l=>l.id===s.lessonId)))return [];
  const steps=path.steps.map((s:{lessonId:string;purpose:string})=>({...available.find(l=>l.id===s.lessonId)!,purpose:s.purpose,href:`/study/lessons/${s.lessonId}?path=${path.id}`}));
  const readiness=path.readiness.map((r:{lessonId:string;exerciseId:string;prompt:string})=>({prompt:r.prompt,title:lessons.find(l=>l.id===r.lessonId)!.exercises.find(e=>e.id===r.exerciseId)!.title,href:`/study/lessons/${r.lessonId}?path=${path.id}&fromReadiness=1#exercise-${r.exerciseId}`}));
  return [{id:path.id,revision:path.revision,kind:path.kind as PublicStudyPath['kind'],title:path.title,summary:path.summary,objectives:path.objectives,href:`/study/paths/${path.id}`,steps,readiness}];
 });
}
export async function studyPathPosition(lessonId:string,pathId?:string):Promise<StudyPathPosition|undefined>{
 const paths=await studyPathIndex();
 const path=pathId?paths.find(p=>p.id===pathId):paths.find(p=>p.kind!=='division'&&p.steps.some(s=>s.id===lessonId))??paths.find(p=>p.steps.some(s=>s.id===lessonId));
 if(!path)return;
 const index=path.steps.findIndex(s=>s.id===lessonId);if(index<0)return;
 return {id:path.id,title:path.title,href:path.href,index:index+1,total:path.steps.length,purpose:path.steps[index].purpose,previous:path.steps[index-1],next:path.steps[index+1]};
}
const tierUse=lessonTierUse as Record<string,{tier:string;topic:string;concept:string;role:StudyTierRole;explanation:string;anchors:string[]}[]>;
export async function studyTierIndex():Promise<PublicStudyTier[]>{
 const allowed=await admitted;if(!allowed.relationships)return [];
 const available=await studyLessonIndex();
 return studyTiers.filter(t=>allowed.tierIds.has(t.id)).map(t=>({
  id:t.id as PublicStudyTier['id'],title:t.title,href:`/study/tiers/${t.id}`,revision:t.revision,summary:t.summary,
  prerequisites:t.prerequisites,reasoning:t.reasoning,progression:t.progression,
  topics:t.topics.map(topic=>({id:topic.id,title:topic.title,concepts:topic.concepts.map((concept:{id:string;title:string})=>({id:concept.id,title:concept.title,
   lessons:available.flatMap(lesson=>(tierUse[lesson.id]??[]).filter(u=>u.tier===t.id&&u.topic===topic.id&&u.concept===concept.id).map(u=>({...lesson,role:u.role,explanation:u.explanation}))),
  }))})),
 }));
}
async function publicLessonTierUse(lesson:StudyLesson):Promise<PublicLessonTierUse[]>{
 const tiers=await studyTierIndex();
 return (tierUse[lesson.id]??[]).flatMap(use=>{
  const tier=tiers.find(t=>t.id===use.tier),topic=tier?.topics.find(t=>t.id===use.topic),concept=topic?.concepts.find(c=>c.id===use.concept);
  if(!tier||!topic||!concept)return [];
  const anchors=[...(lesson.contrast.length?[{id:'boundary-cases',title:'Check the boundary cases'}]:[]),...lesson.sections.map(s=>({id:s.id,title:s.title})),...lesson.worked.map(e=>({id:`example-${e.id}`,title:e.title})),...lesson.exercises.map(e=>({id:`exercise-${e.id}`,title:e.title}))];
  return [{tier:tier.id,tierTitle:tier.title,tierHref:tier.href,topicId:topic.id,topicTitle:topic.title,conceptTitle:concept.title,conceptHref:`${tier.href}#${topic.id}-${concept.id}`,role:use.role,explanation:use.explanation,sections:use.anchors.flatMap(id=>{const anchor=anchors.find(a=>a.id===id);return anchor?[{title:anchor.title,href:`#${id}`}]:[];})}];
 });
}
export async function publicStudyLesson(id:string):Promise<PublicStudyLesson|null> {
 const allowedLessons=await availableLessons();
 const lesson=allowedLessons.find(l=>l.id===id);
 if(!lesson)return null;
 const editorial=await reviewedStudyEditorial(lesson,editorialDocument,editorialBindings);
 const available=await studyLessonIndex();
 const links=(ids:string[])=>ids.flatMap(id=>{const link=available.find(l=>l.id===id);return link?[link]:[];});
 return {id:lesson.id,revision:lesson.revision,title:lesson.title,summary:lesson.summary,objectives:lesson.objectives,
  prerequisites:links(lesson.prerequisites),sections:publicStudySections(lesson.sections),worked:lesson.worked.map(publicStudyExample),contrast:publicStudyBlocks(lesson.contrast),
  mistakes:lesson.mistakes,exercises:lesson.exercises.map(e=>{
    const row=editorial?.exercises[e.id];
    return {...publicStudyExample(e),hints:e.hints.map(publicStudyBlocks),...(row?.revision===e.revision?{editorial:{difficulty:row.difficulty,recommended:row.recommended,...(row.why?{why:row.why}:{})}}:{})};
  }),alternatives:publicStudyBlocks(lesson.alternatives),
  readiness:(lesson.readiness??[]).flatMap(r=>{
   const prerequisite=allowedLessons.find(l=>l.id===r.lessonId);
   const exercise=prerequisite?.exercises.find(e=>e.id===r.exerciseId);
   return exercise?[{title:exercise.title,prompt:r.prompt,href:`/study/lessons/${r.lessonId}#exercise-${r.exerciseId}`}]:[];
  }),
  tierUse:await publicLessonTierUse(lesson),
  related:links(lesson.related),next:links(lesson.next).map(link=>({...link,prerequisites:links(lessons.find(l=>l.id===link.id)!.prerequisites)})),references:lesson.references.map(r=>{
    const title=(referenceTitles as Record<string,string>)[r.url]??sourceTitles[r.sourceId]??'Further reading';
    const row=editorial?.readings.find((candidate:{url:string;sourceId:string;title:string})=>candidate.url===r.url&&candidate.sourceId===r.sourceId&&candidate.title===title);
    return {title,url:r.url,...(row?{editorial:{role:row.role,...(row.why?{why:row.why}:{})}}:{})};
  })};
}
const sourceTitles:Record<string,string>={
 'active-single':'Active Calculus — Matthew Boelkins and contributors',
 'active-multi':'Active Calculus: Multivariable — Nicholas Long, Mitchel T. Keller and contributors',
 'diffyqs':'Notes on Diffy Qs — Jiří Lebl',
 'mathworld':'Wolfram MathWorld',
 'openstax-algebra':'Intermediate Algebra 2e — OpenStax',
 'dlmf':'NIST Digital Library of Mathematical Functions',
 'openstax-calculus-1':'Calculus Volume 1 — OpenStax',
 'openstax-calculus-2':'Calculus Volume 2 — OpenStax',
 'openstax-calculus-3':'Calculus Volume 3 — OpenStax',
 'teschl-ode':'Ordinary Differential Equations and Dynamical Systems — Gerald Teschl',
};

// Resolve return destinations against the admitted catalog. The URL contains
// only a lesson and path identity; callers cannot supply a return URL or fragment.
export async function prerequisiteReturn(lessonId:string, sourceId?:string, pathId?:string, section?:string, syllabus?:string, result?:string) {
 if (!sourceId) return;
 const source = (await availableLessons()).find(lesson => lesson.id === sourceId);
 if(!source)return;
 const readiness = section === 'lesson-readiness' && source.readiness?.some(r=>r.lessonId===lessonId);
 const related = section === 'related-lessons' && source.related.includes(lessonId);
 if(!readiness && !related && !source.prerequisites.includes(lessonId))return;
 const anchor = readiness ? 'lesson-readiness' : related ? 'related-lessons' : 'lesson-objectives';
 const position=await studyPathPosition(source.id,pathId);
 const query=new URLSearchParams();
 if(position)query.set('path',position.id);
 const filter=syllabusQuery(studySyllabusState(syllabus));
 if(filter)query.set('syllabus',filter);
 if(typeof result==='string' && /^[a-z0-9-]{1,180}$/.test(result))query.set('result',result);
 return {id:source.id,title:source.title,href:'/study/lessons/'+source.id+(query.size?'?'+query:'')+'#'+anchor};
}
