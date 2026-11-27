'use client';
import {practiceSignInReturn,readStudyPractice} from '@/lib/study/practice-link.mjs';
import { FreeResponseRound } from '@/components/FreeResponseRound';
import {RoundQuestionConfig,type QuestionMix} from '@/components/RoundQuestionConfig';
import { ProblemStatement } from '@/components/ProblemStatement';

import {useReplayCapture,ReplayCaptureStatus,observeReplay,useRoundUrl,capturedView} from '@/components/ReplayCapture';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { ProblemReference } from '@/components/ProblemReference';
import { MathDisplay } from '@/components/MathDisplay';
import { ContentAttribution } from '@/components/ContentAttribution';
import { SolutionSteps } from '@/components/SolutionSteps';
import { ArrowRight, CheckCircle2, XCircle, RefreshCw, Home, Play, Calculator, Info } from 'lucide-react';
import {PendingRoundStart,usePendingRoundStart} from '@/components/PendingRoundStart';
import {CancelledRound} from '@/components/CancelledRound';
import {auth} from '@/firebase';
import { playSound } from '@/lib/sounds';
import { apiRequest, gameProgress } from '@/lib/game-session';
import { GameResultStatus, GameSaveError } from '@/components/GameResultStatus';
import { OperationType, handleFirestoreError } from '@/lib/firestore-errors';

type Question = import('@/lib/game-progress').GameQuestion;

export default function TestMode() {
  const {user}=useAuth();
  const [study,setStudy] = useState<ReturnType<typeof readStudyPractice> | undefined>(undefined);
  useEffect(() => { setStudy(readStudyPractice(window.location.search)); }, []);
  if(study===null&&typeof window!=='undefined'&&['format','technique'].some(k=>new URLSearchParams(window.location.search).has(k)))return <main className="mx-auto max-w-3xl p-8"><h1 className="mb-4 text-2xl font-bold">Practice link unavailable</h1><p className="text-zinc-300">This link does not match a current Study drill.</p><a href="/study" className="mt-5 inline-block rounded py-3 text-emerald-300 underline">Return to the Study Guide</a></main>;
  return <>
    {study&&<nav aria-label="Return to Study Guide" className="mx-auto max-w-4xl px-4 pt-4"><a href={study.returnHref}
      className="inline-block rounded py-2 text-sm text-emerald-300 underline focus-visible:outline-2">Return to lesson section</a></nav>}
    {study===undefined ? <p role="status" className="p-8 text-center text-zinc-400">Loading practice…</p>
      : <TestPractice key={user?.uid??'signed-out'} study={study}/>}
  </>;
}

