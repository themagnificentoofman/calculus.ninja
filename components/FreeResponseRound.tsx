'use client';
import {displayVerdict} from '@/lib/math-answer/feedback.mjs';
import {lazy,Suspense,useState,useRef} from 'react';
import type {GameSession,FreeResponseAnswer} from '@/lib/game-progress';
import {answerSubmissionError} from '@/lib/api-request.mjs';
import {gameProgress} from '@/lib/game-session';
import {ProblemStatement} from './ProblemStatement';
import {SolutionSteps} from './SolutionSteps';
import {ContentAttribution} from './ContentAttribution';
import {MathDisplay} from './MathDisplay';
import {ProblemReference} from './ProblemReference';
import {QuestionAssumptions} from './QuestionAssumptions';
const Editor=lazy(()=>import('./MathAnswerEditor'));
export function FreeResponseRound({game,id,uid,index,onResult,onNext,onFinish}:{game:GameSession;id:string;uid:string;index:number;onResult:(game:GameSession,finalized:boolean)=>void;onNext:()=>void;onFinish:()=>void}){
 const question=game.questions?.[index],answer=game.answers?.[uid]?.[index] as FreeResponseAnswer|undefined;
 const [source,setSource]=useState(''),[pending,setPending]=useState(false),[error,setError]=useState(''),[feedback,setFeedback]=useState<{outcome:string;feedback:string;interpretation:string}|null>(null),busy=useRef(false);
 if(question?.responseFormat!=='free-response')return null;
 const submit=async(action:'fr-submit'|'fr-skip'|'fr-reveal')=>{if(busy.current||answer)return;busy.current=true;setPending(true);setError('');setFeedback(null);try{const result=await gameProgress.submitFreeResponse(id,uid,index,action,source);setFeedback(result.verdict||null);onResult(result.game,!!result.answer);}catch(e){setError(answerSubmissionError(e));}finally{busy.current=false;setPending(false);}};
 const shown=answer||feedback,shownCopy=displayVerdict(shown),canonical=(question as any).canonicalAnswer;
 return <main className="mx-auto min-h-screen max-w-4xl px-4 py-10"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">Free-response practice</h1><p className="mt-1 text-sm text-zinc-400">Question {index+1} of {game.questions!.length} · <span className="capitalize">{question.topic} · {question.difficulty}</span></p></div><a className="text-sm text-emerald-400 underline" href="/help#formatting" target="_blank" rel="noreferrer">Answer formatting guide</a></div>
  <section className="mb-5 min-w-0 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 sm:p-8"><ProblemStatement math={question.latexProblem} legacy={question.legacy}/><QuestionAssumptions assumptions={question.assumptions}/><ContentAttribution credit={question.contentNotice}/></section>
  <Suspense fallback={<p role="status">Loading the answer editor…</p>}><Editor key={`${uid}:${id}:${index}:${question.answerContractHash}`} scope={{uid,roundId:id,problemId:question.problemId!,problemRevision:question.problemRevision!,contentHash:question.contentHash!,contractHash:question.answerContractHash}} instructions={question.answerInstructions} finalized={!!answer} disabled={pending} onChange={setSource}/></Suspense>
  {error&&<p className="my-4 rounded-xl border border-amber-400/40 p-4 text-amber-200" role="alert">{error}</p>}
  {!answer&&<div className="my-5 flex flex-wrap gap-3"><button type="button" disabled={pending} onClick={()=>void submit('fr-submit')} className="min-h-12 rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-zinc-950 disabled:opacity-50">{pending?'Saving…':'Submit answer'}</button><button type="button" disabled={pending} onClick={()=>void submit('fr-skip')} className="min-h-12 rounded-xl border border-zinc-600 px-5 py-3">Skip and review</button><button type="button" disabled={pending} onClick={()=>void submit('fr-reveal')} className="min-h-12 rounded-xl border border-zinc-600 px-5 py-3">Reveal solution</button></div>}
  {shown&&<section className="my-5 rounded-2xl border border-zinc-700 bg-zinc-900 p-5" aria-live="polite"><h2 className="text-lg font-semibold capitalize">{shownCopy.label}</h2><p className="mt-2 text-zinc-300">{shownCopy.feedback}</p>{shown.interpretation&&<><p className="mt-4 text-xs text-zinc-400">Interpreted input</p><MathDisplay math={shown.interpretation} block/></>}{!answer&&<p className="mt-3 text-sm text-zinc-400">This outcome has not been counted as a wrong answer. Your draft remains editable.</p>}</section>}
  {answer&&<section className="mb-8 rounded-2xl border border-emerald-400/25 bg-emerald-400/5 p-5"><ProblemReference problemId={question.problemId} problemRevision={question.problemRevision}/>{canonical&&<><h2 className="mt-4 font-semibold">Reference answer</h2><MathDisplay math={canonical} block/></>}<SolutionSteps steps={question.explanation}/><ContentAttribution credit={question.contentAttribution}/><p className="mt-4 text-sm text-zinc-400">{answer.finalization==='graded'?'This graded attempt is final.':'Finalized without an accuracy penalty or answer XP.'}</p><button type="button" className="mt-5 min-h-12 rounded-full bg-white px-6 py-3 font-semibold text-zinc-950" onClick={()=>{setFeedback(null);index+1<game.questions!.length?onNext():onFinish();}}>{index+1<game.questions!.length?'Next question':'Finish practice'}</button></section>}
 </main>;
}
