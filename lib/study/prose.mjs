// Explicit inline math only. Never guess whether prose is an expression.
export function studyProseParts(text){
 const parts=[];let offset=0;
 for(const match of text.matchAll(/\\\((.*?)\\\)/gs)){
  if(match.index>offset)parts.push({kind:'text',value:text.slice(offset,match.index)});
  parts.push({kind:'math',value:match[1]});offset=match.index+match[0].length;
 }
 if(offset<text.length)parts.push({kind:'text',value:text.slice(offset)});
 return parts;
}
