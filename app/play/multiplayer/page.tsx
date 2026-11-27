'use client';
import { ProblemStatement } from '@/components/ProblemStatement';

import {useReplayCapture,ReplayCaptureStatus,observeReplay,useRoundUrl,capturedView,clearRoundUrl} from '@/components/ReplayCapture';
import { useState, useEffect, useRef } from 'react';
import { useLobbyDeparture } from '@/components/LobbyDeparture';
import { useLobbyPresence } from '@/components/LobbyPresence';
import { LobbyChoice, LobbySignIn } from '@/components/LobbyChoice';
import { useAuth } from '@/components/AuthProvider';
import { ProblemReference } from '@/components/ProblemReference';
import { MathDisplay } from '@/components/MathDisplay';
import { ContentAttribution } from '@/components/ContentAttribution';
import { SolutionSteps } from '@/components/SolutionSteps';
import { LastAnswerReview, type AnsweredQuestion } from '@/components/LastAnswerReview';
import { Trophy, RefreshCw, Home, Play, CheckCircle2, XCircle, ArrowRight, Globe, Users, Info } from 'lucide-react';
import Image from 'next/image';
import {PendingRoundStart,usePendingRoundStart} from '@/components/PendingRoundStart';
import { RankIcon, getRankInfo } from '@/components/RankDisplay';
import { auth, db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { playSound } from '@/lib/sounds';
import { hasRating } from '@/lib/progression';
import { apiRequest, gameProgress } from '@/lib/game-session';
import {answerSubmissionError} from '@/lib/api-request.mjs';
import { gameStandings, nextUnanswered, type GameSession, type MultipleChoiceSession, requireMultipleChoiceSession } from '@/lib/game-progress';
import { GameResultStatus, GameSaveError } from '@/components/GameResultStatus';
import { Chat } from '@/components/Chat';

interface ChatMessage {
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

interface Question {
  contentNotice?: import('@/lib/bank/contracts').ContentNotice;
  contentAttribution?: import('@/lib/bank/contracts').ContentCredit;
  problemId?: string;
  problemRevision?: number;
  legacy?: boolean;
  latexProblem: string;
  options: string[];
  correctIndex: number;
  explanation: string | string[];
  topic: string;
  difficulty: string;
}

type GameData = MultipleChoiceSession;

export default function MultiplayerMode() {
  const [match, setMatch] = useState(0);
  return <MultiplayerMatch key={match} onPlayAgain={() => {clearRoundUrl();setMatch(value => value + 1);}} />;
}

function MultiplayerMatch({ onPlayAgain }: { onPlayAgain: () => void }) {
  const { user, profile, loading: authLoading } = useAuth();
  const [leaving, setLeaving] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameData, setGameData] = useState<GameData | null>(null);
  useLobbyDeparture(user?.uid, gameId, gameData?.status);
  const presenceError = useLobbyPresence(user?.uid, gameId, gameData?.status);
  const [creationVisibility, setCreationVisibility] = useState<'private' | 'public' | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('host') === 'public') setCreationVisibility('public');
    else if (params.has('invite')) setCreationVisibility('private');
  }, []);
  const [loading, setLoading] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('Setting up arena...');
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<AnsweredQuestion | null>(null);
  const [playerProfiles, setPlayerProfiles] = useState<Record<string, any>>({});
  const busy = useRef(false);
  const restoredGame = useRef<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('hard');
  
  // New Settings
  const [winCondition, setWinCondition] = useState<'first_to_n' | 'time_limit'>('first_to_n');
  const [targetScore, setTargetScore] = useState(5);
  const [timeLimit, setTimeLimit] = useState(60);
  const [penalties, setPenalties] = useState(false);
  const [playerColor, setPlayerColor] = useState(profile?.color || '#a855f7');
  
  const ratingFor = (uid: string) => gameData?.receipts?.[uid]?.newRating ?? playerProfiles[uid]?.rating ?? 0;
  const ratedFor = (uid: string) => gameData?.receipts?.[uid]?.rated || hasRating(playerProfiles[uid]);

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
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [joinError, setJoinError] = useState('');

  // Load settings from local storage
  useEffect(() => {
    const savedSettings = localStorage.getItem('multiplayerSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.difficulty) setDifficulty(parsed.difficulty);
        if (parsed.winCondition) setWinCondition(parsed.winCondition);
        if (parsed.targetScore) setTargetScore(parsed.targetScore);
        if (parsed.timeLimit) setTimeLimit(parsed.timeLimit);
        if (parsed.penalties !== undefined) setPenalties(parsed.penalties);
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
  }, []);

  // Save settings to local storage when they change
  useEffect(() => {
    const settingsToSave = {
      category,
      difficulty,
      winCondition,
      targetScore,
      timeLimit,
      penalties
    };
    localStorage.setItem('multiplayerSettings', JSON.stringify(settingsToSave));
  }, [category, difficulty, winCondition, targetScore, timeLimit, penalties]);

  useEffect(() => {
    if (!gameId || !user || leaving) return;

    const unsub = gameProgress.watchGame(gameId, user!.uid, async (view) => {
      {
        const data = requireMultipleChoiceSession(view);
        if (data.status === 'cancelled') { setGameId(null); setGameData(null); setCreationVisibility(null); setGenerationError('This lobby was cancelled or expired. Start or join a new game.'); return; }
        setGameData(data);
        if (user && restoredGame.current !== gameId) {
          restoredGame.current = gameId;
          const next=data.progressionVersion===3?nextUnanswered(data,user.uid):0,saved=await capturedView(user.uid,gameId);const index=saved?.index!==null&&saved?.index!==undefined?Math.min(saved.index,next):next;const answer=data.answers?.[user.uid]?.[index];setCurrentIndex(index);setSelectedOption(answer?.selectedOption??saved?.selectedOption??null);setShowExplanation(Boolean(answer));if(answer&&data.questions?.[index])setLastAnswer({question:data.questions[index],selectedOption:answer.selectedOption});
        }
        
        // Fetch profiles for players we don't have yet
        for (const uid of data.players) {
          setPlayerProfiles(prev => {
            if (!prev[uid]) {
              getDoc(doc(db, 'users_public', uid)).then(pSnap => {
                if (pSnap.exists()) {
                  setPlayerProfiles(p => ({ ...p, [uid]: pSnap.data() }));
                }
              }).catch(() => setSaveError('A player profile could not be loaded. Please reconnect.'));
            }
            return prev;
          });
        }
      }
    }, () => setSaveError('Game sync failed. Please reconnect.'), () => {
      setGameId(null); setGameData(null); setCreationVisibility(null); clearRoundUrl();
      setGenerationError('You have left this lobby or it is no longer available. Start or join a new game.');
    });

    return () => unsub();
  }, [gameId, user, leaving]);

  const hostId = gameData?.players?.[0];

  useEffect(() => {
    if (!gameId || !user || gameData?.status !== 'active' || !gameData.deadline) return;
    let ending = false;
    const tick = async () => {
      const remaining = Math.max(0, Math.ceil((gameData.deadline! - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0 && !ending) {
        ending = true;
        try { await gameProgress.completeGame(gameId, user.uid); }
        catch { setSaveError('Could not finish the match. Reconnecting…'); }
        finally { ending = false; }
      }
    };
    void tick(); const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [gameId, user, gameData?.status, gameData?.deadline]);

  const [closedHostId, setClosedHostId] = useState<string | null>(null);
  async function loadHostRoom(id:string) {
    if (!user) return false;
    const uid = user.uid;
    const game = requireMultipleChoiceSession(await gameProgress.getGame(id, uid));
    if (auth.currentUser?.uid !== uid) return false;
    if (game.mode !== 'multiplayer' || game.players[0] !== uid) throw Error('This lobby belongs to another host.');
    if (game.status === 'cancelled') {
      setClosedHostId(id);
      setGenerationError('This lobby closed. You can start another game.');
      return true;
    }
    setGameData(game);
    setGameId(id);

    return true;
  }
  const hostStart = usePendingRoundStart(user?.uid, 'multiplayer', loadHostRoom, gameId && gameData?.players[0] === user?.uid ? gameId : closedHostId);
  const createGame = () => {
    if (!user) return;
    setClosedHostId(null);
    setGenerationError('');
    return hostStart.start({mode:'multiplayer',category,difficulty,count:winCondition === 'first_to_n' ? Math.min(targetScore * 3,20) : 20,options:{visibility:creationVisibility ?? 'private',settings:{winCondition,targetScore,timeLimit,penalties}}});
  };

  const joinGame = async (idToJoin: string, source:'manual'|'link'='manual') => {
    if (!user) return;
    setLoading(true); setGenerationError('');
    try {
      const id = idToJoin.trim();
      if (!/^[a-zA-Z0-9]{5,30}$/.test(id)) throw new Error('Enter a valid lobby code.');
      await gameProgress.joinGame(id, user.uid, 'multiplayer',source);
      setGameId(id);
    } catch (error) { setGenerationError(error instanceof Error ? error.message : 'Could not join this game.'); }
    finally { setLoading(false); }
  };

  const joiningFromLink = useRef(false);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('join');
    if (user && id && !joiningFromLink.current) { joiningFromLink.current = true; void joinGame(id,'link'); }
  }, [user]);

  const startGame = async () => {
    if (!gameId || !user) return;
    try { await gameProgress.startGame(gameId, user.uid); }
    catch (error) { setSaveError(error instanceof Error ? error.message : 'Could not start this game.'); }
  };

  const handleOptionSelect = (index: number) => {
    if (saving || showExplanation || !gameData || !gameData.questions || !user || !gameId) return;
    if(gameId)observeReplay(gameId,'selection_changed',{questionIndex:currentIndex,selectedOption:index},user?.uid);
    setSelectedOption(index);
  };

  const checkAnswer = async () => {
    if (busy.current || selectedOption === null || showExplanation || !gameData?.questions || !user || !gameId || gameData.status !== 'active') return;
    busy.current = true; setSaving(true); setSaveError('');
    try {
      const q = gameData.questions[currentIndex];
      const result = await gameProgress.submitAnswer(gameId, user.uid, currentIndex, selectedOption);
      if (!result.answer) return;
      setSelectedOption(result.answer.selectedOption);
      setGameData(result.game as GameData);
      setLastAnswer({ question: result.game.questions[currentIndex], selectedOption: result.answer.selectedOption });
      playSound(result.answer.correct ? 'correct' : 'incorrect');
      if (result.answer.xp && !result.duplicate) {
        setXpEarned(result.answer.xp); setTimeout(() => setXpEarned(null), 2000);
      }
      setShowExplanation(true);
    } catch (error) { setSaveError(answerSubmissionError(error)); }
    finally { busy.current = false; setSaving(false); }
  };

  const nextQuestion = () => {
    if (saving || !showExplanation) return;
    if(gameId)observeReplay(gameId,'next',{questionIndex:currentIndex},user?.uid);
    setCurrentIndex(currentIndex + 1); setSelectedOption(null); setShowExplanation(false);
  };

  const leaveLobby = async () => {
    if (!user || !gameId || leaving) return;
    setLeaving(true); setSaveError('');
    try { await gameProgress.leaveGame(gameId,user.uid); setGameId(null); setGameData(null); setCreationVisibility(null); }
    catch (error) { setSaveError(error instanceof Error ? error.message : 'Could not leave the lobby. Please retry.'); }
    finally { setLeaving(false); }
  };

  useRoundUrl(user?.uid,gameId,id=>{void gameProgress.getGame(id,user?.uid).then(g=>{if(g.mode!=='multiplayer')throw Error('This round belongs to another mode.');setGameId(id);}).catch(e=>setGenerationError(e.message));});
  const capturedFeedbackIndex=showExplanation?currentIndex:gameData?.status==='finished'&&lastAnswer?gameData.questions?.findIndex(q=>!!q.problemId&&q.problemId===lastAnswer.question.problemId)??-1:-1;
  const captureStatus=useReplayCapture(user?.uid,gameId,gameData?.replayVersion,{index:!loading&&gameData?.status==='active'&&true&&currentIndex<(gameData.questions?.length||0)?currentIndex:null,selectedOption,feedbackIndex:capturedFeedbackIndex>=0?capturedFeedbackIndex:null,serverEventId:gameData?.answers?.[user?.uid||'']?.[capturedFeedbackIndex]?.serverEventId,finished:gameData?.status==='finished',settled:!saving});

  if (authLoading) return <main className="p-8 text-center text-zinc-400" role="status">Loading your account…</main>;

  if (!user) return <LobbySignIn mode="multiplayer" />;

  if (loading || hostStart.loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <RefreshCw className="w-12 h-12 text-purple-500 animate-spin mb-4" />
        <p className="text-xl text-zinc-400 animate-pulse">{loadingMessage}</p>
      </div>
    );
  }

  if (!gameId && hostStart.pending) return <main className="mx-auto max-w-xl px-4 py-12"><PendingRoundStart state={hostStart}/>{hostStart.error && <p role="alert">{hostStart.error}</p>}</main>;
  if (!gameId && !creationVisibility) return <LobbyChoice mode="multiplayer" error={generationError || hostStart.error} onPrivate={() => setCreationVisibility('private')} onJoin={joinGame} />;

  if (!gameId) {
    return (
      <div className="min-h-screen max-w-3xl mx-auto px-4 py-12 flex flex-col justify-center">
        <button onClick={() => { if (creationVisibility === 'public') location.assign('/play/multiplayer/lobbies'); else setCreationVisibility(null); }} className="mb-8 inline-flex min-h-11 w-fit items-center gap-2 text-zinc-400 hover:text-white">
          <Home className="h-4 w-4" /> Back to {creationVisibility === 'public' ? 'public catalog' : 'Multiplayer lobbies'}
        </button>
        
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
            <Trophy className="w-4 h-4 shrink-0" />
            <span>Multiplayer</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{creationVisibility === 'public' ? 'Public Lobby' : 'Private Lobby'}</h1>
          <p className="text-zinc-400 mt-4 text-lg">Join a global arena and compete against multiple players.</p>
        </div>
        
        {(generationError || hostStart.error) && <p role="alert" className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">{generationError || hostStart.error}</p>}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 sm:p-10 space-y-8 backdrop-blur-sm shadow-xl">
          <div className="space-y-6">
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
                  className="w-full appearance-none bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                >
                  <option value="all">All</option>
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
                  Determines the complexity of the problems. Harder problems earn more XP. Rating depends on results and opponent strength.
                </div>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['easy', 'medium', 'hard', 'olympiad'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`py-3 px-4 rounded-xl border text-sm font-bold capitalize transition-all ${
                      difficulty === diff 
                        ? 'bg-purple-500/20 border-purple-500 text-purple-400' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-zinc-300 mb-3 uppercase tracking-wider group relative w-fit">
                Win Condition
                <Info className="w-4 h-4 text-zinc-500 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-zinc-800 text-xs text-zinc-300 rounded shadow-xl z-10 border border-zinc-700 normal-case font-normal">
                  Play to a target score or compete for the highest score within a time limit. A match also ends when everyone runs out of questions.
                </div>
              </label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setWinCondition('first_to_n')}
                  className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                    winCondition === 'first_to_n'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  First to N
                </button>
                <button
                  onClick={() => setWinCondition('time_limit')}
                  className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                    winCondition === 'time_limit'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  Time Limit
                </button>
              </div>

              {winCondition === 'first_to_n' ? (
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-400 mb-2 group relative w-fit">
                    Target Score
                    <Info className="w-4 h-4 text-zinc-500 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-zinc-800 text-xs text-zinc-300 rounded shadow-xl z-10 border border-zinc-700 normal-case font-normal">
                      The first player to reach this many points wins. If penalties are on, each wrong answer costs one point.
                    </div>
                  </label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="1" 
                      max="20" 
                      value={targetScore} 
                      onChange={e => setTargetScore(parseInt(e.target.value) || 5)}
                      className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="w-16 h-12 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center font-mono font-bold text-xl text-purple-400">
                      {targetScore}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-400 mb-2 group relative w-fit">
                    Time Limit (seconds)
                    <Info className="w-4 h-4 text-zinc-500 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-zinc-800 text-xs text-zinc-300 rounded shadow-xl z-10 border border-zinc-700 normal-case font-normal">
                      The duration of the game. The player with the highest score at the end wins.
                    </div>
                  </label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="30" 
                      max="300" 
                      step="30"
                      value={timeLimit} 
                      onChange={e => setTimeLimit(parseInt(e.target.value) || 60)}
                      className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="w-16 h-12 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center font-mono font-bold text-xl text-purple-400">
                      {timeLimit}s
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 mt-6">
                <input
                  type="checkbox"
                  id="penalties"
                  checked={penalties}
                  onChange={e => setPenalties(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-800 bg-zinc-950 text-purple-500 focus:ring-purple-500 focus:ring-offset-zinc-900"
                />
                <label htmlFor="penalties" className="flex items-center gap-2 text-sm font-bold text-zinc-300 group relative w-fit cursor-pointer">
                  Enable Penalties (-1 point for incorrect answers)
                  <Info className="w-4 h-4 text-zinc-500" />
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-zinc-800 text-xs text-zinc-300 rounded shadow-xl z-10 border border-zinc-700 normal-case font-normal">
                    If enabled, answering a question incorrectly will reduce your score by 1 point.
                  </div>
                </label>
              </div>

              <div className="mt-6">
                <label className="flex items-center gap-2 text-sm font-bold text-zinc-400 mb-2 group relative w-fit">
                  Display Color
                  <Info className="w-4 h-4 text-zinc-500 cursor-help" />
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-zinc-800 text-xs text-zinc-300 rounded shadow-xl z-10 border border-zinc-700 normal-case font-normal">
                    Choose your display color for multiplayer games.
                  </div>
                </label>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-full border-2 border-zinc-700 overflow-hidden relative shrink-0"
                    style={{ backgroundColor: playerColor }}
                  >
                    <input
                      type="color"
                      value={playerColor}
                      onChange={(e) => handleColorSelect(e.target.value)}
                      className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer opacity-0"
                    />
                  </div>
                  <div className="min-w-0 flex-1 flex gap-2">
                    <div className="min-w-0 flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 flex items-center gap-2">
                      <span className="text-zinc-500 font-mono text-xs">HEX</span>
                      <input 
                        type="text" 
                        value={playerColor.toUpperCase()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                            handleColorSelect(val);
                          }
                        }}
                        className="bg-transparent border-none focus:outline-none text-white font-mono text-sm w-full uppercase"
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button onClick={createGame} className="min-h-12 w-full rounded-2xl bg-purple-600 px-6 py-4 text-lg font-bold text-white hover:bg-purple-500">
            Create {creationVisibility} lobby
          </button>
        </div>
      </div>
    );
  }

  if (gameData?.status === 'waiting') {
    const isHost = gameData.players[0] === user.uid;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div
          className="bg-zinc-900 border border-zinc-800 p-4 sm:p-8 rounded-3xl max-w-md w-full text-center"
        >
          <Trophy className="w-20 h-20 text-purple-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-3xl font-bold mb-2">Lobby</h2>
          <p className="mt-2 mb-4 text-sm text-zinc-500">{gameData.visibility === 'public' ? 'Public Lobby · Listed in the live catalog' : 'Private Lobby · Join by code or invitation'}</p>
          {presenceError && <p role="status" className="mb-4 text-sm text-amber-300">{presenceError}</p>}
          <p className="text-zinc-400 mb-8">Share this lobby code with the other players.</p>
          
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl mb-8 font-mono text-base sm:text-xl break-all text-purple-400 select-all">
            {gameId}
          </div>

          <div className="mb-8 text-left bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Game Settings</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Category:</span>
                <span className="text-white capitalize">{gameData.category || 'all'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Difficulty:</span>
                <span className="text-white capitalize">{gameData.difficulty || 'medium'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Win Condition:</span>
                <span className="text-white capitalize">{gameData.settings?.winCondition === 'first_to_n' ? 'First to N' : 'Time Limit'}</span>
              </div>
              {gameData.settings?.winCondition === 'first_to_n' ? (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Target Score:</span>
                  <span className="text-white">{gameData.settings?.targetScore}</span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Time Limit:</span>
                  <span className="text-white">{gameData.settings?.timeLimit}s</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-400">Penalties:</span>
                <span className="text-white">{gameData.settings?.penalties ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>

          <div className="mb-8 text-left">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Players ({gameData.players.length}/10)</h3>
            <div className="space-y-2">
              {gameData.players.map(p => (
                <div key={p} className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg flex items-center gap-3">
                  {playerProfiles[p]?.photoURL ? (
                    <Image 
                      src={playerProfiles[p].photoURL} 
                      alt={playerProfiles[p].displayName || 'Player'} 
                      width={32} 
                      height={32} 
                      className="rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 shrink-0 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-500 font-bold">
                      {playerProfiles[p]?.displayName?.charAt(0) || '?'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    <span className="min-w-0 break-words">{playerProfiles[p]?.displayName || 'Loading...'}</span>
                    {playerProfiles[p]?.rating !== undefined && (
                      <RankIcon rated={ratedFor(p)} rating={ratingFor(p)} className="w-4 h-4 shrink-0" />
                    )}
                  </div>
                  {p === gameData.players[0] && <span className="ml-auto shrink-0 text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">HOST</span>}
                </div>
              ))}
            </div>
          </div>
          
          {isHost ? (
            <button 
              onClick={startGame}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-colors mb-4"
            >
              Start Game
            </button>
          ) : (
            <p className="text-zinc-400 mb-4 animate-pulse">Waiting for host to start...</p>
          )}

          <ReplayCaptureStatus status={captureStatus} /><GameSaveError error={saveError} />
          {saveError && <p role="alert" className="my-3 text-sm text-red-300">{saveError}</p>}
          <button disabled={leaving} onClick={leaveLobby} className="w-full min-h-11 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition-colors disabled:opacity-50">
            {leaving ? 'Leaving…' : 'Leave Lobby'}
          </button>
        </div>
      </div>
    );
  }

  if (gameData?.status === 'finished') {
    const standings = gameStandings(gameData);
    const sortedPlayers = standings.map(p => p.uid);
    const outcome = standings.find(p => p.uid === user.uid)?.outcome;
    const isWinner = outcome === 'win';

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div
          className="bg-zinc-900 border border-zinc-800 p-4 sm:p-8 rounded-3xl max-w-md w-full text-center"
        >
          {isWinner ? (
            <div className="text-purple-500 text-6xl mb-6">👑</div>
          ) : (
            <div className="text-zinc-500 text-6xl mb-6">👏</div>
          )}
          
          <h2 className="text-3xl font-bold mb-8">
            {isWinner ? 'You Won!' : outcome === 'draw' ? 'Draw!' : 'Game Over'}
          </h2>
          
          <div className="space-y-3 mb-8 text-left">
            {sortedPlayers.map((p, i) => (
              <div key={p} className={`flex items-center justify-between p-4 rounded-xl border ${p === user.uid ? 'bg-purple-500/10 border-purple-500/30' : 'bg-zinc-950 border-zinc-800'}`}>
                <div className="min-w-0 flex-1 flex items-center gap-3">
                  <span className="text-zinc-500 font-mono font-bold w-4">{standings.find(s => s.uid === p)?.rank}.</span>
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    {playerProfiles[p]?.photoURL ? (
                      <Image 
                        src={playerProfiles[p].photoURL} 
                        alt={playerProfiles[p].displayName || 'Player'} 
                        width={24} 
                        height={24} 
                        className="rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-6 h-6 shrink-0 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-500 font-bold text-xs">
                        {playerProfiles[p]?.displayName?.charAt(0) || '?'}
                      </div>
                    )}
                    <span className={`min-w-0 break-words ${p === user.uid ? 'font-bold' : 'text-white'}`} style={p === user.uid ? { color: playerColor } : { color: playerProfiles[p]?.color || '#ffffff' }}>
                      {playerProfiles[p]?.displayName || 'Unknown'}
                    </span>
                    {playerProfiles[p]?.rating !== undefined && (
                      <RankIcon rated={ratedFor(p)} rating={ratingFor(p)} className="w-4 h-4 shrink-0" />
                    )}
                  </div>
                </div>
                <span 
                  key={gameData.scores[p] || 0}
                  className="shrink-0 ml-3 whitespace-nowrap font-mono font-bold inline-block"
                  style={p === user.uid ? { color: playerColor } : { color: playerProfiles[p]?.color || '#ffffff' }}
                >
                  {gameData.scores[p] || 0}
                  {gameData.settings?.winCondition === 'first_to_n' && <span className="text-zinc-500 text-xs ml-1">/ {gameData.settings.targetScore}</span>}
                </span>
              </div>
            ))}
          </div>
          
          <ReplayCaptureStatus status={captureStatus} /><GameResultStatus gameId={gameId} />
          <LastAnswerReview answer={lastAnswer} />

          <div className="flex flex-col gap-4">
            <button 
              onClick={onPlayAgain}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-colors"
            >
              Play Again
            </button>
            <ReplayCaptureStatus status={captureStatus} /><GameSaveError error={saveError} />
          <a href="/" className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition-colors block">
              Back to Dashboard
            </a>
          </div>
        </div>
        <Chat gameId={gameId!} messages={gameData.messages || []} />
      </div>
    );
  }

  if (gameData?.status === 'active' && currentIndex >= (gameData.questions?.length || 0)) {
    return <div className="min-h-screen max-w-2xl mx-auto px-4 py-24 text-center">
      <h2 className="text-2xl font-bold mb-4">Your questions are complete</h2>
      <p className="text-zinc-400">Waiting for the other players or the match deadline. Your answers and XP are saved.</p>
      <ReplayCaptureStatus status={captureStatus} /><GameSaveError error={saveError} />
      <a className="inline-block mt-6 underline" href="/">Back to Dashboard</a>
      <Chat gameId={gameId!} messages={gameData.messages || []} />
    </div>;
  }

  if (gameData?.status === 'active' && gameData.questions) {
    const q = gameData.questions[currentIndex];
    const isCorrect = selectedOption === q?.correctIndex;
    
    // Sort players by score for the leaderboard
    const standings = gameStandings(gameData);
    const sortedPlayers = standings.map(p => p.uid);

    return (
      <div className="min-h-screen max-w-6xl mx-auto px-4 py-12 flex gap-8 flex-col lg:flex-row relative overflow-x-clip">
        <ReplayCaptureStatus status={captureStatus} /><GameSaveError error={saveError} />
        
          {xpEarned !== null && (
             <div
               className="pointer-events-none fixed top-24 right-10 md:right-20 bg-amber-500/20 border border-amber-500/50 text-amber-500 font-bold px-4 py-2 rounded-xl flex items-center gap-2 z-50 shadow-lg"
             >
               <span className="text-xl">+</span>
               <span className="text-2xl">{xpEarned} XP</span>
             </div>
          )}
        
        
        {/* Main Game Area */}
        <div className="min-w-0 flex-1">
          <div className="flex justify-between items-center mb-8 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
            <div className="text-zinc-400 font-mono text-sm">
              Question {currentIndex + 1} of {gameData.questions.length}
            </div>
            {gameData.settings?.winCondition === 'time_limit' && timeLeft !== null && (
              <div className="text-purple-400 font-mono font-bold text-xl">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            )}
            {gameData.settings?.winCondition === 'first_to_n' && (
              <div className="text-purple-400 font-mono font-bold text-sm">
                Target: {gameData.settings.targetScore} pts
              </div>
            )}
          </div>

          {q && (
            
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
                        btnClass += "bg-zinc-800 border-purple-500/50 text-white";
                      } else {
                        btnClass += "bg-zinc-950 border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-800 cursor-pointer text-zinc-300";
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
                      className="px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl font-bold text-lg transition-colors flex items-center gap-2"
                    >
                      Confirm Answer <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            
          )}

          {showExplanation && q && (
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
                  {currentIndex < gameData.questions.length - 1 ? 'Next Question' : 'View Match Status'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Leaderboard */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sticky top-24">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-500" /> Live Standings
            </h3>
            <div className="space-y-3">
              {sortedPlayers.map((p, i) => (
                <div key={p} className={`flex items-center justify-between p-3 rounded-xl border ${p === user.uid ? 'bg-purple-500/10 border-purple-500/30' : 'bg-zinc-950 border-zinc-800'}`}>
                  <div className="min-w-0 flex-1 flex items-center gap-3">
                    <span className="text-zinc-500 font-mono font-bold w-4">{standings.find(s => s.uid === p)?.rank}.</span>
                    <div className="min-w-0 flex-1 flex items-center gap-1.5">
                      {playerProfiles[p]?.photoURL ? (
                        <Image 
                          src={playerProfiles[p].photoURL} 
                          alt={playerProfiles[p].displayName || 'Player'} 
                          width={20} 
                          height={20} 
                          className="rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-5 h-5 shrink-0 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-500 font-bold text-[10px]">
                          {playerProfiles[p]?.displayName?.charAt(0) || '?'}
                        </div>
                      )}
                      <span title={playerProfiles[p]?.displayName} className={`min-w-0 truncate text-sm ${p === user.uid ? 'font-bold' : 'text-zinc-300'}`} style={p === user.uid ? { color: playerColor } : { color: playerProfiles[p]?.color || '#d4d4d8' }}>
                        {playerProfiles[p]?.displayName?.split(' ')[0] || 'Unknown'}
                      </span>
                      {playerProfiles[p]?.rating !== undefined && (
                        <RankIcon rated={ratedFor(p)} rating={ratingFor(p)} className="w-3 h-3 shrink-0" />
                      )}
                    </div>
                  </div>
                  <span 
                    key={gameData.scores[p] || 0}
                    className="shrink-0 ml-3 whitespace-nowrap font-mono font-bold inline-block"
                    style={p === user.uid ? { color: playerColor } : { color: playerProfiles[p]?.color || '#c084fc' }}
                  >
                    {gameData.scores[p] || 0}
                    {gameData.settings?.winCondition === 'first_to_n' && <span className="text-zinc-500 text-xs ml-1">/ {gameData.settings.targetScore}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Chat gameId={gameId!} messages={gameData.messages || []} />
      </div>
    );
  }

  return null;
}
