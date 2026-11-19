import type { ProblemReference, RoundSnapshot, ProblemPedagogy } from './bank/contracts.ts';
import { finite, getStandings, type GameMode } from './progression.ts';

type QuestionPedagogy=Omit<ProblemPedagogy,'responseFormat'>&{responseFormat:'multiple-choice'|'free-response'};
export interface QuestionBase extends Partial<ProblemReference> { assumptions?:string[]; legacy?:boolean; contentNotice?:import('./bank/contracts.ts').ContentNotice; contentAttribution?:import('./bank/contracts.ts').ContentCredit; templateVersion?:string; solutionReviewVersion?:string; pedagogy?: QuestionPedagogy; context?: {assumptions:string[];subtopic:string;techniqueTags:string[];parameters:Record<string,number>}; latexProblem: string; explanation: string | string[]; topic: string; difficulty: string }
export interface MultipleChoiceQuestion extends QuestionBase {responseFormat?:'multiple-choice';options:string[];correctIndex:number;freeResponse?:never;answerInstructions?:never}
export interface FreeResponseQuestion extends QuestionBase {responseFormat:'free-response';options?:never;correctIndex?:never;choiceOrder?:never;freeResponse:import('./math-answer/versioned-contracts.ts').FreeResponseContract;answerInstructions:string;answerContractId:string;answerContractHash:string;graderVersion:string;parserVersion:string}
export type GameQuestion = MultipleChoiceQuestion | FreeResponseQuestion;
export interface AnswerBase {xp:number;timeMs:number;serverEventId?:string;requestId?:string;acceptedAt?:number}
export interface MultipleChoiceAnswer extends AnswerBase {responseFormat?:'multiple-choice';selectedOption:number;correct:boolean}
export interface FreeResponseAnswer extends AnswerBase {responseFormat:'free-response';selectedOption?:never;correct?:boolean;finalization:'graded'|'skipped'|'revealed';outcome:import('./math-answer/versioned-contracts.ts').Verdict['outcome']|'skipped'|'revealed';source:string;interpretation:string;contractHash:string;graderVersion:string;submissionId:string;feedback:string}
export type SavedAnswer = MultipleChoiceAnswer | FreeResponseAnswer;
export interface FreeResponseSummary {correct:number;incorrect:number;graded:number;skipped:number;revealed:number;ungradedSubmissions:number;finalized:number;total:number}
export function freeResponseSummary(game:GameSession,uid:string):FreeResponseSummary {
  const answers=Object.values(game.answers?.[uid]||{}).filter((a):a is FreeResponseAnswer=>a.responseFormat==='free-response');
  const graded=answers.filter(a=>a.finalization==='graded').length,correct=answers.filter(a=>a.correct===true).length;
  return {correct,incorrect:graded-correct,graded,skipped:answers.filter(a=>a.finalization==='skipped').length,revealed:answers.filter(a=>a.finalization==='revealed').length,ungradedSubmissions:Math.max(0,Object.values(game.frAttemptCounts||{}).reduce((sum,n)=>sum+finite(n),0)-graded),finalized:answers.length,total:game.questions?.filter(q=>q.responseFormat==='free-response').length??game.questionCount??0};
}
export interface MatchSettings { category?: string; difficulty?: string; winCondition: 'first_to_n' | 'time_limit'; targetScore: number; timeLimit: number; penalties: boolean }
export interface ResultReceipt { ratingChange: number; newRating: number; topicChanges: Record<string, number>; outcome: string; rank: number; rated: boolean; counted: boolean; legacy?: boolean; statisticsKind?:'free-response'|'mixed' }
export interface GameSession {
  visibility?: 'private' | 'public'; lobbyPresence?: Record<string, number>; lobbyExpiresAt?: number;
  mode: GameMode; status: 'waiting' | 'active' | 'finished' | 'cancelled'; players: string[]; scores: Record<string, number>;
  roundSnapshot?: RoundSnapshot;
  pvpGuestHoldVersion?: 1;
  competitiveRoom?: {version:2|3; catalogWindow?:import('./server/competitive-catalog.ts').CompetitiveCatalogWindow; id:string; createdAt:number; deadline:number; selectionHash:string; seats:Record<string,{key:string;at:number}>; issuedAt?:number};
  replayVersion?:1|2; replaySequence?:number; replayChunkCount?:number; logicalEndAt?:number; endReason?:string; originalTimeLimit?:number;
  responseFormat?:'multiple-choice'|'free-response'|'mixed';
  questionMix?:{multipleChoice:number;freeResponse:number;order:'mcq-first'|'frq-first'|'uniform'};
  frAttemptCounts?:Record<string,number>;
  frRecentSubmissionAt?:number[];
  frLastSubmission?:{requestId:string;index:number;contractHash:string;outcome:import('./math-answer/versioned-contracts.ts').Verdict;source:string;at:number};
  freeResponseSummary?:FreeResponseSummary;
  questionCount?: number; questions?: GameQuestion[]; category?: string; difficulty?: string; settings?: MatchSettings;
  startTime?: number; deadline?: number; finishedAt?: number; createdAt?: unknown;
  progressionVersion?: number; answers?: Record<string, Record<string, SavedAnswer>>;
  ratingSnapshot?: Record<string, { rating: number; topicRatings: Record<string, number> }>;
  completedPlayers?: string[]; pendingClaims?: string[]; receipts?: Record<string, ResultReceipt>;
  timeline?: Record<string, { questionIndex: number; timeMs: number; serverEventId?:string; requestId?:string; acceptedAt?:number }[]>;
  messages?: { senderId: string; senderName: string; text: string; timestamp: number }[]; winner?: string;
}
export function gamePlayers(game: GameSession) {
  return game.players.map(uid => {
    const answers = game.answers?.[uid] || {};
    return { uid, score: finite(game.scores[uid]), attempted: (game.progressionVersion || 0) >= 2 ? Object.keys(answers).length : 1,
      correct: Object.values(answers).filter(a => a.correct).length, answers:Object.fromEntries(Object.entries(answers).filter(([,a])=>typeof a.correct==='boolean').map(([i,a])=>[i,{correct:a.correct!}])),
      rating: finite(game.ratingSnapshot?.[uid]?.rating), topicRatings: game.ratingSnapshot?.[uid]?.topicRatings || {} };
  });
}
export const gameStandings = (game: GameSession) => getStandings(gamePlayers(game).map(player =>
  // During play, rank the current score. Apply inactivity forfeits only at the end.
  game.status === 'active' ? { ...player, attempted: 1 } : player));
export const isCompetitive = (game: GameSession) => game.mode === 'pvp' || game.mode === 'multiplayer';
export const nextUnanswered = (game: GameSession, uid: string) => {
  const index = (game.questions || []).findIndex((_, i) => !game.answers?.[uid]?.[i]);
  return index === -1 ? (game.questions || []).length : index;
};
export type MultipleChoiceSession=Omit<GameSession,'questions'|'answers'>&{questions?:MultipleChoiceQuestion[];answers?:Record<string,Record<string,MultipleChoiceAnswer>>};
export function requireMultipleChoiceQuestions(questions:GameQuestion[]=[]):MultipleChoiceQuestion[]{if(questions.some(q=>q.responseFormat==='free-response'))throw Error('This mode requires multiple-choice questions.');return questions as MultipleChoiceQuestion[];}
export function requireMultipleChoiceSession(game:GameSession):MultipleChoiceSession{requireMultipleChoiceQuestions(game.questions);if(game.responseFormat==='free-response')throw Error('This round uses a different answer format.');return game as MultipleChoiceSession;}
