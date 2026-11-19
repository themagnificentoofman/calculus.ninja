export const QUESTION_ORDERS=['mcq-first','frq-first','uniform'];
export function validQuestionMix(value,count){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!['multipleChoice','freeResponse','order'].includes(k)))return false;
 return Number.isInteger(value.multipleChoice)&&value.multipleChoice>=0&&Number.isInteger(value.freeResponse)&&value.freeResponse>=0&&value.multipleChoice+value.freeResponse===count&&count>=1&&count<=20&&QUESTION_ORDERS.includes(value.order);
}
export const questionFormat=q=>q.responseFormat==='free-response'?'free-response':'multiple-choice';
export function questionMixMatches(questions,mix){
 return validQuestionMix(mix,questions.length)&&questions.filter(q=>questionFormat(q)==='free-response').length===mix.freeResponse;
}
export function questionOrderMatches(questions,mix){
 if(!questionMixMatches(questions,mix))return false;
 if(mix.order==='uniform')return true; // Randomness is verified at creation, never inferred from an outcome.
 const first=mix.order==='mcq-first'?'multiple-choice':'free-response';let changed=false;
 for(const q of questions){if(questionFormat(q)!==first)changed=true;else if(changed)return false;}return true;
}
// Rejection sampling gives each integer the same probability, avoiding modulo
// bias. Fisher–Yates then gives every complete question permutation probability 1/n!.
export function uniformIndex(upper){
 if(!Number.isInteger(upper)||upper<1||upper>20)throw Error('Invalid shuffle bound');
 const limit=Math.floor(4294967296/upper)*upper;let draw;
 do{draw=crypto.getRandomValues(new Uint32Array(1))[0];}while(draw>=limit);
 return draw%upper;
}
export function orderConfiguredQuestions(questions,mix,index=uniformIndex){
 if(!questionMixMatches(questions,mix))throw Error('Question counts do not match the requested mix');
 if(mix.order!=='uniform'){
  const first=mix.order==='mcq-first'?'multiple-choice':'free-response';
  return [...questions.filter(q=>questionFormat(q)===first),...questions.filter(q=>questionFormat(q)!==first)];
 }
 const result=[...questions];
 for(let i=result.length-1;i>0;i--){const j=index(i+1);if(!Number.isInteger(j)||j<0||j>i)throw Error('Invalid shuffle index');[result[i],result[j]]=[result[j],result[i]];}
 return result;
}

// With n remaining slots, the most frequent family can occupy at most
// ceil(n/2) isolated slots, or floor(n/2) when it follows itself. Every
// excess copy forces a contact. This bound is attained by interleaving.
function minimumContacts(items,previous,family){
 const counts=new Map();
 for(const item of items){const id=family(item);counts.set(id,(counts.get(id)??0)+1);}
 let contacts=0;
 for(const [id,count] of counts)contacts=Math.max(contacts,2*count-items.length-(id===previous?0:1));
 return contacts;
}
function orderedBlock(items,previous,family){
 const pending=[...items],ordered=[];
 while(pending.length){
  const goal=minimumContacts(pending,previous,family);
  const index=pending.findIndex((item,i)=>{
   const id=family(item);
   return Number(id===previous)+minimumContacts(pending.filter((_,j)=>i!==j),id,family)===goal;
  });
  if(index<0)throw Error('Invalid construction family ordering');
  const [item]=pending.splice(index,1);ordered.push(item);previous=family(item);
 }
 return ordered;
}
export function adjacentFamilyContacts(items,family){
 return items.reduce((count,q,i)=>count+Number(i>0&&family(q)===family(items[i-1])),0);
}
export function orderedFamilyBlocks(first,second,family){
 const original=[...first,...second];
 if(!adjacentFamilyContacts(original,family))return original;
 if(!first.length||!second.length)return orderedBlock(original,null,family);
 // Fix the last item of the first block. In reverse, its prefix and the
 // second block both start with that same neighbor and can be optimized separately.
 let bestCost=Infinity,best;
 const seen=new Set();
 for(let i=first.length-1;i>=0;i--){
  const item=first[i],id=family(item);
  if(seen.has(id))continue;
  seen.add(id);
  const prefix=first.filter((_,j)=>i!==j);
  const cost=minimumContacts(prefix,id,family)+minimumContacts(second,id,family);
  if(cost<bestCost){best={prefix,item,id};bestCost=cost;}
  if(!cost)break;
 }
 return [...orderedBlock(best.prefix.reverse(),best.id,family).reverse(),best.item,...orderedBlock(second,best.id,family)];
}
const construction=q=>q.constructionFamilyId??q.familyId??q.problemId??q;
export function orderConfiguredQuestionsV2(questions,mix,index=uniformIndex){
 if(mix.order==='uniform')return orderConfiguredQuestions(questions,mix,index);
 if(!questionMixMatches(questions,mix))throw Error('Question counts do not match the requested mix');
 const first=mix.order==='mcq-first'?'multiple-choice':'free-response';
 return orderedFamilyBlocks(questions.filter(q=>questionFormat(q)===first),questions.filter(q=>questionFormat(q)!==first),construction);
}
