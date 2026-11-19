'use client';

import {useState} from 'react';
import {MathDisplay} from '@/components/MathDisplay';
import {StudyVisit} from './StudyVisit';
import {StudyMark,StudyMarkLegend,StudyRecommendation} from './StudyMark';
import {studyReadingAnchor} from '@/lib/study/marks.mjs';
import {syllabusHref} from '@/lib/study/syllabus.mjs';
import {BookOpen} from 'lucide-react';
import {StudyDiagram} from './StudyDiagram';
import {exercisePracticeUse} from '@/lib/study/practice-drills.mjs';
import {studyPracticeHref} from '@/lib/study/practice-link.mjs';
import {studyProseParts} from '@/lib/study/prose.mjs';
import type {StudyBlock,PublicStudyLesson,PublicStudyExercise,StudyLink,StudyPathPosition} from '@/lib/study/contracts';

function Inline({text}:{text:string}){return <>{studyProseParts(text).map((part:{kind:string;value:string},i:number)=>part.kind==='math'?<MathDisplay key={i} math={part.value}/>:<span key={i}>{part.value}</span>)}</>;}
function Blocks({blocks}:{blocks:StudyBlock[]}){return <div className="space-y-4">{blocks.map((b,i)=>b.kind==='prose'?<p key={i} className="leading-relaxed text-zinc-300"><Inline text={b.text}/></p>:b.kind==='math'?<div key={i} className="min-w-0 py-2"><MathDisplay math={b.latex} block/></div>:<StudyDiagram key={i} id={b.id}/>)}</div>;}
function Links({links}:{links:StudyLink[]}){return <ul className="flex flex-wrap gap-3">{links.map(l=><li key={l.id}><a href={l.href} className="inline-block rounded-xl border border-zinc-700 px-3 py-2 text-sm text-emerald-300 hover:border-emerald-400 focus-visible:outline-2 focus-visible:outline-emerald-300">{l.title}</a></li>)}</ul>;}
type Format='multiple-choice'|'free-response';
type PracticeFormats=Record<string,{exact:Format[];broader:Format[]}>;
const formatName=(format:Format)=>format==='free-response'?'Free response':'Multiple choice';
type ExercisePractice={broaderHref:string;broaderLabel:string;broaderFormats?:Format[];label?:string;drills:{href:string;format:Format}[]};
function Exercise({lessonId,exercise,practice}:{lessonId:string;exercise:PublicStudyExercise;practice?:ExercisePractice}){
 const [hintCount,setHintCount]=useState(0);
 return <article id={`exercise-${exercise.id}`} className="scroll-mt-24 rounded-2xl border border-zinc-700 bg-zinc-950/60 p-5 sm:p-6">
  <h3 className="mb-2 text-xl font-semibold">{exercise.title}</h3>
  <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-zinc-400"><span>Self-study · Written response</span>{exercise.editorial&&<span className="capitalize">{exercise.editorial.difficulty}</span>}{exercise.editorial?.recommended&&<StudyRecommendation/>}
   <StudyMark kind="exercise" resource={lessonId+'/'+exercise.id+'@'+exercise.revision} title={exercise.title}/></div><Blocks blocks={exercise.problem}/>
  {exercise.hints.slice(0,hintCount).map((hint,i)=><div key={i} className="mt-5 border-l-2 border-amber-400/50 pl-4"><h4 className="mb-2 text-sm font-semibold text-amber-200">Hint {i+1}</h4><Blocks blocks={hint}/></div>)}
  {hintCount<exercise.hints.length&&<button type="button" onClick={()=>setHintCount(n=>n+1)} className="mt-5 min-h-11 rounded-xl border border-zinc-600 px-4 py-2 text-sm hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-emerald-300">{hintCount?'Show next hint':'Show first hint'}</button>}
  <details className="mt-5 border-t border-zinc-700 pt-4"><summary className="cursor-pointer rounded py-2 font-semibold text-emerald-300 focus-visible:outline-2 focus-visible:outline-emerald-300">Show complete solution</summary><div className="mt-4"><Blocks blocks={exercise.solution}/></div></details>
  {practice&&<div className="mt-5 space-y-3 border-t border-zinc-800 pt-4">
   {practice.drills.length>0?<><h4 className="font-semibold">Practice {practice.label}</h4><div className="flex flex-wrap gap-2">{practice.drills.map(d=><a key={d.format} href={d.href} className="inline-flex min-h-11 items-center rounded-lg border border-emerald-500/50 px-3 py-2 text-sm text-emerald-300 underline focus-visible:outline-2">{formatName(d.format)}</a>)}</div></>:<p className="text-sm text-zinc-400">A technique-specific drill is unavailable for this exercise.</p>}
   <a href={practice.broaderHref} className="inline-flex min-h-11 items-center rounded text-sm text-emerald-300 underline underline-offset-4 focus-visible:outline-2">{practice.broaderLabel}</a>
   <p className="text-sm text-zinc-400">{practice.broaderFormats===undefined?'Current multiple-choice and free-response availability could not be verified.':practice.broaderFormats.length?'Broader practice supports '+practice.broaderFormats.map(formatName).join(' and ').toLowerCase()+'.':'Broader practice has no available round in this topic and difficulty.'}</p>
  </div>}
 </article>;
}
export function StudyLessonReader({lesson,pathway,returnLesson,fromReadiness,syllabus,result,practiceFormats={}}:{
 lesson:PublicStudyLesson;practiceFormats?:PracticeFormats;pathway?:StudyPathPosition;returnLesson?:StudyLink;fromReadiness?:boolean;syllabus?:string;result?:string;
}){
 function practiceFor(exercise: PublicStudyExercise) {
   const section = 'exercise-' + exercise.id;
   const scope=exercisePracticeUse(lesson,exercise,pathway);
   if(!scope)return;
   const {use,technique}=scope;
   const prior=returnLesson ? new URL(returnLesson.href,'https://study.invalid') : undefined;
   const origin={syllabus,result,fromReadiness:fromReadiness?'1':undefined,fromLesson:returnLesson?.id,
    fromPath:prior?.searchParams.get('path')??undefined,fromSection:prior?.hash.slice(1)};
   const broaderHref=studyPracticeHref(lesson.id,section,pathway?.id,use.topicId,use.tier,origin);
   if(!broaderHref)return;
   const formats=practiceFormats[exercise.id];
   const drills=technique?(formats?.exact??[]).flatMap(format=>{
    const href=studyPracticeHref(lesson.id,section,pathway?.id,use.topicId,use.tier,origin,{tag:technique.tag,format});
    return href?[{format,href}]:[];
   }):[];
   return {broaderHref,broaderLabel:'Broader practice · '+use.topicTitle+' · '+use.tierTitle,
    broaderFormats:formats?.broader,label:technique?.label,drills};
 }
 const source = new URLSearchParams({fromLesson: lesson.id});
 if (pathway) source.set('fromPath', pathway.id);
 if(syllabus)source.set('syllabus',syllabus);
 if(result)source.set('result',result);
 function connection(href:string,anchor:string) {
  const url=new URL(href,'https://study.invalid');
  source.forEach((value,key)=>url.searchParams.set(key,value));
  url.searchParams.set('fromSection',anchor);
  return url.pathname+url.search+url.hash;
 }
 const prerequisites = lesson.prerequisites.map(link => ({...link, href: link.href + '?' + source}));
 return <main className="study-lesson mx-auto my-6 max-w-4xl rounded-3xl border border-zinc-800/60 bg-zinc-950/95 px-4 py-10 text-zinc-100 sm:px-6 sm:py-14">
  <nav aria-label="Breadcrumb" className="mb-7 flex flex-wrap gap-2 text-sm text-zinc-400"><a href="/help" className="text-emerald-300 hover:underline">Help &amp; Info</a><span aria-hidden="true">/</span><a href={syllabusHref(syllabus,result)} className="text-emerald-300 hover:underline">Syllabus</a><span aria-hidden="true">/</span><span aria-current="page">{lesson.title}</span></nav>
  <StudyVisit id={lesson.id}/><header><h1 className="text-3xl font-bold leading-tight sm:text-4xl">{lesson.title}</h1><p className="mt-4 text-lg leading-relaxed text-zinc-400"><Inline text={lesson.summary}/></p><p className="mt-4 text-sm text-zinc-400">Variables and constants are real unless a different domain is stated. Angles are measured in radians.</p><div className="mt-3"><StudyMark kind="module" resource={lesson.id+'@'+lesson.revision} title={lesson.title}/></div></header>
  {pathway&&<aside aria-label="Current pathway" className="mt-6 rounded-xl border border-zinc-700 p-4"><p className="text-sm text-zinc-400">Step {pathway.index} of {pathway.total} in <a href={pathway.href} className="text-emerald-300 underline">{pathway.title}</a></p><p className="mt-2 text-sm leading-relaxed text-zinc-300">{pathway.purpose}</p></aside>}
  {returnLesson&&<p className="mt-4"><a href={returnLesson.href} className="inline-block py-2 text-emerald-300 underline">Return to {returnLesson.title}</a></p>}
  {pathway&&fromReadiness&&<p className="mt-4"><a href={pathway.href+'#path-readiness'} className="inline-block py-2 text-emerald-300 underline">Return to pathway readiness checks</a></p>}
  {lesson.tierUse.length>0&&<section aria-labelledby="lesson-tier-use" className="mt-8 rounded-2xl border border-zinc-700 p-5"><h2 id="lesson-tier-use" className="scroll-mt-24 mb-3 text-lg font-semibold">How this lesson fits the difficulty tiers</h2><p className="mb-5 text-sm leading-relaxed text-zinc-400">The same idea can be used at different levels. These connections describe what this lesson teaches or prepares you for; they do not assign one difficulty to every problem using the technique.</p><ul className="space-y-5">{lesson.tierUse.map(use=><li key={use.conceptHref} className="border-t border-zinc-800 pt-4"><div className="flex flex-wrap items-center gap-2"><a href={use.tierHref} className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-300 underline underline-offset-2">{use.tierTitle}</a><span className="text-xs font-semibold text-zinc-400">{use.role==='foundation'?'Preparation':use.role==='core'?'Core concept':'Extension'} · {use.topicTitle}</span></div><a href={use.conceptHref} className="mt-3 block text-sm text-emerald-300 underline underline-offset-4">{use.conceptTitle}</a><p className="mt-2 text-sm leading-relaxed text-zinc-300">{use.explanation}</p><ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-400">{use.sections.map(s=><li key={s.href}><a href={s.href} className="underline underline-offset-4">{s.title}</a></li>)}</ul></li>)}</ul></section>}
  <section aria-labelledby="lesson-objectives" className="my-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 sm:p-6"><h2 id="lesson-objectives" className="mb-3 text-lg font-semibold">What you will learn</h2><ul className="list-disc space-y-2 pl-5 text-zinc-300">{lesson.objectives.map(o=><li key={o}><Inline text={o}/></li>)}</ul>{lesson.prerequisites.length>0&&<div className="mt-5"><h3 className="mb-3 text-sm font-semibold">Review these foundations first</h3><Links links={prerequisites}/></div>}</section>
  {lesson.readiness.length>0&&<section aria-labelledby="lesson-readiness" className="mb-10 rounded-2xl border border-zinc-700 p-5"><h2 id="lesson-readiness" className="mb-3 text-lg font-semibold">Check your preparation</h2><p className="mb-4 text-sm leading-relaxed text-zinc-400">These exercises revisit the methods used in this lesson. Try them before continuing if a prerequisite is unfamiliar.</p><ul className="space-y-4">{lesson.readiness.map(r=><li key={r.href}><a href={connection(r.href,'lesson-readiness')} className="text-emerald-300 underline underline-offset-4">{r.title}</a><p className="mt-1 text-sm leading-relaxed text-zinc-400">{r.prompt}</p></li>)}</ul></section>}
  <details open className="mb-6"><summary className="cursor-pointer py-3 font-semibold">Module outline</summary><StudyMarkLegend/><nav aria-label="On this page" className="mb-10 flex flex-wrap gap-x-5 gap-y-3 text-sm text-emerald-300">{lesson.sections.map(s=><a key={s.id} href={`#${s.id}`} className="underline underline-offset-4">{s.title}</a>)}<a href="#worked-examples" className="underline underline-offset-4">Worked examples</a><a href="#practice" className="underline underline-offset-4">Practice</a><a href="#further-reading" className="underline underline-offset-4">Readings</a></nav></details>
  <div className="space-y-10">
   {lesson.sections.map(s=><section id={s.id} key={s.id} className="scroll-mt-24"><h2 className="mb-5 text-2xl font-semibold">{s.title}</h2><Blocks blocks={s.body}/></section>)}
   <section id="worked-examples" className="scroll-mt-24"><h2 className="mb-5 text-2xl font-semibold">Worked examples</h2><div className="space-y-6">{lesson.worked.map(e=><article id={`example-${e.id}`} key={e.id} className="scroll-mt-24 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6"><h3 className="mb-4 text-xl font-semibold">{e.title}</h3><Blocks blocks={e.problem}/><div className="my-5 border-t border-zinc-700"/><Blocks blocks={e.solution}/></article>)}</div></section>
   {lesson.contrast.length>0&&<section id="boundary-cases" className="scroll-mt-24"><h2 className="mb-5 text-2xl font-semibold">Check the boundary cases</h2><Blocks blocks={lesson.contrast}/></section>}
   <section><h2 className="mb-4 text-2xl font-semibold">Common mistakes</h2><ul className="list-disc space-y-3 pl-5 leading-relaxed text-zinc-300">{lesson.mistakes.map(m=><li key={m}><Inline text={m}/></li>)}</ul></section>
   <section id="practice" className="scroll-mt-24"><h2 className="mb-3 text-2xl font-semibold">Try it yourself</h2><p className="mb-5 leading-relaxed text-zinc-400">Work through these self-study exercises on paper. Reveal hints one at a time, then compare your reasoning with the complete solution. These exercises are not automatically graded and do not award XP.</p><div className="space-y-6">{lesson.exercises.map(e=><Exercise lessonId={lesson.id} key={`${lesson.id}-${e.id}-${e.revision}`} exercise={e} practice={practiceFor(e)}/>)}</div></section>
   {lesson.alternatives.length>0&&<section><h2 className="mb-5 text-2xl font-semibold">Another way to think about it</h2><Blocks blocks={lesson.alternatives}/></section>}
   {lesson.related.length>0&&<section id="related-lessons" className="scroll-mt-24"><h2 className="mb-4 text-xl font-semibold">Make connections</h2><Links links={lesson.related.map(l=>({...l,href:connection(l.href,'related-lessons')}))}/></section>}
   {pathway?<section><h2 className="mb-4 text-xl font-semibold">Continue this pathway</h2><nav aria-label="Pathway steps" className="flex flex-wrap gap-4">{pathway.previous&&<a href={pathway.previous.href} className="min-h-11 rounded-xl border border-zinc-700 px-4 py-3 text-sm text-emerald-300">Previous: {pathway.previous.title}</a>}{pathway.next?<a href={pathway.next.href} className="min-h-11 rounded-xl border border-emerald-500/40 px-4 py-3 text-sm text-emerald-300">Next: {pathway.next.title}</a>:<a href={pathway.href} className="min-h-11 rounded-xl border border-emerald-500/40 px-4 py-3 text-sm text-emerald-300">Return to the readiness checks</a>}</nav></section>:lesson.next.length>0&&<section><h2 className="mb-4 text-xl font-semibold">Where to go next</h2><ul className="space-y-5">{lesson.next.map(next=><li key={next.id} className="rounded-xl border border-zinc-800 p-4"><a href={next.href} className="font-semibold text-emerald-300 underline underline-offset-4">{next.title}</a>{next.prerequisites.length>0&&<div className="mt-3"><p className="mb-2 text-sm text-zinc-400">Preparation for this lesson:</p><Links links={next.prerequisites}/></div>}</li>)}</ul></section>}
   <section id="further-reading" className="scroll-mt-24 border-t border-zinc-800 pt-7"><h2 className="mb-3 text-lg font-semibold">Readings</h2><p className="mb-4 text-sm leading-relaxed text-zinc-400">Explore these references for more explanations and exercises.</p><ul className="space-y-3">{[...lesson.references].sort((a,b)=>Number(a.editorial?.role==='optional')-Number(b.editorial?.role==='optional')).map(r=><li key={r.url} id={studyReadingAnchor(r.url)} className="scroll-mt-24 flex flex-wrap items-center justify-between gap-3"><div><BookOpen aria-hidden="true" size={15} className="mr-2 inline"/><a href={r.url} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-300 underline underline-offset-4">{r.title}</a>{r.editorial&&<div><StudyRecommendation optional={r.editorial.role==='optional'}/></div>}</div><StudyMark kind="reading" resource={r.url} title={r.title}/></li>)}</ul><p className="mt-6 text-xs text-zinc-500"><a href="/help#formatting" className="text-emerald-300 underline">Answer formatting guide</a></p></section>
  </div>
 </main>;
}
