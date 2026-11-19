import {matchesFreeResponsePracticeTag} from '../bank/practice-technique-tags.mjs';
import {isBoundedJsonSnapshot} from './bounded-json-snapshot.mjs';
import {admissionChecker} from '../math-answer/admission-checker.mjs';
import {assertNoHeldAssessmentRevisions} from '../bank/free-response-assessment-holds.mjs';
import defaultAdmissions from './free-response-admissions.json' with {type:'json'};
import {MAX_SELECTION_HISTORY_IDENTITIES} from '../bank/exposure.ts';
import {topics,difficulties} from './questions-policy.mjs';
import {FR_SELECTION_FIELDS,MAX_FR_METADATA_FIELD_BYTES,MAX_FR_METADATA_TEXT_BYTES,freeResponseSelectionContentHash} from '../bank/free-response-metadata.mjs';

export const MAX_FR_REGISTRATIONS=6000,MAX_FR_REGISTRATION_BYTES=1500000;
const assert=(condition,message)=>{if(!condition)throw Error(message);};
const hash=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
/** Exact compiled contracts enter SQL eligibility before any counting. An old
 * receipt or a same-ID contract is not a substitute for the current hash. */
const immutablePolicies=new WeakMap();
export function freeResponseEligibilityPolicy(admissions=defaultAdmissions){
 const cached=immutablePolicies.get(admissions);
 if(cached)return cached;
 const policy=compileEligibilityPolicy(admissions);
 if(isBoundedJsonSnapshot(admissions))immutablePolicies.set(admissions,policy);
 return policy;
}
function compileEligibilityPolicy(admissions){
 const binding=admissionChecker(admissions);
 assert(admissions.records&&typeof admissions.records==='object'&&!Array.isArray(admissions.records),'Invalid FR admission policy');
 const entries=Object.entries(admissions.records);assert(entries.length<=MAX_FR_REGISTRATIONS,'FR registration catalog exceeds its supported bound');
 assertNoHeldAssessmentRevisions(admissions);
 if(!entries.length)return Object.freeze({checkerSourceHash:null,registeredJson:'[]',count:0,selectionHashes:Object.freeze({})});
 assert(hash(binding.sourceHash),'Unreviewed FR checker');
 const seen=new Set(),registered=[],selectionHashes={};
 for(const [key,entry]of entries){
  const match=/^(cn_[a-f0-9]{20})@([1-9][0-9]*)#([a-z][a-z0-9-]{1,100})$/.exec(key),revision=Number(match?.[2]);
  assert(binding.legacy||entry?.checkerKey===binding.checker.key,'Inactive FR checker');
  assert(match&&Number.isSafeInteger(revision)&&hash(entry?.recordHash)&&hash(entry.selectionHash)&&hash(entry.reviewHash)&&entry.checkerSourceHash===binding.sourceHash,'Invalid registered FR identity');
  assert(!seen.has(entry.recordHash),'Duplicate registered FR record');seen.add(entry.recordHash);
  registered.push([match[1],revision,match[3],entry.recordHash,entry.reviewHash]);
  selectionHashes[entry.recordHash]=entry.selectionHash;
 }
 const registeredJson=JSON.stringify(registered);
 assert(new TextEncoder().encode(registeredJson).length<=MAX_FR_REGISTRATION_BYTES,'FR registration data exceeds its supported bound');
 return Object.freeze({checkerSourceHash:binding.sourceHash,registeredJson,count:entries.length,selectionHashes:Object.freeze(selectionHashes)});
}

