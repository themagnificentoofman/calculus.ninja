/** Reference checks do not certify that an anchored section teaches enough. */
export function reviewTierStructure(lessons,tiers,mappings){
 const errors=[],byId=new Map(lessons.map(l=>[l.id,l]));
 const expectedTiers=['easy','medium','hard','olympiad'];
 const expectedTopics=['differentiation','integration','limits','series','ode','multivariable','mixed'];
 if(JSON.stringify(tiers.map(t=>t.id))!==JSON.stringify(expectedTiers))errors.push({kind:'tier-order'});
 for(const tier of tiers){
  if(JSON.stringify(tier.topics.map(t=>t.id))!==JSON.stringify(expectedTopics))errors.push({kind:'topic-coverage',tier:tier.id});
  for(const topic of tier.topics){
   if(!topic.concepts.length||new Set(topic.concepts.map(c=>c.id)).size!==topic.concepts.length)errors.push({kind:'concept-identities',tier:tier.id,topic:topic.id});
  }
 }
 let relationshipCount=0;
 for(const lesson of lessons){
  const uses=mappings[lesson.id];
  if(!Array.isArray(uses)||!uses.length){errors.push({kind:'missing-lesson-tier-use',lesson:lesson.id});continue;}
  const anchors=new Set([...(lesson.contrast?.length?['boundary-cases']:[]),...lesson.sections.map(s=>s.id),...lesson.worked.map(e=>`example-${e.id}`),...lesson.exercises.map(e=>`exercise-${e.id}`)]);
  const keys=new Set();
  for(const use of uses){
   relationshipCount++;
   const key=`${use.tier}/${use.topic}/${use.concept}`;
   if(keys.has(key))errors.push({kind:'duplicate-relationship',lesson:lesson.id,key});keys.add(key);
   const concept=tiers.find(t=>t.id===use.tier)?.topics.find(t=>t.id===use.topic)?.concepts.find(c=>c.id===use.concept);
   if(!concept)errors.push({kind:'unknown-tier-concept',lesson:lesson.id,key});
   if(!['foundation','core','extension'].includes(use.role)||typeof use.explanation!=='string'||use.explanation.trim().length<40)errors.push({kind:'missing-tier-explanation',lesson:lesson.id,key});
   if(!Array.isArray(use.anchors)||!use.anchors.length||use.anchors.some(a=>!anchors.has(a)))errors.push({kind:'unwritten-teaching-anchor',lesson:lesson.id,key});
  }
 }
 for(const id of Object.keys(mappings))if(!byId.has(id))errors.push({kind:'unknown-mapped-lesson',lesson:id});
 return {version:'study-tier-structure-1',tierCount:tiers.length,topicCount:tiers.reduce((n,t)=>n+t.topics.length,0),lessonCount:lessons.length,relationshipCount,errors,passed:errors.length===0,scope:'Expected-concept identities, explicit scoped relationships and existing teaching anchors. Instructional adequacy and difficulty fit require independent editorial review.'};
}
