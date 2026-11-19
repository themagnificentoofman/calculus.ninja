import {boundedJsonSnapshot} from '../server/bounded-json-snapshot.mjs';
/** Durable first accepted display time, aligned to the original event. Upload
 * receipt, a new browser segment and eviction from bankRecent cannot refresh it.
 * Historical captures that already reported a display but lack this field use
 * round creation as the earliest plausible clock; they are never backfilled
 * with a fresh replay-time exposure. This metadata does not alter replay events.
 */
export function rememberFirstDisplayTime(summary: {firstDisplayAt?: Array<number|null>}, index:number, alignedAt:number, createdAt:number, previouslyObserved:boolean,receivedAt:number):number {
 if(!Number.isInteger(index)||index<0||index>=20||![alignedAt,createdAt,receivedAt].every(Number.isFinite)||createdAt<0||alignedAt<createdAt||alignedAt>receivedAt||receivedAt>8640000000000000||typeof previouslyObserved!=='boolean')throw Error('Invalid first display time');
 const field=Object.getOwnPropertyDescriptor(summary,'firstDisplayAt');
 if(field&&!Object.hasOwn(field,'value'))throw Error('Invalid saved first display times');
 const saved=field?boundedJsonSnapshot(field.value,{maxBytes:1024,maxNodes:30,maxDepth:2}):Array(20).fill(null);
 if(!Array.isArray(saved)||saved.length!==20||saved.some(v=>v!==null&&(!Number.isSafeInteger(v)||v<Math.floor(createdAt)||v>receivedAt)))throw Error('Invalid saved first display times');
 const clocks=[...saved];
 if(clocks[index]===null)clocks[index]=Math.floor(previouslyObserved?createdAt:alignedAt);
 summary.firstDisplayAt=clocks;
 return clocks[index]!;
}
