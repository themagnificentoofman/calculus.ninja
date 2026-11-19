import {LIMITS,MathInputError,ZERO,ONE,rat,add,sub,mul,div,neg,cmp,key,pow,integerRoot} from './rational.mjs';
import {astKey} from './parser.mjs';
const q=a=>({op:'q',args:[a]}),N=n=>q(rat(n)),op=(name,...args)=>({op:name,args});
export function exactRational(a,b){b.spend();if(a.op==='q')return a.args[0];const r=a.args.map(x=>typeof x==='object'?exactRational(x,b):null);if(r.some(x=>!x))return null;
 if(a.op==='+')return add(r[0],r[1],b);if(a.op==='-')return sub(r[0],r[1],b);if(a.op==='*')return mul(r[0],r[1],b);if(a.op==='/')return r[1][0]?div(r[0],r[1],b):null;if(a.op==='^'&&r[1][1]===1n)return pow(r[0],Number(r[1][0]),b);
 if(a.op==='sqrt'){const n=integerRoot(r[0][0],b),d=integerRoot(r[0][1],b);return n!==null&&d!==null?rat(n,d,b):null;}if(a.op==='abs')return r[0][0]<0?neg(r[0]):r[0];return null;
}
const clean=p=>new Map([...p].filter(([,v])=>v[0]!==0n));
const scalar=c=>new Map(c[0]?[[JSON.stringify([]),c]]:[]);
const serialized=p=>JSON.stringify([...p].sort(([a],[b])=>a.localeCompare(b)).map(([m,c])=>[m,key(c)]));
/** A rational function over named analytic atoms. Only proved identities rewrite atoms.
 * Zero normal form is a proof by ring/field identities, subject to a separate domain check.
 * A nonzero normal form over analytic atoms is NOT a proof of inequality. */
