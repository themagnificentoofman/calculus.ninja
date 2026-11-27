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
import { Users, RefreshCw, Home, Play, CheckCircle2, XCircle, ArrowRight, Swords, Info } from 'lucide-react';
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

interface AnswerRecord {
  questionIndex: number;
  timeMs: number;
}

type GameData = MultipleChoiceSession;

export default function PvPMode() {
  const [match, setMatch] = useState(0);
  return <PvPMatch key={match} onPlayAgain={() => {clearRoundUrl();setMatch(value => value + 1);}} />;
}

function PvPMatch({ onPlayAgain }: { onPlayAgain: () => void }) {
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<AnsweredQuestion | null>(null);
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const [playerProfiles, setPlayerProfiles] = useState<Record<string, any>>({});
  const busy = useRef(false);
  const restoredGame = useRef<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);
  const [playerColor, setPlayerColor] = useState(profile?.color || '#ef4444');

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
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (gameData?.status !== 'active') return;
    const tick = () => {
      const left = Math.max(0, Math.ceil(((gameData.startTime || 0) - Date.now()) / 1000));
      setCountdown(left || null); setGameStarted(left === 0);
    };
    tick(); const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [gameData?.status, gameData?.startTime]);

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

  const [hostInvitation, setHostInvitation] = useState<{room:string;to:string;message:string;retry:boolean} | null>(null);
  const [invitedFriendId, setInvitedFriendId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const params = new URLSearchParams(window.location.search);
      const invite = params.get('invite');
      if (invite) {
        setInvitedFriendId(invite);
      }
      const joinId = params.get('join');
      if (joinId) {
        joinGame(joinId,'link');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!gameId || !user || gameData?.status !== 'active' || !gameData.deadline) return;
    let ending = false;
    const tick = async () => {
      const remaining = Math.max(0, Math.ceil((gameData.deadline! - Date.now()) / 1000));

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

  async function inviteFromStart(room:string, to:string, uid:string) {
    try {
      const invitation = await apiRequest('social', {action:'invite_once', to, gameId:room}, uid);
      if (auth.currentUser?.uid === uid) setHostInvitation({room,to,message:invitation.status === 'rejected' ? 'Your friend declined the invitation.' : 'Invitation sent.',retry:false});
    } catch {
      if (auth.currentUser?.uid === uid) setHostInvitation({room,to,message:'The invitation could not be confirmed.',retry:true});
    }
  }
  const [closedHostId, setClosedHostId] = useState<string | null>(null);
  async function loadHostRoom(id:string, saved?:{inviteTo?:string}) {
    if (!user) return false;
    const uid = user.uid;
    const game = requireMultipleChoiceSession(await gameProgress.getGame(id, uid));
    if (auth.currentUser?.uid !== uid) return false;
    if (game.mode !== 'pvp' || game.players[0] !== uid) throw Error('This lobby belongs to another host.');
    if (game.status === 'cancelled') {
      setClosedHostId(id);
      setGenerationError('This lobby closed. You can start another game.');
      return true;
    }
    setGameData(game);
    setGameId(id);
    if (saved?.inviteTo && game.status === 'waiting') await inviteFromStart(id,saved.inviteTo,uid);
    return true;
  }
  const hostStart = usePendingRoundStart(user?.uid, 'pvp', loadHostRoom, gameId && gameData?.players[0] === user?.uid ? gameId : closedHostId);
  const createGame = () => {
    if (!user) return;
    setClosedHostId(null);
    setGenerationError('');
    return hostStart.start({mode:'pvp',category,difficulty,count,options:{visibility:creationVisibility ?? 'private'},...(invitedFriendId ? {inviteTo:invitedFriendId} : {})});
  };

  const joinGame = async (idToJoin: string, source:'manual'|'link'='manual') => {
    if (!user) return;
    setLoading(true); setGenerationError('');
    try {
      const id = idToJoin.trim();
      if (!/^[a-zA-Z0-9]{5,30}$/.test(id)) throw new Error('Enter a valid lobby code.');
      await gameProgress.joinGame(id, user.uid, 'pvp',source);
      setGameId(id);
    } catch (error) { setGenerationError(error instanceof Error ? error.message : 'Could not join this game.'); }
    finally { setLoading(false); }
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

  useRoundUrl(user?.uid,gameId,id=>{void gameProgress.getGame(id,user?.uid).then(g=>{if(g.mode!=='pvp')throw Error('This round belongs to another mode.');setGameId(id);}).catch(e=>setGenerationError(e.message));});
  const capturedFeedbackIndex=showExplanation?currentIndex:gameData?.status==='finished'&&lastAnswer?gameData.questions?.findIndex(q=>!!q.problemId&&q.problemId===lastAnswer.question.problemId)??-1:-1;
  const captureStatus=useReplayCapture(user?.uid,gameId,gameData?.replayVersion,{index:!loading&&gameData?.status==='active'&&gameStarted&&currentIndex<(gameData.questions?.length||0)?currentIndex:null,selectedOption,feedbackIndex:capturedFeedbackIndex>=0?capturedFeedbackIndex:null,serverEventId:gameData?.answers?.[user?.uid||'']?.[capturedFeedbackIndex]?.serverEventId,finished:gameData?.status==='finished',settled:!saving});

  if (authLoading) return <main className="p-8 text-center text-zinc-400" role="status">Loading your account…</main>;

  if (!user) return <LobbySignIn mode="pvp" />;

  if (loading || hostStart.loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <RefreshCw className="w-12 h-12 text-red-500 animate-spin mb-4" />
        <p className="text-xl text-zinc-400 animate-pulse">Setting up arena...</p>
      </div>
    );
  }

  if (!gameId && hostStart.pending) return <main className="mx-auto max-w-xl px-4 py-12"><PendingRoundStart state={hostStart}/>{hostStart.error && <p role="alert">{hostStart.error}</p>}</main>;
  if (!gameId && !creationVisibility) return <LobbyChoice mode="pvp" error={generationError || hostStart.error} onPrivate={() => setCreationVisibility('private')} onJoin={joinGame} />;

  if (!gameId) {
    return (
      <div className="min-h-screen max-w-3xl mx-auto px-4 py-12 flex flex-col justify-center">
        <button onClick={() => { if (creationVisibility === 'public') location.assign('/play/pvp/lobbies'); else setCreationVisibility(null); }} className="mb-8 inline-flex min-h-11 w-fit items-center gap-2 text-zinc-400 hover:text-white">
          <Home className="h-4 w-4" /> Back to {creationVisibility === 'public' ? 'public catalog' : 'PvP lobbies'}
        </button>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-4">
            <Swords className="w-4 h-4" />
            <span>PvP</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{creationVisibility === 'public' ? 'Public Lobby' : 'Private Lobby'}</h1>
          <p className="text-zinc-400 mt-4 text-lg">Challenge another player in a head-to-head calculus battle.</p>

          {invitedFriendId && (
            <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-3">
              <Users className="w-5 h-5 text-indigo-400" />
              <p className="text-sm text-indigo-200">
                You are setting up a game to invite a friend. They will receive a notification once you create the lobby.
              </p>
            </div>
          )}
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
                  className="w-full appearance-none bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
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
                        ? 'bg-red-500/20 border-red-500 text-red-400'
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
                Number of Questions
                <Info className="w-4 h-4 text-zinc-500 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-zinc-800 text-xs text-zinc-300 rounded shadow-xl z-10 border border-zinc-700 normal-case font-normal">
                  The amount of questions in the match.
                </div>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={count}
                  onChange={e => setCount(parseInt(e.target.value) || 5)}
                  className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <div className="w-16 h-12 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center font-mono font-bold text-xl text-red-400">
                  {count}
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-zinc-300 mb-3 uppercase tracking-wider group relative w-fit">
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

          <button onClick={createGame} className="min-h-12 w-full rounded-2xl bg-red-600 px-6 py-4 text-lg font-bold text-white hover:bg-red-500">
            Create {creationVisibility} lobby
          </button>
        </div>
      </div>
    );
  }

  if (gameData?.status === 'waiting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div
          className="bg-zinc-900 border border-zinc-800 p-4 sm:p-8 rounded-3xl max-w-md w-full text-center"
        >
          <Users className="w-20 h-20 text-red-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-3xl font-bold mb-2">Waiting for Opponent...</h2>
          <p className="mt-2 mb-4 text-sm text-zinc-500">{gameData.visibility === 'public' ? 'Public Lobby · Listed in the live catalog' : 'Private Lobby · Join by code or invitation'}</p>
          {presenceError && <p role="status" className="mb-4 text-sm text-amber-300">{presenceError}</p>}
          <p className="text-zinc-400 mb-6">Share this lobby code with your opponent.</p>

          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl mb-6 font-mono text-base sm:text-xl break-all text-red-400 select-all">
            {gameId}
          </div>

          {hostInvitation?.room === gameId && hostInvitation && <div className="mb-6 rounded-xl border border-indigo-500/20 p-4" role="status">
            <p>{hostInvitation.message}</p>
            {hostInvitation.retry && user && <button className="min-h-11 underline" onClick={() => inviteFromStart(gameId,hostInvitation.to,user.uid)}>Retry invitation</button>}
          </div>}

          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl mb-8 text-left space-y-2">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Game Settings</h3>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">Category</span>
              <span className="text-white capitalize">{gameData.category || 'Mixed'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">Difficulty</span>
              <span className="text-white capitalize">{gameData.difficulty || 'Medium'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">Questions</span>
              <span className="text-white">{gameData.questionCount ?? gameData.questions?.length ?? 0}</span>
            </div>
          </div>

          <ReplayCaptureStatus status={captureStatus} /><GameSaveError error={saveError} />
          {saveError && <p role="alert" className="my-3 text-sm text-red-300">{saveError}</p>}
          <button disabled={leaving} onClick={leaveLobby} className="w-full min-h-11 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition-colors disabled:opacity-50">
            {leaving ? 'Leaving…' : 'Cancel'}
          </button>
        </div>
      </div>
    );
  }

  if (gameData?.status === 'finished') {
    const myScore = gameData.scores[user.uid] || 0;
    const opponentUid = gameData.players.find(p => p !== user.uid);
    const opponentScore = opponentUid ? (gameData.scores[opponentUid] || 0) : 0;
    const opponentRating = opponentUid ? ratingFor(opponentUid) : 0;
    const myRating = profile?.rating || 0;

    const outcome = gameStandings(gameData).find(p => p.uid === user.uid)?.outcome;
    const isWinner = outcome === 'win';
    const isTie = outcome === 'draw' || outcome === 'unplayed';

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div
          className="bg-zinc-900 border border-zinc-800 p-4 sm:p-8 rounded-3xl max-w-md w-full text-center"
        >
          {isWinner ? (
            <div className="text-red-500 text-6xl mb-6">🏆</div>
          ) : isTie ? (
            <div className="text-zinc-500 text-6xl mb-6">🤝</div>
          ) : (
            <div className="text-blue-500 text-6xl mb-6">💀</div>
          )}

          <h2 className="text-3xl font-bold mb-2">
            {isWinner ? 'Victory!' : isTie ? 'Draw!' : 'Defeat!'}
          </h2>

          <div className="flex justify-center gap-8 my-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <RankIcon rated={hasRating(profile)} rating={myRating} className="w-4 h-4" />
                <p className="text-zinc-400 text-sm">You</p>
              </div>
              <p className="text-4xl font-bold font-mono" style={{ color: playerColor }}>{myScore}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <p className="text-zinc-400 text-sm">Opponent</p>
                <RankIcon rated={ratedFor(opponentUid || '')} rating={opponentRating} className="w-4 h-4" />
              </div>
              <p className="text-4xl font-bold font-mono" style={{ color: opponentUid ? (playerProfiles[opponentUid]?.color || '#3b82f6') : '#3b82f6' }}>{opponentScore}</p>
            </div>
          </div>

          {/* Match Timeline Summary */}
          {(() => {
            const allAnswers: any[] = [];
            if (gameData.timeline) {
              Object.values(gameData.timeline).forEach(playerAnswers => {
                if (Array.isArray(playerAnswers)) {
                   allAnswers.push(...playerAnswers);
                }
              });
            }
            if (allAnswers.length > 0) {
              const maxTime = Math.max(10000, ...allAnswers.map(a => a.timeMs)); // minimum 10s scale

              return (
                <div className="mb-8 pt-6 border-t border-zinc-800/50 text-left">
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Timeline (Correct Answers)</h3>
                  <div className="space-y-3">
                    {(gameData.questions || []).map((q, idx) => {
                      const myAnswer = gameData.timeline?.[user.uid]?.find((a: any) => a.questionIndex === idx);
                      const oppAnswer = opponentUid ? gameData.timeline?.[opponentUid]?.find((a: any) => a.questionIndex === idx) : null;

                      if (!myAnswer && !oppAnswer) return null; // Only show if someone answered correctly

                      return (
                        <div key={idx} className="flex flex-col gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800/50">
                          <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase">
                            <span>Q{idx + 1}</span>
                            <span>{Math.max(myAnswer?.timeMs || 0, oppAnswer?.timeMs || 0) > 0 ? (Math.max(myAnswer?.timeMs || 0, oppAnswer?.timeMs || 0) / 1000).toFixed(1) + 's max' : ''}</span>
                          </div>
                          <div className="relative h-6 bg-zinc-900 rounded-lg">
                            {/* Visual Timeline Bar */}
                            {myAnswer && (
                              <div
                                className="absolute top-0 bottom-0 w-1.5 z-20 shadow-lg rounded-full"
                                title={`You: ${(myAnswer.timeMs / 1000).toFixed(1)}s`}
                                style={{
                                  backgroundColor: playerColor,
                                  left: `${Math.min(98, (myAnswer.timeMs / maxTime) * 100)}%`
                                }}
                              />
                            )}
                            {oppAnswer && (
                              <div
                                className="absolute top-0 bottom-0 w-1.5 z-10 shadow-lg rounded-full"
                                title={`Opponent: ${(oppAnswer.timeMs / 1000).toFixed(1)}s`}
                                style={{
                                  backgroundColor: opponentUid ? (playerProfiles[opponentUid]?.color || '#3b82f6') : '#3b82f6',
                                  left: `${Math.min(98, (oppAnswer.timeMs / maxTime) * 100)}%`
                                }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          <ReplayCaptureStatus status={captureStatus} /><GameResultStatus gameId={gameId} />
          <LastAnswerReview answer={lastAnswer} />

          <div className="flex flex-col gap-4">
            <button
              onClick={onPlayAgain}
              className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition-colors"
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

  if (gameData?.status === 'active' && countdown !== null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative">
        
          <div
            key={countdown}
            className="text-8xl font-bold text-red-500 font-mono"
          >
            {countdown > 0 ? countdown : 'GO!'}
          </div>
        

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

  if (gameData?.status === 'active' && gameData.questions && gameStarted) {
    const q = gameData.questions[currentIndex];
    const isCorrect = selectedOption === q?.correctIndex;

    const myScore = gameData.scores[user.uid] || 0;
    const opponentUid = gameData.players.find(p => p !== user.uid);
    const opponentScore = opponentUid ? (gameData.scores[opponentUid] || 0) : 0;
    const opponentName = opponentUid ? (playerProfiles[opponentUid]?.displayName || 'Opponent') : 'Opponent';
    const opponentRating = opponentUid ? ratingFor(opponentUid) : 0;
    const myRating = profile?.rating || 0;

    return (
      <div className="min-h-screen max-w-4xl mx-auto px-4 py-12 relative overflow-x-clip">
        <ReplayCaptureStatus status={captureStatus} /><GameSaveError error={saveError} />
        
          {xpEarned !== null && (
             <div
               className="pointer-events-none fixed top-24 right-10 md:right-20 bg-amber-500/20 border border-amber-500/50 text-amber-500 font-bold px-4 py-2 rounded-xl flex items-center gap-2 z-50 shadow-lg"
             >
               <span className="text-xl">+</span>
               <span className="text-2xl">{xpEarned} XP</span>
             </div>
          )}
        

        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-3 items-center mb-8 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
          <div className="min-w-0 flex items-center justify-center gap-4">
            <div className="min-w-0 text-center">
              <div className="flex items-center gap-1.5 justify-center mb-1">
                <RankIcon rated={hasRating(profile)} rating={myRating} className="w-3 h-3 shrink-0" />
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">You</p>
              </div>
              <p
                key={myScore}
                className="text-2xl font-bold font-mono inline-block"
                style={{ color: playerColor }}
              >
                {myScore}
              </p>
            </div>
          </div>

          <div className="text-zinc-400 font-mono text-sm whitespace-nowrap">
            Q {currentIndex + 1} / {gameData.questions.length}
          </div>

          <div className="min-w-0 flex items-center justify-center gap-4">
            <div className="min-w-0 text-center">
              <div className="flex items-center gap-1.5 justify-center mb-1">
                <p title={opponentName} className="min-w-0 truncate text-xs text-zinc-500 uppercase font-bold tracking-wider">{opponentName}</p>
                <RankIcon rated={ratedFor(opponentUid || '')} rating={opponentRating} className="w-3 h-3 shrink-0" />
              </div>
              <p
                key={opponentScore}
                className="text-2xl font-bold font-mono inline-block"
                style={{ color: opponentUid ? (playerProfiles[opponentUid]?.color || '#3b82f6') : '#3b82f6' }}
              >
                {opponentScore}
              </p>
            </div>
          </div>
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
                      btnClass += "bg-zinc-800 border-red-500/50 text-white";
                    } else {
                      btnClass += "bg-zinc-950 border-zinc-800 hover:border-red-500/50 hover:bg-zinc-800 cursor-pointer text-zinc-300";
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
                    className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-lg transition-colors flex items-center gap-2"
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
        <Chat gameId={gameId!} messages={gameData.messages || []} />
      </div>
    );
  }

  return null;
}
