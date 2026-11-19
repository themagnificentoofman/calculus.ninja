import {InlineMathText} from './InlineMathText';

export function QuestionAssumptions({assumptions=[]}:{assumptions?:string[]}){
 if(!assumptions.length)return null;
 return <section aria-label="Question assumptions" className="mt-5 border-t border-zinc-700 pt-4"><h2 className="text-sm font-semibold text-zinc-200">Assumptions</h2><ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-300">{assumptions.map((text,i)=><li key={i}><InlineMathText text={text}/></li>)}</ul></section>;
}
