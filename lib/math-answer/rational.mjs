/** Every integer operation is preceded/followed by a finite size/work bound. */
export const LIMITS=Object.freeze({source:2048,tokens:768,depth:32,nodes:384,digits:64,exponent:32,terms:256,bits:4096,steps:50000,collection:16});
export class MathInputError extends Error {constructor(kind,message){super(message);this.kind=kind;}}
export function budget(){let used=0;return {get used(){return used;},spend(n=1){used+=n;if(used>LIMITS.steps)throw new MathInputError('indeterminate','This expression needs more work than the current checker supports.');}};}
export function rat(n,d=1n,b){b?.spend();n=BigInt(n);d=BigInt(d);if(!d)throw new MathInputError('invalid','Division by zero is not a real number.');
  if(n.toString(2).length>LIMITS.bits||d.toString(2).length>LIMITS.bits)throw new MathInputError('indeterminate','The exact number is too large to check.');
  if(d<0n){n=-n;d=-d;}let a=n<0n?-n:n,c=d;while(c){b?.spend();[a,c]=[c,a%c];}return [n/a,d/a];}
export const add=(a,c,b)=>rat(a[0]*c[1]+c[0]*a[1],a[1]*c[1],b);
export const neg=a=>[-a[0],a[1]];
export const sub=(a,c,b)=>add(a,neg(c),b);
export const mul=(a,c,b)=>rat(a[0]*c[0],a[1]*c[1],b);
export const div=(a,c,b)=>rat(a[0]*c[1],a[1]*c[0],b);
export const cmp=(a,c)=>a[0]*c[1]<c[0]*a[1]?-1:a[0]*c[1]>c[0]*a[1]?1:0;
export const key=a=>`${a[0]}/${a[1]}`;
export const ZERO=[0n,1n],ONE=[1n,1n];
export function decimal(s,b){if(!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))throw new MathInputError('invalid','Enter a number.');if(s.replace('.','').length>LIMITS.digits)throw new MathInputError('indeterminate','Use at most 64 digits in one number.');const [a,c='']=s.split('.');return rat(BigInt((a||'0')+c),10n**BigInt(c.length),b);}
export function pow(a,n,b){if(!Number.isSafeInteger(n)||Math.abs(n)>LIMITS.exponent)throw new MathInputError('indeterminate','This exponent exceeds the supported work limit.');if(a[0]===0n&&n===0)throw new MathInputError('invalid','The form 0^0 needs an explicit convention and is not accepted here.');let r=ONE;for(let i=0;i<Math.abs(n);i++)r=mul(r,a,b);return n<0?div(ONE,r,b):r;}
export function integerRoot(n,b){if(n<0n)return null;if(n<2n)return n;let x=1n<<BigInt(Math.ceil(n.toString(2).length/2));for(let i=0;i<LIMITS.bits;i++){b?.spend();const y=(x+n/x)>>1n;if(y>=x)return x*x===n?x:null;x=y;}throw new MathInputError('indeterminate','Root work limit reached.');}
