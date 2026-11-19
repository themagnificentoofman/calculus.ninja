'use client';

import {useContext,useEffect,useState} from 'react';
import {BookOpen, CalendarDays, ListChecks, ChartBar} from 'lucide-react';
import {StudyLearnerContext} from '@/lib/study/learner-context';
import type {PublicStudyTier,StudySearchEntry} from '@/lib/study/contracts';
import {dashboardChange,markGroup,studyDashboard} from '@/lib/study/dashboard.mjs';
import {StudyMark} from './StudyMark';

const panel='min-w-0 rounded-2xl border border-zinc-800 bg-zinc-950/90 p-4 sm:p-6';
const link='text-emerald-300 underline underline-offset-4';
const groups=[
 {id:'completed',label:'Completed',fill:'bg-emerald-500',text:'text-emerald-300'},
 {id:'active',label:'In progress',fill:'bg-amber-500',text:'text-amber-200'},
 {id:'skipped',label:'Skipped',fill:'bg-sky-500',text:'text-sky-200'},
 {id:'new',label:'Not started',fill:'bg-zinc-700',text:'text-zinc-300'},
];

function ProgressBar({title,entries,statuses}:{title:string;entries:StudySearchEntry[];statuses:Record<string,string>}){
 const counts=new Map<string,number>();
 for(const item of entries){
  const status=markGroup(statuses[item.resource]??(item.kind==='module'?'Not started':'Not attempted'));
  counts.set(status,(counts.get(status)??0)+1);
 }
 return <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
  <h3 className="font-semibold">{title} <span className="ml-1 text-sm font-normal text-zinc-400">· {entries.length} total</span></h3>
  <div aria-hidden="true" className="my-4 flex h-2 overflow-hidden rounded-full bg-zinc-800">
   {entries.length>0&&groups.map(g=><span key={g.id} className={g.fill} style={{width:((counts.get(g.id)??0)/entries.length*100)+'%'}}/>)}
  </div>
  <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">{groups.map(g=><div key={g.id} className={g.text}>
   <dt className="text-sm">{g.label}</dt><dd className="text-xl font-semibold tabular-nums">{counts.get(g.id)??0}</dd>
  </div>)}</dl>
 </div>;
}

