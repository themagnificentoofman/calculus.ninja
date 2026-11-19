
'use client';

import {useMemo, useState} from 'react';
import {ArrowRight, BookOpen, FileText, PencilLine, Search} from 'lucide-react';
import type {StudySearchEntry,PublicStudyPath,PublicStudyTier} from '@/lib/study/contracts';
import {syllabusQuery,withSyllabus,studySyllabusState} from '@/lib/study/syllabus.mjs';
import {StudyMark,StudyMarkLegend,StudyRecommendation} from './StudyMark';

type Props={lessons:StudySearchEntry[];paths?:PublicStudyPath[];tiers?:PublicStudyTier[];initialSearch?:string;restoreResult?:string};
const itemLabels={module:'Module', reading:'Reading', exercise:'Practice'};
const linkClass='text-emerald-300 underline underline-offset-4 focus-visible:outline-emerald-300';
const fieldClass='min-h-11 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-zinc-100';

export function StudyLibrary({lessons,paths=[],tiers=[],initialSearch='',restoreResult=''}:Props){
 const [filters,setFilters]=useState(()=>studySyllabusState(initialSearch));
 const [limit,setLimit]=useState(30);
 const results=useMemo(()=>{
  const terms=filters.q.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const ids=new Set<string>();
  if(filters.tier||filters.topic)for(const tier of tiers){
   if(filters.tier&&tier.id!==filters.tier)continue;
   for(const topic of tier.topics){
    if(filters.topic&&topic.id!==filters.topic)continue;
    for(const concept of topic.concepts)for(const lesson of concept.lessons)ids.add(lesson.id);
   }
  }
  return lessons.filter(entry=>{
   if(filters.kind ? entry.kind!==filters.kind : !filters.q && entry.kind!=='module') return false;
   if((filters.tier||filters.topic)&&!entry.locations.some(l=>ids.has(l.id)))return false;
   const text=(entry.searchText+' '+entry.locations.map(l=>l.title).join(' ')).toLocaleLowerCase();
   return terms.every((t:string)=>text.includes(t));
  });
 },[filters,lessons,tiers]);
 function change(key:keyof typeof filters,value:string){
  const next={...filters,[key]:value};
  setFilters(next);setLimit(30);
  const query=syllabusQuery(next);
  window.history.replaceState(window.history.state,'','/study'+(query?'?'+query:'')+'#syllabus');
  window.dispatchEvent(new Event('study-syllabus-change'));
 }
 const placement=useMemo(()=>{
  const result=new Map<string,{title:string;href:string;step:number;total:number}>();
  function priority(path:PublicStudyPath) {
   const [level,...subject]=path.id.split('-');
   const matchesTier=filters.tier && level===filters.tier;
   const matchesTopic=filters.topic && subject.join('-')===filters.topic;
   return (matchesTier?4:0)+(matchesTopic?2:0)+(path.kind!=='division'?1:0);
  }
  const ordered=[...paths].sort((a,b)=>priority(b)-priority(a));
  for(const path of ordered)path.steps.forEach((step,index)=>{
   if(!result.has(step.id))result.set(step.id,{title:path.title,href:step.href,step:index+1,total:path.steps.length});
  });
  return result;
 },[paths,filters.tier,filters.topic]);
 const tierLabels=useMemo(()=>{
  const labels=new Map<string,Set<string>>();
  for(const tier of tiers)for(const topic of tier.topics)for(const concept of topic.concepts)for(const lesson of concept.lessons){
   const values=labels.get(lesson.id)??new Set<string>();
   values.add(tier.title);labels.set(lesson.id,values);
  }
  return labels;
 },[tiers]);
 const topics=new Map(tiers.flatMap(t=>t.topics.map(topic=>[topic.id,topic.title] as const)));
 const base=paths.find(p=>p.kind==='foundation')??paths.find(p=>p.kind==='core')??lessons.find(l=>l.kind==='module');
 const anchorAt=restoreResult?results.findIndex(e=>e.resultAnchor===restoreResult):-1;
 const shown=results.slice(0,Math.max(limit,anchorAt+1));
 return <main className="mx-auto max-w-5xl px-4 py-10 text-zinc-100 sm:px-6 sm:py-14">
  <header className="max-w-3xl"><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Study Guide</h1>
  <p className="mt-4 leading-relaxed text-zinc-400">Explore calculus by topic, follow a pathway, or look up a specific reading or exercise.</p>
  {base&&<a href={base.href} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 font-semibold text-zinc-950">Start here <ArrowRight size={17} aria-hidden="true"/></a>}</header>
  <nav aria-label="Study Guide" className="my-7 flex flex-wrap gap-x-5 gap-y-3 text-sm">{paths.length>0&&<a className={linkClass} href="#pathways">Pathways and roadmaps</a>}<a className={linkClass} href="#syllabus">Search the syllabus</a>{tiers.length>0&&<a className={linkClass} href="#difficulty-guides">Difficulty guides</a>}</nav>
  <section id="syllabus" className="scroll-mt-20 border-y border-zinc-800 py-7" aria-labelledby="syllabus-heading"><h2 id="syllabus-heading" className="mb-4 text-2xl font-semibold">Search the syllabus</h2>
   <div className="flex flex-wrap gap-3"><label className="flex min-w-48 flex-1 flex-col gap-1 text-sm"><span className="flex items-center gap-1"><Search size={15} aria-hidden="true"/>Search</span><input type="search" className={fieldClass} value={filters.q} onChange={e=>change('q',e.target.value)} placeholder="Topic, module, reading, or exercise"/></label>
   <label className="flex flex-col gap-1 text-sm">Resource<select className={fieldClass} value={filters.kind} onChange={e=>change('kind',e.target.value)}><option value="">Browse modules or search all</option>{Object.entries(itemLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
   {!!tiers.length&&<label className="flex flex-col gap-1 text-sm">Tier<select className={fieldClass} value={filters.tier} onChange={e=>change('tier',e.target.value)}><option value="">All tiers</option>{tiers.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label>}
   {!!topics.size&&<label className="flex flex-col gap-1 text-sm">Topic<select className={fieldClass} value={filters.topic} onChange={e=>change('topic',e.target.value)}><option value="">All topics</option>{Array.from(topics,([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>}</div>
   <div className="my-5"><StudyMarkLegend/></div><p role="status" className="mb-2 text-sm text-zinc-400">{results.length?`${results.length} matching ${results.length===1?'resource':'resources'}`:'No matching resources. Try another term or filter.'}</p>
   <ul className="divide-y divide-zinc-800">{shown.map(item=>{
    const id=item.resultAnchor,Icon=item.kind==='module'?FileText:item.kind==='reading'?BookOpen:PencilLine;
    const position=item.kind==='module'?placement.get(item.id):undefined;
    const difficultyTiers=item.kind==='module'?tierLabels.get(item.id):undefined;
    return <li key={item.kind+item.id} id={id} className="flex scroll-mt-24 flex-wrap items-start justify-between gap-3 py-4"><div className="min-w-48 flex-1"><span className="flex items-center gap-2 text-xs text-zinc-400"><Icon aria-hidden="true" size={15}/>{itemLabels[item.kind]}{item.difficulty&&` · ${item.difficulty}`}</span><a href={withSyllabus(position?.href??item.href,filters,id)} className={linkClass+' mt-1 inline-block font-semibold'}>{item.title}</a>
    <p className="mt-1 text-sm text-zinc-400">{item.kind==='module'?item.summary:item.locations.map(l=>l.title).join(' · ')}</p>{position&&<p className="mt-1 text-xs text-zinc-400">{position.title} · Step {position.step} of {position.total}</p>}{difficultyTiers&&<p className="mt-1 text-xs text-zinc-400">{Array.from(difficultyTiers).join(' · ')}</p>}{item.recommendation&&<StudyRecommendation optional={item.recommendation==='optional'}/>}</div><StudyMark kind={item.kind} resource={item.resource} title={item.title}/></li>;
   })}</ul>{shown.length<results.length&&<button className={fieldClass+' mt-4'} onClick={()=>setLimit(shown.length+30)}>Show more resources</button>}</section>
  {paths.length>0&&<section id="pathways" className="scroll-mt-20 py-8"><h2 className="mb-4 text-2xl font-semibold">Pathways and division roadmaps</h2>{(['foundation','core','division'] as const).map(kind=>{
   const group=paths.filter(p=>p.kind===kind);
   return group.length>0&&<details key={kind} className="border-b border-zinc-800 py-3"><summary className="cursor-pointer py-2 font-semibold">{kind==='division'?'Division roadmaps':kind==='foundation'?'Foundations':'Methods and connections'}</summary><ul className="grid gap-4 py-3 sm:grid-cols-2">{group.map(p=><li key={p.id}><a className={linkClass} href={p.href}>{p.title}</a><p className="mt-1 text-sm text-zinc-400">{p.summary}</p></li>)}</ul></details>;
  })}</section>}
  {!!tiers.length&&<section id="difficulty-guides" className="scroll-mt-20 pb-8"><h2 className="mb-4 text-2xl font-semibold">Difficulty guides</h2><ul className="grid gap-4 sm:grid-cols-2">{tiers.map(t=><li key={t.id}><a className={linkClass} href={t.href}>{t.title}</a><p className="mt-1 text-sm text-zinc-400">{t.summary}</p></li>)}</ul></section>}
 </main>;
}

