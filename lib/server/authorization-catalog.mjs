// Private coherent authorization snapshot. Not wired to runtime creation.
import {MIXED_CATALOG_SQL,eligibleMixedQuestionCatalog} from './mixed-question-catalog.mjs';
import {registeredForCell,HISTORICAL_MC_CELL_SQL,SCOPED_MIXED_CATALOG_SQL} from './mixed-catalog-scope.mjs';
import {freeResponseEligibilityPolicy} from './free-response-eligibility.mjs';
import {boundedJsonSnapshot} from './bounded-json-snapshot.mjs';
import {selectionHistorySnapshot} from './selection-history-token.mjs';
import {AUTHORIZATION_CLOCK_SQL} from './round-authorizations.mjs';
import defaultAdmissions from './free-response-admissions.json' with {type:'json'};

const check=(ok,message)=>{if(!ok)throw Error(message);};
const hash=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const integer=(value,min,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(value)&&value>=min&&value<=max;
// This is an explicit v2 scope change: bound/review MC identities relevant to
// this requested cell, retaining ALL their eligible revisions before filtering.
// Unrelated off-cell malformed metadata does not block this request. Complete
// release qualification must still audit every cell and metadata record.
export const AUTHORIZATION_CELL_SQL=HISTORICAL_MC_CELL_SQL;
const withControl=catalogSql=>`WITH captured AS MATERIALIZED (
 SELECT epoch,enabled,writing,gc_active,lower(hex(policy_hash)) AS policy_hash,control_version,lower(hex(incarnation)) AS incarnation,retired_before,ticket_count,${AUTHORIZATION_CLOCK_SQL} AS as_of
 FROM round_authorization_control WHERE id=1
), catalog AS (${catalogSql})
 SELECT 'control' AS kind,epoch,enabled,writing,gc_active,policy_hash,control_version,incarnation,retired_before,ticket_count,as_of,NULL AS response_format,NULL AS selection_valid,NULL AS metadata_json,NULL AS history_blocked FROM captured
 UNION ALL SELECT 'candidate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,response_format,selection_valid,metadata_json,history_blocked FROM catalog`;

export const AUTHORIZATION_CATALOG_SQL=withControl(AUTHORIZATION_CELL_SQL);
export const SCOPED_AUTHORIZATION_CATALOG_SQL=withControl(SCOPED_MIXED_CATALOG_SQL);
/** Capture all requested candidates, global registered FR metadata/history
 * aliases and the exact control epoch/incarnation in ONE SQL statement. This
 * verifies metadata, not saved selected payloads or residual horizon capacity. */
export async function authorizationCatalog(database,input,recent={},options={}){
 const request=boundedJsonSnapshot(input,{maxBytes:8192,maxNodes:100,maxDepth:4}),history=selectionHistorySnapshot(recent);
 const admissions=boundedJsonSnapshot(options.admissions??defaultAdmissions,{maxBytes:4000000,maxNodes:50000,maxDepth:8});
 const expectedPolicy=options.policyHash,expectedVersion=options.controlVersion,now=options.now??Date.now(),originPolicy=options.originPolicy;
 check(hash(expectedPolicy)&&integer(expectedVersion,1),'Invalid expected catalog policy/control');
 const db=typeof database.withSession==='function'?database.withSession('first-primary'):database;
 let capture=null,queries=0;
 const registrations=registeredForCell(freeResponseEligibilityPolicy(admissions),request);
 const adapter={prepare(sql){
  check(sql===MIXED_CATALOG_SQL&&queries++===0,'Unexpected authorization catalog query');
  return {bind(...params){return {all:async()=>{
   const scoped=registrations!==null;
   if(scoped)params[0]=registrations;
   const rows=(await db.prepare(scoped?SCOPED_AUTHORIZATION_CATALOG_SQL:AUTHORIZATION_CATALOG_SQL).bind(...params,request.difficulty,request.category).all()).results;
   check(Array.isArray(rows)&&rows.length<=12002,'Authorization catalog exceeds its supported bound');
   const controls=rows.filter(row=>row.kind==='control');
   check(controls.length===1&&rows.every(row=>['control','candidate'].includes(row.kind)),'Authorization catalog control unavailable');
   check(!rows.some(row=>row.response_format==='invalid-history-aliases'),'Unsupported current history aliases');
   const r=controls[0];
   check(integer(r.epoch,1)&&r.enabled===1&&r.writing===0&&r.gc_active===0&&r.policy_hash===expectedPolicy&&r.control_version===expectedVersion&&hash(r.incarnation)&&integer(r.retired_before,0,8640000000000000)&&integer(r.ticket_count,0,10000)&&integer(r.as_of,0,8640000000000000),'Authorization catalog changed or unavailable');
   capture=Object.freeze({epoch:r.epoch,incarnation:r.incarnation,policyHash:r.policy_hash,controlVersion:r.control_version,retiredBefore:r.retired_before,ticketCount:r.ticket_count,asOf:r.as_of});
   return {results:rows.filter(row=>row.kind==='candidate').map(({response_format,selection_valid,metadata_json,history_blocked})=>({response_format,selection_valid,metadata_json,history_blocked}))};
  }};}};
 }};
 const catalog=await eligibleMixedQuestionCatalog(adapter,request,history,now,admissions,originPolicy);
 check(capture!==null,'Missing coherent catalog control');
 return Object.freeze({...catalog,authorization:capture,diagnostics:Object.freeze({...catalog.diagnostics,policy:registrations===null?'mixed-catalog-cell-v2':'mixed-catalog-cell-v3',scope:registrations===null?'requested-mc-identities-and-all-registered-fr':'all-revisions-of-registered-requested-identities'})});
}
