import {readBoundedJson} from './questions-policy.mjs';
import {roundIdentity,RoundIntentError} from './round-intents.ts';
import {JointSelectionError} from './joint-selection-error.mjs';
import {ReservationConflictError} from '../bank/issuance-reservations.mjs';
import {BankUnavailableError} from './bank-selection.ts';

type Workflow={prepare:(uid:string,id:string,request:unknown)=>Promise<any>;activate:(uid:string,id:string,request:unknown)=>Promise<any>;cancel:(uid:string,id:string,request:unknown)=>Promise<any>};
const respond=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const validId=(value:unknown):value is string=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const messages:Record<string,string>={
 INVALID_ROUND_REQUEST:'Choose a supported round configuration and try again.',
 ROUND_REQUEST_CHANGED:'This pending round has different settings. Resume or cancel it before starting another.',
 ROUND_NOT_PREPARED:'This pending round is no longer available. Start a new round.',
 ROUND_TYPE_UNAVAILABLE:'This round type is currently unavailable.',
 ROUND_SELECTION_LIMIT:'Question selection limit reached. Please try again later.',
 ROUND_CREATION_UNAVAILABLE:'New rounds are temporarily unavailable. Please try again later.',
 ROUND_CLOCK_UNAVAILABLE:'This round could not start yet. Please retry.',
 ROUND_STATE_UNAVAILABLE:'Your round could not be loaded. Please refresh and try again.',
 ROUND_HISTORY_UNAVAILABLE:'Your recent rounds could not be loaded. Please try again later.',
 ROUND_HISTORY_CHANGED:'Your recent rounds changed. Resume an existing round or cancel this pending round before trying again.',
 ROUND_RESERVATION_CHANGED:'This pending round changed. Resume an existing round or cancel this one before trying again.',
 ROUND_CREATION_CHANGED:'The available rounds changed. Cancel this pending round before trying again.',
 ROUND_POLICY_CHANGED:'The available problems changed. Cancel this pending round before trying again.',
 ROUND_AUTHORIZATION_CHANGED:'This pending round could not start. Please retry, or cancel it to choose a new round.',
 ROUND_AUTHORIZATION_REQUIRED:'This pending round could not start. Please retry.',
};

/** Authenticate each action, bind the account on the server, and expose only
 * opaque preparation/round identities. Private snapshots never cross this API. */
export function createRoundApi(deps:{verify:(token:string)=>Promise<Record<string,any>>;workflow:Workflow;mutationQuota:(uid:string)=>Promise<boolean>}){
 return async(request:Request)=>{
  if(request.method!=='POST')return respond({error:'Use POST.'},405);
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin||request.headers.get('sec-fetch-site')==='cross-site')return respond({error:'Request origin is not allowed.'},403);
  const bearer=/^Bearer ([^\s]+)$/.exec(request.headers.get('authorization')||'');
  if(!bearer||bearer[1].length>8192)return respond({error:'Please sign in.'},401);
  let uid:string;
  try{
   const claims=await deps.verify(bearer[1]);uid=claims.sub;
   if(typeof uid!=='string'||!/^[a-zA-Z0-9_-]{5,128}$/.test(uid)||['__proto__','constructor','prototype'].includes(uid))throw Error('Invalid identity');
  }catch{return respond({error:'Your sign-in has expired. Please sign in again.'},401);}
  try{
   let body:any;
   try{body=await readBoundedJson(request,10000);}catch{return respond({error:'Send a valid round request.'},400);}
   if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).length!==3||!['action','operationId','request'].every(key=>Object.hasOwn(body,key))||!['prepare','activate','cancel'].includes(body.action))return respond({error:'Send a valid round request.'},400);
   // Validate/own the request before charging mutation quota or invoking a
   // workflow. Revalidation inside the service protects non-HTTP callers too.
   let identity;
   try{identity=await roundIdentity(uid,body.operationId,body.request);}catch{return respond({error:messages.INVALID_ROUND_REQUEST,code:'INVALID_ROUND_REQUEST'},400);}
   if(!await deps.mutationQuota(uid))return respond({error:'Too many requests. Please wait a moment and retry.',code:'ROUND_REQUEST_LIMIT'},429);
   const result=await deps.workflow[body.action as keyof Workflow](uid,identity.operationId,identity.request);
   if(body.action==='activate'){
    if(!validId(result?.id)||result.id!==identity.id)throw Error('Invalid activated round response');
    return respond({id:result.id});
   }
   if(!validId(result?.questionSetId)||result.questionSetId!==identity.id||result.questionCount!==identity.request.count||!['PREPARED','ISSUED','CANCELLED','EXPIRED'].includes(result?.status))throw Error('Invalid preparation response');
   return respond({questionSetId:result.questionSetId,questionCount:result.questionCount,status:result.status});
  }catch(error){
   if(error instanceof RoundIntentError&&Object.hasOwn(messages,error.code))return respond({error:messages[error.code],code:error.code},error.code==='ROUND_SELECTION_LIMIT'?429:error.code==='INVALID_ROUND_REQUEST'?400:409);
   if(error instanceof JointSelectionError&&error.code==='joint-catalog-changed')return respond({error:messages.ROUND_POLICY_CHANGED,code:'ROUND_POLICY_CHANGED'},409);
   if(error instanceof JointSelectionError||error instanceof BankUnavailableError)return respond({error:'This question mix is currently unavailable. Try another topic or mix.',code:'INSUFFICIENT_CONTENT'},409);
   if(error instanceof ReservationConflictError)return respond({error:'Finish or resume an existing round before starting another.',code:'PENDING_ROUNDS'},409);
   return respond({error:'The server could not finish this round request. Please retry.',code:'ROUND_RETRY'},503);
  }
 };
}
