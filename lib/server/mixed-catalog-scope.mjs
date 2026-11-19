// Private query scope for new practice. The global catalog remains the release
// audit. Candidate filtering never uses a topic or difficulty supplied by D1.
import {MIXED_CATALOG_SQL,MAX_MIXED_MC_ROWS,eligibleMixedQuestionCatalog} from './mixed-question-catalog.mjs';
import {freeResponseEligibilityPolicy} from './free-response-eligibility.mjs';
import compiledCells from './free-response-catalog-cells.json' with {type:'json'};
import {topics,difficulties} from './questions-policy.mjs';

const begin=MIXED_CATALOG_SQL.indexOf('), mc AS (');
const from=MIXED_CATALOG_SQL.indexOf(' FROM cbank_slots s',begin);
const order=MIXED_CATALOG_SQL.indexOf(' ORDER BY b.problem_ref,p.release_id',from);
const wildcard="WHERE p.tag='*' AND r.state='published'";
if(begin<0||from<begin||order<from||!MIXED_CATALOG_SQL.includes(wildcard))throw Error('Catalog SQL structure changed');
const source=MIXED_CATALOG_SQL.slice(from,order);
const wanted=`), mc_requested AS MATERIALIZED (SELECT DISTINCT b.problem_id ${source} AND p.difficulty=?7 AND (?8='all' OR p.topic=?8)), fr AS (`;
export const HISTORICAL_MC_CELL_SQL=MIXED_CATALOG_SQL.replace(wildcard,wildcard+' AND b.problem_id IN (SELECT problem_id FROM mc_requested)').replace('), fr AS (',wanted);
// Preserve the supported whole-catalog bound even on a narrow request. One
// physical row may occur in more than one source release, as in the global SQL.
const ceiling=`), mc_size AS MATERIALIZED (SELECT DISTINCT b.problem_ref,p.release_id,p.topic,p.difficulty,p.family_id ${source} LIMIT ${MAX_MIXED_MC_ROWS+1}), mc_requested AS MATERIALIZED (`;
export const SCOPED_MIXED_CATALOG_SQL=HISTORICAL_MC_CELL_SQL.replace('), mc_requested AS MATERIALIZED (',ceiling)
 +` UNION ALL SELECT 'catalog-overflow',0,'{}',0 WHERE EXISTS(SELECT 1 FROM mc_size LIMIT 1 OFFSET ${MAX_MIXED_MC_ROWS})`;

const compiledCache=new WeakMap();
/** The offline compiler establishes the cell from the exact selection hash.
 * If a receipt is new to this build, the global, independently verified policy
 * still works. Include every revision of a requested identity before resolving
 * supersession. Historical aliases continue to use the full database. */
export function registeredForCell(policy,input,index=compiledCells){
 if(!policy.count||index?.version!==1||!index.cells)return null;
 const cacheable=index===compiledCells;
 let groups=cacheable?compiledCache.get(policy):undefined;
 if(groups===undefined){
  groups=new Map();
  for(const row of JSON.parse(policy.registeredJson)){
   const [id,,,recordHash]=row;
   const cell=index.cells[policy.selectionHashes[recordHash]];
   if(!cell){groups=null;break;}
   if(!Array.isArray(cell)||cell.length!==2||!topics.includes(cell[0])||!difficulties.includes(cell[1]))throw Error('Invalid registered practice cell');
   let group=groups.get(id);
   if(!group){group={rows:[],cells:[]};groups.set(id,group);}
   group.rows.push(row);group.cells.push(cell);
  }
  if(cacheable)compiledCache.set(policy,groups);
 }
 if(!groups)return null;
 const subset=[];
 for(const {rows,cells} of groups.values())if(cells.some(([topic,level])=>level===input.difficulty&&(input.category==='all'||topic===input.category)))subset.push(...rows);
 return JSON.stringify(subset);
}

export async function eligiblePracticeCatalog(db,input,recent,now,admissions,originPolicy,index=compiledCells){
 const policy=freeResponseEligibilityPolicy(admissions);
 const registrations=registeredForCell(policy,input,index);
 if(registrations===null)return eligibleMixedQuestionCatalog(db,input,recent,now,admissions,originPolicy);
 const adapter={prepare(sql){
  if(sql!==MIXED_CATALOG_SQL)throw Error('Unexpected practice catalog query');
  return {bind:(_registered,...rest)=>db.prepare(SCOPED_MIXED_CATALOG_SQL).bind(registrations,...rest,input.difficulty,input.category)};
 }};
 const catalog=await eligibleMixedQuestionCatalog(adapter,input,recent,now,admissions,originPolicy);
 return Object.freeze({...catalog,diagnostics:Object.freeze({...catalog.diagnostics,policy:'mixed-catalog-cell-v3'})});
}
