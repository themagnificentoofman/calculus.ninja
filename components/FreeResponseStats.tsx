export function FreeResponseStats({stats}:{stats?:{rounds?:number;finalized?:number;graded?:number;correct?:number;skipped?:number;revealed?:number;ungraded?:number}}){
 if(!stats)return null;
 const graded=stats.graded||0,correct=stats.correct||0;
 return <section className="rounded-3xl border border-zinc-800/50 bg-zinc-900/40 p-6" aria-label="Free-response practice statistics">
  <h3 className="font-semibold">Free-response practice</h3>
  <p className="mt-3 text-emerald-300">{graded?`${correct} / ${graded} graded answers correct (${Math.round(100*correct/graded)}%)`:'No graded answers yet'}</p>
  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">{Object.entries({'Completed rounds':stats.rounds||0,'Finalized questions':stats.finalized||0,Skipped:stats.skipped||0,Revealed:stats.revealed||0,'Ungraded submissions':stats.ungraded||0}).map(([label,value])=><div key={label}><dt className="text-xs text-zinc-400">{label}</dt><dd className="mt-1 font-mono">{value}</dd></div>)}</dl>
  <p className="mt-4 text-xs leading-relaxed text-zinc-400">Ungraded submissions remain editable. Skips and reveals earn no answer credit and are excluded from accuracy. These counts are separate from multiple-choice results and competitive ratings.</p>
 </section>;
}
