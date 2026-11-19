// Private D1 authorization ledger. No public endpoint or runtime activation.
// Eligibility is supplied only by the trusted catalog validator, never a client.
import {boundedJsonSnapshot} from './bounded-json-snapshot.mjs';
import {canonical,hex} from '../bank/compact-codec.mjs';

export const AUTHORIZATION_VERSION=1;
export const AUTHORIZATION_WINDOW_MS=30000;
export const AUTHORIZATION_GC_GRACE_MS=3600000;
export const AUTHORIZATION_GC_BATCH=64;
export const AUTHORIZATION_CAP=10000;
// SQLite resolves every 'now' in one step to the same instant. Avoid floating
// multiplication of Unix seconds and the old whole-second-only clock.
export const AUTHORIZATION_CLOCK_SQL="(unixepoch('now')*1000+CAST(substr(strftime('%f','now'),4,3) AS INTEGER))";
const hashes=['intent_id','binding','request_hash','selection_hash','policy_hash'];
const fixed=[...hashes,'control_version','intent_expires'];
const proofFields=['history_token','incarnation','epoch','authorization_deadline'];
const digestFields=[...hashes,'history_token','incarnation','body_hash'];
const bodyFields=[...fixed,...proofFields,'protocol_version'];
const columns=[...bodyFields,'body_hash','authorized_at'];
const isHash=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const integer=(value,min=0,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(value)&&value>=min&&value<=max;
const time=value=>integer(value,0,8640000000000000);
const check=(ok,message)=>{if(!ok)throw Error(message);};
const snapshot=value=>boundedJsonSnapshot(value,{maxBytes:12000,maxNodes:160,maxDepth:3});
const exact=(value,fields)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===fields.length&&fields.every(key=>Object.hasOwn(value,key));
const hash=async value=>hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical(value))));
const bytes=value=>Uint8Array.from(value.match(/../g),part=>parseInt(part,16));
const primary=db=>typeof db.withSession==='function'?db.withSession('first-primary'):db;

export function authorizationIdentity(value){
 const owned=snapshot(value);
 check(exact(owned,fixed)&&hashes.every(key=>isHash(owned[key]))&&integer(owned.control_version,1)&&time(owned.intent_expires),'Invalid authorization identity');
 return owned;
}
function authorizationProof(value,expected){
 const owned=snapshot(value);
 check(exact(owned,proofFields)&&isHash(owned.history_token)&&isHash(owned.incarnation)&&integer(owned.epoch,1)&&time(owned.authorization_deadline)&&owned.authorization_deadline<=expected.intent_expires,'Invalid authorization proof');
 return owned;
}
const body=row=>Object.fromEntries(bodyFields.map(key=>[key,row[key]]));
export async function verifyAuthorizationReceipt(value,input){
 const expected=authorizationIdentity(input);
 if(value===null||value===undefined)return null;
 const row=snapshot(value);
 check(exact(row,columns)&&digestFields.every(key=>isHash(row[key]))&&row.protocol_version===AUTHORIZATION_VERSION&&integer(row.epoch,1)&&integer(row.control_version,1)&&time(row.intent_expires)&&time(row.authorization_deadline)&&time(row.authorized_at)&&row.authorized_at<row.authorization_deadline&&row.authorization_deadline<=row.intent_expires&&row.authorization_deadline-row.authorized_at<=AUTHORIZATION_WINDOW_MS,'Invalid saved authorization');
 check(fixed.every(key=>row[key]===expected[key]),'Authorization identity conflict');
 check(await hash(body(row))===row.body_hash,'Authorization integrity mismatch');
 return row;
}
export const AUTHORIZATION_SELECT_SQL=`SELECT ${columns.map(key=>digestFields.includes(key)?`lower(hex(${key})) AS ${key}`:key).join(',')} FROM round_authorizations WHERE intent_id=?`;
async function recover(db,expected){
 return verifyAuthorizationReceipt(await db.prepare(AUTHORIZATION_SELECT_SQL).bind(bytes(expected.intent_id)).first(),expected);
}
export async function recoverRoundAuthorization(database,input){
 const expected=authorizationIdentity(input);
 return recover(primary(database),expected);
}
const insertSql=`INSERT INTO round_authorizations(${columns.join(',')}) SELECT ${columns.map(key=>key==='authorized_at'?AUTHORIZATION_CLOCK_SQL:key==='protocol_version'?'1':'?').join(',')} FROM round_authorization_control c
 WHERE c.id=1 AND c.enabled=1 AND c.writing=0 AND c.gc_active=0
 AND c.incarnation=? AND c.epoch=? AND c.policy_hash=? AND c.control_version=?
 AND c.ticket_count<${AUTHORIZATION_CAP} AND ?>c.retired_before
 AND ?>${AUTHORIZATION_CLOCK_SQL} AND ?<=${AUTHORIZATION_CLOCK_SQL}+${AUTHORIZATION_WINDOW_MS}
 AND NOT EXISTS(SELECT 1 FROM round_authorizations WHERE intent_id=?) RETURNING lower(hex(intent_id)) AS intent_id`;

