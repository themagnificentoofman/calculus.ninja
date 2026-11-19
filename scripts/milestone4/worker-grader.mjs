import {Miniflare} from 'miniflare';
import {build} from 'esbuild';
import {writeFileSync,mkdirSync,readFileSync,existsSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {OPERATORS} from '../../lib/math-answer/grade.mjs';
import katex from 'katex';
const contract=answer=>({version:'answer-contract-1',parserVersion:'bounded-latex-1',graderVersion:'exact-algebra-1',domain:'real',branch:'real-principal',review:{referenceVerified:true},allowedOperators:OPERATORS,answer});
const scalar=expected=>contract({kind:'scalar',expected});
const fn=expected=>contract({kind:'function',expected,variable:'x',domain:{kind:'real-line'}});
const cases=[
 ['fraction',scalar('1/2'),'2/4','correct'],['decimal',scalar('1/2'),'0.5','correct'],['rounded-third',scalar('1/3'),'0.3333333333333333333','incorrect'],
 ['polynomial',fn('x^2+2*x+1'),'(x+1)^2','correct'],['trig',fn('1'),'\\sin(x)^2+\\cos(x)^2','correct'],
 ['hole',fn('x+1'),'(x^2-1)/(x-1)','incorrect'],['principal-root',fn('x'),'\\sqrt{x^2}','incorrect'],
 ['primitive',contract({kind:'antiderivative',integrand:'x^2',variable:'x',domain:{kind:'real-line'},request:'any',constant:'optional-real-additive'}),'x^3/3+C','correct'],
 ['unsafe',scalar('1'),'\\htmlData{onclick=evil}{1}','invalid'],['huge-integer',scalar('1'),'9'.repeat(65),'indeterminate'],
 ['huge-exponent',scalar('1'),'2^{999999999999}','indeterminate'],['nesting',scalar('1'),'('.repeat(33)+'1'+')'.repeat(33),'indeterminate'],
 ['expansion',fn('0'),'(1+x+x^2+x^3+x^4+x^5+x^6+x^7+x^8)^{32}','indeterminate'],
 ['nested-analytic',fn('0'),'\\sin('.repeat(20)+'x'+')'.repeat(20),'indeterminate'],
];
const output=process.argv[2];
if(!output||existsSync(output))throw Error('Choose a new report path; historical evidence is never overwritten.');
const sha=value=>createHash('sha256').update(value).digest('hex'),reviewBindings={};
const option=name=>{const i=process.argv.indexOf(name);return i<0?null:process.argv[i+1];};
const amendmentFile=option('--domain-amendment'),extraFile=option('--extra-review');
let amendment=null;
if(amendmentFile){
 const bytes=readFileSync(amendmentFile);amendment=JSON.parse(bytes);reviewBindings.domainAmendment=sha(bytes);
 if(amendment.version!=='original-fr-even-power-independent-review-2'||JSON.stringify(amendment.changedModules)!==JSON.stringify(['domain.mjs']))throw Error('Unsupported review amendment scope');
 for(const[name,hash]of Object.entries(amendment.sourceHashes))if(sha(readFileSync(`lib/math-answer/${name}`))!==hash)throw Error(`Amendment is stale for ${name}`);
}
for(const file of ['docs/milestone4/grader-review/results-v5-replay.json','docs/milestone4/grader-review/new-routes-results-v5.json',...(extraFile?[extraFile]:[])]){
 const bytes=readFileSync(file),review=JSON.parse(bytes);reviewBindings[file.split('/').at(-1)]=sha(bytes);
 for(const[name,hash]of Object.entries(review.sourceHashes))if(sha(readFileSync(`lib/math-answer/${name}`))!==hash&&!(amendment&&name==='domain.mjs'))throw Error(`Review is stale for ${name}; require a new source-bound review.`);
 for(const item of review.results)cases.push([`independent:${file}:${item.id}`,item.contract,item.source,item.acceptable]);
}
const bundle=await build({stdin:{contents:"import {gradeAnswer} from './lib/math-answer/grade.mjs';export default {async fetch(r){const {contract,source}=await r.json();return Response.json(gradeAnswer(contract,source));}};",resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'browser',target:'es2022'});
const code=bundle.outputFiles[0].text,mf=new Miniflare({modules:[{type:'ESModule',path:'index.mjs',contents:code}],modulesRoot:process.cwd(),compatibilityDate:'2026-04-01'});
try{const results=[];for(const[id,c,source,expected]of cases){const times=[],verdicts=[];for(let i=0;i<5;i++){const start=performance.now(),r=await mf.dispatchFetch('http://local.invalid/',{method:'POST',body:JSON.stringify({contract:c,source})});verdicts.push(await r.json());times.push(performance.now()-start);}const sorted=[...times].sort((a,b)=>a-b),acceptable=Array.isArray(expected)?expected:[expected];let rendering=true;for(const verdict of verdicts)if(verdict.interpretation){try{katex.renderToString(verdict.interpretation,{strict:'error',throwOnError:true,trust:false});}catch{rendering=false;}}results.push({id,acceptable,passed:rendering&&verdicts.every(v=>acceptable.includes(v.outcome)),completeInterpretationRenders:rendering,outcomes:verdicts.map(v=>v.outcome),maxWork:Math.max(...verdicts.map(v=>v.work)),localRoundTripMs:{median:sorted[2],max:sorted.at(-1)}});}
 const report={version:'worker-foundation-v4',runtime:'local workerd',node:process.version,workerd:JSON.parse(readFileSync('node_modules/workerd/package.json','utf8')).version,reviewBindings,sourceHashes:Object.fromEntries(['contracts.ts','rational.mjs','parser.mjs','algebra.mjs','domain.mjs','grade.mjs'].map(name=>[name,sha(readFileSync(`lib/math-answer/${name}`))])),bundleSha256:sha(code),bundleBytes:Buffer.byteLength(code),bundleGzipBytes:gzipSync(code).length,requests:cases.length*5,results,passed:results.every(x=>x.passed),limitations:'Foundation and independent synthetic fixtures only; no bank contracts admitted. Prior fixtures retain their original reviews; the optional source-bound amendment covers only the even-power domain change. Passing a permitted ungraded outcome is not graded accuracy. External monotonic local round-trip timing includes IPC and is not hosted CPU or quota. No model/CAS service calls.'};mkdirSync(output.slice(0,output.lastIndexOf('/')),{recursive:true});writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,requests:report.requests,bundleBytes:report.bundleBytes,failures:results.filter(x=>!x.passed)}));if(!report.passed)process.exitCode=1;
}finally{await mf.dispose();}
