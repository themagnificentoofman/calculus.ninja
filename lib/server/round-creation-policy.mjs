// Private compiled identity, never user-selectable policy. Source fingerprints
// are checked at build time; the runtime binds the same manifest and registry.
import manifest from './round-creation-policy.json' with {type:'json'};
import admissions from './free-response-admissions.json' with {type:'json'};
import {boundedJsonSnapshot} from './bounded-json-snapshot.mjs';
import {frDigest} from '../bank/free-response-record.mjs';
const owned=boundedJsonSnapshot(manifest,{maxBytes:100000,maxNodes:3000,maxDepth:8});
const registry=boundedJsonSnapshot(admissions,{maxBytes:4000000,maxNodes:50000,maxDepth:8});
let validated;
export async function roundCreationPolicy(difficulty){
 if(typeof difficulty!=='string'||!Object.hasOwn(owned.policy.rounds,difficulty))throw Error('Unsupported practice difficulty');
 validated??=(async()=>{
  const {digest,...body}=owned;
  if(body.version!=='round-creation-policy-v1'||digest!==await frDigest(body)||body.registryHash!==await frDigest(registry))throw Error('Round creation policy is unavailable');
  return Object.freeze({selectionPolicyHash:digest,registryHash:body.registryHash});
 })();
 return Object.freeze({...await validated,rounds:owned.policy.rounds[difficulty]});
}
