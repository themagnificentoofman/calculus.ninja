import activation from './study-practice-activation.json' with {type:'json'};
import {exercisePracticeUse} from '../study/practice-drills.mjs';
import creationPolicy from './round-creation-policy.json' with {type:'json'};

export const STUDY_PRACTICE_CONTROL_SQL=`SELECT epoch,control_version AS version,lower(hex(incarnation)) AS incarnation,lower(hex(policy_hash)) AS policy
 FROM round_authorization_control WHERE id=1 AND enabled=1 AND writing=0 AND gc_active=0`;

/** A catalog edit advances the guarded epoch. An old release or rollback cannot
 * inherit another catalog's reviewed response-format claims. */
export async function lessonPracticeAvailability(database,lesson,pathway,manifest=activation,currentPolicy=creationPolicy.digest){
 const rows=lesson.exercises.flatMap(exercise=>{
  const scope=exercisePracticeUse(lesson,exercise,pathway);
  return scope?[{exercise,scope}]:[];
 });
 if(!rows.length||!database||!manifest.control)return {};
 try{
  const db=typeof database.withSession==='function'?database.withSession('first-primary'):database;
  const actual=await db.prepare(STUDY_PRACTICE_CONTROL_SQL).first(),expected=manifest.control;
  if(!actual||actual.epoch!==expected.epoch||actual.version!==expected.version||actual.incarnation!==expected.incarnation||actual.policy!==expected.policy)return {};
  if(currentPolicy!==actual.policy)return {};
  const result={};
  for(const {exercise,scope:{use,technique}} of rows){
   const cell=use.topicId+'/'+use.tier,broader=manifest.formats[cell+'/*'],exact=technique&&manifest.formats[cell+'/'+technique.tag];
   if(broader)result[exercise.id]={broader,exact:exact??[]};
  }
  return result;
 }catch{return {};}
}
