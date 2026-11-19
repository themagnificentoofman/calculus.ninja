// Private bounded metadata foundation. Not a serving selector or pool admission.
import {matchesFreeResponsePracticeTag,reviewedPracticeTags} from '../bank/practice-technique-tags.mjs';
import {FR_ELIGIBLE_CATALOG_SQL,MAX_FR_REGISTRATIONS,freeResponseEligibilityPolicy} from './free-response-eligibility.mjs';
import {FR_SELECTION_FIELDS,freeResponseSelectionContentHash} from '../bank/free-response-metadata.mjs';
import {legacyPolicy,legacyEligibilitySql} from './legacy-selection.mjs';
import legacyFeatures from '../bank/legacy-features.json' with {type:'json'};
import {selectionFeatures,assertSelectionVocabularySource} from './selection-vocabulary.mjs';
import {freeResponseHistory} from './free-response-selection.mjs';
import {MAX_SELECTION_HISTORY_IDENTITIES} from '../bank/exposure.ts';
import {topics,difficulties} from './questions-policy.mjs';

export const MAX_MIXED_MC_ROWS=6000;
const MC_FIELDS=['problem_ref','problem_id','revision','content_hash','lineage_id','source_family','family_id','idea','structure','technique','combination','weight','topic','difficulty','source_release_id','active_release','tag_match'];
const MC_TEXT=MC_FIELDS.filter(k=>!['problem_ref','revision','weight','tag_match'].includes(k));
const sqlObject=fields=>`json_object(${fields.map(k=>`'${k}',${k}`).join(',')})`;
const bounded=MC_TEXT.map(k=>`COALESCE(length(CAST(${k} AS BLOB)),0)<=1024`).join(' AND ')+` AND (${MC_TEXT.map(k=>`COALESCE(length(CAST(${k} AS BLOB)),0)`).join('+')})<=4096`;
// Slots may repeat a record in composed source releases. Preserve those sources
// until the owner-side ambiguity check, rather than choosing arbitrary SQL data.
const mcEligibility=legacyEligibilitySql(`u.state='approved' AND NOT EXISTS(SELECT 1 FROM cbank_release_exclusions e JOIN cbank_releases er ON er.release_id=e.release_id WHERE e.problem_ref=b.problem_ref AND (e.release_id=(SELECT active_release FROM context) OR e.scope='global' AND er.state='published'))`);
export const MIXED_CATALOG_SQL=`WITH context AS (
 SELECT c.value AS active_release,?4 AS legacy_families,?5 AS legacy_revisions FROM cbank_config c JOIN cbank_releases r ON r.release_id=c.value WHERE c.key='active_release' AND r.state='published'
), fr AS (${FR_ELIGIBLE_CATALOG_SQL}), mc AS (
 SELECT DISTINCT b.problem_ref,b.problem_id,b.revision,lower(hex(b.content_hash)) AS content_hash,
 COALESCE(l.lineage_id,b.problem_id) AS lineage_id,p.family_id AS source_family,COALESCE(fl.construction_id,p.family_id) AS family_id,
 f.idea,f.structure,f.technique,f.combination,f.weight,p.topic,p.difficulty,p.release_id AS source_release_id,(SELECT active_release FROM context) AS active_release,
 (?6='*' OR EXISTS(SELECT 1 FROM cbank_slots ts JOIN cbank_pools tp USING(pool_id) WHERE ts.problem_ref=b.problem_ref AND tp.release_id=p.release_id AND tp.topic=p.topic AND tp.difficulty=p.difficulty AND tp.family_id=p.family_id AND tp.tag=?6)) AS tag_match
 FROM cbank_slots s JOIN cbank_problems b USING(problem_ref) JOIN cbank_publication u USING(problem_ref) JOIN cbank_pools p USING(pool_id)
 JOIN cbank_releases r ON r.release_id=p.release_id LEFT JOIN cbank_selection_features f USING(problem_ref)
 LEFT JOIN cbank_problem_lineage l USING(problem_id) LEFT JOIN cbank_family_lineage fl USING(family_id)
 WHERE p.tag='*' AND r.state='published'
 AND p.release_id IN (SELECT active_release FROM context UNION SELECT source_release_id FROM cbank_release_sources WHERE release_id=(SELECT active_release FROM context))
 AND ${mcEligibility}
 AND NOT EXISTS(SELECT 1 FROM cbank_withdrawn_families w JOIN cbank_releases wr ON wr.release_id=w.introduced_by WHERE w.source_release_id=p.release_id AND w.family_id=p.family_id AND (wr.state='published' OR w.introduced_by=(SELECT active_release FROM context)))
 ORDER BY b.problem_ref,p.release_id LIMIT ${MAX_MIXED_MC_ROWS+1}
), mc_bounded AS (SELECT *,(${bounded}) AS selection_valid FROM mc), catalog AS (
 SELECT 'multiple-choice' AS response_format,problem_id,lineage_id,selection_valid,CASE WHEN selection_valid THEN ${sqlObject(MC_FIELDS)} ELSE '{}' END AS metadata_json FROM mc_bounded
 UNION ALL SELECT 'free-response',problem_id,lineage_id,selection_valid,CASE WHEN selection_valid THEN ${sqlObject(['record_ref','record_hash',...FR_SELECTION_FIELDS])} ELSE '{}' END FROM fr
),
 -- Expand historical IDs once per coherent snapshot. Membership tests then
 -- use the materialized set for every candidate in either format.
 blocked AS MATERIALIZED (SELECT value AS id FROM json_each(?3)),
 mc_aliases AS MATERIALIZED (SELECT CASE WHEN length(CAST(a.lineage_id AS BLOB))<=256 THEN a.lineage_id ELSE NULL END AS id FROM cbank_problem_lineage a JOIN blocked b ON b.id=a.problem_id),
 fr_aliases AS MATERIALIZED (SELECT CASE WHEN length(CAST(a.lineage_id AS BLOB))<=256 THEN a.lineage_id ELSE NULL END AS id FROM frbank_records a JOIN blocked b ON b.id=a.problem_id LIMIT 8193),
 alias_invalid AS MATERIALIZED (SELECT ((SELECT count(*) FROM fr_aliases)>8192 OR EXISTS(SELECT 1 FROM mc_aliases WHERE id IS NULL) OR EXISTS(SELECT 1 FROM fr_aliases WHERE id IS NULL)) AS invalid),
 aliases AS MATERIALIZED (SELECT id FROM blocked UNION SELECT id FROM mc_aliases UNION SELECT id FROM fr_aliases)
 SELECT response_format,selection_valid,metadata_json,(problem_id IN (SELECT id FROM blocked) OR lineage_id IN (SELECT id FROM aliases)) AS history_blocked FROM catalog
 UNION ALL SELECT 'invalid-history-aliases',0,'{}',2 FROM alias_invalid WHERE invalid`;

