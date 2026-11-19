import test from 'node:test';
import assert from 'node:assert/strict';
import {validQuestionMix,questionOrderMatches,orderConfiguredQuestions,uniformIndex} from '../lib/round-question-config.mjs';
const questions=[{id:'m1'},{id:'f1',responseFormat:'free-response'},{id:'m2'},{id:'f2',responseFormat:'free-response'}];
test('question counts are explicit, integral and total 1–20; either type can be zero',()=>{
 for(const [m,f]of [[5,0],[0,20],[7,13],[1,0]])assert(validQuestionMix({multipleChoice:m,freeResponse:f,order:'uniform'},m+f));
 for(const mix of [{multipleChoice:0,freeResponse:0},{multipleChoice:10,freeResponse:11},{multipleChoice:-1,freeResponse:2},{multipleChoice:1.5,freeResponse:1.5},{multipleChoice:'1',freeResponse:2},{multipleChoice:2,freeResponse:2,secret:1}])assert(!validQuestionMix({order:'mcq-first',...mix},Number(mix.multipleChoice)+mix.freeResponse));
 assert(!validQuestionMix({multipleChoice:2,freeResponse:2,order:'alternating'},4));
 assert(!validQuestionMix({multipleChoice:2,freeResponse:2,order:'uniform'},5));
});
test('grouped modes preserve the actual selected order within each question type',()=>{
 for(const [order,expected]of [['mcq-first',['m1','m2','f1','f2']],['frq-first',['f1','f2','m1','m2']]]){
  const mix={multipleChoice:2,freeResponse:2,order},ordered=orderConfiguredQuestions(questions,mix);
  assert.deepEqual(ordered.map(q=>q.id),expected);assert(questionOrderMatches(ordered,mix));assert(!questionOrderMatches(questions,mix));
 }
 assert.deepEqual(questions.map(q=>q.id),['m1','f1','m2','f2']);
});
test('uniform shuffle enumerates each full permutation exactly once for equal-probability draws',()=>{
 const permutations=new Set(),masks=new Map(),mix={multipleChoice:2,freeResponse:2,order:'uniform'};
 for(let a=0;a<4;a++)for(let b=0;b<3;b++)for(let c=0;c<2;c++){
  const draws=[a,b,c],result=orderConfiguredQuestions(questions,mix,upper=>{const n=draws.shift();assert(n<upper);return n;});
  permutations.add(result.map(q=>q.id).join(','));const mask=result.map(q=>q.responseFormat?'f':'m').join('');masks.set(mask,(masks.get(mask)||0)+1);
 }
 assert.equal(permutations.size,24);assert.equal(masks.size,6);assert([...masks.values()].every(n=>n===4));
 assert.throws(()=>orderConfiguredQuestions(questions,mix,()=>4),/shuffle index/);assert.throws(()=>uniformIndex(21),/shuffle bound/);
});

import {orderConfiguredQuestionsV2,adjacentFamilyContacts} from '../lib/round-question-config.mjs';
test('grouped order minimizes contacts including the format boundary; uniform retains every draw',()=>{
 const family=q=>q.constructionFamilyId;
 function permutations(rows){
  if(!rows.length)return [[]];
  return rows.flatMap((r,i)=>permutations(rows.filter((_,j)=>i!==j)).map(p=>[r,...p]));
 }
 for(let encoding=0;encoding<3**5;encoding++){
  let bits=encoding;
  const rows=Array.from({length:5},(_,i)=>{
   const id=bits%3;bits=Math.floor(bits/3);
   return {problemId:'q'+i,constructionFamilyId:'f'+id,responseFormat:i<3?'multiple-choice':'free-response'};
  });
  for(const order of ['mcq-first','frq-first']){
   const mix={multipleChoice:3,freeResponse:2,order},current=orderConfiguredQuestionsV2(rows,mix);
   const all=permutations(rows.slice(0,3)).flatMap(a=>permutations(rows.slice(3)).map(b=>order==='mcq-first'?[...a,...b]:[...b,...a]));
   assert(questionOrderMatches(current,mix));assert.deepEqual(new Set(current),new Set(rows));
   assert.equal(adjacentFamilyContacts(current,family),Math.min(...all.map(s=>adjacentFamilyContacts(s,family))));
  }
  const uniform={multipleChoice:3,freeResponse:2,order:'uniform'};
  assert.deepEqual(orderConfiguredQuestionsV2(rows,uniform,()=>0),orderConfiguredQuestions(rows,uniform,()=>0));
 }
});
