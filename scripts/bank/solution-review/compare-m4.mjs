// Reproduce the presentation-only comparison on the complete recovered compact bank.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';
import {DatabaseSync} from 'node:sqlite';
import Module from 'node:module';
import {build} from 'esbuild';
import {canonical,reconstruct} from '../../../lib/bank/compact-codec.mjs';
import * as current from '../../../lib/server/solution-presentation.mjs';
import {formatSolutionStep} from '../../../lib/solution-format.mjs';
import {renderMath} from '../../../lib/render-math.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../../..'),[database,destination]=process.argv.slice(2);
assert(database&&destination,'Provide the recovered physical database and the output report.');
const bytes=p=>readFileSync(resolve(root,p)),digest=value=>createHash('sha256').update(value).digest('hex');
const predecessor='fa22010f6f7ec83e90e0d8f6d0f63375be981088',old=file=>execFileSync('git',['show',predecessor+':'+file],{cwd:root,maxBuffer:32*1024*1024});
const file='lib/server/solution-presentation.mjs';
const buildOld=await build({absWorkingDir:root,stdin:{contents:old(file).toString(),resolveDir:resolve(root,'lib/server'),loader:'js'},platform:'node',format:'cjs',target:'node24',bundle:true,write:false,metafile:true,logLevel:'silent'});
const deps=Object.fromEntries(Object.keys(buildOld.metafile.inputs).filter(p=>p!=='<stdin>').map(p=>{assert.equal(digest(bytes(p)),digest(old(p)),p);return [p,digest(bytes(p))];}));
const previous=new Module('historical-presentation');previous._compile(buildOld.outputFiles[0].text,'previous.cjs');
const corrections={};for(const [name,type] of [['tangent-intercepts','intercept'],['p-series-classification','series']]){
 for(const [k,v] of Object.entries(JSON.parse(bytes('lib/server/solution-reviews/'+name+'.json')))){assert(!corrections[k]);corrections[k]={...v,type};}}
const dp=digest(readFileSync(database));assert.equal(dp,'088f3029f9d77599f8cf90446b78b236af9c88c4511c6ee7da53516f93a6d6e7');
const db=new DatabaseSync(database,{readOnly:true}),matches=[],all=createHash('sha256');let unchanged=0;
try{
 const sql='SELECT b.*,s.metadata_json FROM cbank_problems b JOIN cbank_shared s USING(shared_id) JOIN cbank_publication u USING(problem_ref) WHERE u.state=\'approved\' ORDER BY b.problem_ref';
 for(const row of db.prepare(sql).iterate()){
  const p=reconstruct(row,JSON.parse(gunzipSync(row.payload_gzip)));const {contentHash,...body}=p;
  assert.equal(digest(canonical(body)),contentHash,p.problemId);const oldShown=previous.exports.presentBankProblem(p),shown=current.presentBankProblem(p);
  const projection=v=>[v.statement,v.choices,v.answerChoiceId,v.solutionSteps,v.solutionQuality];
  const before=digest(JSON.stringify(projection(oldShown))),after=digest(JSON.stringify(projection(shown))),key=p.problemId+'@'+p.problemRevision;
  all.update(JSON.stringify([key,contentHash,before,after])+'\n');
  if(before===after){assert(!corrections[key]);unchanged++;continue;}
  const change=corrections[key];assert(change,key);assert.equal(change.sourceContentHash,contentHash);
  assert.deepEqual(shown.choices,oldShown.choices);assert.equal(shown.statement,oldShown.statement);
  assert.equal(shown.answerChoiceId,oldShown.answerChoiceId);assert.deepEqual(shown.solutionSteps,change.steps);
  const option=shown.choices.find(c=>c.choiceId===shown.answerChoiceId).math;let proof;
  if(change.type==='intercept'){
   const literal=/y=x\^\{(\d+)\}/.exec(p.statement);assert(literal&&/x=1/.test(p.statement));
   const n=Number(literal[1]);assert.equal(option,String(1-n));assert(shown.solutionSteps.some(s=>s.includes('y='+n+'x-'+(n-1))));
   proof='At x=1 the value is 1 and slope is '+n+'. Thus the intercept is 1−'+n+'='+String(1-n)+'.';
  }else{
   const ratios=[...p.statement.matchAll(/n\^\{\\frac\{(\d+)\}\{(\d+)\}\}/g)].map(m=>[+m[1],+m[2]]);assert.equal(ratios.length,2);
   const terms=ratios.map(([numerator,denominator])=>numerator>denominator?'converges':'diverges');
   assert.deepEqual([...option.matchAll(/\\textnormal\{(converges|diverges)\}/g)].map(m=>m[1]),terms);
   assert(shown.solutionSteps.some(s=>s.includes('0<p\\le1')));proof='The positive p-series converges precisely for p>1, by integration of x^(−p). The displayed exponent pairs are '+JSON.stringify(ratios)+', giving '+terms.join(', ')+'.';
  }
  assert.equal(shown.solutionSteps.at(-1),option);
  for(const step of shown.solutionSteps)for(const b of formatSolutionStep(step)){if(b.kind==='math')renderMath(b.value,true);else for(const part of b.parts)if(part.kind==='math')renderMath(part.value,false);}
  const snapshot={...p,options:p.choices.map(c=>c.math),correctIndex:p.choices.findIndex(c=>c.choiceId===p.answerChoiceId),explanation:oldShown.solutionSteps,solutionReviewVersion:previous.exports.SOLUTION_REVIEW_VERSION};
  const frozen=JSON.stringify(snapshot),replay=current.reviewSavedQuestion(snapshot);assert(replay.clarified);assert.deepEqual(replay.steps,shown.solutionSteps);assert.equal(JSON.stringify(snapshot),frozen);assert.equal(current.reviewSavedQuestion({...snapshot,contentHash:'f'.repeat(64),solutionReviewVersion:'earlier-unknown'}),null);
  matches.push({id:p.problemId,revision:p.problemRevision,hash:contentHash,oldPresentation:before,currentPresentation:after,type:change.type,answer:option,proof,stepDigest:digest(JSON.stringify(change.steps)),savedSnapshotPreserved:true});
 }
}finally{db.close();}
assert.equal(matches.length,Object.keys(corrections).length);assert.equal(unchanged+matches.length,106596);
const ui='components/ProblemStatement.tsx',css='app/globals.css';
assert.equal(old(ui).toString().replace('A problem from an original bank construction.','A problem from Calculus Ninja’s earlier collection.'),bytes(ui).toString());
const restoredCSS=bytes(css).toString().replace(/,\n\.study-lesson \.katex-display > \.katex( > \.katex-html)? \{/g,' {').replace(/\n\/\* The answer field offers entry tools only[^]*$/,'');
assert.equal(restoredCSS,old(css).toString());
const report={scope:'Comparison of every retained compact bank payload against the preserved source. Answer identity, all options and the statement are unchanged for all 106596 revisions. Historical overlay corrections have independent checks and separate saved-snapshot evidence.',baselineCommit:predecessor,physicalDatabase:dp,baselineDependencies:deps,baselineModule:digest(old(file)),currentModule:digest(bytes(file)),baselineStylesheet:digest(old(css)),currentStylesheet:digest(bytes(css)),baselineStatementComponent:digest(old(ui)),currentStatementComponent:digest(bytes(ui)),controls:{formerRulesPreserved:true,legacyTooltipOnly:true,changedSourceFallback:true},total:unchanged+matches.length,unchanged,changed:matches,orderedBinding:all.digest('hex')};
writeFileSync(destination,JSON.stringify(report,null,2)+'\n');console.log(report.total,unchanged,matches.length,report.orderedBinding);