const assert=(ok,message)=>{if(!ok)throw Error(message);};
const enc=new TextEncoder();
const text=(v,max=1024)=>typeof v==='string'&&v.length>0&&v.length<=max&&!/[\u0000-\u001f\u007f]/.test(v)&&enc.encode(v).length<=max;
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const positive=v=>Number.isSafeInteger(v)&&v>0;
const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
function mcMetadata(row,originPolicy,includeLegacy){
 assert(positive(row.problem_ref)&&positive(row.revision)&&hash(row.content_hash),'Invalid MC catalog identity');
 assert(/^cn_[a-f0-9]{20}$/.test(row.problem_id)&&text(row.lineage_id,256),'Invalid MC catalog lineage');
 assert(topics.includes(row.topic)&&difficulties.includes(row.difficulty)&&[0,1].includes(row.tag_match),'Invalid MC catalog classification');
 for(const k of ['source_family','family_id','source_release_id','active_release'])assert(text(row[k],256),'Invalid MC catalog source');
 assertSelectionVocabularySource({problemId:row.problem_id,problemRevision:row.revision,contentHash:row.content_hash,familyId:row.source_family});
 const fallback=legacyFeatures[row.source_family];
 const derived=selectionFeatures({...row,idea:row.idea||fallback?.idea||row.family_id,structure:row.structure||fallback?.structure||row.family_id,technique:row.technique||fallback?.technique||row.family_id,combination:row.combination||fallback?.combination||row.family_id,weight:row.weight??fallback?.weight??.15});
 for(const k of ['family_id','idea','structure','technique','combination'])assert(text(derived[k]),'Invalid MC catalog vocabulary');
 assert(Number.isFinite(derived.weight)&&derived.weight>0&&derived.weight<=100,'Invalid MC catalog weight');
 originPolicy.check({problemId:row.problem_id,problemRevision:row.revision,contentHash:row.content_hash,familyId:row.source_family},derived.family_id,includeLegacy);
 return derived;
}
/** One SQL snapshot, both formats and history aliases. This does NOT make the
 * later D1/Firestore issuance atomic, qualify real capacity or expose payloads.
 * A larger catalog is explicitly unsupported, never silently truncated. */
