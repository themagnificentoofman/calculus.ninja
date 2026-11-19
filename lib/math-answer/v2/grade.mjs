import {certificate,compareCertificates} from './constant-certificate.mjs';
import {LIMITS,MathInputError,budget,ZERO,ONE,rat,add,sub,mul,div,neg,cmp,key} from './rational.mjs';
import {parse,preflight,astLatex} from './parser.mjs';
import {exactRational,normalForm,derivative} from './algebra.mjs';
import {domainRange,range,witnesses,violates,separate,pointRange} from './domain.mjs';
export const GRADER_VERSION='exact-algebra-2',PARSER_VERSION='bounded-latex-2';
export const OPERATORS=Object.freeze(['root','sqrt','ln','exp','sin','cos','tan','arcsin','arccos','arctan','sinh','cosh','tanh','abs']);
const message={correct:'Your answer is equivalent under the stated assumptions.',incorrect:'The answer does not meet the stated mathematical conditions.',invalid:'Check the answer syntax.',unsupported:'This form is outside the currently verified capabilities. You may edit it or reveal the solution.',indeterminate:'The checker could not justify a verdict. You may edit or reveal without a wrong-answer penalty.'};
const strip=s=>s.replace(/\\(?:left|right)\b/g,'').trim();
function parts(source,open,close){let s=strip(source);if(!s.startsWith(open)||!s.endsWith(close))throw new MathInputError('invalid',`Enter the answer in ${open} ${close}.`);s=s.slice(open.length,s.length-close.length);const out=[];let start=0,stack=[];for(let i=0;i<s.length;i++){if('({['.includes(s[i]))stack.push(s[i]);else if(')}]'.includes(s[i])){if(!stack.length)throw new MathInputError('invalid','Check the brackets.');stack.pop();}else if(s[i]===','&&!stack.length){out.push(s.slice(start,i));start=i+1;}}out.push(s.slice(start));if(stack.length||out.length>LIMITS.collection||out.some(x=>!x.trim()))throw new MathInputError('invalid','Check the number of components and their brackets.');return out;}
const outcomes=new Map([['+infinity','positive-infinity'],['infinity','positive-infinity'],['+\\infty','positive-infinity'],['\\infty','positive-infinity'],['∞','positive-infinity'],['-infinity','negative-infinity'],['-\\infty','negative-infinity'],['-∞','negative-infinity'],['dne','does-not-exist'],['does not exist','does-not-exist'],['diverges','diverges'],['converges','converges'],['absolute','absolute'],['absolutely convergent','absolute'],['conditional','conditional'],['conditionally convergent','conditional']]);
const outcomeLatex=value=>({'positive-infinity':'\\infty','negative-infinity':'-\\infty','does-not-exist':'\\text{DNE}',diverges:'\\text{diverges}',converges:'\\text{converges}',absolute:'\\text{absolutely convergent}',conditional:'\\text{conditionally convergent}'})[value];
export function gradeAnswer(contract,source){const b=budget();let interpretation='';
 try{
  if(contract?.version!=='answer-contract-1'||contract.parserVersion!==PARSER_VERSION||contract.graderVersion!==GRADER_VERSION||contract.domain!=='real'||contract.branch!=='real-principal'||contract.review?.referenceVerified!==true)throw new MathInputError('indeterminate','This saved answer version is not available for grading.');
  preflight(source);const permitted=contract.allowedOperators;if(!Array.isArray(permitted)||permitted.length>OPERATORS.length||permitted.some(x=>!OPERATORS.includes(x)))throw new MathInputError('indeterminate','This answer contract is not supported.');
  const parseFor=(s,variable,constant=false)=>parse(s,{variables:variable?[variable]:[],constant,allowedOperators:permitted},b);
  const parseReference=(s,variable)=>{try{return parseFor(s,variable);}catch{throw new MathInputError('indeterminate','The reference answer cannot be verified.');}};
  const rational=s=>{const r=exactRational(parseReference(s),b);if(!r)throw new MathInputError('indeterminate','This precision contract is unavailable.');return r;};
  function checkDomain(a,variable,domain,differentiable=false){const result=range(a,variable,domain,b,{differentiable});if(!result.issues.length)return null;
   for(const x of witnesses(domain,b))for(const issue of result.issues)if(violates(issue,variable,x,b)){if(!variable)throw new MathInputError('invalid','The expression is not defined as a real value. Check denominators and function domains.');return 'incorrect';}
   return 'unsupported';
  }
  function checkReferenceDomain(ast,variable,domain){try{if(!checkDomain(ast,variable,domain))return;}catch{}throw new MathInputError('indeterminate','The reference domain cannot be verified.');}
  function compare(a,expected,variable,domain){const difference={op:'-',args:[a,expected]},normal=normalForm(difference,b);if(normal.n.size===0)return 'correct';
   const exact=normal.rational();if(exact)return exact[0]===0n?'correct':'incorrect';
   // A verified separating interval at ONE required point is a counterexample.
   // Agreement at points never establishes an identity.
   for(const x of variable?witnesses(domain,b):[ZERO]){const av=range(a,variable,pointRange(x),b),ev=range(expected,variable,pointRange(x),b);if(!av.issues.length&&!ev.issues.length&&separate(av.range,ev.range))return 'incorrect';}
   return 'indeterminate';
  }
  function check(type,s,depth=0){b.spend();if(depth>4)throw new MathInputError('indeterminate','The answer structure is too deeply nested.');
   if(type.kind==='outcome'){const v=outcomes.get(strip(s).toLowerCase());if(!v)throw new MathInputError('invalid','Enter the requested classification, such as DNE or infinity.');interpretation=outcomeLatex(v);return v===type.expected?'correct':'incorrect';}
   if(type.kind==='tuple'||type.kind==='finite-set'){
    const items=parts(s,type.kind==='tuple'?'(':'\\{',type.kind==='tuple'?')':'\\}'),types=type.kind==='tuple'?type.components:type.elements;
    if(!Array.isArray(types)||types.length>LIMITS.collection)throw new MathInputError('indeterminate','The collection contract is unavailable.');
    if(type.kind==='finite-set')throw new MathInputError('unsupported','Unordered sets are not enabled in this grader version.');
    if(items.length!==types.length)throw new MathInputError('invalid',`Enter ${types.length} components in the requested order.`);
    const interpreted=[],results=items.map((x,i)=>{interpretation='';const result=check(types[i],x,depth+1);interpreted.push(interpretation);return result;});
    interpretation=`\\left(${interpreted.join(',\\;')}\\right)`;
    return results.includes('incorrect')?'incorrect':results.includes('unsupported')?'unsupported':results.includes('indeterminate')?'indeterminate':'correct';
   }
   if(type.kind==='interval'){
    const s0=strip(s),l=s0[0],r=s0.at(-1);
    if(!['(','['].includes(l)||![')',']'].includes(r))throw new MathInputError('invalid','Use interval notation with the requested endpoints.');
    const items=parts(s0,l,r);if(items.length!==2)throw new MathInputError('invalid','An interval needs two endpoints.');
    const interpreted=[],verdicts=items.map((x,i)=>{
     const expected=i?type.upper:type.lower,actualInfinity=outcomes.get(strip(x).toLowerCase()),expectedInfinity=outcomes.get(strip(expected).toLowerCase());
     const isInfinity=v=>v==='positive-infinity'||v==='negative-infinity';
     if(isInfinity(actualInfinity)){
      if(i?r===']':l==='[')throw new MathInputError('invalid','An infinite endpoint must use a round bracket.');
      interpreted.push(outcomeLatex(actualInfinity));return actualInfinity===expectedInfinity?'correct':'incorrect';
     }
     // Parse a finite endpoint even when the reference is infinite, so malformed
     // input cannot become a mathematical wrong verdict.
     if(isInfinity(expectedInfinity)){const a=parseFor(x);interpreted.push(astLatex(a));const verdict=checkDomain(a,null,domainRange(null,rational));return verdict||'incorrect';}
     interpretation='';const result=check({kind:'scalar',expected},x,depth+1);interpreted.push(interpretation);return result;
    });
    interpretation=`\\left${l}${interpreted.join(',\\;')}\\right${r}`;
    if(verdicts.includes('incorrect')||(l==='[')!==type.lowerClosed||(r===']')!==type.upperClosed)return 'incorrect';
    return verdicts.includes('unsupported')?'unsupported':verdicts.every(x=>x==='correct')?'correct':'indeterminate';
   }
   const needsVariable=type.kind==='function'||type.kind==='antiderivative',variable=needsVariable?type.variable:null;if(needsVariable&&(typeof variable!=='string'||!/^[a-df-hj-z]$/.test(variable)))throw new MathInputError('indeterminate','This variable contract is unavailable.');
   if(needsVariable){const d=type.domain;if(!d||!['real-line','interval'].includes(d.kind))throw new MathInputError('indeterminate','This domain contract is unavailable.');if(d.kind==='interval'&&(typeof d.lowerClosed!=='boolean'||typeof d.upperClosed!=='boolean'||d.lower===null&&d.lowerClosed||d.upper===null&&d.upperClosed||d.lower!==null&&typeof d.lower!=='string'||d.upper!==null&&typeof d.upper!=='string'))throw new MathInputError('indeterminate','This domain contract is unavailable.');}
   const domain=domainRange(type.domain,rational);if(domain.lo&&domain.hi&&cmp(domain.lo,domain.hi)>=0)throw new MathInputError('indeterminate','This interval contract is unavailable.');
   const a=parseFor(s,variable,type.kind==='antiderivative');interpretation=astLatex(a);
   // Certify each COMPLETE scalar expression, including all domain obligations.
   // A capability miss falls through to the original conservative proof routes.
   // Domain errors in a learner's expression remain invalid; reference failures
   // are unavailable contracts, never a wrong-answer penalty.
   if(type.kind==='scalar'){
    let actualCertificate=null;
    try{actualCertificate=certificate(a,b);}catch(error){if(!(error instanceof MathInputError)||error.kind!=='unsupported')throw error;}
    if(actualCertificate){
     let expectedCertificate=null;
     try{expectedCertificate=certificate(parseReference(type.expected),b);}catch(error){
      if(!(error instanceof MathInputError))throw error;
      if(error.kind!=='unsupported')throw new MathInputError('indeterminate','The reference answer cannot be verified.');
     }
     if(expectedCertificate)return compareCertificates(actualCertificate,expectedCertificate,b)===0?'correct':'incorrect';
    }
   }
   const domainVerdict=checkDomain(a,variable,domain,type.kind==='antiderivative');if(domainVerdict)return domainVerdict;
   if(type.kind==='approximate'){const actual=normalForm(a,b).rational(),expected=rational(type.expected),abs=rational(type.absoluteTolerance),rel=rational(type.relativeTolerance);if(abs[0]<0n||rel[0]<0n)throw new MathInputError('indeterminate','This tolerance contract is unavailable.');if(!actual)throw new MathInputError('unsupported','For this approximation, enter a finite number.');const absolute=x=>x[0]<0n?neg(x):x,tolerance=add(abs,mul(rel,absolute(expected),b),b);return cmp(absolute(sub(actual,expected,b)),tolerance)<=0?'correct':'incorrect';}
   if(type.kind==='antiderivative'){if(type.request!=='any'||type.constant!=='optional-real-additive')throw new MathInputError('unsupported','General-family completeness is not graded in this version.');const target=parseReference(type.integrand,variable),d=derivative(a,variable,b);checkReferenceDomain(target,variable,domain);return compare(d,target,variable,domain);}
   if(type.kind!=='scalar'&&type.kind!=='function')throw new MathInputError('indeterminate','This answer type is not available.');const expected=parseReference(type.expected,variable);checkReferenceDomain(expected,variable,domain);return compare(a,expected,variable,domain);
  }
  // Establish that the saved reference itself is supported before assigning a
  // mathematical result to a learner. This uses the same bounded semantics,
  // including collection components, endpoint closures and domain obligations.
  const reference=t=>t.kind==='antiderivative'?t.reference:t.kind==='tuple'?`(${t.components.map(reference).join(',')})`:t.kind==='interval'?`${t.lowerClosed?'[':'('}${t.lower},${t.upper}${t.upperClosed?']':')'}`:t.kind==='outcome'?({'positive-infinity':'infinity','negative-infinity':'-infinity','does-not-exist':'DNE',diverges:'diverges',converges:'converges',absolute:'absolute',conditional:'conditional'})[t.expected]:t.expected;
  try{if(check(contract.answer,reference(contract.answer))!=='correct')throw Error('Unavailable reference');}
  catch{throw new MathInputError('indeterminate','The reference answer cannot be verified.');}
  interpretation='';
  const outcome=check(contract.answer,source);if(interpretation.length>4096)throw new MathInputError('indeterminate','The complete interpreted answer is too long to display safely. Shorten the expression and retry.');return {version:GRADER_VERSION,outcome,feedback:message[outcome],interpretation,work:b.used};
 }catch(e){if(e instanceof MathInputError)return {version:GRADER_VERSION,outcome:e.kind,feedback:e.message,interpretation:'',work:b.used};return {version:GRADER_VERSION,outcome:'indeterminate',feedback:message.indeterminate,interpretation:'',work:b.used};}
}
