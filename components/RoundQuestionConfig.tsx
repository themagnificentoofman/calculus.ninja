'use client';
export interface QuestionMix {multipleChoice:number;freeResponse:number;order:'mcq-first'|'frq-first'|'uniform'}
export function RoundQuestionConfig({value,onChange}:{value:QuestionMix;onChange:(value:QuestionMix)=>void}){
 const total=value.multipleChoice+value.freeResponse,valid=total>=1&&total<=20;
 return <fieldset className="space-y-4"><legend className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-300">Question mix</legend>
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{([['multipleChoice','Multiple choice (MCQ)'],['freeResponse','Free response (FRQ)']] as const).map(([key,label])=><label key={key} className="block text-sm text-zinc-300">{label}<input type="number" min={0} max={20} step={1} inputMode="numeric" value={value[key]} onChange={e=>onChange({...value,[key]:Math.max(0,Math.min(20,Math.trunc(Number(e.target.value)||0)))})} className="mt-2 min-h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-lg text-white"/></label>)}</div>
  <p aria-live="polite" className={valid?'text-sm text-zinc-400':'text-sm text-amber-300'}>{total} questions total · Choose 1–20 questions. Set either count to 0 for a single-format round.</p>
  <label className="block text-sm text-zinc-300">Question order<select value={value.order} onChange={e=>onChange({...value,order:e.target.value as QuestionMix['order']})} className="mt-2 min-h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"><option value="mcq-first">MCQs first</option><option value="frq-first">FRQs first</option><option value="uniform">Uniformly shuffled</option></select></label>
  <p className="text-xs leading-relaxed text-zinc-400">Uniform shuffle gives every question order an equal chance. Topic and difficulty apply to both question types. <a href="/help#formatting" className="text-emerald-400 underline">Free-response formatting guide</a></p>
 </fieldset>;
}
