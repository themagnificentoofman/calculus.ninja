import {ZERO,ONE,rat,add,neg,mul,div,cmp,pow,MathInputError} from './rational.mjs';
import {exactRational} from './algebra.mjs';
const interval=(lo=null,hi=null,loOpen=false,hiOpen=false)=>({lo,hi,loOpen,hiOpen});
const singleton=q=>interval(q,q),whole=()=>interval();
const positive=r=>!!r.lo&&(cmp(r.lo,ZERO)>0||(cmp(r.lo,ZERO)===0&&r.loOpen));
const nonnegative=r=>!!r.lo&&cmp(r.lo,ZERO)>=0;
const negative=r=>!!r.hi&&(cmp(r.hi,ZERO)<0||(cmp(r.hi,ZERO)===0&&r.hiOpen));
const nonzero=r=>positive(r)||negative(r);
const flip=r=>interval(r.hi?neg(r.hi):null,r.lo?neg(r.lo):null,r.hiOpen,r.loOpen);
function product(a,c,b){if(a.lo&&a.hi&&cmp(a.lo,ZERO)===0&&cmp(a.hi,ZERO)===0||c.lo&&c.hi&&cmp(c.lo,ZERO)===0&&cmp(c.hi,ZERO)===0)return singleton(ZERO);
 if(nonnegative(a)&&nonnegative(c)){const lo=mul(a.lo,c.lo,b);return interval(lo,a.hi&&c.hi?mul(a.hi,c.hi,b):null,lo[0]===0n?positive(a)&&positive(c):a.loOpen||c.loOpen,a.hiOpen||c.hiOpen);}
 if(a.hi&&cmp(a.hi,ZERO)<=0)return flip(product(flip(a),c,b));
 if(c.hi&&cmp(c.hi,ZERO)<=0)return flip(product(a,flip(c),b));
 if(a.lo&&a.hi&&c.lo&&c.hi){const vs=[mul(a.lo,c.lo,b),mul(a.lo,c.hi,b),mul(a.hi,c.lo,b),mul(a.hi,c.hi,b)].sort(cmp);return interval(vs[0],vs[3]);}return whole();
}
export function domainRange(domain,parseNumber){if(domain?.kind==='interval')return interval(domain.lower===null?null:parseNumber(domain.lower),domain.upper===null?null:parseNumber(domain.upper),!domain.lowerClosed,!domain.upperClosed);return whole();}
/** Outward rational ranges; null means unbounded, never a guessed finite endpoint. */
export function range(ast,variable,domain,b,{differentiable=false,constants={}}={}){
 const issues=[];const obligation=(condition,a,reason)=>{if(!condition)issues.push({ast:a,reason});};
 function run(a){b.spend();const r=exactRational(a,b);if(r)return singleton(r);
  if(a.op==='symbol'){const s=a.args[0];if(constants[s])return singleton(constants[s]);if(s===variable)return domain;if(s==='pi')return interval(rat(31415926,10000000),rat(31415927,10000000));if(s==='e')return interval(rat(27182818,10000000),rat(27182819,10000000));return whole();}
  const u=run(a.args[0]),v=a.args[1]?run(a.args[1]):null;
  if(a.op==='+')return interval(u.lo&&v.lo?add(u.lo,v.lo,b):null,u.hi&&v.hi?add(u.hi,v.hi,b):null,u.loOpen||v.loOpen,u.hiOpen||v.hiOpen);
  if(a.op==='-'){const w=flip(v);return interval(u.lo&&w.lo?add(u.lo,w.lo,b):null,u.hi&&w.hi?add(u.hi,w.hi,b):null,u.loOpen||w.loOpen,u.hiOpen||w.hiOpen);}
  if(a.op==='*')return product(u,v,b);
  if(a.op==='/'){obligation(nonzero(v),a.args[1],'nonzero');if(!nonzero(v))return whole();const inv=interval(v.hi?v.hi[0]===0n?null:div(ONE,v.hi,b):ZERO,v.lo?v.lo[0]===0n?null:div(ONE,v.lo,b):ZERO,v.hiOpen||v.hi===null,v.loOpen||v.lo===null);return product(u,inv,b);}
  if(a.op==='^'){if(a.args[0].op==='symbol'&&a.args[0].args[0]==='e')return interval(ZERO,null,true,false);const n=exactRational(a.args[1],b);if(!n||![1n,2n].includes(n[1]))throw new MathInputError('unsupported','This power is outside the verified answer grammar.');
   if(n[1]===2n){const strict=n[0]<0n;obligation(strict?positive(u):nonnegative(u),a.args[0],strict?'positive':'nonnegative');if(differentiable&&!strict)obligation(positive(u),a.args[0],'smoothness-unproved');return interval(ZERO,null,positive(u),false);}
   const k=Number(n[0]);if(k<0){obligation(nonzero(u),a.args[0],'nonzero');return whole();}if(k===0){obligation(nonzero(u),a.args[0],'nonzero');return singleton(ONE);}if(k%2===0){
    // A positive even power is increasing on [0,infinity) and decreasing
    // on (-infinity,0]. Keep the finite endpoint of an unbounded ray and
    // whether it is attained; replacing it with zero loses valid domains.
    if(nonnegative(u))return interval(pow(u.lo,k,b),u.hi?pow(u.hi,k,b):null,u.loOpen,u.hiOpen);
    if(u.hi&&cmp(u.hi,ZERO)<=0)return interval(pow(u.hi,k,b),u.lo?pow(u.lo,k,b):null,u.hiOpen,u.loOpen);
    // The enclosing interval crosses zero. Its image contains zero. If
    // both endpoint magnitudes tie, the maximum is excluded only when
    // both endpoints are excluded. Unbounded input has no finite maximum.
    if(!u.lo||!u.hi)return interval(ZERO,null);
    const left=pow(u.lo,k,b),right=pow(u.hi,k,b),order=cmp(left,right);
    return interval(ZERO,order>0?left:right,false,order>0?u.loOpen:order<0?u.hiOpen:u.loOpen&&u.hiOpen);
   }return interval(u.lo?pow(u.lo,k,b):null,u.hi?pow(u.hi,k,b):null,u.loOpen,u.hiOpen);
  }
  if(a.op==='ln'){
   obligation(positive(u),a.args[0],'positive');
   // ln is strictly increasing on (0,infinity), with ln(1)=0. These
   // sign enclosures prove domains without approximating a transcendental.
   if(u.lo&&u.hi&&cmp(u.lo,ONE)===0&&cmp(u.hi,ONE)===0)return singleton(ZERO);
   if(u.lo&&cmp(u.lo,ONE)>=0)return interval(ZERO,null,cmp(u.lo,ONE)>0||u.loOpen,false);
   if(u.hi&&cmp(u.hi,ONE)<=0)return interval(null,ZERO,false,cmp(u.hi,ONE)<0||u.hiOpen);
   return whole();
  }
  if(a.op==='sqrt'){obligation(nonnegative(u),a.args[0],'nonnegative');if(differentiable)obligation(positive(u),a.args[0],'smoothness-unproved');return interval(ZERO,null,positive(u),false);}
  if(a.op==='abs'){if(differentiable)obligation(nonzero(u),a.args[0],'smoothness-unproved');return interval(ZERO,null,nonzero(u),false);}
  if(a.op==='exp')return interval(ZERO,null,true,false);
  if(a.op==='sin'||a.op==='cos'||a.op==='tanh')return interval(rat(-1),ONE);
  if(a.op==='cosh')return interval(ONE,null);
  if(a.op==='sinh')return whole();
  if(a.op==='arctan')return interval(rat(-2),rat(2),true,true);
  if(a.op==='arcsin'||a.op==='arccos'){obligation(!!u.lo&&!!u.hi&&cmp(u.lo,rat(-1))>=0&&cmp(u.hi,ONE)<=0,a.args[0],'unit-interval');return interval(rat(-4),rat(4));}
  obligation(false,a,'unsupported-domain');return whole();
 }
 const value=run(ast);return {range:value,issues};
}
export function contains(domain,x){return (!domain.lo||cmp(x,domain.lo)>0||cmp(x,domain.lo)===0&&!domain.loOpen)&&(!domain.hi||cmp(x,domain.hi)<0||cmp(x,domain.hi)===0&&!domain.hiOpen);}
export function witnesses(domain,b){const xs=[-3,-2,-1,0,1,2,3].map(x=>rat(x));if(domain.lo&&domain.hi)xs.push(div(add(domain.lo,domain.hi,b),rat(2),b));if(domain.lo)xs.push(domain.lo,add(domain.lo,ONE,b));if(domain.hi)xs.push(domain.hi,add(domain.hi,rat(-1),b));return xs.filter(x=>contains(domain,x));}
export function violates(issue,variable,x,b){const r=range(issue.ast,variable,singleton(x),b).range;
 if(issue.reason==='nonzero')return r.lo&&r.hi&&cmp(r.lo,ZERO)===0&&cmp(r.hi,ZERO)===0;
 if(issue.reason==='positive')return r.hi&&cmp(r.hi,ZERO)<=0;
 if(issue.reason==='nonnegative')return r.hi&&cmp(r.hi,ZERO)<0;
 if(issue.reason==='unit-interval')return r.lo&&cmp(r.lo,ONE)>0||r.hi&&cmp(r.hi,rat(-1))<0;
 return false;
}
export function separate(a,c){return !!(a.hi&&c.lo&&cmp(a.hi,c.lo)<0||c.hi&&a.lo&&cmp(c.hi,a.lo)<0);}
export const pointRange=singleton;
