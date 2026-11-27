import {aggregateFeasibility,normalizeJointCatalog,rollingReserveSchedule} from './joint-selection.mjs';
import {selectJointMetadataV2} from './joint-selection-v2.mjs';

const fits=(catalog,mix,rounds)=>aggregateFeasibility(catalog,mix.multipleChoice*rounds,mix.freeResponse*rounds,2*rounds).feasible;

// H successive starts with an H-round window use at most 2H−1 rounds.
function availableRounds(catalog,mix,required){
 let rounds=2*required-1;
 while(rounds>required&&!fits(catalog,mix,rounds))rounds--;
 return rounds;
}

export function preservesRollingReserve(catalog,remaining,mix,required){
 return fits(remaining,mix,availableRounds(catalog,mix,required)-1);
}

export function selectJointMetadataV3(catalog,mix,options={},normalized=normalizeJointCatalog(catalog,options.blocked)){
 const original=selectJointMetadataV2(catalog,mix,options);
 const required=options.rounds,planningRounds=availableRounds(normalized,mix,required);
 const used=new Set(original.selected.map(row=>row.lineage));
 const remainder={...normalized,lineages:normalized.lineages.filter(group=>!used.has(group.lineage))};
 if(planningRounds===required||fits(remainder,mix,planningRounds-1))return {...original,planningRounds};
 // Reserve whole disjoint later rounds. The original sampler can still choose
 // and order a full current window from the unreserved pool.
 const witness=rollingReserveSchedule(normalized,mix,planningRounds,options);
 const blocked=new Set(options.blocked);
 for(const round of witness.slice(required))for(const item of round)blocked.add(item.lineage);
 return {...selectJointMetadataV2(catalog,mix,{...options,blocked}),planningRounds};
}
