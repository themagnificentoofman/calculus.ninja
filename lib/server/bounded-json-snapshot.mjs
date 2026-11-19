// Detach trusted in-process data without running getters or silently dropping
// hidden/symbol fields. This is not a sandbox for executable Proxy objects.
const encoder=new TextEncoder();
// Only completed roots created by this module carry a size and deep-immutability proof.
const snapshotLimits=new WeakMap();
export function isBoundedJsonSnapshot(value){
 return snapshotLimits.has(value);
}
const fail=()=>{throw Error('Expected bounded plain JSON data');};
/** @template T
 * @param {T} value
 * @param {{maxBytes:number,maxNodes?:number,maxDepth?:number}} options
 * @returns {T}
 */
export function boundedJsonSnapshot(value,{maxBytes,maxNodes=8192,maxDepth=32}={}){
 if(!Number.isSafeInteger(maxBytes)||maxBytes<=0)fail();
 const known=snapshotLimits.get(value);
 if(known){
  if(known.bytes>maxBytes||known.nodes>maxNodes||known.depth>maxDepth)fail();
  return value;
 }
 let bytes=0,nodes=0,deepest=0;const ancestors=new Set();
 const charge=n=>{bytes+=n;if(bytes>maxBytes)fail();};
 const string=s=>{if(s.length>maxBytes)fail();charge(encoder.encode(JSON.stringify(s)).length);return s;};
 const visit=(v,depth)=>{
  if(++nodes>maxNodes||depth>maxDepth)fail();
  deepest=Math.max(deepest,depth);
  if(v===null){charge(4);return null;}
  if(typeof v==='string')return string(v);
  if(typeof v==='boolean'){charge(v?4:5);return v;}
  if(typeof v==='number'){if(!Number.isFinite(v))fail();charge(String(v).length);return v;}
  if(typeof v!=='object'||ancestors.has(v))fail();
  const array=Array.isArray(v),proto=Object.getPrototypeOf(v);
  if(array?proto!==Array.prototype:proto!==Object.prototype&&proto!==null)fail();
  const keys=Reflect.ownKeys(v);
  if(keys.length>maxNodes-nodes+1)fail();
  if(array&&(!Number.isSafeInteger(v.length)||keys.length!==v.length+1))fail();
  const out=array?[]:{};ancestors.add(v);charge(2);let count=0;
  for(const key of keys){
   if(array&&key==='length')continue;
   const desc=Object.getOwnPropertyDescriptor(v,key);
   if(typeof key!=='string'||!desc?.enumerable||!Object.hasOwn(desc,'value'))fail();
   if(array&&(!/^(0|[1-9][0-9]*)$/.test(key)||Number(key)>=v.length))fail();
   if(count++)charge(1);
   if(!array){string(key);charge(1);}
   Object.defineProperty(out,key,{value:visit(desc.value,depth+1),enumerable:true,writable:false,configurable:false});
  }
  ancestors.delete(v);return Object.freeze(out);
 };
 const result=visit(value,0);
 if(result!==null&&typeof result==='object')snapshotLimits.set(result,{bytes,nodes,depth:deepest});
 return result;
}
