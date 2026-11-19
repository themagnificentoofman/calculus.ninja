import test from 'node:test';
import assert from 'node:assert/strict';
import {studyPracticeHref,readStudyPractice,practiceSignInReturn,afterSignIn} from '../lib/study/practice-link.mjs';
import {exercisePracticeUse} from '../lib/study/practice-drills.mjs';
import {lessonPracticeAvailability,STUDY_PRACTICE_CONTROL_SQL} from '../lib/server/study-practice-availability.mjs';

const lesson={id:'parts',revision:1,exercises:[{id:'twice-trigonometric',revision:1}],tierUse:[{role:'core',tier:'medium',topicId:'integration',sections:[{href:'#exercise-twice-trigonometric'}]}]};
const origin={syllabus:'topic=integration',result:'practice-parts-twice-trigonometric'};
const condition={epoch:8,version:3,incarnation:'a'.repeat(64),policy:'b'.repeat(64)};
const manifest={control:condition,formats:{'integration/medium/*':['multiple-choice','free-response'],'integration/medium/integration-by-parts':['free-response']}};
const db=(row,calls)=>({withSession(name){assert.equal(name,'first-primary');return this;},prepare(sql){calls.push(sql);return {first:async()=>row};}});
test('an exact Study link preserves the chosen tag, format and original section through sign-in',()=>{
 const link=studyPracticeHref('parts','exercise-twice-trigonometric','medium-integration','integration','medium',origin,{tag:'integration-by-parts',format:'free-response'});
 const query=new URL(link,'https://test.invalid').search,context=readStudyPractice(query);
 assert.deepEqual(context.drill,{tag:'integration-by-parts',label:'integration by parts',format:'free-response'});assert.equal(context.returnHref.split('#')[1],'exercise-twice-trigonometric');
 assert.equal(afterSignIn(link),link);assert.equal(practiceSignInReturn(query),link);const broader=readStudyPractice(new URL(context.broaderHref,'https://test.invalid').search);assert.equal(broader.drill,undefined);assert.equal(context.returnHref,broader.returnHref);
 for(const bad of [query+'&format=multiple-choice',query.replace('integration-by-parts','substitution'),query.replace('tier=medium','tier=easy'),query.replace('format=free-response','format=legacy')]){
  assert.equal(readStudyPractice(bad),null);assert.equal(practiceSignInReturn(bad),'/study');
 }
});
test('the reader displays only flags from the exact active catalog and curriculum revision',async()=>{
 const calls=[],policy=condition.policy;
 assert.deepEqual((await lessonPracticeAvailability(db(condition,calls),lesson,null,manifest,policy))['twice-trigonometric'],{broader:['multiple-choice','free-response'],exact:['free-response']});
 assert.deepEqual(calls,[STUDY_PRACTICE_CONTROL_SQL]);assert.match(STUDY_PRACTICE_CONTROL_SQL,/enabled=1 AND writing=0 AND gc_active=0/);
 for(const row of [null,{...condition,incarnation:'c'.repeat(64)},{...condition,epoch:9},{...condition,version:4},{...condition,policy:'d'.repeat(64)}]){
  assert.deepEqual(await lessonPracticeAvailability(db(row,[]),lesson,null,manifest,policy),{});
 }
 assert.deepEqual(await lessonPracticeAvailability(db(condition,[]),lesson,null,manifest,'d'.repeat(64)),{});
 assert.deepEqual(await lessonPracticeAvailability(db(condition,[]),lesson,null,{control:null},policy),{});
 const changed={...lesson,revision:2};assert.equal(exercisePracticeUse(changed,lesson.exercises[0],null).technique,null);
 assert.deepEqual((await lessonPracticeAvailability(db(condition,[]),changed,null,manifest,policy))['twice-trigonometric'].exact,[]);
});

test('the release compiler refuses a detached registry from a different selector before producing a manifest',async t=>{
 const {DatabaseSync}=await import('node:sqlite');
 const {spawnSync}=await import('node:child_process');
 const {mkdtempSync,writeFileSync,existsSync,rmSync}=await import('node:fs');
 const {tmpdir}=await import('node:os');
 const {resolve,join}=await import('node:path');
 const {fileURLToPath}=await import('node:url');
 const {roundCreationPolicy}=await import('../lib/server/round-creation-policy.mjs');
 const root=fileURLToPath(new URL('..',import.meta.url)),dir=mkdtempSync(join(tmpdir(),'cn-study-compiler-'));
 t.after(()=>rmSync(dir,{recursive:true,force:true}));
 const dbPath=join(dir,'catalog.sqlite'),reg=join(dir,'other.json');
 const policy=await roundCreationPolicy('easy');
 const db=new DatabaseSync(dbPath);
 db.exec('CREATE TABLE round_authorization_control(id INTEGER PRIMARY KEY,epoch INTEGER,control_version INTEGER,incarnation BLOB,policy_hash BLOB,enabled INTEGER,writing INTEGER,gc_active INTEGER)');
 db.prepare('INSERT INTO round_authorization_control VALUES(1,2,2,?,?,1,0,0)').run(Buffer.alloc(32,1),Buffer.from(policy.selectionPolicyHash,'hex'));
 db.close();
 writeFileSync(reg,JSON.stringify({version:'unrelated-registry',records:{}}));
 const result=spawnSync(process.execPath,[resolve(root,'scripts/milestone4/compile-study-practice.mjs'),dbPath,root,reg,dir],{encoding:'utf8'});
 assert.notEqual(result.status,0);
 assert.match(result.stderr,/Supplied admission registry differs from the enabled selector registry/);
 assert.equal(existsSync(join(dir,'study-practice-activation.json')),false);
 assert.equal(existsSync(join(dir,'selector-proofs.json')),false);
});
