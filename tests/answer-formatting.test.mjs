import test from 'node:test';
import assert from 'node:assert/strict';
import {gradeAnswer,OPERATORS} from '../lib/math-answer/grade.mjs';
import {entrySafety} from '../lib/math-entry.mjs';
import {freeResponseSummary} from '../lib/game-progress.ts';
import {referenceAnswer} from '../lib/math-answer/presentation.ts';

const real={kind:'real-line'},positive={kind:'interval',lower:'0',upper:null,lowerClosed:false,upperClosed:false};
const scalar=expected=>({kind:'scalar',expected});
const fn=(expected,domain=real)=>({kind:'function',expected,variable:'x',domain});
const contract=answer=>({version:'answer-contract-1',parserVersion:'bounded-latex-1',graderVersion:'exact-algebra-1',domain:'real',branch:'real-principal',review:{referenceVerified:true},allowedOperators:OPERATORS,answer});
// Player documentation examples are semantic promises under these explicit
// task/domain contracts, not an assertion that an entire pool is admitted.
const examples=[
 ['exact',scalar('1/2'),String.raw`\frac{1}{2}`,'correct'],
 ['exact',scalar('1/2'),'0.5','correct'],
 ['rounding',scalar('1/3'),'0.333333','incorrect'],
 ['scientific',scalar('1/1000'),'10^{-3}','correct'],
 ['ambiguous-scientific',scalar('1/1000'),'1e-3','invalid'],
 ['grouping',fn('(x+1)/(x-1)',{kind:'interval',lower:'2',upper:'3',lowerClosed:true,upperClosed:true}),String.raw`\frac{x+1}{x-1}`,'correct'],
 ['power',fn('x^{12}'),'x^12','invalid'],
 ['polynomial',fn('x^2+2*x+1'),'(x+1)^2','correct'],
 ['ln',fn('ln(x)',positive),String.raw`\ln(x)`,'correct'],
 ['base',scalar('ln(7)/ln(10)'),String.raw`\ln(7)/\ln(10)`,'correct'],
 ['ambiguous-log',fn('ln(x)',positive),'log(x)','unsupported'],
 ['e',fn('exp(2*x)'),'e^{2*x}','correct'],
 ['pi',scalar('pi'),String.raw`\pi`,'correct'],
 ['inverse',fn('arcsin(x)',{kind:'interval',lower:'-1',upper:'1',lowerClosed:true,upperClosed:true}),String.raw`\arcsin(x)`,'correct'],
 ['inverse-ambiguity',fn('arcsin(x)',{kind:'interval',lower:'-1',upper:'1',lowerClosed:true,upperClosed:true}),String.raw`\sin^{-1}(x)`,'invalid'],
 ['root-domain',fn('x'),String.raw`\sqrt{x^2}`,'incorrect'],
 ['hole',fn('x+1'),'(x^2-1)/(x-1)','incorrect'],
 ['any-primitive',{kind:'antiderivative',integrand:'x^2',reference:'x^3/3',variable:'x',domain:real,request:'any',constant:'optional-real-additive'},'x^3/3+C','correct'],
 ['tuple',{kind:'tuple',components:[scalar('2'),scalar('5')]},'(2,5)','correct'],
 ['tuple-order',{kind:'tuple',components:[scalar('2'),scalar('5')]},'(5,2)','incorrect'],
 ['mixed',{kind:'tuple',components:[scalar('2'),{kind:'outcome',expected:'absolute'}]},'(2,absolute)','correct'],
 ['interval',{kind:'interval',lower:'0',upper:'1',lowerClosed:false,upperClosed:true},'(0,1]','correct'],
 ['interval-endpoint',{kind:'interval',lower:'0',upper:'1',lowerClosed:false,upperClosed:true},'(0,1)','incorrect'],
 ['infinity',{kind:'outcome',expected:'positive-infinity'},String.raw`\infty`,'correct'],
 ['dne',{kind:'outcome',expected:'does-not-exist'},'DNE','correct'],
 ['divergence',{kind:'outcome',expected:'diverges'},String.raw`\infty`,'incorrect'],
 ['final-answer',scalar('1/3'),String.raw`\int_0^1 x^2\,dx`,'unsupported'],
];
test('documented answer forms retain their stated mathematical meaning',()=>{
 for(const [label,answer,source,outcome]of examples){const result=gradeAnswer(contract(answer),source);assert.equal(result.outcome,outcome,`${label}: ${JSON.stringify(result)}`);}
});
test('broad palette notation can be safe to display without being gradable',()=>{
 const matrix=String.raw`\begin{pmatrix}1&0\\0&1\end{pmatrix}`;
 assert.equal(entrySafety(matrix),null);
 assert.notEqual(gradeAnswer(contract(scalar('1')),matrix).outcome,'correct');
 assert.ok(entrySafety(String.raw`\href{https://example.com}{1}`));
});
test('FR accuracy excludes neutral finalization and counts ungraded submissions separately',()=>{
 const make=(finalization,correct)=>({responseFormat:'free-response',finalization,...(correct===undefined?{}:{correct})});
 const summary=freeResponseSummary({questionCount:4,answers:{alice:{0:make('graded',true),1:make('graded',false),2:make('skipped'),3:make('revealed')}},frAttemptCounts:{0:3,1:1,2:2}},'alice');
 assert.deepEqual(summary,{correct:1,incorrect:1,graded:2,skipped:1,revealed:1,ungradedSubmissions:4,finalized:4,total:4});
 assert.equal(referenceAnswer({kind:'antiderivative',reference:'x^3/3'}),'x^3/3');
});