export function normalForm(ast,b){
 const atoms=new Map(),atomIds=new Map();
 const plus=(a,c)=>{b.spend(a.size+c.size);const r=new Map(a);for(const[k,v]of c)r.set(k,add(r.get(k)||ZERO,v,b));if(r.size>LIMITS.terms)throw new MathInputError('indeterminate','Expansion exceeds the checker limit.');return clean(r);};
 const scale=(a,c)=>clean(new Map([...a].map(([m,v])=>[m,mul(v,c,b)])));
 const product=(a,c)=>{const r=new Map();for(const [ka,ca]of a)for(const[kc,cc]of c){b.spend();const m=new Map(JSON.parse(ka));for(const[k,n]of JSON.parse(kc))m.set(k,(m.get(k)||0)+n);let coefficient=mul(ca,cc,b);
   for(const[k,n]of m){const atom=atoms.get(k);if(atom?.radical&&n>=2){coefficient=mul(coefficient,pow(atom.radical,Math.floor(n/2),b),b);m.set(k,n%2);}}
   const k=JSON.stringify([...m].filter(([,n])=>n).sort(([a],[c])=>a.localeCompare(c)));r.set(k,add(r.get(k)||ZERO,coefficient,b));if(r.size>LIMITS.terms)throw new MathInputError('indeterminate','Expansion exceeds the checker limit.');
 }return clean(r);};
 const one=()=>scalar(ONE),value=c=>({n:scalar(c),d:one()}),sum=(a,c)=>({n:plus(product(a.n,c.d),product(c.n,a.d)),d:product(a.d,c.d)}),times=(a,c)=>({n:product(a.n,c.n),d:product(a.d,c.d)});
 const signature=a=>`${serialized(a.n)} / ${serialized(a.d)}`;
 // Intern analytic subexpressions instead of recursively JSON-escaping their
 // entire spelling. Nested functions must have linear-size names.
 const intern=(name,data)=>{if(atomIds.has(name))return atomIds.get(name);const id=`@${atomIds.size}`;atomIds.set(name,id);atoms.set(id,data);return id;};
 const atom=(name,data)=>{const id=intern(name,data);return {n:new Map([[JSON.stringify([[id,1]]),ONE]]),d:one()};};
 const power=(a,n)=>{if(!Number.isInteger(n)||Math.abs(n)>LIMITS.exponent)throw new MathInputError('indeterminate','This exponent exceeds the supported work limit.');let r=value(ONE);for(let i=0;i<Math.abs(n);i++)r=times(r,a);return n<0?{n:r.d,d:r.n}:r;};
 function run(a){b.spend();const r=exactRational(a,b);if(r)return value(r);if(a.op==='symbol')return atom(a.args[0],{ast:a});
  if(['+','-','*','/'].includes(a.op)){const x=run(a.args[0]),y=run(a.args[1]);return a.op==='+'?sum(x,y):a.op==='-'?sum(x,{n:scale(y.n,rat(-1)),d:y.d}):a.op==='*'?times(x,y):times(x,{n:y.d,d:y.n});}
 if(a.op==='^'){if(a.args[0].op==='symbol'&&a.args[0].args[0]==='e')return run(op('exp',a.args[1]));const n=exactRational(a.args[1],b);if(n?.[1]===1n)return power(run(a.args[0]),Number(n[0]));if(n&&n[1]===2n)return power(run(op('sqrt',a.args[0])),Number(n[0]));throw new MathInputError('unsupported','This power is outside the verified answer grammar.');}
  const argument=run(a.args[0]),rarg=exactRational(a.args[0],b);
  if(rarg?.[0]===0n){if(['sin','tan','sinh','tanh','arcsin','arctan'].includes(a.op))return value(ZERO);if(['cos','cosh','exp'].includes(a.op))return value(ONE);}
  if(a.op==='ln'&&rarg&&cmp(rarg,ONE)===0)return value(ZERO);
  if(a.op==='exp'&&rarg&&cmp(rarg,ONE)===0)return run({op:'symbol',args:['e']});
  if(a.op==='ln'&&a.args[0].op==='symbol'&&a.args[0].args[0]==='e')return value(ONE);
  if(a.op==='sqrt'&&rarg&&rarg[0]>0n){let nn=rarg[0]*rarg[1],outside=1n;for(let f=2n;f<=251n;f++){const square=f*f;while(nn%square===0n){b.spend();nn/=square;outside*=f;}}const root=integerRoot(nn,b);if(root!==null)return value(rat(outside*root,rarg[1],b));const rr=rat(nn);return times(value(rat(outside,rarg[1],b)),atom(`sqrt(${key(rr)})`,{ast:op('sqrt',q(rr)),radical:rr}));}
  // cos(t)^2 = 1 - sin(t)^2 is an exact real identity. Canonicalize cos^2
  // in multiplication below, not by a numerical or random comparison.
  return atom(`${a.op}(${signature(argument)})`,{ast:a,function:a.op,argument:signature(argument)});
 }
 const result=run(ast);
 function trigReduce(p){let out=new Map();for(const [mon,c]of p){let term=scalar(c);for(const[k,n]of JSON.parse(mon)){const def=atoms.get(k);if(def?.function==='cos'&&n>=2){const sk=intern(`sin(${def.argument})`,{ast:op('sin',def.ast.args[0]),function:'sin',argument:def.argument});const base=plus(one(),new Map([[JSON.stringify([[sk,2]]),rat(-1)]]));let factor=one();for(let i=0;i<Math.floor(n/2);i++)factor=product(factor,base);if(n%2)factor=product(factor,new Map([[JSON.stringify([[k,1]]),ONE]]));term=product(term,factor);}else term=product(term,new Map([[JSON.stringify([[k,n]]),ONE]]));}out=plus(out,term);}return out;}
 result.n=trigReduce(result.n);result.d=trigReduce(result.d);
 return { ...result,atoms,signature:signature(result),rational:()=>{if(result.n.size===0)return ZERO;if(result.n.size===1&&result.d.size===1&&result.n.has('[]')&&result.d.has('[]'))return div(result.n.get('[]'),result.d.get('[]'),b);return null;} };
}
export function derivative(a,variable,b){b.spend();if(a.op==='q')return N(0);if(a.op==='symbol')return N(a.args[0]===variable?1:0);const [u,v]=a.args,du=derivative(u,variable,b);
 if(a.op==='+'||a.op==='-')return op(a.op,du,derivative(v,variable,b));
 if(a.op==='*')return op('+',op('*',du,v),op('*',u,derivative(v,variable,b)));
 if(a.op==='/')return op('/',op('-',op('*',du,v),op('*',u,derivative(v,variable,b))),op('^',v,N(2)));
 if(a.op==='^'){if(u.op==='symbol'&&u.args[0]==='e')return op('*',op('exp',v),derivative(v,variable,b));const n=exactRational(v,b);if(!n)throw new MathInputError('unsupported','Variable exponents are not checked for antiderivatives.');return op('*',op('*',q(n),op('^',u,q(sub(n,ONE,b)))),du);}
 const chain={exp:()=>op('exp',u),ln:()=>op('/',N(1),u),sin:()=>op('cos',u),cos:()=>op('*',N(-1),op('sin',u)),tan:()=>op('/',N(1),op('^',op('cos',u),N(2))),sinh:()=>op('cosh',u),cosh:()=>op('sinh',u),tanh:()=>op('/',N(1),op('^',op('cosh',u),N(2))),arctan:()=>op('/',N(1),op('+',N(1),op('^',u,N(2)))),sqrt:()=>op('/',N(1),op('*',N(2),op('sqrt',u)))};
 if(!chain[a.op])throw new MathInputError('unsupported','This derivative form is outside the verified capabilities.');return op('*',chain[a.op](),du);
}
