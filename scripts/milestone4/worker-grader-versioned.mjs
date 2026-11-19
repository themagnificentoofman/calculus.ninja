// Local Worker qualification only. No production writes or content admission.
import {build} from 'esbuild';
import {Miniflare} from 'miniflare';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import katex from 'katex';
import {CHECKERS} from '../../lib/math-answer/versioned-grade.mjs';
import {verifyCheckerSources} from './checker-policy.mjs';
const output=process.argv[2];if(!output||existsSync(output))throw Error('Choose a fresh Worker evidence path');
const identities=verifyCheckerSources();
const scalar=(expected,version=2)=>({version:'answer-contract-1',parserVersion:`bounded-latex-${version}`,graderVersion:`exact-algebra-${version}`,domain:'real',branch:'real-principal',review:{referenceVerified:true},allowedOperators:CHECKERS[version-1].operators,answer:{kind:'scalar',expected}});
const rows=[
 ['v1-retry',scalar('1/2',1),String.raw`\sqrt[3]{1/8}`,'invalid'],
 ['v2-root',scalar('1/2'),String.raw`\sqrt[3]{1/8}`,'correct'],
 ['v1-power',scalar('4^{4/3}',1),'4^{4/3}','unsupported'],
 ['v2-power',scalar('4^{4/3}'),'4^{4/3}','correct'],
 ['indexed-root',scalar('4^{4/3}'),String.raw`\sqrt[3]{256}`,'correct'],
 ['log-bridge',scalar('4^{4/3}'),'exp(4*ln(4)/3)','correct'],
 ['reciprocal-root',scalar('4^{4/3}'),String.raw`1/\sqrt[3]{1/256}`,'correct'],
 ['finite-decimal',scalar('4^{4/3}'),'6.3496042079','incorrect'],
 ['exponent-scope',scalar('4^{4/3}'),'4^4/3','incorrect'],
 ['decimal-exponent-bound',scalar('4^{4/3}'),'4^{1.3333333333}','indeterminate'],
 ['zero-power',scalar('1'),'2^{0}','correct'],
 ['fractional-zero',scalar('0'),'0^{1/3}','correct'],
 ['undefined-before-zero',scalar('0'),'0*sqrt{-1}','invalid'],
 ['zero-denominator',scalar('1'),'(1/0)^{0}','invalid'],
 ['invalid-log',scalar('0'),'exp(0*ln(-1))','invalid'],
 ['negative-odd-root',scalar('2'),String.raw`\sqrt[3]{-8}`,'unsupported'],
 ['invalid-reference',scalar('1/0'),'1','indeterminate'],
 ['unsupported-reference',scalar('ln(3)^{1/3}'),'1','indeterminate'],
 ['degree-bound',scalar('1'),'2^{1/31}*2^{1/32}','indeterminate'],
 ['source-bound',scalar('1'),'9'.repeat(65),'indeterminate'],
 ['unknown-pair',{...scalar('1'),parserVersion:'bounded-latex-1'},'1','indeterminate'],
];
const hash=x=>createHash('sha256').update(x).digest('hex');
const bundle=await build({stdin:{contents:"import {gradeAnswer} from './lib/math-answer/versioned-grade.mjs';export default {async fetch(request){const {contract,source}=await request.json();return Response.json(gradeAnswer(contract,source));}};",resolveDir:process.cwd()},bundle:true,write:false,metafile:true,format:'esm',platform:'browser',target:'es2022'});
const code=bundle.outputFiles[0].text,mf=new Miniflare({modules:[{type:'ESModule',path:'index.mjs',contents:code}],modulesRoot:process.cwd(),compatibilityDate:'2026-04-01'});
try{
 const results=[];
 for(const[id,contract,source,expected]of rows){
  const samples=[],verdicts=[];
  for(let repeat=0;repeat<5;repeat++){
   const start=performance.now(),response=await mf.dispatchFetch('http://local.invalid/',{method:'POST',body:JSON.stringify({contract,source})});
   verdicts.push(await response.json());samples.push(performance.now()-start);
  }
  let renders=true;for(const v of verdicts)if(v.interpretation){try{katex.renderToString(v.interpretation,{strict:'error',throwOnError:true,trust:false});}catch{renders=false;}}
  results.push({id,expected,outcomes:verdicts.map(v=>v.outcome),passed:renders&&verdicts.every(v=>v.outcome===expected),completeInterpretationRenders:renders,maxWork:Math.max(...verdicts.map(v=>v.work)),localRoundTripMs:{median:[...samples].sort((a,b)=>a-b)[2],maximum:Math.max(...samples)}});
 }
 const files=Object.keys(bundle.metafile.inputs).filter(p=>p!=='<stdin>');
 const report={version:'versioned-worker-check-1',runtime:'local workerd',node:process.version,workerd:JSON.parse(readFileSync('node_modules/workerd/package.json','utf8')).version,checkerSources:identities,sourceHashes:Object.fromEntries([...files,'scripts/milestone4/worker-grader-versioned.mjs'].map(p=>[p,hash(readFileSync(p))])),bundleHash:hash(code),bundleBytes:Buffer.byteLength(code),bundleGzipBytes:gzipSync(code).length,requests:rows.length*5,results,passed:results.every(r=>r.passed),limits:'Synthetic contracts, local workerd only; no content admitted or hosted CPU/quota claim. Timings include local IPC. No model or external CAS calls.'};
 writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,requests:report.requests,bundleBytes:report.bundleBytes,failures:results.filter(r=>!r.passed)}));if(!report.passed)process.exitCode=1;
}finally{await mf.dispose();}
