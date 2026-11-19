import {readStudyMark,studyMarkKey,studyStatuses} from './marks.mjs';

const base = uid => 'calculus-ninja/study/dashboard/v1/' + (uid ? 'user/'+encodeURIComponent(uid) : 'guest');
export const dashboardChange = 'study-dashboard-change';
export const markGroup = status => {
 if (['Complete','Solved'].includes(status)) return 'completed';
 if (status === 'Skipped') return 'skipped';
 return ['Not started','Not attempted'].includes(status) ? 'new' : 'active';
};

export function dayKey(date) {
 return [date.getFullYear(), date.getMonth()+1, date.getDate()].map(value=>String(value).padStart(2,'0')).join('-');
}

export function activityWindow(now = new Date(), weeks = 53) {
 const end = new Date(now.getFullYear(),now.getMonth(),now.getDate());
 const first = new Date(end);
 first.setDate(first.getDate()-end.getDay()-(weeks-1)*7);
 return Array.from({length:(weeks-1)*7+end.getDay()+1},(_,i)=>{
  const day=new Date(first);day.setDate(first.getDate()+i);return day;
 });
}

export function recordStudyActivity(storage,uid,kind,resource,now=new Date()) {
 const prefix=base(uid)+'/day/', date=dayKey(now), key=prefix+date;
 const activity=readDay(storage,key);
 const values=activity[kind]??[];
 if (!values.includes(resource)) storage.setItem(key, JSON.stringify({...activity,[kind]:[...values,resource]}));
 // One key per day. Keep the calendar bounded without erasing Study marks.
 const oldest=dayKey(activityWindow(now)[0]);
 for(let i=storage.length-1;i>=0;i--){
  const stored=storage.key(i);
  if(stored?.startsWith(prefix)&&stored.slice(prefix.length)<oldest) storage.removeItem(stored);
 }
}

function readDay(storage,key){
 try {return JSON.parse(storage.getItem(key))||{};} catch {return {};}
}

export function recordModuleVisit(storage,uid,id,href,now=new Date()){
 const recent=base(uid)+'/recent';
 const value=JSON.stringify({id,href});
 if(storage.getItem(recent)!==value) storage.setItem(recent,value);
 recordStudyActivity(storage,uid,'opened',id,now);
}

export function lastModule(storage,uid,modules){
 try{
  const visited=JSON.parse(storage.getItem(base(uid)+'/recent'));
  const lesson=modules.find(m=>m.id===visited?.id);
  if(lesson){
   const url=new URL(visited.href,'https://study.invalid');
   if(url.origin==='https://study.invalid' && url.pathname===new URL(lesson.href,url.origin).pathname)
    return {...lesson,resumeHref:url.pathname+url.search+url.hash};
  }
 }catch{}
 return null;
}

export function studyDashboard(storage,uid,entries,now=new Date()){
 const modules=entries.filter(item=>item.kind==='module');
 const exercises=entries.filter(item=>item.kind==='exercise');
 const statuses=Object.fromEntries([...modules,...exercises].map(item=>[item.resource,
  readStudyMark(storage,studyMarkKey(uid,item.kind,item.resource),item.kind)]));
 const days=activityWindow(now).map(date=>{
  const key=dayKey(date),day=readDay(storage,base(uid)+'/day/'+key);
  const count=kind=>Array.isArray(day[kind])?day[kind].length:0;
  return {key,date,opened:count('opened'),practiced:count('practiced'),solved:count('solved')};
 });
 return {modules,exercises,statuses,days,recent:lastModule(storage,uid,modules)};
}

export function trackStudyMark(storage,uid,kind,resource,before,after,now=new Date()){
 if(before===after || !studyStatuses[kind]?.includes(after))return;
 if(kind==='module' && ['Practicing','Complete'].includes(after)) recordStudyActivity(storage,uid,'practiced',resource,now);
 if(kind==='exercise' && after==='Solved') recordStudyActivity(storage,uid,'solved',resource,now);
}
