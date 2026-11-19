import {frDigest as digestCompetitiveSet} from '../bank/free-response-record.mjs';
import {selectionHistoryToken} from './selection-history-token.mjs';
import {boundedJsonSnapshot} from './bounded-json-snapshot.mjs';
import {canonical,hex} from '../bank/compact-codec.mjs';
import {questionOrderMatches} from '../round-question-config.mjs';
import {finishTestWithFreeResponse} from './test-round-results.ts';
import {isLegacyProblem} from '../bank/legacy-origin.mjs';
import { applyRatingChange, clampProfileRatings, ratingBalance } from '../rating-floor.ts';
import { lobbyCapacity, pruneLobby, updateLobbyExpiry } from '../lobby.ts';
import {reviewSavedQuestion} from './solution-presentation.mjs';
import { calculateProblemXp, calculateRatings, finite, TOPICS, type GameMode } from '../progression.ts';
import { gamePlayers, nextUnanswered, freeResponseSummary, type GameQuestion, type GameSession, type MatchSettings } from '../game-progress.ts';
import { recordTransition } from './replay-recording.ts';
import type { RoundSnapshot, RoundSelectionDiagnostics as SelectionDiagnostics } from '../bank/contracts.ts';
import {requireCompetitiveWindow, type CompetitiveCatalogWindow} from './competitive-catalog.ts';
import {competitiveSelectionHash,knownCompetitiveRecord,recoverSet,privateSet,prepareSeat,roomFromSet,compatibleCreate,closedSeat,planCompetitive,CompetitiveHoldError} from './competitive-lifecycle.ts';
import { reserveQuestionSet } from '../bank/issuance-reservations.mjs';
import { recordExposures,recordAttemptedExposures } from '../bank/exposure.ts';
import type { Store, Transaction, Data } from './firestore-admin.ts';
import {actFreeResponse} from './free-response-actions.ts';
import {referenceAnswer} from '../math-answer/presentation.ts';