const dayFormat=new Intl.DateTimeFormat(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'});
const formatDay=(date:Date)=>dayFormat.format(date);
const calendarMonth=(date:Date)=>date.toLocaleDateString(undefined,{month:'short'});
type DashboardData=ReturnType<typeof studyDashboard>;

function Activity({days}:{days:DashboardData['days']}){
 const [selected,setSelected]=useState('');
 const latest=days.findLast(day=>day.opened+day.practiced+day.solved>0)??days.at(-1);
 const day=days.find(d=>d.key===selected)??latest;
 function move(index:number,event:React.KeyboardEvent<HTMLButtonElement>){
  const steps:Record<string,number>={ArrowLeft:-7,ArrowRight:7,ArrowUp:-1,ArrowDown:1};
  if(!(event.key in steps))return;
  event.preventDefault();
  const next=days[Math.max(0,Math.min(days.length-1,index+steps[event.key]))];
  document.getElementById('study-day-'+next.key)?.focus();
 }
 return <section className={panel} aria-labelledby="study-activity">
  <h2 id="study-activity" className="flex items-center gap-2 text-lg font-semibold"><CalendarDays aria-hidden="true" size={19} className="text-emerald-300"/>Activity</h2>
  <div className="mt-4 overflow-x-auto" aria-label="Study calendar">
   <div className="min-w-max">
    <div className="mb-1 grid auto-cols-[13px] grid-flow-col gap-[3px] text-xs text-zinc-400" aria-hidden="true">
     {days.filter((_,i)=>i%7===0).map((d,i)=> <span key={d.key}>{(i===0||d.date.getMonth()!==days[(i-1)*7].date.getMonth())?calendarMonth(d.date):''}</span>)}
    </div>
    <div className="grid grid-flow-col grid-rows-7 auto-cols-[13px] gap-[3px]">
     {days.map((d,i)=>{
      const count=d.opened+d.practiced+d.solved;
      const color=count===0?'bg-zinc-800':count===1?'bg-emerald-950':count<=3?'bg-emerald-700':'bg-emerald-400';
      return <button key={d.key} id={'study-day-'+d.key} type="button" title={formatDay(d.date)}
       className={`h-[13px] rounded-[2px] ${color} ${day?.key===d.key?'ring-1 ring-inset ring-white':''} focus-visible:outline focus-visible:outline-offset-0 focus-visible:outline-white`}
       aria-label={`${formatDay(d.date)}, ${count} study activities`} aria-pressed={day?.key===d.key} tabIndex={day?.key===d.key?0:-1}
       onClick={()=>setSelected(d.key)} onFocus={()=>setSelected(d.key)} onKeyDown={event=>move(i,event)}/>;
     })}
    </div>
   </div>
  </div>
  {day&&<label className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-300">Jump to date
   <input type="date" min={days[0]?.key} max={days.at(-1)?.key} value={day.key} onChange={event=>{if(event.target.value)setSelected(event.target.value);}}
    className="min-h-11 rounded-lg border border-zinc-700 bg-zinc-950 px-2 text-zinc-100 [color-scheme:dark]"/>
  </label>}
  {day&&<p aria-live="polite" className="mt-4 text-sm text-zinc-300"><strong className="text-zinc-100">{formatDay(day.date)}</strong><br/>{day.opened} modules opened · {day.practiced} marked practicing or complete · {day.solved} exercises marked solved</p>}
 </section>;
}

export function StudyDashboard({entries,tiers}:{entries:StudySearchEntry[];tiers:PublicStudyTier[]}){
 const {uid,loading}=useContext(StudyLearnerContext);
 const [saved,setSaved]=useState<{uid:string|null;data:DashboardData}|null>(null);
 const [tier,setTier]=useState('');
 const [expanded,setExpanded]=useState(false);
 useEffect(()=>{
  if(loading)return;
  const update=()=>{
   try{setSaved({uid,data:studyDashboard(window.localStorage,uid,entries)});}
   catch{setSaved({uid,data:studyDashboard(null,uid,entries)});}
  };
  update();
  window.addEventListener(dashboardChange,update);
  window.addEventListener('storage',update);
  window.addEventListener('pageshow',update);
  return ()=>{
   window.removeEventListener(dashboardChange,update);
   window.removeEventListener('storage',update);
   window.removeEventListener('pageshow',update);
  };
 },[uid,loading,entries]);
 const data=!loading&&saved?.uid===uid?saved.data:null;
 const algebra=entries.find(e=>e.kind==='module'&&e.id==='algebra');
 const recent=data?.recent;
 const active=data?.modules.filter((m:StudySearchEntry)=>['active','skipped'].includes(markGroup(data.statuses[m.resource])))??[];
 const selectedTier=tiers.find(t=>t.id===tier);
 const tierIds=new Set(selectedTier?.topics.flatMap(t=>t.concepts.flatMap(c=>c.lessons.map(l=>l.id))));
 const matches=(item:StudySearchEntry)=>!selectedTier||item.difficulty===selectedTier.id||
  (!item.difficulty&&item.locations.some(l=>tierIds.has(l.id)));
 return <div className="mt-7 space-y-4">
  <section className={panel+' flex flex-wrap items-center justify-between gap-4 border-emerald-900/70 bg-emerald-950/40'} aria-labelledby="study-resume">
   <div><h2 id="study-resume" className="flex items-center gap-2 text-xl font-semibold"><BookOpen size={20} aria-hidden="true" className="text-emerald-300"/>{recent?'Pick up where you left off':'Begin with Algebra'}</h2>
    <p className="mt-1 text-zinc-300">{recent?recent.title:algebra?.summary}</p></div>
   {(recent||algebra)&&<a className="inline-flex min-h-11 items-center rounded-xl bg-emerald-400 px-4 font-semibold text-zinc-950 hover:bg-emerald-300 focus-visible:outline-emerald-200" href={recent?.resumeHref??algebra?.href}>{recent?'Resume module':'Open Algebra'}</a>}
  </section>
  <p className="text-sm text-zinc-400">Progress and activity are saved in this browser. Study marks are self-reported.</p>
  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
   <section className={panel} aria-labelledby="study-active">
    <h2 id="study-active" className="flex items-center gap-2 text-lg font-semibold"><ListChecks size={19} aria-hidden="true" className="text-emerald-300"/>Active modules</h2>
    {active.length?<ul className="mt-3 divide-y divide-zinc-800">{active.slice(0,expanded?undefined:4).map((module:StudySearchEntry)=><li key={module.id} className="flex flex-wrap items-center justify-between gap-1 py-2"><a className={link} href={module.href}>{module.title}</a><StudyMark kind="module" resource={module.resource} title={module.title}/></li>)}</ul>:<p className="mt-3 text-zinc-400">Mark a module Reading, Practicing, Reviewing, or Skipped to see it here.</p>}
    {active.length>4&&<button type="button" className={link+' min-h-11'} onClick={()=>setExpanded(!expanded)}>{expanded?'Show fewer modules':`Show all ${active.length} modules`}</button>}
   </section>
   <Activity days={data?.days??[]}/>
  </div>
  <section className={panel} aria-labelledby="study-statistics">
   <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
    <h2 id="study-statistics" className="flex items-center gap-2 text-lg font-semibold"><ChartBar size={19} aria-hidden="true" className="text-emerald-300"/>Statistics</h2>
    <label className="flex items-center gap-2 text-sm">Difficulty<select value={tier} onChange={e=>setTier(e.target.value)} className="min-h-11 rounded-lg border border-zinc-700 bg-zinc-950 px-2"><option value="">All tiers</option>{tiers.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
   </div>
   <div className="grid gap-4 md:grid-cols-2"><ProgressBar title="Module progress" entries={(data?.modules??entries.filter(e=>e.kind==='module')).filter(matches)} statuses={data?.statuses??{}}/><ProgressBar title="Exercise progress" entries={(data?.exercises??entries.filter(e=>e.kind==='exercise')).filter(matches)} statuses={data?.statuses??{}}/></div>
  </section>
 </div>;
}