export async function eligibleMixedQuestionCatalog(db,input,recent={},now=Date.now(),admissions,originPolicy=legacyPolicy){
 const category=input?.category,difficulty=input?.difficulty,tag=input?.tag??'*',includeLegacy=input?.includeLegacy??false;
 assert((category==='all'||topics.includes(category))&&difficulties.includes(difficulty),'Invalid mixed catalog filters');
 assert(tag==='*'||typeof tag==='string'&&/^[a-z][a-z0-9-]{1,63}$/.test(tag),'Invalid mixed catalog technique');
 assert(typeof includeLegacy==='boolean','Invalid mixed legacy preference');
 const policy=freeResponseEligibilityPolicy(admissions),history=freeResponseHistory(recent,now),ids=[...history.ids];
 assert(ids.length<=MAX_SELECTION_HISTORY_IDENTITIES,'Unsupported mixed history');
 const origin=originPolicy.selection(includeLegacy);
 const result=await db.prepare(MIXED_CATALOG_SQL).bind(policy.registeredJson,policy.checkerSourceHash,JSON.stringify(ids),originPolicy.familyJson,origin.revisions,tag).all();
 const raw=result.results;
 assert(Array.isArray(raw)&&raw.length<=MAX_MIXED_MC_ROWS+MAX_FR_REGISTRATIONS,'Mixed catalog exceeds its supported bound');
 assert(!raw.some(row=>row.response_format==='invalid-history-aliases'),'Unsupported current history aliases');
 const counts={'multiple-choice':0,'free-response':0},byFormat={'multiple-choice':new Map(),'free-response':new Map()};
 for(const item of raw){
  assert(Object.hasOwn(counts,item.response_format)&&++counts[item.response_format]<=6000,'Mixed catalog exceeds its supported bound');
  assert(item.selection_valid===1&&[0,1].includes(item.history_blocked)&&typeof item.metadata_json==='string'&&item.metadata_json.length<=16000,'Unbound or oversized mixed metadata');
  let row=JSON.parse(item.metadata_json);
  if(item.response_format==='free-response'){
   assert(positive(row.record_ref)&&hash(row.record_hash)&&hash(policy.selectionHashes[row.record_hash])&&await freeResponseSelectionContentHash(row)===policy.selectionHashes[row.record_hash],'Unbound FR mixed metadata');
   // Exact original/conversion legacy admission is checked independently from
   // FR registration; opting in cannot admit unreviewed legacy mathematics.
   const source=row.source_problem_id?{problemId:row.source_problem_id,problemRevision:row.source_revision,contentHash:row.source_content_hash,familyId:row.source_family_id}:{problemId:row.problem_id,problemRevision:row.revision,contentHash:row.content_hash,familyId:row.source_family};
   try{originPolicy.check(source,row.family_id,includeLegacy);}catch(error){if(error.message==='Unreviewed legacy revision')continue;throw error;}
  }else row=mcMetadata(row,originPolicy,includeLegacy);
  const key=item.response_format==='free-response'?row.record_ref:row.problem_ref,map=byFormat[item.response_format];
  const candidate={...row,response_format:item.response_format,history_blocked:item.history_blocked};
  const previous=map.get(key);
  if(previous){
   const stable=value=>JSON.stringify(Object.fromEntries(Object.entries(value).filter(([k])=>k!=='source_release_id').sort()));
   assert(stable(previous)===stable(candidate),'Ambiguous mixed source membership');
  }else map.set(key,candidate);
 }
 const selected=[];
 for(const [format,records]of Object.entries(byFormat)){
  const latest=new Map(),maxRevision=new Map();
  for(const row of records.values())maxRevision.set(row.problem_id,Math.max(maxRevision.get(row.problem_id)||0,row.revision));
  for(const row of records.values()){
   if(row.revision!==maxRevision.get(row.problem_id))continue;
   assert(!latest.has(row.problem_id),'Ambiguous current mixed task contract');
   latest.set(row.problem_id,row);
  }
  // Supersession is resolved before topic/difficulty/history filtering.
  for(const row of latest.values())if(row.difficulty===difficulty&&(category==='all'||row.topic===category)&&(tag==='*'||(format==='multiple-choice'?(row.tag_match===1||reviewedPracticeTags(row.content_hash).includes(tag)):matchesFreeResponsePracticeTag(row,tag))))selected.push(row);
 }
 const constructions=new Map();
 for(const row of selected){const old=constructions.get(row.lineage_id);assert(!old||old===row.family_id,'Conflicting cross-format construction lineage');constructions.set(row.lineage_id,row.family_id);}
 return freeze({candidates:selected,counts,retainedIds:ids,diagnostics:{statements:1,payloadsDecoded:0,policy:'mixed-catalog-v2',complete:true}});
}