function TestPractice({study}:{study:ReturnType<typeof readStudyPractice>}) {
  const { user, loading: authLoading } = useAuth();
  const [category, setCategory] = useState(study?.category ?? 'all');
  const drill=study&&'drill' in study?study.drill:null;
  const [questionMix,setQuestionMix]=useState<QuestionMix>({multipleChoice:drill?.format==='free-response'?0:study?1:5,freeResponse:drill?.format==='free-response'?1:0,order:'mcq-first'});
  const [difficulty, setDifficulty] = useState(study?.difficulty ?? 'medium');
  const count=questionMix.multipleChoice+questionMix.freeResponse;
  
  const [gameId, setGameId] = useState<string | null>(null);
  const [roundGame,setRoundGame]=useState<import('@/lib/game-progress').GameSession|null>(null);
  const busy = useRef(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [generationError, setGenerationError] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const { profile } = useAuth();
  const [playerColor, setPlayerColor] = useState(profile?.color || '#3b82f6');
  
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

  const handleColorSelect = async (color: string) => {
    setPlayerColor(color);
    if (user) {
      try {
        await apiRequest('profile', { patch: { color } });
      } catch (error) {
        console.error('Failed to update color', error);
      }
    }
  };

  useEffect(() => {
    if (profile?.color) {
      setPlayerColor(profile.color);
    }
  }, [profile?.color]);

  async function loadRound(id:string){
    if(!user)return false;const uid=user.uid;
    const round=await gameProgress.getGame(id);
    if(round.mode!=='test'||!['active','finished','cancelled'].includes(round.status))throw Error('This round is unavailable in Test practice.');
    const saved=await capturedView(uid,id);
    if(auth.currentUser?.uid!==uid)return false;
    const answers=round.answers?.[uid]||{},next=Object.keys(answers).length;
    const index=saved?.index!==null&&saved?.index!==undefined?Math.min(saved.index,next):Math.max(0,next-1);
    setGameId(id);setRoundGame(round);setQuestions(round.questions||[]);
    if(round.questionMix)setQuestionMix(round.questionMix);
    setCategory(round.category||'all');setDifficulty(round.difficulty||'medium');setScore(round.scores[uid]||0);
    setCurrentIndex(Math.min(index,(round.questions?.length||1)-1));setShowExplanation(index<next);
    setSelectedOption(index<next?answers[String(index)]?.selectedOption??null:saved?.selectedOption??null);
    setFinished(round.status==='finished'&&saved?.finished===true);setGenerationError('');setSaveError('');return true;
  }
  const roundStart=usePendingRoundStart(user?.uid,'test',loadRound,roundGame&&(questions.length||roundGame.status==='cancelled')?gameId:null);
  const changeSettings=()=>{setGameId(null);setRoundGame(null);setQuestions([]);setFinished(false);};
  const loading=roundStart.loading;
  const startGame=()=>{
    if(!user||busy.current||count<1||count>20)return;
    setGenerationError('');setSaveError('');
    return roundStart.start({mode:'test',category,difficulty,count,questionMix,...(drill?{tag:drill.tag as string}:{})});
  };

  const handleOptionSelect = (index: number) => {
    if (saving || showExplanation) return;
    if(gameId)observeReplay(gameId,'selection_changed',{questionIndex:currentIndex,selectedOption:index},user?.uid);
    setSelectedOption(index);
  };

  const checkAnswer = async () => {
    if (busy.current || selectedOption === null || showExplanation || !user || !gameId) return;
    busy.current = true; setSaving(true); setSaveError('');
    try {
      const result = await gameProgress.submitAnswer(gameId, user.uid, currentIndex, selectedOption);
      if (!result.answer) return;
      setSelectedOption(result.answer.selectedOption);
      setScore(result.game.scores[user.uid]);
      setRoundGame(result.game);setQuestions(result.game.questions || []);
      playSound(result.answer.correct ? 'correct' : 'incorrect');
      if (result.answer.xp && !result.duplicate) {
        setXpEarned(result.answer.xp); setTimeout(() => setXpEarned(null), 2000);
      }
      setShowExplanation(true);
    } catch (error) { setSaveError(error instanceof Error ? error.message : 'Answer was not saved. Please retry.'); }
    finally { busy.current = false; setSaving(false); }
  };

  const nextQuestion = () => {
    if (saving || !showExplanation) return;
    if(gameId)observeReplay(gameId,'next',{questionIndex:currentIndex},user?.uid);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1); setSelectedOption(null); setShowExplanation(false);
    } else { playSound('end'); setFinished(true); }
  };

  useRoundUrl(user?.uid,gameId,id=>{void loadRound(id).catch(()=>setGenerationError('Your round could not be loaded. Please refresh and try again.'));});
  const captureStatus=useReplayCapture(user?.uid,gameId,roundGame?.replayVersion,{index:!loading&&!finished&&questions.length?currentIndex:null,selectedOption,feedbackIndex:!finished&&showExplanation?currentIndex:null,serverEventId:roundGame?.answers?.[user?.uid||'']?.[currentIndex]?.serverEventId,finished,settled:!saving});

  if (authLoading) return <main className="p-8 text-center text-zinc-400" role="status">Loading your account…</main>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <a className="inline-block rounded-xl border border-zinc-700 px-4 py-3 text-emerald-300 underline"
          href={'/auth?next=' + encodeURIComponent(practiceSignInReturn(window.location.search))}>Sign in to play</a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-xl text-zinc-400 animate-pulse">Selecting calculus problems...</p>
      </div>
    );
  }

  if(roundGame?.status==='cancelled')return <CancelledRound onSettings={changeSettings} error={roundStart.error}/>;

  if (finished) {
    const summary=roundGame?.freeResponseSummary;
    const mcAnswers=Object.values(roundGame?.answers?.[user.uid]||{}).filter(a=>a.responseFormat!=='free-response');
    const mcTotal=questions.filter(q=>q.responseFormat!=='free-response').length;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div
          className="bg-zinc-900 border border-zinc-800 p-4 sm:p-8 rounded-3xl max-w-md w-full text-center"
        >
          <Calculator className="w-20 h-20 text-blue-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-2">Test Complete!</h2>
          {['free-response','mixed'].includes(roundGame?.responseFormat||'')?<div className="mb-8 text-zinc-300"><>{mcTotal>0&&<p className="mb-4">Multiple choice: {mcAnswers.filter(a=>a.correct).length} correct out of {mcTotal}.</p>}<p className="font-medium text-white">Free response</p></><p className="mb-4">{summary?.graded?`${summary.correct} correct out of ${summary.graded} graded answers (${Math.round(100*summary.correct/summary.graded)}%).`:'No graded answers in this round.'}</p>{summary&&<dl className="grid grid-cols-2 gap-3 text-sm"><div><dt className="text-zinc-400">Finalized</dt><dd>{summary.finalized} / {summary.total}</dd></div><div><dt className="text-zinc-400">Ungraded submissions</dt><dd>{summary.ungradedSubmissions}</dd></div><div><dt className="text-zinc-400">Skipped</dt><dd>{summary.skipped}</dd></div><div><dt className="text-zinc-400">Revealed</dt><dd>{summary.revealed}</dd></div></dl>}<p className="mt-4 text-xs text-zinc-400">Skipped, revealed and ungraded submissions do not count as incorrect. Free-response results are separate from multiple-choice accuracy and competitive ratings.</p></div>:<p className="text-zinc-400 mb-8">You scored <span className="font-bold font-mono text-xl" style={{ color: playerColor }}>{score}</span> out of {questions.length}</p>}
          
          <ReplayCaptureStatus status={captureStatus} /><GameResultStatus gameId={gameId} /><GameSaveError error={generationError||roundStart.error} /><PendingRoundStart state={roundStart}/>
          <div className="flex flex-col gap-4">
            <button 
              onClick={startGame}
              disabled={!!roundStart.pending||roundStart.loading}
              className="disabled:opacity-40 disabled:cursor-not-allowed w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors"
            >
              Play Again
            </button>
            <button 
              onClick={changeSettings}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition-colors"
            >
              Change Settings
            </button>
            <a href="/" className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition-colors block">
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length > 0) {
    const q = questions[currentIndex];
    if(q.responseFormat==='free-response')return <FreeResponseRound key={`${gameId}:${currentIndex}`} game={roundGame!} id={gameId!} uid={user.uid} index={currentIndex} onResult={(g,finalized)=>{setRoundGame(g);if(g.questionMix)setQuestionMix(g.questionMix);setCategory(g.category||'all');setDifficulty(g.difficulty||'medium');setQuestions(g.questions||[]);setScore(g.scores[user.uid]||0);setShowExplanation(finalized);}} onNext={()=>{if(gameId)observeReplay(gameId,'next',{questionIndex:currentIndex},user?.uid);setCurrentIndex(currentIndex+1);setSelectedOption(null);setShowExplanation(false);}} onFinish={()=>setFinished(true)}/>;
    const isCorrect = selectedOption === q.correctIndex;

    return (
      <div className="min-h-screen max-w-4xl mx-auto px-4 py-12 relative overflow-x-clip">
        <ReplayCaptureStatus status={captureStatus} /><GameSaveError error={saveError||roundStart.error} />
        
          {xpEarned !== null && (
             <div
               className="pointer-events-none fixed top-24 right-10 md:right-20 bg-amber-500/20 border border-amber-500/50 text-amber-500 font-bold px-4 py-2 rounded-xl flex items-center gap-2 z-50 shadow-lg"
             >
               <span className="text-xl">+</span>
               <span className="text-2xl">{xpEarned} XP</span>
             </div>
          )}
        

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-center mb-8">
          <a href="/" className="col-span-2 sm:col-span-1 text-zinc-400 hover:text-white flex items-center gap-2">
            <Home className="w-5 h-5" /> Dashboard
          </a>
          <div className="text-zinc-400 font-mono text-sm sm:text-base sm:text-center whitespace-nowrap">
            Question {currentIndex + 1} of {questions.length}
          </div>
          <div className="font-bold font-mono flex justify-end items-center gap-2 whitespace-nowrap" style={{ color: playerColor }}>
            Score: 
            <span
              key={score}
              className="inline-block"
            >
              {score}
            </span>
          </div>
        </div>

        
          <div 
            key={currentIndex}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-8 mb-8"
          >
            <div className="text-xl sm:text-2xl mb-6 sm:mb-12 w-full overflow-x-auto py-4">
              <ProblemStatement math={q.latexProblem} legacy={q.legacy} /><ContentAttribution credit={q.contentNotice} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {q.options.map((opt, i) => {
                let btnClass = "p-4 sm:p-6 rounded-2xl border text-lg transition-all text-left flex items-center gap-3 sm:gap-4 ";
                
                if (!showExplanation) {
                  if (selectedOption === i) {
                    btnClass += "bg-zinc-800 border-blue-500/50 text-white";
                  } else {
                    btnClass += "bg-zinc-950 border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-800 cursor-pointer text-zinc-300";
                  }
                } else {
                  if (i === q.correctIndex) {
                    btnClass += "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                  } else if (i === selectedOption) {
                    btnClass += "bg-red-500/20 border-red-500 text-red-400";
                  } else {
                    btnClass += "bg-zinc-950 border-zinc-800 opacity-50";
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={showExplanation}
                    onClick={() => handleOptionSelect(i)}
                    className={btnClass}
                  >
                    <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <MathDisplay math={opt} />
                    </div>
                  </button>
                );
              })}
            </div>

            {!showExplanation && selectedOption !== null && (
              <div
                className="mt-8 flex justify-center"
              >
                <button
                  onClick={checkAnswer}
                  className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold text-lg transition-colors flex items-center gap-2"
                >
                  Confirm Answer <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        

        {showExplanation && (
          <div
            className={`p-4 sm:p-6 rounded-2xl border mb-8 ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}
          >
            <div className="flex items-center gap-3 mb-4">
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
              <h3 className={`text-xl font-bold ${isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect.'}
              </h3>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <ProblemReference problemId={q.problemId} problemRevision={q.problemRevision} />
              <h4 className="text-zinc-300 font-medium mb-2">Explanation:</h4>
              <div className="text-zinc-400 leading-relaxed w-full flex flex-col gap-4">
                <SolutionSteps steps={q.explanation} />
                  <ContentAttribution credit={q.contentAttribution} />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={nextQuestion}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-colors"
              >
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Test'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-12 flex flex-col justify-center">
      <a href="/" className="text-zinc-400 hover:text-white flex items-center gap-2 mb-12 w-fit transition-colors">
        <Home className="w-5 h-5" /> Back to Dashboard
      </a>
      
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
          <Calculator className="w-4 h-4" />
          <span>Test</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Test Setup</h1>
        <p className="text-zinc-400 mt-4 text-lg">Choose your topics, difficulty, question mix and order.</p>
      </div>
      
      <PendingRoundStart state={roundStart}/>
      {(generationError||roundStart.error) && <p role="alert" className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">{generationError||roundStart.error}</p>}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 sm:p-10 space-y-8 backdrop-blur-sm shadow-xl">
        <div className="space-y-6">
          {drill?<div className="space-y-3"><h2 className="text-xl font-semibold">Practice {drill.label}</h2><p className="text-zinc-300 capitalize">{category} · {difficulty} · {drill.format==='free-response'?'Free response':'Multiple choice'} · 1 question</p><p className="text-sm text-zinc-400">Your recent practice can affect which questions are available.</p>{study?.broaderHref&&<a href={study.broaderHref} className="inline-flex min-h-11 items-center rounded text-emerald-300 underline">Open broader practice setup</a>}</div>:<>
          <RoundQuestionConfig value={questionMix} onChange={setQuestionMix}/>
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-zinc-300 mb-3 uppercase tracking-wider group relative w-fit">
              Category
              <Info className="w-4 h-4 text-zinc-500 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-zinc-800 text-xs text-zinc-300 rounded shadow-xl z-10 border border-zinc-700 normal-case font-normal">
                Select the mathematical topic for the questions.
              </div>
            </label>
            <div className="relative">
              <select aria-label="Category"
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="w-full appearance-none bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              >
                <option value="all">Mixed topics</option>
                <option value="integration">Integration</option>
                <option value="differentiation">Differentiation</option>
                <option value="limits">Limits</option>
                <option value="series">Series</option>
                <option value="differential equations">Differential Equations</option>
                <option value="multivariable">Multivariable Calculus</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-zinc-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-zinc-300 mb-3 uppercase tracking-wider group relative w-fit">
              Difficulty
              <Info className="w-4 h-4 text-zinc-500 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-zinc-800 text-xs text-zinc-300 rounded shadow-xl z-10 border border-zinc-700 normal-case font-normal">
                Higher difficulties yield more XP per correct answer.
              </div>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['easy', 'medium', 'hard', 'olympiad'].map(diff => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`py-3 px-4 rounded-xl border text-sm font-bold capitalize transition-all ${
                    difficulty === diff 
                      ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          </>}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-zinc-300 mb-3 uppercase tracking-wider group relative w-fit">
              Display Color
              <svg className="w-4 h-4 text-zinc-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-zinc-800 text-xs text-zinc-300 rounded shadow-xl z-10 border border-zinc-700 normal-case font-normal">
                Choose your display color for the test.
              </div>
            </label>
            <div className="flex flex-wrap gap-3">
              {colors.map(color => (
                <button
                  key={color}
                  aria-label={`Choose ${color} color`} aria-pressed={playerColor === color}
                  onClick={() => handleColorSelect(color)}
                  className={`w-10 h-10 rounded-full transition-transform ${playerColor === color ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800/50">
          <button 
            onClick={startGame}
              disabled={!!roundStart.pending||roundStart.loading||count<1||count>20}
            className="disabled:opacity-40 disabled:cursor-not-allowed w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2 group"
          >
            <Play className="w-5 h-5 fill-current" /> 
            <span>Start Test</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}


