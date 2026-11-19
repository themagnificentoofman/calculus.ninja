import test from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
import {gradeAnswer,OPERATORS} from '../lib/math-answer/grade.mjs';
const contract=answer=>({version:'answer-contract-1',parserVersion:'bounded-latex-1',graderVersion:'exact-algebra-1',domain:'real',branch:'real-principal',review:{referenceVerified:true},allowedOperators:OPERATORS,answer});
const scalar=expected=>contract({kind:'scalar',expected});
const real={kind:'real-line'},positive={kind:'interval',lower:'0',upper:null,lowerClosed:false,upperClosed:false};
const fn=(expected,domain=real)=>contract({kind:'function',expected,variable:'x',domain});
const anti=(integrand,domain=real)=>contract({kind:'antiderivative',integrand,variable:'x',domain,request:'any',constant:'optional-real-additive'});
function is(c,s,outcome){const v=gradeAnswer(c,s);assert.equal(v.outcome,outcome,JSON.stringify({s,v}));assert.ok(v.work<=50001);}
test('terminating decimals are exact rationals; rounding is not equality',()=>{
 for(const s of ['1/2','2/4','0.5','\\frac{3}{6}'])is(scalar('1/2'),s,'correct');
 for(const s of ['0.3333333333333333','0.3333','1/2'])is(scalar('1/3'),s,'incorrect');
 is(scalar('0'),'1/1000000000000000000000000000000000000000000','incorrect');
});
test('rational ring proofs and a supported trigonometric identity',()=>{
 is(fn('x^2+2*x+1'),'(x+1)^2','correct');is(fn('1'),'\\sin(x)^2+\\cos(x)^2','correct');
 is(fn('x^2'),'x^2+x*(x-1)*(x-2)','incorrect');
 is(scalar('2*\\sqrt{2}'),'\\sqrt{8}','correct');is(scalar('2'),'\\sqrt{2}*\\sqrt{2}','correct');
});
test('whole-domain obligations precede algebraic cancellation',()=>{
 is(fn('x'),'\\sqrt{x^2}','incorrect');
 is(fn('x+1'),'\\frac{x^2-1}{x-1}','incorrect');
 is(fn('1'),'x/x','incorrect');
 is(fn('x+1',{kind:'interval',lower:'2',upper:'3',lowerClosed:true,upperClosed:true}),'\\frac{x^2-1}{x-1}','correct');
 is(fn('\\ln(x)',positive),'\\ln(x)','correct');is(fn('x'),'\\ln(x)','incorrect');
 is(scalar('1'),'1/ln(1)','invalid');
 is(fn('1',{kind:'interval',lower:'1',upper:'2',lowerClosed:true,upperClosed:true}),'ln(x)/ln(x)','incorrect');
 is(fn('1',{kind:'interval',lower:'1',upper:'2',lowerClosed:false,upperClosed:true}),'ln(x)/ln(x)','correct');
 is(fn('1',{kind:'interval',lower:'0',upper:'1',lowerClosed:false,upperClosed:false}),'ln(x)/ln(x)','correct');
 is(fn('x'),'\\arcsin(x)','incorrect');
 is(fn('1',{kind:'interval',lower:'-3',upper:'-2',lowerClosed:true,upperClosed:true}),'(x^2-4)/(x^2-4)','incorrect');
 is(fn('1',{kind:'interval',lower:'0',upper:'1',lowerClosed:true,upperClosed:true}),'x^{-1/2}*x^{1/2}','incorrect');
 is(fn('x'),'x^{1/3}','unsupported');
 is(fn('1',{kind:'interval',lower:'0',upper:'1',lowerClosed:true,upperClosed:true}),'(x*exp(x))/(x*exp(x))','incorrect');
});
test('any antiderivative verifies derivatives without claiming a complete family',()=>{
 for(const s of ['x^3/3','x^3/3+7','x^3/3+C','x^3/3+C^2'])is(anti('x^2'),s,'correct');
 is(anti('2*x'),'x^2+x','incorrect');is(anti('\\cos(x)'),'\\sin(x)+C','correct');
 is(anti('1/x',positive),'\\ln(x)+C','correct');
 is(anti('exp(x)'),'e^x+C','correct');is(anti('2*exp(2*x)'),'e^{2*x}','correct');
 is(anti('1'),'x+\\operatorname{floor}(x)','unsupported');
 is(anti('x'),'\\int x dx','unsupported');
 for(const s of ['abs(x^2)','sqrt(x^4)','(x^4)^{1/2}'])is(anti('2*x'),s,'unsupported');
});
test('even powers retain finite endpoints and strictness on unbounded domains',()=>{
 const ray=(lower,upper,lowerClosed=false,upperClosed=false)=>({kind:'interval',lower,upper,lowerClosed,upperClosed});
 for(const domain of [ray('1',null),ray(null,'-1'),ray('1','3'),ray('-3','-1')]){
  is(fn('1',domain),'(x^2-1)/(x^2-1)','correct');
  is(anti('x/sqrt(x^2-1)',domain),'sqrt(x^2-1)','correct');
 }
 for(const domain of [ray('1',null,true),ray(null,'-1',false,true),ray('-2','2',true,true)])
  is(fn('1',domain),'(x^2-1)/(x^2-1)','incorrect');
 is(anti('1/(x^2-1)',ray('1',null)),'(ln(x-1)-ln(x+1))/2','correct');
 // A finite witness is a disproof. No cancellation can remove these poles.
 is(fn('1',ray('0',null,true)),'(x^2-4)/(x^2-4)','incorrect');
 is(fn('1',real),'(x^4-1)/(x^4-1)','incorrect');
});
test('outcomes, ordered tuples, interval endpoints and approximation policy',()=>{
 is(contract({kind:'outcome',expected:'positive-infinity'}),'\\infty','correct');
 is(contract({kind:'outcome',expected:'does-not-exist'}),'\\infty','incorrect');
 is(contract({kind:'outcome',expected:'diverges'}),'DNE','incorrect');
 const pair=contract({kind:'tuple',components:[{kind:'scalar',expected:'1'},{kind:'outcome',expected:'absolute'}]});is(pair,'(1,absolute)','correct');is(pair,'(2,absolute)','incorrect');
 assert.equal(gradeAnswer(pair,'(1,absolute)').interpretation,String.raw`\left(1,\;\text{absolutely convergent}\right)`);
 assert.equal(gradeAnswer(pair,'(1,)').interpretation,'');
 const interval=contract({kind:'interval',lower:'0',upper:'1',lowerClosed:false,upperClosed:true});is(interval,'(0,1]','correct');is(interval,'[0,1]','incorrect');
 assert.equal(gradeAnswer(interval,'(0,1]').interpretation,String.raw`\left(0,\;1\right]`);
 const ray=contract({kind:'interval',lower:'0',upper:String.raw`\infty`,lowerClosed:false,upperClosed:false});
 is(ray,String.raw`(0,\infty)`,'correct');is(ray,String.raw`(0,\infty]`,'invalid');is(ray,'(0,2)','incorrect');is(ray,'(0,nan)','unsupported');
 const approx=contract({kind:'approximate',expected:'0',absoluteTolerance:'0.001',relativeTolerance:'0',precision:'absolute error at most 0.001'});is(approx,'0.001','correct');is(approx,'0.0010001','incorrect');
});
test('bounded, inert source; errors are ungraded and unknown versions fail closed',()=>{
 for(const s of ['',String.raw`\htmlData{a=1}{x}`,String.raw`\href{https://x}{x}`])is(scalar('1'),s,'invalid');
 for(const s of ['z','\\sum_{n=1}^{10}n','\\log(2)'])is(scalar('1'),s,'unsupported');
 is({...scalar('1'),allowedOperators:[]},'|1|','unsupported');
 is(fn('x'),'\\sin^{-1}(x)','invalid');
 for(const s of ['9'.repeat(65),'('.repeat(33)+'1'+')'.repeat(33),'x'.repeat(2049),'2^{9999999999}'])is(scalar('1'),s,'indeterminate');
 is({...scalar('1'),graderVersion:'future'},'1','indeterminate');
 is(scalar('1'),'1+','invalid');is(scalar('1'),'1/0','invalid');
 is(scalar('1000'),'1e3','invalid');is(scalar('0.002'),'2e-3','invalid');is(scalar('0.002'),'2*10^{-3}','correct');is(scalar('1'),'0^0','invalid');is(scalar('e^2'),'\\exp(2)','correct');
 for(const s of ['x^12','x^ 12','x^-2','x^−2','\\sqrt12','\\sin x'])is(fn('x'),s,'invalid');
 is(scalar('0.002'),'2e−3','invalid');
 is(fn('x',{kind:'unknown'}),'x','indeterminate');is(fn('x',{kind:'interval',lower:'2',upper:'1',lowerClosed:true,upperClosed:true}),'x','indeterminate');
 is(contract({kind:'function',expected:'e^2',variable:'e',domain:real}),'exp(2)','indeterminate');
});
test('interpreted mathematics is complete, bounded, renderable and preserves precedence',()=>{
 const source=Array(80).fill('1-1').join('+'),result=gradeAnswer(scalar('0'),source);
 assert.equal(result.outcome,'correct');assert.equal(result.interpretation,source);
 assert.doesNotThrow(()=>katex.renderToString(result.interpretation,{throwOnError:true,strict:'error',trust:false}));
 for(const source of ['x-(x-1)','(x+1)*(x-1)','(-x)^2','(x^2)^3','x^{-2}','1/(x+1)','sin(x+1)','(x+1)^{1/2}']){
  const c=fn(source,{kind:'interval',lower:'2',upper:'3',lowerClosed:true,upperClosed:true}),v=gradeAnswer(c,source);
  assert.equal(v.outcome,'correct',source);assert.equal(gradeAnswer(c,v.interpretation).outcome,'correct',v.interpretation);
  assert.doesNotThrow(()=>katex.renderToString(v.interpretation,{throwOnError:true,strict:'error',trust:false}));
 }
 const expandedDecimal=Array(31).fill('0.'+'1'.repeat(63)).join('+');
 assert.ok(expandedDecimal.length<=2048);const bounded=gradeAnswer(scalar('0'),expandedDecimal);
 assert.equal(bounded.outcome,'indeterminate');assert.equal(bounded.interpretation,'');assert.match(bounded.feedback,/complete interpreted answer/);
});
