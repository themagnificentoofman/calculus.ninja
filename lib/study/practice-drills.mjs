import techniques from './exercise-techniques.json' with {type:'json'};

export function studyTechnique(lesson,section,topic,tier){
 if(typeof section!=='string'||!section.startsWith('exercise-'))return null;
 const key=lesson+'/'+section.slice('exercise-'.length);
 if(!Object.hasOwn(techniques,key))return null;
 const technique=techniques[key];
 return technique.scopes.includes(topic+'/'+tier)?technique:null;
}

export function exercisePracticeUse(lesson,exercise,pathway){
 const key=lesson.id+'/'+exercise.id,section='#exercise-'+exercise.id;
 const technique=Object.hasOwn(techniques,key)?techniques[key]:undefined;
 const current=technique?.lessonRevision===lesson.revision&&technique.exerciseRevision===exercise.revision;
 const uses=lesson.tierUse.filter(use=>use.sections.some(anchor=>anchor.href===section));
 if(!uses.length&&current&&technique.defaultScope){
  const [topic,tier]=technique.defaultScope;
  const fallback=lesson.tierUse.find(use=>use.topicId===topic&&use.tier===tier);
  if(fallback)uses.push(fallback);
 }
 const use=uses.find(u=>pathway?.id===u.tier+'-'+u.topicId)??uses.find(u=>u.role==='core')??uses[0];
 if(!use)return null;
 return {use,technique:current?studyTechnique(lesson.id,section.slice(1),use.topicId,use.tier):null};
}
