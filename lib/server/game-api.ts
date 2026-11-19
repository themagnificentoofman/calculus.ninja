import type {selectCompetitiveQuestions} from './competitive-catalog.ts';
import {competitiveIdentity,recoverSet,CompetitiveHoldError,cancelPrivate,preflightHost} from './competitive-lifecycle.ts';
import {selectionHistoryToken,selectionHistorySnapshot} from './selection-history-token.mjs';
import {boundedJsonSnapshot} from './bounded-json-snapshot.mjs';
import {includesLegacyForMode} from './legacy-selection.mjs';
import { competitiveRoomOptions, createServerGames, GameError, identifier } from './game-engine.ts';
import { BankUnavailableError, type RecentProblems } from './bank-selection.ts';
import type { RoundSnapshot, RoundSelectionDiagnostics as SelectionDiagnostics } from '../bank/contracts.ts';
import { socialAction } from './social.ts';
import { readBoundedJson, validateQuestionRequest, validQuestionResponse } from './questions-policy.mjs';
import { StoreError, type Store, type Data } from './firestore-admin.ts';
import type { GameQuestion } from '../game-progress.ts';
import type { GameMode } from '../progression.ts';
import {FreeResponseError} from './free-response-actions.ts';
import {JointSelectionError} from './joint-selection-error.mjs';
import {ReservationConflictError} from '../bank/issuance-reservations.mjs';
import {validQuestionMix,orderConfiguredQuestionsV2} from '../round-question-config.mjs';
const response = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
const only = (body: Data, keys: string[]) => { if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(k => !keys.includes(k))) throw new GameError('Unexpected request fields.'); };
const modes = ['test', 'rapid', 'pvp', 'multiplayer'];
export function createGameApi(deps: { store: Store; verify: (token: string) => Promise<Data>; select: (input: { category: string; difficulty: string; count: number; tag?: string; includeLegacy?: boolean }, recent: RecentProblems) => Promise<{ questions: GameQuestion[]; relaxation: RoundSnapshot['relaxation']; diagnostics?: SelectionDiagnostics }>; selectFreeResponse?: (input:{category:string;difficulty:string;count:number;tag?:string;includeLegacy?:boolean},recent:RecentProblems)=>Promise<{questions:GameQuestion[];relaxation:RoundSnapshot['relaxation'];diagnostics?:SelectionDiagnostics}>; selectMixed?: (input:{category:string;difficulty:string;count:number;tag?:string;includeLegacy?:boolean;questionMix:{multipleChoice:number;freeResponse:number;order:string}},recent:RecentProblems)=>Promise<{questions:GameQuestion[];relaxation:RoundSnapshot['relaxation'];diagnostics?:SelectionDiagnostics}>; freeResponseEnabled?:boolean; compactCompetitiveBank?:true; selectCompetitive?:(input:Parameters<typeof selectCompetitiveQuestions>[1])=>ReturnType<typeof selectCompetitiveQuestions>; checkPlayable?: (questions: GameQuestion[]) => Promise<void>; quota: (uid: string) => Promise<boolean>; mutationQuota?: (uid: string) => Promise<boolean>; now?: () => number }) {
  const games = createServerGames(deps.store, deps.now, !!deps.selectCompetitive);
  return async (resource: 'games' | 'profile' | 'questions' | 'social', request: Request) => {
    if (request.method !== 'POST') return response({ error: 'Use POST.' }, 405);
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin || request.headers.get('sec-fetch-site') === 'cross-site') return response({ error: 'Request origin is not allowed.' }, 403);
    const bearer = /^Bearer ([^\s]+)$/.exec(request.headers.get('authorization') || '');
    if (!bearer || bearer[1].length > 8192) return response({ error: 'Please sign in.' }, 401);
    let claims: Data;
    try { claims = await deps.verify(bearer[1]); identifier(claims.sub); } catch { return response({ error: 'Your sign-in has expired. Please sign in again.' }, 401); }
    const uid = claims.sub;
    try {
      let body: Data;
      try { body = await readBoundedJson(request, resource === 'profile' ? 320000 : 8192); } catch { throw new GameError('Send a valid JSON request.'); }
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new GameError('Send a JSON object.');
      if (deps.mutationQuota && !await deps.mutationQuota(uid)) throw new GameError('Too many requests. Please wait a moment and retry.', 429);
      if (resource === 'profile') { only(body, ['patch']); return response({ profile: await games.profile(uid, claims, body.patch ?? {}) }); }
      if (resource === 'questions') {
        only(body, ['mode', 'category', 'difficulty', 'count', 'tag','responseFormat','questionMix','operationId','operation','roomOptions']);
        const input = validateQuestionRequest(body);
        if (!input || !modes.includes(body.mode) || (body.tag !== undefined && (typeof body.tag !== 'string' || !/^[a-z][a-z0-9-]{1,63}$/.test(body.tag)))) throw new GameError('Choose a supported mode, category, difficulty and question count.');
        if(body.responseFormat!==undefined&&!['multiple-choice','free-response'].includes(body.responseFormat))throw new GameError('Choose a supported answer format.');
        const mix=body.questionMix;
        if(mix!==undefined&&(!validQuestionMix(mix,input.count)||body.responseFormat!==undefined))throw new GameError('Choose valid MCQ and FRQ counts totaling 1–20, and a question order.');
        if(mix!==undefined&&body.mode!=='test')throw new GameError('Question mix controls are available only in individual Test practice.');
        const free=mix?mix.freeResponse>0:body.responseFormat==='free-response',mixed=!!mix&&mix.freeResponse>0&&mix.multipleChoice>0;
        if(['test','rapid'].includes(body.mode)&&await deps.store.get('roundCreation/control')!==null)throw new GameError('Please refresh and start this round from the practice screen.',409);
        if(free&&body.mode!=='test')throw new GameError('Free response is available only in individual Test practice.');
        if(free&&(!deps.freeResponseEnabled||(mixed?!deps.selectMixed:!deps.selectFreeResponse)))throw new BankUnavailableError('This free-response question mix is currently unavailable. Multiple-choice practice remains available.');
        const guarded=deps.compactCompetitiveBank&&['pvp','multiplayer'].includes(body.mode);
        if(guarded && body.operationId===undefined && body.roomOptions===undefined) throw new GameError('Refresh the lobby page before creating a new room.',409);
        if(body.operation!==undefined&&(!guarded||body.operation!=='cancel'))throw new GameError('Unsupported round operation.');
        if(!guarded && (body.operationId!==undefined||body.roomOptions!==undefined))throw new GameError('Unsupported round identifier.');
        const identity=guarded?await competitiveIdentity(uid,body.operationId,{mode:body.mode,...input,tag:body.tag??null,roomOptions:competitiveRoomOptions(body.mode,body.roomOptions)}):undefined;
        if(identity&&body.operation==='cancel')return response(await cancelPrivate(deps.store,uid,identity,{...input,mode:body.mode},(deps.now??Date.now)()));
        if(identity){const prior=recoverSet(await deps.store.get('questionSets/'+identity.id),identity);if(prior)return response(prior);}
        try {
        const hostHistory=identity?(await deps.store.get('bankRecent/'+uid)||{}):null;
        if(hostHistory)preflightHost(hostHistory,input.count,(deps.now??Date.now)());
        if (!await deps.quota(uid)) throw new GameError('Question selection limit reached. Please try again later.', 429);
        // Competitive sets use the common bank policy without adapting to the
        // host's personal practice history. The immutable order is shared.
        const solo = ['test','rapid'].includes(body.mode);
        const [history, profile] = solo ? await Promise.all([deps.store.get(`bankRecent/${uid}`), deps.store.get(`users/${uid}`)]) : [hostHistory, null];
        const recent = solo ? (free ? selectionHistorySnapshot(history || {}) : history || {}) : {};
        const selectedFromHistory = identity ? await selectionHistoryToken(history||{}) : free ? await selectionHistoryToken(recent) : undefined;
        const includeLegacy = includesLegacyForMode(body.mode, profile?.settings);
        const selectionInput={...input,includeLegacy,...(body.tag?{tag:body.tag}:{}),...(mixed?{questionMix:mix}:{})};
        const selectionRequest=free?boundedJsonSnapshot(selectionInput,{maxBytes:8192,maxNodes:100,maxDepth:4}):selectionInput;
        const competitiveResult = identity && deps.selectCompetitive ? await deps.selectCompetitive(selectionInput) : null;
        const result=competitiveResult ?? (mixed?await deps.selectMixed!(selectionRequest as Parameters<NonNullable<typeof deps.selectMixed>>[0],recent):await (free?deps.selectFreeResponse!:deps.select)(selectionRequest,recent));
        const selected=free?boundedJsonSnapshot(result,{maxBytes:2000000,maxNodes:180000,maxDepth:40}):result;
        if (!validQuestionResponse(selected.questions, {...input,...(mix?{questionMix:mix}:{responseFormat:free?'free-response':'multiple-choice'})})) throw new GameError('The problem bank returned an invalid set. Please retry.', 502);
        const questions=mix?orderConfiguredQuestionsV2(selected.questions,mix):selected.questions;
        if(mixed){
          const lineages=new Set(questions.map(q=>q.lineageId||q.problemId)),families=new Map<string,number>();
          for(const q of questions){if(!q.problemId||!q.familyId)throw new GameError('The selected question identity is incomplete.',502);const family=q.constructionFamilyId||q.familyId;families.set(family,(families.get(family)||0)+1);}
          if(lineages.size!==questions.length||Math.max(...families.values())>2||selected.relaxation!=='none')throw new BankUnavailableError('This question mix does not have enough distinct approved problems. Choose another mix.');
        }
        return response(await games.storeQuestions(uid,body.mode,input.category,input.difficulty,questions,selected.relaxation,selected.diagnostics,mix,selectedFromHistory,deps.compactCompetitiveBank,identity,competitiveResult?.catalogWindow));
        } catch(error) {
          if(identity){const winner=recoverSet(await deps.store.get('questionSets/'+identity.id),identity);if(winner)return response(winner);}
          throw error;
        }
      }
      if (resource === 'social') {
        const fields: Record<string, string[]> = { request: ['to'], remove: ['friendId'], invite: ['to', 'gameId'], invite_once: ['to', 'gameId'], accept: ['id'], reject: ['id'], cancel: ['id'], invite_accept: ['id'], invite_reject: ['id'] };
        if (typeof body.action !== 'string' || !Object.hasOwn(fields, body.action)) throw new GameError('Unsupported social action.');
        only(body, ['action', ...fields[body.action]]);
        for (const key of fields[body.action]) identifier(body[key]);
        if (body.action === 'invite_accept') return response(await games.acceptInvite(uid, body.id));
        return response(await socialAction(deps.store, uid, body.action, body, deps.now?.()));
      }
      const fields: Record<string, string[]> = { create: ['questionSetId', 'mode', 'options'], join: ['gameId', 'mode','seatOperationId'], heartbeat: ['gameId','seatOperationId'], sweep: ['mode'], answer: ['gameId', 'index', 'selectedOption','requestId'], 'fr-submit':['gameId','index','source','requestId'],'fr-skip':['gameId','index','requestId'],'fr-reveal':['gameId','index','requestId'], start: ['gameId'], leave: ['gameId','seatOperationId'], view: ['gameId'], complete: ['gameId'], claim: ['gameId'], chat: ['gameId', 'text'], sync: [] };
      if (typeof body.action !== 'string' || !Object.hasOwn(fields, body.action)) throw new GameError('Unsupported game action.');
      only(body, ['action', ...fields[body.action]]);
      if (body.action === 'sync') { await games.sync(uid); return response({ ok: true }); }
      if (body.action === 'sweep') return response(await games.sweepLobbies(body.mode));
      if (body.action === 'create') {
        if (!modes.includes(body.mode)) throw new GameError('Invalid game mode.');
        only(body.options || {}, ['category', 'difficulty', 'timeLimit', 'settings', 'visibility']);
        if (deps.checkPlayable && !await deps.store.get(`gameSecrets/${identifier(body.questionSetId)}`)) {
          const pending = await deps.store.get(`questionSets/${body.questionSetId}`);
          if (pending && pending.uid === uid) await deps.checkPlayable(pending.questions || []);
        }
        return response(await games.createGame(uid, identifier(body.questionSetId), body.mode as GameMode, body.options || {}));
      }
      return response(await games.act(uid, identifier(body.gameId), body.action, body));
    } catch (error) {
      if (error instanceof CompetitiveHoldError||error instanceof GameError||error instanceof FreeResponseError||error instanceof ReservationConflictError) return response({ error: error.message,...(error instanceof CompetitiveHoldError&&error.code?{code:error.code}:{}) }, error.status);
      if (error instanceof JointSelectionError) return response({ error: error.message, code: error.code === 'joint-catalog-changed' ? 'CONTENT_CHANGED' : 'INSUFFICIENT_CONTENT' }, error.status);
      if (error instanceof BankUnavailableError) return response({ error: error.message, code: 'INSUFFICIENT_CONTENT' }, 409);
      if (error instanceof StoreError && error.status === 429) return response({ error: 'Online storage is at its usage limit. Please try again later.', code: 'STORAGE_QUOTA_EXCEEDED' }, 503);
      // Never send credentials, upstream bodies, private question data or stack traces.
      return response({ error: 'The server could not save this operation. Please retry.' }, 503);
    }
  };
}
