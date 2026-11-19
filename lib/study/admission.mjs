import {canonical,hex} from '../bank/compact-codec.mjs';

const hashPattern=/^[a-f0-9]{64}$/;
const isHash=value=>typeof value==='string'&&hashPattern.test(value);
export const studyDocumentKey=(kind,value)=>`${kind}/${value.id}@${value.revision}`;
export function studyDocumentContent(value){
 const {review,exposureAudit,...content}=value;
 return content;
}
export async function studyContentHash(value){
 return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical(studyDocumentContent(value)))));
}
/** Registry entries are verified against evidence at build time. Runtime also
 * binds the exact content; authored status flags cannot authorize publication. */
export async function registeredStudyDocument(kind,value,registry){
 if(registry?.version!=='study-admission-1')return false;
 const entry=registry.documents?.[studyDocumentKey(kind,value)];
 if(!entry||!isHash(entry.contentHash)||!isHash(entry.reviewHash)||!isHash(registry.presentationHash)||entry.presentationHash!==registry.presentationHash)return false;
 if(entry.exposureDecision!=='distinct'||!isHash(entry.exposureHash))return false;
 return entry.contentHash===await studyContentHash(value);
}
export async function admittedStudyCatalog({lessons,paths,tiers,tierUse,registry}){
 const admittedTiers=[];
 for(const tier of tiers)if(await registeredStudyDocument('tier',tier,registry))admittedTiers.push(tier.id);
 const relationships=await registeredStudyDocument('relationships',tierUse,registry);
 const admittedLessons=[];
 for(const lesson of lessons){
  const uses=tierUse.mappings[lesson.id];
  if(relationships&&Array.isArray(uses)&&uses.length&&uses.every(use=>admittedTiers.includes(use.tier))&&await registeredStudyDocument('lesson',lesson,registry))admittedLessons.push(lesson);
 }
 // A released lesson cannot silently hide a required, unadmitted prerequisite.
 let allowed=new Set(admittedLessons.map(l=>l.id)),changed=true;
 while(changed){changed=false;for(const lesson of admittedLessons)if(allowed.has(lesson.id)&&lesson.prerequisites.some(id=>!allowed.has(id))){allowed.delete(lesson.id);changed=true;}}
 const admittedPaths=[];
 for(const path of paths)if(path.steps.every(s=>allowed.has(s.lessonId))&&await registeredStudyDocument('path',path,registry))admittedPaths.push(path.id);
 return {lessonIds:allowed,pathIds:new Set(admittedPaths),tierIds:new Set(admittedTiers),relationships};
}
