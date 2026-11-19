// Bounded exact real-constant certificates used only by exact-algebra-2.
import {budget,MathInputError,rat,ONE,ZERO,pow,mul,div,cmp,LIMITS} from './rational.mjs';
import {exactRational} from './algebra.mjs';
const unsupported=()=>{throw new MathInputError('unsupported','Outside the signed positive-constant monomial certificate scope.');};
const gcd=(a,b)=>b?gcd(b,a%b):a;
const lcm=(a,b)=>{const n=a/gcd(a,b)*b;if(n>32)throw new MathInputError('indeterminate','Common root degree exceeds 32.');return n;};
// Invariant: sign in {-1,0,1}; for nonzero x, |x|>0, |x|^degree=radicand>0.
// Copy before freezing: exactRational/pow may return a caller AST pair or the
// frozen v1 implementation's mutable ONE/ZERO singletons. Never freeze or
// expose those borrowed arrays. BigInt entries themselves are immutable.
const ownedCertificate=(sign,degree,radicand)=>Object.freeze({sign,degree,radicand:Object.freeze([radicand[0],radicand[1]])});
const rational=q=>ownedCertificate(q[0]===0n?0:q[0]<0n?-1:1,1,[q[0]<0n?-q[0]:q[0],q[1]]);
function powered(a,n,b){
 const[p,q]=n;if(q>32n||p>32n||p< -32n)throw new MathInputError('indeterminate','Rational exponent exceeds the supported range.');
 if(!a.sign){if(p<=0n)throw new MathInputError('invalid','Zero cannot have zero or a negative exponent here.');return rational(ZERO);}
 if(p===0n)return rational(ONE);
 if(a.sign<0&&q!==1n){if(q%2n===0n)throw new MathInputError('invalid','An even root of a negative real number is not real.');unsupported();}
 const product=a.degree*Number(q),g=gcd(Math.abs(Number(p)),product),degree=product/g;
 if(degree>32)throw new MathInputError('indeterminate','Root degree exceeds 32.');
 return ownedCertificate(a.sign<0&&p%2n!==0n?-1:1,degree,pow(a.radicand,Number(p)/g,b));
}
function combined(a,c,divide,b){
 if(divide&&!c.sign)throw new MathInputError('invalid','Division by zero.');
 if(!a.sign||!c.sign)return rational(ZERO);
 const degree=lcm(a.degree,c.degree),left=pow(a.radicand,degree/a.degree,b),right=pow(c.radicand,degree/c.degree,b);
 return ownedCertificate(a.sign*c.sign,degree,divide?div(left,right,b):mul(left,right,b));
}
export function certificate(ast,b){
 function logTerm(a){b.spend();
  if(a.op==='ln'){const base=exactRational(a.args[0],b);if(!base)unsupported();if(base[0]<=0n)throw new MathInputError('invalid','Natural logarithm requires a positive real argument.');return {base,exponent:ONE};}
  if(a.op==='*'){
   const x=exactRational(a.args[0],b),y=exactRational(a.args[1],b);
   if(x){const r=logTerm(a.args[1]);return {...r,exponent:mul(x,r.exponent,b)};}
   if(y){const r=logTerm(a.args[0]);return {...r,exponent:mul(y,r.exponent,b)};}
  }
  if(a.op==='/'){const d=exactRational(a.args[1],b);if(d){if(!d[0])throw new MathInputError('invalid','Division by zero.');const r=logTerm(a.args[0]);return {...r,exponent:div(r.exponent,d,b)};}}
  unsupported();
 }
 function run(a){b.spend();const q=exactRational(a,b);if(q)return rational(q);
  if(a.op==='*'||a.op==='/')return combined(run(a.args[0]),run(a.args[1]),a.op==='/',b);
  if(a.op==='sqrt')return powered(run(a.args[0]),rat(1,2,b),b);
  if(a.op==='^'){
   if(a.args[0].op==='symbol'&&a.args[0].args[0]==='e')return exponential(a.args[1]);
   const n=exactRational(a.args[1],b);if(!n)unsupported();return powered(run(a.args[0]),n,b);
  }
  if(a.op==='exp')return exponential(a.args[0]);
  unsupported();
 }
 function exponential(a){const q=exactRational(a,b);if(q&&q[0]===0n)return rational(ONE);const t=logTerm(a);return powered(rational(t.base),t.exponent,b);}
 return run(ast);
}
export function compareCertificates(a,c,b){
 if(a.sign!==c.sign)return a.sign<c.sign?-1:1;
 if(!a.sign)return 0;
 const n=lcm(a.degree,c.degree),order=cmp(pow(a.radicand,n/a.degree,b),pow(c.radicand,n/c.degree,b));
 return order===0?0:a.sign*order;
}