// SQL applies exact registration/receipt and current source eligibility first.
// Worker verification of derived metadata precedes all counts and filters.
export const FR_ELIGIBLE_CTE=`WITH registered AS (
 SELECT json_extract(value,'$[0]') AS problem_id,json_extract(value,'$[1]') AS revision,
 json_extract(value,'$[2]') AS contract_id,json_extract(value,'$[3]') AS record_hash,json_extract(value,'$[4]') AS review_hash FROM json_each(?1)
), mc_context AS (
 SELECT c.value AS active_release FROM cbank_config c JOIN cbank_releases r ON r.release_id=c.value
 WHERE c.key='active_release' AND r.state='published'
), eligible AS (
 SELECT b.record_ref,b.problem_id,b.revision,b.contract_id,lower(hex(b.record_hash)) AS record_hash,
 lower(hex(b.content_hash)) AS content_hash,lower(hex(b.contract_hash)) AS contract_hash,b.topic,b.difficulty,
 b.family_id AS source_family,b.construction_id AS family_id,b.lineage_id,m.idea,m.structure,m.technique,m.combination,
 m.source_release_id,m.source_family_id,m.source_difficulty,m.source_problem_id,m.source_revision,m.source_content_hash
 FROM registered a JOIN frbank_records b ON b.problem_id=a.problem_id AND b.revision=a.revision AND b.contract_id=a.contract_id AND lower(hex(b.record_hash))=a.record_hash
 JOIN frbank_selection_metadata m ON m.record_ref=b.record_ref AND m.record_hash=b.record_hash
 WHERE EXISTS(SELECT 1 FROM frbank_admission_receipts r WHERE r.record_ref=b.record_ref AND lower(hex(r.review_hash))=a.review_hash AND lower(hex(r.checker_source_hash))=?2)
 AND NOT EXISTS(SELECT 1 FROM frbank_withdrawals w WHERE w.record_ref=b.record_ref)
 AND ((b.mc_problem_ref IS NULL AND m.source_release_id IS NULL) OR (b.mc_problem_ref IS NOT NULL AND EXISTS(
  SELECT 1 FROM cbank_problems source JOIN cbank_publication u USING(problem_ref)
  JOIN cbank_slots s USING(problem_ref) JOIN cbank_pools p USING(pool_id) JOIN cbank_releases r ON r.release_id=p.release_id
  LEFT JOIN cbank_family_lineage fl ON fl.family_id=p.family_id LEFT JOIN cbank_problem_lineage pl ON pl.problem_id=source.problem_id
  WHERE source.problem_ref=b.mc_problem_ref AND u.state='approved' AND r.state='published' AND p.tag='*'
  AND source.problem_id=m.source_problem_id AND source.revision=m.source_revision AND lower(hex(source.content_hash))=m.source_content_hash
  AND p.release_id=m.source_release_id AND p.family_id=m.source_family_id AND p.difficulty=m.source_difficulty
  AND COALESCE(fl.construction_id,p.family_id)=b.construction_id AND COALESCE(pl.lineage_id,source.problem_id)=b.lineage_id
  AND p.release_id IN (SELECT active_release FROM mc_context UNION SELECT source_release_id FROM cbank_release_sources WHERE release_id=(SELECT active_release FROM mc_context))
  AND NOT EXISTS(SELECT 1 FROM cbank_release_exclusions e JOIN cbank_releases er ON er.release_id=e.release_id WHERE e.problem_ref=source.problem_ref AND (e.release_id=(SELECT active_release FROM mc_context) OR e.scope='global' AND er.state='published'))
  AND NOT EXISTS(SELECT 1 FROM cbank_withdrawn_families w JOIN cbank_releases wr ON wr.release_id=w.introduced_by WHERE w.source_release_id=p.release_id AND w.family_id=p.family_id AND (wr.state='published' OR w.introduced_by=(SELECT active_release FROM mc_context)))
 )))
 )`;

const textFields=FR_SELECTION_FIELDS.filter(key=>!['revision','source_revision'].includes(key));
const validMetadataSql=textFields.map(key=>`COALESCE(length(CAST(${key} AS BLOB)),0)<=${MAX_FR_METADATA_FIELD_BYTES}`).join(' AND ')+
 ` AND (${textFields.map(key=>`COALESCE(length(CAST(${key} AS BLOB)),0)`).join('+')})<=${MAX_FR_METADATA_TEXT_BYTES}`;
