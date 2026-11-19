/** Editorial order remains authored; this check never silently sorts a broken
 * path, drops a prerequisite, or treats a missing lesson as taught. */
export function reviewPathStructure(lessons,paths){
 const byId=new Map(lessons.map(l=>[l.id,l])),errors=[],visiting=new Set(),visited=new Set();
 if(byId.size!==lessons.length)errors.push({kind:'duplicate-lesson'});
 for(const lesson of lessons)for(const prerequisite of lesson.prerequisites)if(!byId.has(prerequisite))errors.push({kind:'missing-prerequisite',lesson:lesson.id,prerequisite});
 const visit=(id,trail)=>{
  if(visiting.has(id)){errors.push({kind:'prerequisite-cycle',trail:[...trail,id]});return;}
  if(visited.has(id)||!byId.has(id))return;
  visiting.add(id);for(const p of byId.get(id).prerequisites)visit(p,[...trail,id]);visiting.delete(id);visited.add(id);
 };
 for(const id of byId.keys())visit(id,[]);
 const ancestors=(id,seen=new Set())=>{
  for(const prerequisite of byId.get(id)?.prerequisites??[])if(!seen.has(prerequisite)){seen.add(prerequisite);ancestors(prerequisite,seen);}
  return seen;
 };
 for(const lesson of lessons)for(const ready of lesson.readiness??[]){
  if(!ancestors(lesson.id).has(ready.lessonId)||!byId.get(ready.lessonId)?.exercises.some(e=>e.id===ready.exerciseId))errors.push({kind:'invalid-preparation-exercise',lesson:lesson.id,prerequisite:ready.lessonId,exercise:ready.exerciseId});
  if(typeof ready.prompt!=='string'||ready.prompt.trim().length<20)errors.push({kind:'missing-preparation-prompt',lesson:lesson.id});
 }
 const ids=new Set();
 for(const path of paths){
  if(ids.has(path.id))errors.push({kind:'duplicate-path',path:path.id});ids.add(path.id);
  const taught=new Set();
  for(const step of path.steps){
   const lesson=byId.get(step.lessonId);
   if(!lesson){errors.push({kind:'missing-lesson',path:path.id,lesson:step.lessonId});continue;}
   if(taught.has(lesson.id))errors.push({kind:'duplicate-step',path:path.id,lesson:lesson.id});
   for(const prerequisite of lesson.prerequisites)if(!taught.has(prerequisite))errors.push({kind:'untaught-prerequisite',path:path.id,lesson:lesson.id,prerequisite});
   if(typeof step.purpose!=='string'||step.purpose.trim().length<20)errors.push({kind:'missing-transition',path:path.id,lesson:lesson.id});
   taught.add(lesson.id);
  }
  if(!path.readiness?.length)errors.push({kind:'missing-readiness',path:path.id});
  for(const ready of path.readiness||[])if(!taught.has(ready.lessonId)||!byId.get(ready.lessonId)?.exercises.some(e=>e.id===ready.exerciseId))errors.push({kind:'untaught-readiness',path:path.id,lesson:ready.lessonId,exercise:ready.exerciseId});
 }
 return {version:'study-path-structure-1',pathCount:paths.length,errors,passed:errors.length===0,scope:'Prerequisite graph, authored order, lesson/exercise references and transition presence. Pedagogical adequacy needs separate editorial review.'};
}