export class GameError extends Error { status: number; constructor(message: string, status = 400) { super(message); this.status = status; } }
export const identifier = (value: unknown) => { if (typeof value !== 'string' || (!/^[a-zA-Z0-9_-]{5,128}$/.test(value) || ['__proto__', 'constructor', 'prototype'].includes(value))) throw new GameError('Invalid identifier.'); return value; };
const requireMember = (game: GameSession, uid: string) => { if (!game.players.includes(uid)) throw new GameError('You are not a player in this game.', 403); };
const snapshot = (p: Data) => ({ rating: ratingBalance(p.rating), topicRatings: Object.fromEntries(TOPICS.map(t => [t, ratingBalance(p.topicRatings?.[t])])) });
export const lobbyExpired = (g: GameSession, time: number) => g.status === 'waiting' && new Date(g.createdAt as any).getTime() + 30 * 60_000 <= time;
const competitive = (g: GameSession) => ['pvp', 'multiplayer'].includes(g.mode);
export function publicProfile(profile: Data) {
  const keys = ['uid', 'displayName', 'handle', 'photoURL', 'color', 'lastActive', 'createdAt', 'rating', 'classification', 'gamesPlayed', 'wins', 'losses', 'draws', 'ratedGames', 'xp', 'topicXp', 'topicRatings', 'topicRatedGames'];
  return Object.fromEntries(keys.filter(k => profile[k] !== undefined).map(k => [k, profile[k]]));
}
export function publicGame(game: GameSession) {
  const { questions = [], answers = {} } = game;
  // Deliberate public schema: adding a private submission/diagnostic field to a
  // saved round or answer must never publish it by default.
  const publicKeys = ['mode','status','players','scores','category','difficulty','settings','startTime','deadline','finishedAt','createdAt','progressionVersion','completedPlayers','pendingClaims','receipts','messages','winner','replayVersion','logicalEndAt','endReason','originalTimeLimit','responseFormat','visibility','lobbyExpiresAt'] as const;
  const rest = Object.fromEntries(publicKeys.filter(k => game[k] !== undefined).map(k => [k, game[k]]));
  return { ...rest, questionCount: questions.length,
    ...(game.questionMix?{questionMix:{multipleChoice:game.questionMix.multipleChoice,freeResponse:game.questionMix.freeResponse,order:game.questionMix.order}}:{}),
    ...(game.timeline ? { timeline: Object.fromEntries(Object.entries(game.timeline).map(([uid,events]) => [uid,events.map(e=>({questionIndex:e.questionIndex,timeMs:e.timeMs}))])) } : {}),
    questions: ['waiting', 'cancelled'].includes(game.status) ? [] : questions.map(q => ({ ...(isLegacyProblem(q)?{legacy:true}:{}), latexProblem: q.latexProblem, ...(q.responseFormat==='free-response'?{responseFormat:'free-response',answerInstructions:q.answerInstructions,assumptions:q.freeResponse.presentation.assumptions,contentHash:q.contentHash,answerContractId:q.answerContractId,answerContractHash:q.answerContractHash,graderVersion:q.graderVersion,parserVersion:q.parserVersion}:{options:q.options}), topic: q.topic, difficulty: q.difficulty, ...(q.contentAttribution?{contentNotice:{credit:q.contentAttribution.credit,sourceUrl:q.contentAttribution.sourceUrl,sourceItem:q.contentAttribution.sourceItem,license:q.contentAttribution.license,licenseUrl:q.contentAttribution.licenseUrl}}:{}), ...(q.problemId ? { problemId: q.problemId, problemRevision: q.problemRevision } : {}) })),
    answers: Object.fromEntries(Object.entries(answers).map(([uid, values]) => [uid, Object.fromEntries(Object.entries(values).map(([i,a]) => [i,{...(typeof a.correct==='boolean'?{correct:a.correct}:{}),xp:a.xp,timeMs:a.timeMs,...(a.responseFormat==='free-response'?{responseFormat:'free-response',finalization:a.finalization,outcome:a.outcome}:{})}]))])),
  };
}
function ownProgress(game: GameSession, uid: string) {
  const answers = game.answers?.[uid] || {};
  return { answers, ...(['free-response','mixed'].includes(game.responseFormat||'')?{freeResponseSummary:freeResponseSummary(game,uid)}:{}), reviews: Object.fromEntries(Object.keys(answers).map(index => {
    const q = game.questions![Number(index)]; if(q.responseFormat==='free-response')return [index,{responseFormat:'free-response',canonicalAnswer:referenceAnswer(q.freeResponse.answer),explanation:q.explanation,...(q.contentAttribution?{contentAttribution:q.contentAttribution}:{})}];const review=reviewSavedQuestion(q); return [index, { ...(q.contentAttribution?{contentAttribution:q.contentAttribution}:{}), correctIndex: q.correctIndex, explanation: review?.steps||q.explanation, ...(review?{solutionReviewVersion:review.version,explanationClarified:review.clarified}:{}) }];
  })) };
}
export const playerView = (game: GameSession, uid: string) => ({ game: publicGame(game), progress: ownProgress(game, uid), ...(game.status==='waiting'&&knownCompetitiveRecord(game.competitiveRoom)&&game.competitiveRoom.seats[uid]?{lobbyVisitId:game.competitiveRoom.seats[uid].key}:{}) });
export function saveGame(tx: Transaction, id: string, game: GameSession, reviews = true, projection = true) {
  updateLobbyExpiry(game);
  tx.set(`gameSecrets/${id}`, game);
  // Existing deployed rules expose waiting rooms for discovery. This internal
  // status keeps private rooms member-only without widening any read permissions.
  const view = publicGame(game);
  if (projection) tx.set(`games/${id}`, { ...view, status: game.status === 'waiting' && game.visibility !== 'public' ? 'private_waiting' : game.status });
  if (reviews) for (const uid of game.players) tx.set(`games/${id}/reviews/${uid}`, ownProgress(game, uid));
}
function saveProfile(tx: Transaction, uid: string, profile: Data) {
  const repaired = clampProfileRatings(profile);
  tx.set(`users/${uid}`, repaired); tx.set(`users_public/${uid}`, publicProfile(repaired));
}
function patchProfile(profile: Data, patch: Data) {
  const allowed = ['displayName', 'handle', 'photoURL', 'color', 'settings'];
  if (!patch || typeof patch !== 'object' || Array.isArray(patch) || Object.keys(patch).some(k => !allowed.includes(k))) throw new GameError('Only profile preferences can be changed.');
  for (const [k, v] of Object.entries(patch)) {
    if (k === 'settings') {
      if (!v || Array.isArray(v) || typeof v !== 'object' || Object.keys(v).some(key => !['theme', 'notifications', 'soundEnabled', 'includeLegacyProblems'].includes(key)) ||
        ('theme' in v && !['dark', 'light', 'system'].includes(v.theme)) || ['notifications', 'soundEnabled', 'includeLegacyProblems'].some(key => key in v && typeof v[key] !== 'boolean')) throw new GameError('Invalid settings.');
      profile.settings = { ...profile.settings, ...v }; continue;
    }
    if (typeof v !== 'string' || v.length > (k === 'photoURL' ? 300000 : k === 'displayName' ? 99 : 32)) throw new GameError('Invalid profile field.');
    if (k === 'handle' && !/^[a-zA-Z0-9_]{3,32}$/.test(v)) throw new GameError('Handles must use 3–32 letters, numbers or underscores.');
    if (k === 'color' && !/^#[0-9a-fA-F]{6}$/.test(v)) throw new GameError('Invalid player color.');
    if (k === 'photoURL' && v && !/^https:\/\//.test(v) && !/^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(v)) throw new GameError('Invalid profile image.');
    if (k === 'displayName' && !v.trim()) throw new GameError('Enter a display name.');
    profile[k] = k === 'displayName' ? v.trim() : v;
  }
}
function settingsFor(mode: GameMode, input: Data): { timeLimit?: number; settings?: MatchSettings } {
  const integer = (n: unknown, min: number, max: number) => typeof n === 'number' && Number.isInteger(n) && n >= min && n <= max;
  if (mode === 'rapid') { if (!integer(input.timeLimit, 30, 300)) throw new GameError('Choose a 30–300 second time limit.'); return { timeLimit: input.timeLimit }; }
  if (mode === 'multiplayer') {
    const s = input.settings;
    if (!s || typeof s !== 'object' || Array.isArray(s) || Object.keys(s).some(k => !['winCondition', 'targetScore', 'timeLimit', 'penalties'].includes(k)) || !['first_to_n', 'time_limit'].includes(s.winCondition) || !integer(s.targetScore, 1, 20) || !integer(s.timeLimit, 30, 300) || typeof s.penalties !== 'boolean') throw new GameError('Invalid multiplayer settings.');
    return { settings: { winCondition: s.winCondition, targetScore: s.targetScore, timeLimit: s.timeLimit, penalties: s.penalties } };
  }
  return {};
}
export function competitiveRoomOptions(mode:GameMode,input:Data) {
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['visibility','settings'].includes(k))||
     (input.visibility!==undefined&&!['private','public'].includes(input.visibility))||(mode==='pvp'&&input.settings!==undefined))
    throw new GameError('Choose supported room settings.');
  return {visibility:input.visibility??'private',...settingsFor(mode,input)};
}
export function createServerGames(store: Store, now: () => number = Date.now, fencedCompetition = false) {
  async function profile(uid: string, claims: Data, patch: Data = {}) {
    return store.transaction(async tx => {
      const existing = await tx.get(`users/${uid}`);
      const p = existing || { uid, displayName: typeof claims.name === 'string' ? claims.name.slice(0, 99) : 'Calculus Ninja', handle: `user${uid.slice(0, 6)}`, photoURL: typeof claims.picture === 'string' ? claims.picture : '', email: typeof claims.email === 'string' ? claims.email : '',
        rating: 0, classification: 'Novice', gamesPlayed: 0, wins: 0, losses: 0, draws: 0, ratedGames: 0, answeredQuestions: 0, correctAnswers: 0, xp: 0, topicXp: {}, topicRatings: {}, topicRatedGames: {}, friends: [], settings: { theme: 'dark', notifications: true, soundEnabled: true, includeLegacyProblems: false }, createdAt: new Date(now()) };
      const previousUid = p.uid, previousActivity = finite(p.lastActive), time = now();
      p.uid = uid; patchProfile(p, patch); const repaired = clampProfileRatings(p);
      if (existing && previousUid === uid && repaired === p && Object.keys(patch).length === 0 && time >= previousActivity && time - previousActivity < 120000) return repaired;
      repaired.lastActive = time; saveProfile(tx, uid, repaired); return repaired;
    });
  }
  async function storeQuestions(uid: string, mode: GameMode, category: string, difficulty: string, questions: GameQuestion[], relaxation: RoundSnapshot['relaxation'] = 'none', diagnostics?: SelectionDiagnostics, questionMix?:GameSession['questionMix'],selectedFromHistory?:string, compactCompetitiveBank=false, identity?:Data, catalogWindow?:CompetitiveCatalogWindow) {
    const free=questions.some(q=>q.responseFormat==='free-response');if(free&&mode!=='test')throw new GameError('Free-response questions are available only in individual Test practice.');
    // Own the exact validated selection through hashing and transaction retries.
    const prepared=free||identity?boundedJsonSnapshot({questions,relaxation,...(diagnostics?{diagnostics}:{}),...(questionMix?{questionMix}:{})},{maxBytes:2000000,maxNodes:180000,maxDepth:40}):null;
    if(prepared){questions=prepared.questions;relaxation=prepared.relaxation;diagnostics=prepared.diagnostics;questionMix=prepared.questionMix;}
    if(free&&(typeof selectedFromHistory!=='string'||!/^[a-f0-9]{64}$/.test(selectedFromHistory)))throw new GameError('Your practice history changed while selecting questions. Please request a new round.',409);
    if(free&&questions.some(q=>q.responseFormat!=='free-response')&&!questionMix)throw new GameError('Mixed rounds require explicit question counts and order.');
    if(questionMix&&!questionOrderMatches(questions,questionMix))throw new GameError('The saved questions do not match the selected counts and order.');
    const id = identity?.id ?? crypto.randomUUID().replaceAll('-', '').slice(0, 24);
    const created=identity?privateSet(questions,uid,identity,now()):null;
    const issuanceBinding=free?hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical({version:'fr-issuance-1',uid,mode,category,difficulty,prepared,selectedFromHistory:selectedFromHistory??null})))):undefined;
    const issued = {questionSetId: id, questionCount: questions.length};
    const recoverIssued = (existing: Data) => {
      const saved = {questions: existing.questions, relaxation: existing.roundSnapshot?.relaxation,
        ...(existing.roundSnapshot?.diagnostics ? {diagnostics: existing.roundSnapshot.diagnostics} : {}),
        ...(existing.questionMix ? {questionMix: existing.questionMix} : {})};
      if (existing.uid === uid && existing.mode === mode && existing.category === category &&
          existing.difficulty === difficulty && existing.issuanceBinding === issuanceBinding &&
          Array.isArray(existing.questions) && canonical(saved) === canonical(prepared)) return issued;
      throw new GameError('The selected question set changed. Please request a new round.', 409);
    };
    const checkCreation = async (control: Data | null, recent: Data) => {
      if (control !== null) throw new GameError('Please refresh and start this round from the practice screen.', 409);
      if (free && selectedFromHistory !== await selectionHistoryToken(recent)) {
        throw new GameError('Your practice history changed while selecting questions. Please request a new round.', 409);
      }
    };
    return store.transaction(async tx => {
      const recent = await tx.get(`bankRecent/${uid}`) || {};
      const existing=await tx.get(`questionSets/${id}`);
      if(identity){
        if(recoverSet(existing,identity))return issued;
        if(selectedFromHistory!==await selectionHistoryToken(recent))throw new CompetitiveHoldError('Your current rounds changed. Please retry.');
      }
      if ((fencedCompetition || catalogWindow !== undefined) && (mode === 'pvp' || mode === 'multiplayer')) {
        if (!created) throw new CompetitiveHoldError('Please start a new room.');
        await requireCompetitiveWindow(tx, catalogWindow, difficulty);
      }
      const creationControl=['test','rapid'].includes(mode)?await tx.get('roundCreation/control'):null;
      if (free && existing) return recoverIssued(existing);
      await checkCreation(creationControl, recent);
      const refs = questions.filter(q => q.problemId && (q.responseFormat==='free-response'||q.choiceOrder)).map((q, ordinal) => ({ ordinal, problemId: q.problemId!, problemRevision: q.problemRevision!, contentHash: q.contentHash!, bankRelease: q.bankRelease!, familyId: q.familyId!, ...(q.lineageId?{lineageId:q.lineageId}:{}),...(q.constructionFamilyId?{constructionFamilyId:q.constructionFamilyId}:{}),...(q.responseFormat==='free-response'?{responseFormat:'free-response' as const,answerContractId:q.answerContractId,answerContractHash:q.answerContractHash,graderVersion:q.graderVersion,parserVersion:q.parserVersion}:{choiceOrder:q.choiceOrder!}) }));
      const roundSnapshot: RoundSnapshot | undefined = refs.length === questions.length ? { schemaVersion: free?3:diagnostics ? 2 : 1, selectionPolicy: diagnostics?.policy ?? (free?'unrecorded-v1':'family-uniform-v1'), relaxation, questions: refs, ...(diagnostics ? { diagnostics } : {}) } : undefined;
      if(free&&!roundSnapshot)throw new GameError('Free-response question identity is incomplete.');
      let pvpGuestHoldVersion: 1 | undefined;
      if (mode === 'pvp' && compactCompetitiveBank && !created) {
        if (!roundSnapshot || questions.some(q => !q.lineageId || !q.constructionFamilyId)) {
          throw new GameError('This question set is unavailable. Please try again later.',409);
        }
        pvpGuestHoldVersion = 1;
      }
      if(created && (!roundSnapshot || now()>=created.deadline))throw new CompetitiveHoldError('This private set has expired.');
      tx.set(`questionSets/${id}`, { uid, mode, category, difficulty, questions, ...(created?{competitiveCreation:{...created,...(catalogWindow?{version:3,catalogWindow}:{}),selectionHash:await competitiveSelectionHash(questions,roundSnapshot,catalogWindow)}}:{}), ...(pvpGuestHoldVersion ? {pvpGuestHoldVersion} : {}), ...(issuanceBinding?{issuanceBinding}:{}), ...(questionMix?{questionMix}:{}), ...(roundSnapshot ? { roundSnapshot } : {}), expiresAt: new Date(created?.deadline??(now() + 30 * 60_000)) });
      if(created)tx.set(`bankRecent/${uid}`,prepareSeat(recent,id,questions,created.createdAt,created.deadline));
      else if (refs.length) tx.set(`bankRecent/${uid}`, recordExposures(recent, id, questions, 'issued', now()));
      return issued;
    }, free && !identity ? async get => {
      // Both the ticket and issued exposure were recorded by one transaction.
      // A different ticket can invalidate the old selection but cannot acknowledge this one.
      const existing = await get(`questionSets/${id}`);
      if (existing) return recoverIssued(existing);
      const [control, recent] = await Promise.all([get('roundCreation/control'), get(`bankRecent/${uid}`)]);
      await checkCreation(control, recent ?? {});
      return null;
    } : undefined);
  }
  async function createGame(uid: string, id: string, mode: GameMode, input: Data) {
    identifier(id); await sync(uid);
    if (input.visibility !== undefined && !['private', 'public'].includes(input.visibility)) throw new GameError('Choose a private or public lobby.');
    const requestId=crypto.randomUUID(),receivedAt=now();
    return store.transaction(async tx => {
      const [set, existing, p, creationControl] = await Promise.all([tx.get(`questionSets/${id}`), tx.get(`gameSecrets/${id}`), tx.get(`users/${uid}`), ['test','rapid'].includes(mode)?tx.get('roundCreation/control'):Promise.resolve(null)]);
      if (!set || set.uid !== uid || set.mode !== mode) throw new GameError('This question set does not belong to this game.', 403);
      if(knownCompetitiveRecord(set.competitiveCreation)){
        const {category,difficulty,...options}=input;
        if((category!==undefined&&category!==set.category)||(difficulty!==undefined&&difficulty!==set.difficulty)||
           await digestCompetitiveSet(competitiveRoomOptions(mode,options))!==await digestCompetitiveSet(set.competitiveCreation.requestedRoom))
          throw new CompetitiveHoldError('This retry changes the requested room settings.');
      }
      if (existing) { requireMember(existing as GameSession, uid); compatibleCreate(existing as GameSession,input); return { id, ...playerView(existing as GameSession, uid) }; }
      // Installing the permanent control cuts over new solo creation even
      // while disabled. Reading it in this transaction closes in-flight races;
      // old committed games still recover above without changing history.
      if(creationControl!==null)throw new GameError('Please refresh and start this round from the practice screen.',409);
      if (Object.hasOwn(set,'pvpGuestHoldVersion') && (mode !== 'pvp' || set.pvpGuestHoldVersion !== 1)) {
        throw new GameError('This question set is unavailable. Please try again later.',409);
      }
      // Prepared protocol-v1 sets require the D1 authorization/activation path.
      // This legacy endpoint must not bypass that gate while it is being built.
      if (set.intentVersion) throw new GameError('This prepared round is not available for activation yet.',409);
      if (!p || set.used || new Date(set.expiresAt).getTime() <= now()) throw new GameError('This question set has expired. Please start again.');
      if(Object.hasOwn(set,'competitiveCreation') && (!['pvp','multiplayer'].includes(mode)||!knownCompetitiveRecord(set.competitiveCreation)||set.competitiveCreation.id!==id))throw new CompetitiveHoldError('This private set is unavailable.');
      if ((mode === 'pvp' || mode === 'multiplayer') && (fencedCompetition || set.competitiveCreation?.version === 3)) {
        if (set.competitiveCreation?.version !== 3) throw new CompetitiveHoldError('Please start a new room.');
        await requireCompetitiveWindow(tx, set.competitiveCreation.catalogWindow, set.difficulty);
      }
      const room=set.competitiveCreation?await roomFromSet(set,uid,await tx.get('bankRecent/'+uid)||{},now()):null;
      const configuration = settingsFor(mode, input), solo = mode === 'test' || mode === 'rapid', startTime = now() + (mode === 'rapid' ? 3000 : 0);
      const free=set.questions.some((q:GameQuestion)=>q.responseFormat==='free-response'),mixed=free&&set.questions.some((q:GameQuestion)=>q.responseFormat!=='free-response');if(free&&mode!=='test')throw new GameError('This response format is unavailable in this mode.');
      if(set.questionMix&&!questionOrderMatches(set.questions,set.questionMix))throw new GameError('The saved question configuration changed.');
      const game: GameSession = { mode, status: solo ? 'active' : 'waiting', progressionVersion: 3, replayVersion:free?2:1,...(free?{responseFormat:mixed?'mixed' as const:'free-response' as const}:{}),...(set.questionMix?{questionMix:set.questionMix}:{}), originalTimeLimit:configuration.timeLimit, players: [uid], scores: { [uid]: 0 }, questions: set.questions, ...(set.roundSnapshot ? { roundSnapshot: set.roundSnapshot } : {}), category: set.category, difficulty: set.difficulty,
        ...(room?{competitiveRoom:room}:{}),
        ...(mode === 'pvp' && set.pvpGuestHoldVersion === 1 ? {pvpGuestHoldVersion:1 as const} : {}),
        ...(!solo ? { visibility: input.visibility ?? 'private', lobbyPresence: { [uid]: now() } } : {}),
        answers: {}, completedPlayers: [], pendingClaims: [], receipts: {}, ratingSnapshot: { [uid]: snapshot(p) }, createdAt: new Date(now()),
        ...(configuration.settings ? { settings: configuration.settings } : {}), ...(solo ? { startTime } : {}), ...(mode === 'rapid' ? { deadline: startTime + configuration.timeLimit! * 1000 } : {}) };
      const { questions: _questions, ...metadata } = set;
      tx.set(`questionSets/${id}`, { ...metadata, used: true }); recordTransition(tx,id,null,game,uid,requestId,receivedAt,now()); saveGame(tx, id, game);
      return { id, ...playerView(game, uid) };
    });
  }
  // Every transition reads authoritative state, identities and clocks on the server.
  // Score, XP and all result receipts commit together with the accepted answer.
  async function act(uid: string, id: string, action: string, input: Data = {}) {
    identifier(id);
    if(['fr-submit','fr-skip','fr-reveal'].includes(action))return actFreeResponse({store,now,view:playerView,saveGame,saveProfile},uid,id,action,input);
    const requestId=typeof input.requestId==='string'?identifier(input.requestId):crypto.randomUUID(),receivedAt=now(),operationId=crypto.randomUUID();
    // A saved MC answer and its rewards share one commit. On retry exhaustion
    // acknowledge only that player's exact answer without replaying the write.
    const readCommittedAnswer = action === 'answer' && !input.inviteId ? async (get: Store['get']) => {
      const {index, selectedOption, requestId: suppliedId} = input;
      if (!Number.isInteger(index) || index < 0 || !Number.isInteger(selectedOption) || selectedOption < 0 || selectedOption > 3) return null;
      const game = await get(`gameSecrets/${id}`) as GameSession | null;
      if (!game || game.progressionVersion !== 3 || !game.players.includes(uid)) return null;
      const question = game.questions?.[index];
      const answer = game.answers?.[uid]?.[index];
      if (!question || question.responseFormat === 'free-response' || !answer || answer.responseFormat === 'free-response') return null;
      if (answer.selectedOption !== selectedOption || (suppliedId !== undefined && answer.requestId !== suppliedId)) return null;
      return {...playerView(game, uid), answer, duplicate: true, receipt: game.receipts?.[uid] ?? null, serverNow: now()};
    } : undefined;
    const result=await store.transaction(async tx => {
      const raw = await tx.get(`gameSecrets/${id}`);
      if (!raw || raw.progressionVersion !== 3) throw new GameError('This saved round cannot be continued. Please start a new round.', 409);
      const game = raw as GameSession, before=structuredClone(raw) as GameSession;
      const invitation = input.inviteId ? await tx.get(`gameInvites/${identifier(input.inviteId)}`) : null;
      let joining = action === 'join' && !game.players.includes(uid);
      if(!joining&&!game.players.includes(uid)&&action==='leave'&&knownCompetitiveRecord(game.competitiveRoom)&&await closedSeat(tx,id,uid,input.seatOperationId))return {left:true};
      if (!joining) requireMember(game, uid);
      const time = now(), pruned = pruneLobby(game, time);
      if (action === 'join') joining = !game.players.includes(uid);
      // Joining a waiting room or starting it may reserve or issue its questions.
      // Active retries, departures and recovery use the saved game.
      if (game.status === 'waiting' && competitive(game) && (fencedCompetition || game.competitiveRoom?.version === 3) &&
          ((action === 'join' && joining) || (action === 'start' && uid === game.players[0] && game.mode === 'multiplayer'))) {
        if (game.competitiveRoom?.version !== 3) throw new CompetitiveHoldError('Please start a new room.');
        await requireCompetitiveWindow(tx, game.competitiveRoom.catalogWindow, game.difficulty!);
      }
      const holds=await planCompetitive(tx,id,before,game,pruned.removed,action,uid,input,time);
      if (pruned.changed && (game.status === 'cancelled' || !joining && !game.players.includes(uid))) {
        holds?.commit();
        for (const p of pruned.removed) tx.delete(`games/${id}/reviews/${p}`);
        recordTransition(tx,id,before,game,uid,requestId,receivedAt,time,undefined,operationId); saveGame(tx,id,game,false);
        if (action === 'leave') return { left: true };
        return { rejected: { message: game.status === 'cancelled' ? 'This lobby has closed. Start or join a new lobby.' : 'Your lobby connection expired. Please rejoin.', status: game.status === 'cancelled' ? 409 : 403 } };
      }
      if (action === 'heartbeat' && game.status === 'waiting') {
        if (holds && game.competitiveRoom!.seats[uid].key !== input.seatOperationId) {
          const error = new CompetitiveHoldError('This lobby visit changed. Reopen the room to reconnect.');
          error.code = 'LOBBY_VISIT_CHANGED';
          throw error;
        }
        holds?.commit();
        for (const p of pruned.removed) tx.delete(`games/${id}/reviews/${p}`);
        (game.lobbyPresence ||= {})[uid] = time;
        updateLobbyExpiry(game);
        if (pruned.changed) recordTransition(tx,id,before,game,uid,requestId,receivedAt,time,undefined,operationId);
        saveGame(tx,id,game,false,pruned.changed || game.lobbyExpiresAt !== before.lobbyExpiresAt);
        return { ...playerView(game,uid), serverNow: time };
      }
      const ids = [...new Set([...game.players, ...(joining ? [uid] : [])])];
      const docs = await Promise.all(ids.map(p => tx.get(`users/${p}`)));
      const recent = (joining&&!holds) || action === 'answer' ? await tx.get(`bankRecent/${uid}`) || {} : null;
      if (docs.some(p => !p)) throw new GameError('A player profile is unavailable.', 409);
      const profiles = Object.fromEntries(ids.map((p, i) => [p, docs[i]!]));
      const changed = new Set<string>();
      let modified = pruned.changed, duplicate = false, answer: any = null;
      if (input.inviteId && (!invitation || invitation.to !== uid || invitation.gameId !== id || !['pending', 'accepted'].includes(invitation.status) || !game.players.includes(invitation.from) || !profiles[uid].friends?.includes(invitation.from) || !profiles[invitation.from]?.friends?.includes(uid))) throw new GameError('This invitation is no longer available.', 409);
      for (const p of pruned.removed) tx.delete(`games/${id}/reviews/${p}`);
      if (action === 'leave') {
        if (game.status === 'active') throw new GameError('This game has already started.', 409);
        if (game.status === 'waiting') {
          holds?.onLeave();holds?.commit();
          if (game.players[0] === uid) {game.status = 'cancelled';game.logicalEndAt=time;game.endReason='lobby_cancelled';}
          else {
            game.players = game.players.filter(p => p !== uid);
            delete game.scores[uid]; delete game.ratingSnapshot?.[uid]; delete game.lobbyPresence?.[uid];
            tx.delete(`games/${id}/reviews/${uid}`);
          }
          recordTransition(tx,id,before,game,uid,requestId,receivedAt,time,undefined,operationId);saveGame(tx, id, game);
        } else if (modified) {recordTransition(tx,id,before,game,uid,requestId,receivedAt,time,undefined,operationId);saveGame(tx, id, game);}
        return { left: true };
      }
      if (action === 'join') {
        if (game.status === 'cancelled') throw new GameError('This lobby has closed.', 409);
        if (input.mode !== game.mode || !competitive(game)) throw new GameError('This game belongs to a different mode.');
        if (joining) {
          if (game.status !== 'waiting' || game.players.length >= lobbyCapacity(game.mode)) throw new GameError('Game is full or already started.', 409);
          if (Object.hasOwn(game,'pvpGuestHoldVersion') && game.pvpGuestHoldVersion !== 1) {
            throw new GameError('This question set is unavailable. Please try again later.',409);
          }
          if (game.pvpGuestHoldVersion === 1 && (game.mode !== 'pvp' || !game.roundSnapshot || !game.questions?.length ||
              game.questions.length !== game.roundSnapshot.questions.length ||
              game.questions.some((q, i) => !q.problemId || !q.lineageId || !q.constructionFamilyId ||
                q.problemId !== game.roundSnapshot!.questions[i].problemId || q.lineageId !== game.roundSnapshot!.questions[i].lineageId))) {
            throw new GameError('This question set is unavailable. Please try again later.',409);
          }
          holds?.onJoin();
          game.players.push(uid); game.scores[uid] = 0; modified = true;
          (game.lobbyPresence ||= {})[uid] = time;
          if (recent && game.roundSnapshot) {
            // A first PvP join activates the existing common set immediately.
            // An active member retry never enters this transition or refreshes its clock.
            const questions = game.questions || [];
            const history = game.pvpGuestHoldVersion === 1 && game.mode === 'pvp'
              ? {...recent, ...reserveQuestionSet(recent, id, questions, 'issued', time)}
              : recent;
            tx.set(`bankRecent/${uid}`, recordExposures(history, id, questions, 'issued', time));
          }
          if (game.mode === 'pvp') { holds?.onActivate(game.players); game.status = 'active'; game.startTime = time + 3000; game.deadline = game.startTime + 30 * 60_000; }
          game.ratingSnapshot = Object.fromEntries(game.players.map(p => [p, snapshot(profiles[p])]));
        } else holds?.onExistingJoin();
      } else if (action === 'heartbeat') {
        if (game.status === 'waiting') { (game.lobbyPresence ||= {})[uid] = time; modified = true; }
      } else if (action === 'start') {
        if (game.players[0] !== uid || game.mode !== 'multiplayer') throw new GameError('Only the host can start this game.', 403);
        if (game.status === 'cancelled') throw new GameError('This lobby has closed.', 409);
        if (game.status === 'waiting') {
          if (game.players.length < 2) throw new GameError('At least two players are required.');
          holds?.onActivate(game.players);
          game.status = 'active'; game.startTime = time; game.deadline = time + (game.settings?.winCondition === 'time_limit' ? game.settings.timeLimit * 1000 : 30 * 60_000);
          game.ratingSnapshot = Object.fromEntries(game.players.map(p => [p, snapshot(profiles[p])])); modified = true;
        }
      } else if (action === 'answer') {
        const { index, selectedOption } = input;
        if(game.questions?.[index]?.responseFormat==='free-response')throw new GameError('Enter a mathematical answer for this question.');
        if (!Number.isInteger(index) || index < 0 || !Number.isInteger(selectedOption) || selectedOption < 0 || selectedOption > 3) throw new GameError('Select a valid answer.');
        answer = game.answers?.[uid]?.[index];
        if (answer) { duplicate = true; }
        else if(game.status!=='active'||time<game.startTime!||(!game.deadline||time<game.deadline)&&index!==nextUnanswered(game,uid)){
          const message=game.status!=='active'?'This game has ended.':time<game.startTime!?'The game has not started yet.':'Please answer the current question.';
          recordTransition(tx,id,before,game,uid,requestId,receivedAt,time,{index,selectedOption,reason:message},operationId);saveGame(tx,id,game);return {rejected:{message,status:409}};
        }
        else if (!game.deadline || time < game.deadline) {
          if (index !== nextUnanswered(game, uid)) throw new GameError('Please answer the current question.', 409);
          const q = game.questions?.[index]; if (!q) throw new GameError('Question not found.');
          const correct = selectedOption === q.correctIndex, xp = correct ? calculateProblemXp(game.mode, q.difficulty) : 0;
          answer = { selectedOption, correct, xp, timeMs: time - game.startTime! };
          (game.answers![uid] ||= {})[index] = answer;
          if (recent && q.problemId) tx.set(`bankRecent/${uid}`, recordAttemptedExposures(recent, id, [q], time));
          game.scores[uid] = finite(game.scores[uid]) + (correct ? 1 : game.mode === 'multiplayer' && game.settings?.penalties ? -1 : 0);
          if (nextUnanswered(game, uid) === game.questions!.length) game.completedPlayers = [...new Set([...game.completedPlayers!, uid])];
          if (game.mode === 'rapid' && !correct) game.deadline! -= 5000;
          const p = profiles[uid], topicXp = { ...p.topicXp };
          topicXp[q.topic] = finite(topicXp[q.topic]) + xp;
          Object.assign(p, { xp: finite(p.xp) + xp, topicXp, answeredQuestions: finite(p.answeredQuestions) + 1, correctAnswers: finite(p.correctAnswers) + Number(correct) });
          changed.add(uid); modified = true;
          if (correct) { game.timeline ||= {}; (game.timeline[uid] ||= []).push({ questionIndex: index, timeMs: answer.timeMs }); }
        }
      } else if (action === 'chat') {
        if (game.status === 'cancelled') throw new GameError('This lobby has closed.', 409);
        if (typeof input.text !== 'string') throw new GameError('Send a text message.');
        const text = input.text.trim();
        if (typeof text !== 'string' || !text || text.length > 100) throw new GameError('Messages must contain 1–100 characters.');
        const last = [...(game.messages || [])].reverse().find(m => m.senderId === uid);
        if (last && time - last.timestamp < 750) throw new GameError('Please wait before sending another message.', 429);
        game.messages = [...(game.messages || []).slice(-99), { senderId: uid, senderName: profiles[uid].displayName || 'Player', text, timestamp: time }]; modified = true;
      } else if (!['view', 'complete', 'claim'].includes(action)) throw new GameError('Unsupported game action.');
      const target = game.mode === 'multiplayer' && game.settings?.winCondition === 'first_to_n' && Object.values(game.scores).some(s => s >= game.settings!.targetScore);
      if (game.status === 'active' && (target || game.players.every(p => nextUnanswered(game, p) === game.questions!.length) || (game.deadline && time >= game.deadline))) {
        if(game.mode==='test'&&['free-response','mixed'].includes(game.responseFormat||'')){
          finishTestWithFreeResponse(game,uid,profiles[uid],time);changed.add(uid);modified=true;
        }else{
        game.logicalEndAt=game.deadline&&time>=game.deadline?(action==='answer'&&answer&&!duplicate&&before.deadline!>time?time:game.deadline):time;
        game.endReason=game.deadline&&time>=game.deadline?'timeout':target?'target_reached':'all_answered';
        game.status = 'finished'; game.finishedAt = time; game.pendingClaims = []; modified = true;
        const players = gamePlayers(game), counted = players.some(p => p.attempted > 0), ranked = competitive(game) && players.length > 1;
        const ratings = ranked ? calculateRatings(players, game.questions!) : {};
        for (const p of game.players) {
          const result = ratings[p] || { ratingChange: 0, topicChanges: {}, rated: false, rank: 1, outcome: 'completed' };
          const profile = clampProfileRatings(profiles[p]);
          profiles[p] = profile;
          const balance = applyRatingChange(profile.rating, result.ratingChange);
          const topicChanges = Object.fromEntries(Object.entries(result.topicChanges).map(([topic, delta]) => [topic, applyRatingChange(profile.topicRatings?.[topic], delta).ratingChange]));
          game.receipts![p] = { ...result, ...balance, topicChanges, counted };
          if (!counted) continue;
          const topicRatings = { ...profile.topicRatings }, topicRatedGames = { ...profile.topicRatedGames };
          for (const [topic, delta] of Object.entries(topicChanges)) { topicRatings[topic] = ratingBalance(topicRatings[topic]) + delta; topicRatedGames[topic] = finite(topicRatedGames[topic]) + 1; }
          Object.assign(profile, { gamesPlayed: finite(profile.gamesPlayed) + 1, rating: balance.newRating, topicRatings, topicRatedGames,
            wins: finite(profile.wins) + Number(ranked && result.outcome === 'win'), losses: finite(profile.losses) + Number(ranked && result.outcome === 'loss'), draws: finite(profile.draws) + Number(ranked && result.outcome === 'draw'),
            ratedGames: finite(profile.ratedGames, finite(profile.wins) + finite(profile.losses) + finite(profile.draws)) + Number(result.rated) });
          changed.add(p);
        }
      }
      }
      holds?.commit();
      if (input.inviteId) tx.set(`gameInvites/${input.inviteId}`, { ...invitation, status: 'accepted' });
      if (action === 'claim' && game.status !== 'finished') throw new GameError('This game is still in progress.', 409);
      for (const p of changed) saveProfile(tx, p, profiles[p]);
      if (modified) {recordTransition(tx,id,before,game,uid,requestId,receivedAt,time,undefined,operationId);saveGame(tx, id, game, action !== 'heartbeat');}
      return { ...playerView(game, uid), answer: answer || null, duplicate, receipt: game.receipts?.[uid] || null, serverNow: time };
    }, readCommittedAnswer);
    if('rejected' in result&&result.rejected)throw new GameError(result.rejected.message,result.rejected.status);
    return result;
  }
  async function sync(uid: string) {
    const active = await store.find('gameSecrets', [['players', 'ARRAY_CONTAINS', uid], ['status', 'EQUAL', 'active'], ['deadline', 'LESS_THAN_OR_EQUAL', now()]], 25);
    for (const g of active) if (g.data.deadline && g.data.deadline <= now()) await act(uid, g.id, 'complete');
  }
  async function sweepLobbies(mode: string) {
    if (!['pvp', 'multiplayer'].includes(mode)) throw new GameError('Choose a competitive mode.');
    const [leased, legacy] = await Promise.all([
      store.find('gameSecrets', [['mode','EQUAL',mode],['status','EQUAL','waiting'],['progressionVersion','EQUAL',3],['lobbyExpiresAt','LESS_THAN_OR_EQUAL',now()]], 50),
      store.find('gameSecrets', [['mode','EQUAL',mode],['status','EQUAL','waiting'],['progressionVersion','EQUAL',3],['lobbyExpiresAt','IS_ABSENT',null]], 50),
    ]);
    const expired = [...leased, ...legacy];
    let cleaned = 0;
    for (const row of expired) await store.transaction(async tx => {
      const raw = await tx.get(`gameSecrets/${row.id}`); if (!raw) return;
      const game = raw as GameSession, before = structuredClone(game), time = now(), result = pruneLobby(game,time);
      if (!result.changed) { if (game.status === 'waiting' && before.lobbyExpiresAt === undefined) saveGame(tx,row.id,game,false); return; }
      const plan=await planCompetitive(tx,row.id,before,game,result.removed,'sweep',game.players[0],{},time);
      plan?.commit();
      for (const p of result.removed) tx.delete(`games/${row.id}/reviews/${p}`);
      recordTransition(tx,row.id,before,game,game.players[0],crypto.randomUUID(),time,time); saveGame(tx,row.id,game,false); cleaned++;
    });
    return { cleaned, hasMore: leased.length === 50 || legacy.length === 50, serverNow: now() };
  }
  async function acceptInvite(uid: string, inviteId: string) {
    const invitation = await store.get(`gameInvites/${identifier(inviteId)}`);
    if (!invitation || invitation.to !== uid) throw new GameError('Invitation not found.', 404);
    const result = await act(uid, identifier(invitation.gameId), 'join', { mode: invitation.mode, inviteId });
    return { mode: invitation.mode, gameId: invitation.gameId, ...result };
  }
  return { profile, storeQuestions, createGame, act, sync, acceptInvite, sweepLobbies };
}
