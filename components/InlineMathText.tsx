import {MathDisplay} from './MathDisplay';
import {studyProseParts} from '@/lib/study/prose.mjs';

/** Only explicit inline delimiters identify mathematics; prose is never guessed. */
export function InlineMathText({text}:{text:string}){
 return <>{studyProseParts(text).map((part:{kind:string;value:string},i:number)=>part.kind==='math'?<MathDisplay key={i} math={part.value}/>:<span key={i}>{part.value}</span>)}</>;
}
