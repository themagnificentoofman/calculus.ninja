import {isBoundedJsonSnapshot} from '../server/bounded-json-snapshot.mjs';
import {CHECKERS,CURRENT_CHECKER,checkerFor} from './versioned-grade.mjs';
import sources from './checker-sources.json' with {type:'json'};
const hash=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const assert=(value,message)=>{if(!value)throw Error(message);};
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const fields=(value,keys)=>object(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key));
// Registry 1 is retained for exact historical evidence and isolated tools.
// The shipped registry 2 admits only the explicitly named current checker.
const validatedRegistries=new WeakMap();
export function admissionChecker(registry){
 const cached=validatedRegistries.get(registry);
 if(cached)return cached;
 const binding=validateRegistry(registry);
 if(isBoundedJsonSnapshot(registry))validatedRegistries.set(registry,Object.freeze(binding));
 return binding;
}
function validateRegistry(registry){
 if(registry?.version==='free-response-admission-1'){
  assert(fields(registry,['version','checkerSourceHash','records'])&&object(registry.records),'Invalid FR admission policy');
  return {checker:CHECKERS[0],sourceHash:registry.checkerSourceHash,legacy:true};
 }
 assert(registry?.version==='free-response-admission-2'&&registry.activeChecker===CURRENT_CHECKER.key,'Invalid FR admission policy');
 assert(fields(registry,['version','activeChecker','checkers','records'])&&object(registry.records)&&object(registry.checkers),'Invalid FR registry fields');
 const keys=Object.keys(registry.checkers??{});
 assert(keys.length===1&&keys[0]===CURRENT_CHECKER.key,'Unexpected active FR checker');
 const binding=registry.checkers[CURRENT_CHECKER.key];
 assert(fields(binding,['graderVersion','parserVersion','checkerSourceHash'])&&binding.graderVersion===CURRENT_CHECKER.graderVersion&&binding.parserVersion===CURRENT_CHECKER.parserVersion&&(binding.checkerSourceHash===null||hash(binding.checkerSourceHash)),'Invalid FR checker binding');
 assert(binding.checkerSourceHash===null||binding.checkerSourceHash===sources.checkers[CURRENT_CHECKER.key]?.sourceHash,'Unreviewed FR checker source');
 for(const entry of Object.values(registry.records))assert(fields(entry,['checkerKey','checkerSourceHash','recordHash','selectionHash','reviewHash'])&&entry.checkerKey===CURRENT_CHECKER.key&&hash(binding.checkerSourceHash)&&entry.checkerSourceHash===binding.checkerSourceHash,'Inactive or unbound FR checker');
 return {checker:CURRENT_CHECKER,sourceHash:binding.checkerSourceHash,legacy:false};
}
export function assertAdmissionChecker(record,entry,registry){
 const policy=admissionChecker(registry),checker=checkerFor(record.contract);
 assert(checker===policy.checker&&hash(policy.sourceHash)&&entry?.checkerSourceHash===policy.sourceHash&&(policy.legacy||entry.checkerKey===checker.key),'Unregistered free-response checker');
 return policy;
}
