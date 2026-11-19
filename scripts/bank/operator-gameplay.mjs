import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {randomUUID} from 'node:crypto';
import {presentBankProblem} from '../../lib/server/solution-presentation.mjs';
import {resolve} from 'node:path';
import {decodeCompact} from '../../lib/bank/compact-codec.mjs';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
// Historical operator v1 uses its original request and checkpoint contract.
export function verifyHostedGameplay(call,saveProgress,progress={}) {
  return verifyGameplay(call,saveProgress,progress,{bankPath:resolve('../calculus.ninja/.bank-data/compact/serving.sqlite'),release:'cn-2026-11-02-full-v2',current:false});
}
export function verifyNamespacedGameplay(call,saveProgress,progress={},source) {
  assert(source && typeof source.bankPath==='string' && source.bankPath && typeof source.release==='string' && source.release,'Specify the source bank and expected release');
  if (progress.started) assert(progress.version===2 && progress.release===source.release,'Incompatible QA checkpoint');
  return verifyGameplay(call,saveProgress,progress,{bankPath:source.bankPath,release:source.release,current:true});
}
async function verifyGameplay(call,saveProgress,progress,{bankPath,release,current}) {
  const db=new DatabaseSync(bankPath,{readOnly:true});
  const uid=i=>'cn_m1qa_ed08a3de_'+i;
  const qa=async data=>(await call({op:'qa',...data})).qa;
  const api=async(actor,resource,body,status=200)=>{const r=await qa({action:'call',actor,resource,body});assert.equal(r.status,status,JSON.stringify(r));return r.body;};
  const answer=(actor,id,index,selectedOption,status=200)=>api(actor,'games',{action:'answer',gameId:id,index,selectedOption},status);
  const profile=async actor=>(await api(actor,'profile',{})).profile;
  const modes=['test','rapid','pvp','multiplayer'];
  const clean=async()=>{
    const cleanup=await qa({action:'cleanup'});
    assert.equal((await qa({action:'history',actor:0})).history.length,0);
    progress.cleanup=cleanup;
    saveProgress(progress);
  };
  try {
    if(current){
      assert.equal(db.prepare("SELECT value FROM cbank_config WHERE key='active_release'").get()?.value,release,'Unexpected source release');
      if(progress.result?.passed){
        if(!progress.cleanup)await clean();
        return progress.result;
      }
    }
    if(!progress.started){await qa({action:'cleanup'});progress={started:true,modes:{},...(current?{version:2,release}:{})};saveProgress(progress);}
    for(let actor=0;actor<3;actor++)await profile(actor);
    for(const mode of modes){
      if(progress.modes[mode]?.passed)continue;
      // Each game checkpoint is saved before the next operation; restarting does
      // not create a replacement round or reset its score.
      let run=progress.modes[mode]||={};
      const settings={winCondition:'first_to_n',targetScore:5,timeLimit:30,penalties:false};
      const competitive=mode==='pvp'||mode==='multiplayer';
      const roomOptions=mode==='pvp'?{visibility:'private'}:{visibility:'private',settings};
      if(current && competitive && !run.operationId){run.operationId=randomUUID();saveProgress(progress);}
      if(!run.set){
        const request={mode,category:'integration',difficulty:'easy',count:3};
        if(current && competitive)Object.assign(request,{operationId:run.operationId,roomOptions});
        run.set=await api(0,'questions',request);
        saveProgress(progress);
      }
      const options=current && competitive?roomOptions:{timeLimit:30,settings};
      if(!run.id){run.id=(await api(0,'games',{action:'create',mode,questionSetId:run.set.questionSetId,options})).id;saveProgress(progress);}
      const players=mode==='multiplayer'?[0,1,2]:mode==='pvp'?[0,1]:[0];
      let view=await api(0,'games',{action:'view',gameId:run.id});
      assert.ok(!JSON.stringify(view.game.questions).includes('correctIndex'));
      if(view.game.status==='waiting'){
        assert.equal(view.game.questions.length,0);
        for(const actor of players.slice(1))if(!view.game.players.includes(uid(actor)))await api(actor,'games',{action:'join',gameId:run.id,mode,...(current?{seatOperationId:run.operationId+'-visit-'+actor}:{})});
        if(mode==='multiplayer'){await api(1,'games',{action:'start',gameId:run.id},403);await api(0,'games',{action:'start',gameId:run.id});}
      }
      view=await api(0,'games',{action:'view',gameId:run.id});
      const snapshot=(await qa({action:'snapshot',actor:0,gameId:run.id})).roundSnapshot;
      assert.equal(snapshot.questions.length,3);
      const correct=[];
      for(let index=0;index<3;index++){
        const ref=snapshot.questions[index],q=view.game.questions[index];
        const row=db.prepare('SELECT b.*,s.metadata_json FROM cbank_problems b JOIN cbank_shared s USING(shared_id) WHERE problem_id=? AND revision=?').get(ref.problemId,ref.problemRevision);
        const original=await decodeCompact(row);const p=current?presentBankProblem(original):original;assert.equal(p.contentHash,ref.contentHash);assert.equal(ref.bankRelease,release);assert.equal(q.problemId,p.problemId);assert.equal(q.problemRevision,p.problemRevision);
        assert.deepEqual(q.options,ref.choiceOrder.map(id=>p.choices.find(c=>c.choiceId===id).math));correct.push(ref.choiceOrder.indexOf(p.answerChoiceId));
      }
      for(const actor of players.slice(1)){const shared=await api(actor,'games',{action:'view',gameId:run.id});assert.deepEqual(shared.game.questions,view.game.questions);assert.deepEqual((await qa({action:'snapshot',actor,gameId:run.id})).roundSnapshot,snapshot);}
      if(view.game.startTime>Date.now())await sleep(view.game.startTime-Date.now()+50);
      if(mode==='test'&&!Object.keys(view.progress.answers).length){
        await api(2,'games',{action:'answer',gameId:run.id,index:0,selectedOption:0},403);
        await api(0,'games',{action:'answer',gameId:run.id,index:0,selectedOption:0,score:999},400);
        await answer(0,run.id,2,correct[2],409);
      }
      for(const actor of players){
        const before=await api(actor,'games',{action:'view',gameId:run.id});
        for(let index=0;index<3;index++){
          if(before.progress.answers[index])continue;
          const right=mode==='pvp'?actor===0||index===0:mode==='multiplayer'?actor<2:index<2;
          const result=await answer(actor,run.id,index,right?correct[index]:(correct[index]+1)%4);
          assert.equal(result.answer.correct,right);assert.equal(result.progress.reviews[index].correctIndex,correct[index]);
          if(mode==='test'&&index===0){const duplicate=await answer(actor,run.id,index,correct[index]);assert.equal(duplicate.duplicate,true);}
        }
      }
      const finished=await api(0,'games',{action:'view',gameId:run.id});assert.equal(finished.game.status,'finished');
      const scores=finished.game.scores;for(const actor of players)assert.equal(scores[uid(actor)],mode==='pvp'?(actor===0?3:1):mode==='multiplayer'?(actor<2?3:0):2);
      const beforeClaim=await profile(0);await api(0,'games',{action:'claim',gameId:run.id});const afterClaim=await profile(0);assert.equal(afterClaim.xp,beforeClaim.xp);assert.equal(afterClaim.gamesPlayed,beforeClaim.gamesPlayed);
      const history=(await qa({action:'history',actor:0})).history;assert.ok(history.some(g=>g.id===run.id&&g.data.status==='finished'));
      run={...run,passed:true,players:players.length,problemIds:snapshot.questions.map(q=>q.problemId),sharedSnapshot:true,scoring:true,history:true,duplicateClaim:true};progress.modes[mode]=run;saveProgress(progress);
    }
    const profiles=[];for(let actor=0;actor<3;actor++)profiles.push(await profile(actor));
    assert.equal(profiles[0].gamesPlayed,4);assert.equal(profiles[1].gamesPlayed,2);assert.equal(profiles[2].gamesPlayed,1);assert.equal(profiles[0].xp,100);assert.equal(profiles[1].xp,40);assert.equal(profiles[2].xp,0);
    const multi=await qa({action:'snapshot',actor:0,gameId:progress.modes.multiplayer.id});assert.deepEqual(Object.values(multi.receipts).map(r=>r.rank).sort(),[1,1,3]);
    progress.result={passed:true,modes:4,profiles:profiles.map(p=>({uid:p.uid,gamesPlayed:p.gamesPlayed,xp:p.xp,rating:p.rating})),scope:current?'Namespaced operator adapter with fixed test identities, compact MC and compatibility-mode competitive rooms. Service location is recorded by the caller.':'Hosted D1 and production game engine/Firestore with isolated test collections; fixed operator-authenticated test identities'};saveProgress(progress);
    await clean();return progress.result;
  }finally{db.close();}
}
