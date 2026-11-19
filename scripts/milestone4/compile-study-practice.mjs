import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {createReadStream,existsSync,readFileSync,realpathSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve,dirname,join} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {studyLessons} from '../../content/study/catalog.mjs';
import {lessonTierUse} from '../../content/study/lesson-tier-use.mjs';
import techniques from '../../lib/study/exercise-techniques.json' with {type:'json'};
import {STUDY_PRACTICE_CONTROL_SQL} from '../../lib/server/study-practice-availability.mjs';
const [dbName,sourceName,registryPath,destination,...options]=process.argv.slice(2);
if(!dbName||!sourceName||!registryPath||!destination||options.some(v=>v!=='--review-only'))throw Error('Pass a serving SQLite snapshot, matching selector source root, admission registry, new output directory and optionally --review-only.');
const source=resolve(sourceName),output=resolve(destination),load=p=>import(pathToFileURL(join(source,p)));
const {selectMixedQuestions}=await load('lib/server/mixed-question-selection.mjs'),{roundCreationPolicy}=await load('lib/server/round-creation-policy.mjs');
const {boundedJsonSnapshot}=await load('lib/server/bounded-json-snapshot.mjs');
const raw=readFileSync(registryPath),registry=boundedJsonSnapshot(JSON.parse(registryPath.endsWith('.gz')?gunzipSync(raw):raw),{maxBytes:4000000,maxNodes:50000,maxDepth:8});
const sha=x=>createHash('sha256').update(x).digest('hex'),db=new DatabaseSync(resolve(dbName),{readOnly:true});
const statements=new Map();
const adapter={prepare(sql){
 let statement=statements.get(sql);
 if(!statement){statement=db.prepare(sql);statements.set(sql,statement);}
 return {bind:(...args)=>({all:async()=>({results:statement.all(...args)})})};
},batch:async requests=>Promise.all(requests.map(x=>x.all()))};
const categories={mixed:'all',ode:'differential equations'},scopes=new Set(),formats={},proof=[];
for(const lesson of studyLessons)for(const exercise of lesson.exercises){
 const key=lesson.id+'/'+exercise.id,entry=techniques[key],section='exercise-'+exercise.id;
 const uses=(lessonTierUse[lesson.id]??[]).filter(u=>u.anchors.includes(section));
 const available=new Set(uses.map(u=>u.topic+'/'+u.tier));
 if(entry){
  assert.equal(entry.lessonRevision,lesson.revision);assert.equal(entry.exerciseRevision,exercise.revision);
  if(entry.defaultScope){const [topic,tier]=entry.defaultScope;assert(lessonTierUse[lesson.id].some(u=>u.topic===topic&&u.tier===tier));available.add(topic+'/'+tier);}
  assert.deepEqual([...available].sort(),entry.scopes);
 }
 for(const scope of available){scopes.add(scope+'/*');if(entry)scopes.add(scope+'/'+entry.tag);}
}
db.exec('BEGIN');
const review=options.includes('--review-only'),control=review?null:db.prepare(STUDY_PRACTICE_CONTROL_SQL).get(),policy=await roundCreationPolicy('easy');
if(!review){
 assert(control&&control.policy===policy.selectionPolicyHash&&control.version>0&&control.epoch>0&&/^[a-f0-9]{64}$/.test(control.incarnation),'Active guarded catalog differs from selector policy');
 const {canonical}=await load('lib/bank/compact-codec.mjs');
 assert.equal(sha(canonical(registry)),policy.registryHash,'Supplied admission registry differs from the enabled selector registry');
 const verified=JSON.parse(execFileSync(process.execPath,[realpathSync(join(source,'scripts/milestone4/creation-policy.mjs'))],{cwd:source,encoding:'utf8'}));
 assert.equal(verified.digest,policy.selectionPolicyHash,'Selector source differs from the enabled policy');
}
const random=()=>0.413,now=Date.now();
for(const scope of [...scopes].sort()){
 const [topic,difficulty,tag]=scope.split('/'),category=categories[topic]??topic;
 const current=await roundCreationPolicy(difficulty);
 assert.equal(current.selectionPolicyHash,policy.selectionPolicyHash);
 const choices=[];
 for(const format of ['multiple-choice','free-response']){
  const fr=Number(format==='free-response'),request={category,difficulty,count:1,...(tag==='*'?{}:{tag}),questionMix:{multipleChoice:1-fr,freeResponse:fr,order:'uniform'}};
  try{
   const result=await selectMixedQuestions(adapter,request,{},{rounds:current.rounds,now,admissions:registry,rng:random,index:()=>0});
   assert.equal(result.questions.length,1);const question=result.questions[0];assert.equal(question.responseFormat??'multiple-choice',format);
   choices.push(format);proof.push({scope,format,rounds:current.rounds,example:question.contentHash});
  }catch(error){if(error.code!=='joint-insufficient-capacity')throw error;proof.push({scope,format,rounds:current.rounds,denial:error.code});}
 }
 formats[scope]=choices;
}
db.exec('ROLLBACK');db.close();
function put(name,value){const bytes=JSON.stringify(value,null,2)+'\n',p=join(output,name);if(existsSync(p))assert.equal(readFileSync(p,'utf8'),bytes);else writeFileSync(p,bytes);}
const databaseHash=createHash('sha256');
for await(const chunk of createReadStream(dbName))databaseHash.update(chunk);
put('study-practice-activation.json',{version:1,control,formats});put('selector-proofs.json',{source,db:databaseHash.digest('hex'),policy:policy.selectionPolicyHash,registry:sha(raw),operator:sha(readFileSync(fileURLToPath(import.meta.url))),reviewOnly:review,scopes:proof});
console.log(scopes.size,'scopes checked,',proof.filter(p=>p.example).length,'supported format scopes');
