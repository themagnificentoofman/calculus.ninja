// Explicit nested projections: even local draft readers never send private
// authoring metadata, verification records or bank assignments to the client.
export function publicStudyBlocks(blocks){
 return blocks.map(block=>{
  if(block.kind==='prose')return {kind:'prose',text:block.text};
  if(block.kind==='math')return {kind:'math',latex:block.latex};
  if(block.kind==='diagram')return {kind:'diagram',id:block.id};
  throw Error('Unknown public study block');
 });
}
export const publicStudySections=sections=>sections.map(({id,title,body})=>({id,title,body:publicStudyBlocks(body)}));
export const publicStudyExample=({id,revision,title,problem,solution})=>({id,revision,title,problem:publicStudyBlocks(problem),solution:publicStudyBlocks(solution)});
