// Administrative transitions for the first combined Milestone 4 import.
// The signed caller chooses an operation. Its expected and destination states
// are constructed exclusively from the installed release and permanent policy.
import {applyRoundControl,inspectRoundControl} from '../../scripts/milestone4/round-control.mjs';
import {m4ReleaseBudget} from './content-release-budget.mjs';
import {digest} from './bank-pilot.mjs';
const route='/api/content-release/control';
const operations=['inspect','install-disabled','enable','disable'];
const respond=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export const controlMessage=(bundle,time,hash)=>['calculus-ninja-m4-round-release-v1',m4ReleaseBudget.projectId,bundle,'POST',route,time,hash].join('\n');

export async function releaseControl(request,{plan,policy,publicKey,expiresAt,db,store}){
 const expiry=Number(expiresAt);
 if(!publicKey||!Number.isFinite(expiry)||Date.now()>=expiry||!db||!store||
    plan?.format!=='content-delta-v4'||plan.approvedBudget!==m4ReleaseBudget.id||
    plan.projectId!==m4ReleaseBudget.projectId||plan.priorOperation?.bundleId!==m4ReleaseBudget.priorBundleId||
    plan.freeResponse?.firstImport!==true||plan.catalogWriter?.policyHash!==policy.digest)return respond({error:'Unavailable'},404);
 if(request.method!=='POST'||request.headers.has('origin')||new URL(request.url).pathname!==route)return respond({error:'Forbidden'},403);
 let action;
 try{
  const time=request.headers.get('x-bank-time')||'',hash=request.headers.get('x-bank-body-sha256')||'',signature=request.headers.get('x-bank-signature')||'';
  if(!/^\d{13}$/.test(time)||Math.abs(Date.now()-Number(time))>60000||!/^[0-9a-f]{64}$/.test(hash)||!/^[A-Za-z0-9+/]{86}==$/.test(signature))throw Error();
  const key=await crypto.subtle.importKey('spki',Uint8Array.from(atob(publicKey),c=>c.charCodeAt(0)),'Ed25519',false,['verify']);
  if(!await crypto.subtle.verify('Ed25519',key,Uint8Array.from(atob(signature),c=>c.charCodeAt(0)),new TextEncoder().encode(controlMessage(plan.bundleId,time,hash))))throw Error();
  // Resolve only four small constant payloads. Never consume an unbounded body.
  for(const value of operations){
   const text=JSON.stringify({action:value});
   if(await digest(new TextEncoder().encode(text))===hash){action=value;break;}
  }
  if(!action||!request.body)throw Error();
  const expected=new TextEncoder().encode(JSON.stringify({action})),reader=request.body.getReader();
  let n=0;
  try{while(true){const {value,done}=await reader.read();if(done)break;
   if(n+value.length>expected.length||value.some((byte,i)=>byte!==expected[n+i])){await reader.cancel();throw Error();}
   n+=value.length;}
  }finally{reader.releaseLock();}
  if(n!==expected.length||Date.now()>=expiry)throw Error();
 }catch{return respond({error:'Invalid authentication or operation'},403);}
 try{
  const auth=plan.catalogWriter,incarnation=auth.incarnation,policyHash=auth.policyHash;
  if(auth.initialEpoch!==1||auth.controlVersion!==1||auth.enabled!==0)throw Error('Invalid initial authority');
  if(action==='inspect')return respond({bundle:plan.bundleId,control:await inspectRoundControl(store,db)});
  const finalEpoch=auth.initialEpoch+plan.batches.length+1;
  const enabled=action==='disable',version=enabled?2:1;
  const expected=action==='install-disabled'?{firestore:null,catalog:null}:{
   firestore:{version,enabled},catalog:{version,enabled,incarnation,policyHash,epoch:finalEpoch+Number(enabled)}
  };
  const database=db.withSession?db.withSession('first-primary'):db;
  const verifyRelease=async()=>{
   const sql="SELECT l.verified,l.activated,l.next_sequence,l.halted,l.pending_id,c.value AS release FROM cbank_delta_ledger l JOIN cbank_config c ON c.key='active_release' WHERE l.bundle_id=?";
   const rows=await database.prepare(sql).bind(plan.bundleId).all();
   const ledger=rows.results[0],steps=plan.batches.length+plan.pages.length+plan.tableHashes.length+plan.cells.length;
   return !!ledger&&ledger.verified===1&&ledger.activated===1&&!ledger.halted&&!ledger.pending_id&&ledger.release===plan.release&&ledger.next_sequence===steps;
  };
  const result=await applyRoundControl(store,database,{action,expected,incarnation,policyHash},verifyRelease);
  return respond({bundle:plan.bundleId,action,control:result});
 }catch{return respond({error:'Control transition could not be reconciled. Inspect the saved controls and signed ledger.'},409);}
}
