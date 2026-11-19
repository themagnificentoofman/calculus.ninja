import test from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
import {gradeAnswer as legacy,OPERATORS} from '../lib/math-answer/grade.mjs';
import {gradeAnswer,checkerFor,CURRENT_CHECKER} from '../lib/math-answer/versioned-grade.mjs';
import {certificate} from '../lib/math-answer/v2/constant-certificate.mjs';
import {parse} from '../lib/math-answer/v2/parser.mjs';
import {budget,ONE,ZERO} from '../lib/math-answer/v2/rational.mjs';
import {currentCheckerSourceHash} from '../scripts/bank/free-response.mjs';
const contract=(answer,version=2)=>({version:'answer-contract-1',parserVersion:`bounded-latex-${version}`,graderVersion:`exact-algebra-${version}`,domain:'real',branch:'real-principal',review:{referenceVerified:true},allowedOperators:version===1?OPERATORS:CURRENT_CHECKER.operators,answer});
const scalar=(expected,version=2)=>contract({kind:'scalar',expected},version);
const is=(c,s,outcome)=>{const value=gradeAnswer(c,s);assert.equal(value.outcome,outcome,JSON.stringify({s,value}));assert(value.work<=50001);if(value.interpretation)assert.doesNotThrow(()=>katex.renderToString(value.interpretation,{strict:'error',throwOnError:true,trust:false}));return value;};

test('saved v1 contracts retain the exact original six-file identity and outcomes',()=>{
 assert.equal(currentCheckerSourceHash(),'1ae21d694037ba320151199e0020fff9175d1d11ccc6e10fa9489766024290fd');
 const cases=[scalar('1/3',1),scalar('4^{4/3}',1),scalar('sqrt{2}',1),contract({kind:'function',expected:'x',variable:'x',domain:{kind:'real-line'}},1),contract({kind:'antiderivative',integrand:'2*x',variable:'x',domain:{kind:'real-line'},request:'any',constant:'optional-real-additive'},1)];
 for(const c of cases)for(const s of ['1/3','0.3333','4^{4/3}',String.raw`\sqrt[3]{256}`,'x','sqrt{x^2}','x^2+C','1/0','0*ln(-1)','2^{9999999}'])assert.deepEqual(gradeAnswer(c,s),legacy(c,s));
 is(scalar('4^{4/3}',1),'4^{4/3}','unsupported');
 is(scalar('4^{4/3}',2),'4^{4/3}','correct');
 for(const c of [{...scalar('1'),parserVersion:'bounded-latex-1'},{...scalar('1'),graderVersion:'future'},null]){assert.equal(checkerFor(c),null);assert.equal(gradeAnswer(c,'1').outcome,'indeterminate');assert.equal(gradeAnswer(c,'1').version,'unavailable');}
});

test('v2 proves conventional positive powers and roots exactly and preserves interpretation',()=>{
 const c=scalar('4^{4/3}');
 for(const s of ['4^{4/3}',String.raw`\sqrt[3]{256}`,String.raw`4\sqrt[3]{4}`,String.raw`\exp(4*\ln(4)/3)`,'e^{4*ln(4)/3}',String.raw`1/\sqrt[3]{1/256}`]){
  const result=is(c,s,'correct');is(c,result.interpretation,'correct');
 }
 for(const s of ['6.3496042079','6.349604207872797','4^4/3','-4^{4/3}'])is(c,s,'incorrect');
 is(c,'4^{1.3333333333}','indeterminate');
 is(scalar('-4^{4/3}'),String.raw`-\sqrt[3]{256}`,'correct');
 is(scalar('16'),String.raw`(\sqrt[3]{8})^{4}`,'correct');
 is(scalar('0'),'0^{1/3}','correct');
 is(scalar('1'),'4^{0}','correct');
 is(scalar('1/4'),'16^{-1/2}','correct');
 is({...c,allowedOperators:OPERATORS},String.raw`\sqrt[3]{256}`,'unsupported');
});

test('v2 does not erase real-domain holes or extend variable-power claims',()=>{
 for(const s of ['0*sqrt{-1}','(sqrt{-1})^{0}','(1/0)^{0}','0*ln(-1)','exp(0*ln(-1))','0/0','0^{-1/3}','(-4)^{1/2}'])is(scalar('0'),s,'invalid');
 for(const s of ['(-8)^{1/3}',String.raw`\sqrt[3]{-8}`,String.raw`\sqrt[3]{ln(3)}`])is(scalar('2'),s,'unsupported');
 for(const s of ['2^{1/33}','2^{33/31}','2^{1/31}*2^{1/32}'])assert(['indeterminate','unsupported'].includes(gradeAnswer(scalar('1'),s).outcome),s);
 for(const s of [String.raw`\sqrt[n]{2}`,String.raw`\sqrt[3]2`,'4^(4/3)'])is(scalar('1'),s,'invalid');
 const fn=contract({kind:'function',expected:'x',variable:'x',domain:{kind:'real-line'}});
 is(fn,String.raw`\sqrt[3]{x}`,'unsupported');is(fn,'sqrt{x^2}','incorrect');
 for(const expected of ['1/0','sqrt{-1}','1+',''])is(scalar(expected),'1','indeterminate');
 is(contract({kind:'function',expected:'ln(-1)',variable:'x',domain:{kind:'real-line'}}),'x','indeterminate');
});

test('complete tuple and interval scalar branches use their saved version',()=>{
 const pair=contract({kind:'tuple',components:[{kind:'scalar',expected:'4^{4/3}'},{kind:'scalar',expected:'-2'}]});
 is(pair,String.raw`(\sqrt[3]{256},-2)`,'correct');is(pair,String.raw`(\sqrt[3]{256},2)`,'incorrect');
 const interval=contract({kind:'interval',lower:'0',upper:'4^{4/3}',lowerClosed:false,upperClosed:true});
 is(interval,String.raw`(0,\sqrt[3]{256}]`,'correct');is(interval,String.raw`[0,\sqrt[3]{256}]`,'incorrect');
});

test('v2 certificates own immutable values and cannot mutate either grader',()=>{
 const before={one:[...ONE],zero:[...ZERO],legacy:legacy(scalar('1',1),'1')};
 for(const s of ['2^{0}','0^{1/2}','4^{4/3}',String.raw`\sqrt[3]{256}`,'1/3']){
  const b=budget(),ast=parse(s,{allowedOperators:CURRENT_CHECKER.operators},b),value=certificate(ast,b);
  assert(Object.isFrozen(value));assert(Object.isFrozen(value.radicand));assert.notEqual(value.radicand,ONE);assert.notEqual(value.radicand,ZERO);
  assert.throws(()=>{value.radicand[0]=999n;},TypeError);
  assert.throws(()=>{value.degree=999;},TypeError);
  assert.deepEqual(legacy(scalar('1',1),'1'),before.legacy);
 }
 assert.deepEqual(ONE,before.one);assert.deepEqual(ZERO,before.zero);
 const ast={op:'q',args:[[3n,5n]]},value=certificate(ast,budget());ast.args[0][0]=99n;assert.deepEqual(value.radicand,[3n,5n]);
});