/** Recover first, then validate the current catalog only when no ticket exists.
 * Recovery preserves the FIRST authorization-time history guard. It does not
 * authorize activation against later history or a new Firestore control. */
export async function authorizeRound(database,input,validateCurrent){
 const expected=authorizationIdentity(input),db=primary(database);
 const existing=await recover(db,expected);
 if(existing)return Object.freeze({status:'recovered',receipt:existing});
 check(typeof validateCurrent==='function','Missing trusted eligibility validator');
 const proof=authorizationProof(await validateCurrent(expected),expected);
 const ticket={...expected,...proof,protocol_version:AUTHORIZATION_VERSION};
 ticket.body_hash=await hash(body(ticket));
 const values=columns.filter(key=>!['authorized_at','protocol_version'].includes(key)).map(key=>digestFields.includes(key)?bytes(ticket[key]):ticket[key]);
 const result=await db.batch([
  db.prepare(insertSql).bind(...values,bytes(ticket.incarnation),ticket.epoch,bytes(ticket.policy_hash),ticket.control_version,ticket.intent_expires,ticket.authorization_deadline,ticket.authorization_deadline,bytes(ticket.intent_id)),
  db.prepare(AUTHORIZATION_SELECT_SQL).bind(bytes(ticket.intent_id))
 ]);
 check(Array.isArray(result)&&result.length===2&&Array.isArray(result[0].results)&&result[0].results.length<=1&&Array.isArray(result[1].results)&&result[1].results.length<=1,'Invalid authorization database response');
 const receipt=await verifyAuthorizationReceipt(result[1].results[0],expected);
 return Object.freeze({status:receipt?(result[0].results.length===1?'authorized':'recovered-race'):'unavailable',receipt});
}

/** Select a fixed, bounded deletion set. The plan contains no account/content.
 * Apply the SAME plan on uncertain-ack retry; it cannot delete extra tickets. */
export async function planAuthorizationCollection(database){
 const db=primary(database);
 const sql=`WITH state AS (SELECT lower(hex(incarnation)) AS incarnation,${AUTHORIZATION_CLOCK_SQL}-${AUTHORIZATION_GC_GRACE_MS} AS retire_before FROM round_authorization_control WHERE id=1 AND writing=0 AND gc_active=0), expired AS (SELECT lower(hex(intent_id)) AS intent_id FROM round_authorizations WHERE intent_expires<=(SELECT retire_before FROM state) ORDER BY intent_expires,intent_id LIMIT ${AUTHORIZATION_GC_BATCH}) SELECT state.*,expired.intent_id FROM state LEFT JOIN expired ON 1=1`;
 const rows=(await db.prepare(sql).all()).results;
 check(Array.isArray(rows)&&rows.length>=1&&rows.length<=AUTHORIZATION_GC_BATCH,'Authorization collection is unavailable');
 const {incarnation,retire_before}=rows[0];
 check(isHash(incarnation)&&time(retire_before)&&rows.every(row=>row.incarnation===incarnation&&row.retire_before===retire_before),'Invalid collection snapshot');
 return collectionPlan({incarnation,retire_before,intent_ids:rows.filter(row=>row.intent_id!==null).map(row=>row.intent_id)});
}
function collectionPlan(value){
 const plan=snapshot(value);
 check(exact(plan,['incarnation','retire_before','intent_ids'])&&isHash(plan.incarnation)&&time(plan.retire_before)&&Array.isArray(plan.intent_ids)&&plan.intent_ids.length<=AUTHORIZATION_GC_BATCH&&plan.intent_ids.every(isHash)&&new Set(plan.intent_ids).size===plan.intent_ids.length,'Invalid authorization collection plan');
 return plan;
}
export async function collectRoundAuthorizations(database,input){
 const plan=collectionPlan(input),db=primary(database);
 const result=await db.batch([
  db.prepare(`UPDATE round_authorization_control SET gc_active=1,retired_before=max(retired_before,?) WHERE id=1 AND incarnation=? AND writing=0 AND gc_active=0 AND ?<=${AUTHORIZATION_CLOCK_SQL}-${AUTHORIZATION_GC_GRACE_MS}`).bind(plan.retire_before,bytes(plan.incarnation),plan.retire_before),
  db.prepare('INSERT INTO round_authorization_assert SELECT 0 WHERE NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND incarnation=? AND gc_active=1 AND retired_before>=?)').bind(bytes(plan.incarnation),plan.retire_before),
  db.prepare(`DELETE FROM round_authorizations WHERE intent_id IN (${plan.intent_ids.map(()=>'?').join(',')||'NULL'}) AND intent_expires<=? RETURNING lower(hex(intent_id)) AS intent_id`).bind(...plan.intent_ids.map(bytes),plan.retire_before),
  db.prepare('UPDATE round_authorization_control SET gc_active=0 WHERE id=1 AND incarnation=? AND gc_active=1').bind(bytes(plan.incarnation)),
  db.prepare('SELECT ticket_count,retired_before FROM round_authorization_control WHERE id=1')
 ]);
 check(Array.isArray(result[2].results)&&result[2].results.length<=plan.intent_ids.length,'Invalid authorization collection result');
 return Object.freeze({deleted:result[2].results.length,...result[4].results[0]});
}