// Bad rows return an explicit flag and no unbounded strings, so the Worker can
// fail closed without materializing hundreds of MB from a corrupt index.
export const FR_ELIGIBLE_CATALOG_SQL=FR_ELIGIBLE_CTE+`, bounded AS (SELECT *,(${validMetadataSql}) AS selection_valid FROM eligible)
 SELECT record_ref,record_hash,selection_valid,${FR_SELECTION_FIELDS.map(key=>`CASE WHEN selection_valid THEN ${key} ELSE NULL END AS ${key}`).join(',')}
 FROM bounded ORDER BY record_ref LIMIT ${MAX_FR_REGISTRATIONS+1}`;

// One SQLite statement observes current eligibility and current history aliases
// in the same read snapshot. The flag stays private and is outside metadata.
export const FR_CURRENT_CATALOG_SQL=`WITH catalog AS (${FR_ELIGIBLE_CATALOG_SQL}),blocked AS (SELECT value AS id FROM json_each(?3))
 SELECT catalog.*,(
 problem_id IN (SELECT id FROM blocked) OR lineage_id IN (SELECT id FROM blocked)
 OR EXISTS(SELECT 1 FROM cbank_problem_lineage l WHERE l.problem_id IN (SELECT id FROM blocked) AND l.lineage_id=catalog.lineage_id)
 OR EXISTS(SELECT 1 FROM frbank_records r WHERE r.problem_id IN (SELECT id FROM blocked) AND r.lineage_id=catalog.lineage_id)
 ) AS history_blocked FROM catalog`;

/** Bounded private metadata only; this foundation does not qualify or activate
 * a pool, select a round, expose a payload, or alter stored history. */
export async function eligibleFreeResponseCatalog(db,input,policy=freeResponseEligibilityPolicy(),retainedIds){
 assert(input&&(input.category==='all'||topics.includes(input.category))&&difficulties.includes(input.difficulty),'Invalid FR filters');
 const tag=input.tag??'*';assert(tag==='*'||typeof tag==='string'&&/^[a-z][a-z0-9-]{1,63}$/.test(tag),'Invalid FR technique');
 if(!policy.count)return [];
 if(retainedIds!==undefined)assert(Array.isArray(retainedIds)&&retainedIds.length<=MAX_SELECTION_HISTORY_IDENTITIES&&Array.from(retainedIds).every(id=>typeof id==='string'&&id.length>0&&id.length<=256&&new TextEncoder().encode(id).length<=256),'Invalid retained history identities');
 const rows=(await db.prepare(retainedIds===undefined?FR_ELIGIBLE_CATALOG_SQL:FR_CURRENT_CATALOG_SQL).bind(policy.registeredJson,policy.checkerSourceHash,...(retainedIds===undefined?[]:[JSON.stringify(retainedIds)])).all()).results;
 assert(rows.length<=MAX_FR_REGISTRATIONS,'FR eligible catalog exceeds its supported bound');
 for(const row of rows)assert(row.selection_valid===1&&hash(policy.selectionHashes[row.record_hash])&&await freeResponseSelectionContentHash(row)===policy.selectionHashes[row.record_hash],'Unbound or oversized FR selection metadata');
 // First discard superseded revisions of the SAME task, even when its
 // corrected classification or lineage changed. Distinct tasks sharing one
 // exposure lineage may remain useful at different difficulty levels.
 const latestRevision=new Map(),latest=new Map();
 for(const row of rows)latestRevision.set(row.problem_id,Math.max(row.revision,latestRevision.get(row.problem_id)??0));
 for(const row of rows)if(row.revision===latestRevision.get(row.problem_id)){
  assert(!latest.has(row.problem_id),'Ambiguous current FR grading contract');latest.set(row.problem_id,row);
 }
 const normalized=new Map();
 for(const row of latest.values()){
  if(row.difficulty!==input.difficulty||input.category!=='all'&&row.topic!==input.category||!matchesFreeResponsePracticeTag(row,tag))continue;
  const old=normalized.get(row.lineage_id);
  if(!old||row.revision>old.revision||row.revision===old.revision&&row.record_ref<old.record_ref)normalized.set(row.lineage_id,row);
 }
 return [...normalized.values()].sort((a,b)=>a.family_id.localeCompare(b.family_id)||a.lineage_id.localeCompare(b.lineage_id));
}
