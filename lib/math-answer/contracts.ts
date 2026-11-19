/** Immutable, private answer contracts. Never project this object to a player. */
export const ANSWER_CONTRACT_VERSION = 'answer-contract-1' as const;
export const PARSER_VERSION = 'bounded-latex-1' as const;
export const GRADER_VERSION = 'exact-algebra-1' as const;
export type ResponseFormat = 'multiple-choice' | 'free-response';
export type RealDomain = {kind:'real-line'} | {kind:'interval'; lower:string|null; upper:string|null; lowerClosed:boolean; upperClosed:boolean};
export type AnswerType =
  | {kind:'scalar'; expected:string}
  | {kind:'function'; expected:string; variable:string; domain:RealDomain}
  | {kind:'antiderivative'; integrand:string; reference:string; variable:string; domain:RealDomain; constant:'optional-real-additive'; request:'any'}
  | {kind:'approximate'; expected:string; absoluteTolerance:string; relativeTolerance:string; precision:string}
  | {kind:'tuple'; components:AnswerType[]}
  | {kind:'finite-set'; elements:AnswerType[]; multiplicity:'ignore'|'count'}
  | {kind:'interval'; lower:string; upper:string; lowerClosed:boolean; upperClosed:boolean}
  | {kind:'outcome'; expected:'positive-infinity'|'negative-infinity'|'does-not-exist'|'diverges'|'converges'|'absolute'|'conditional'};
export interface FreeResponseContract {
  version:typeof ANSWER_CONTRACT_VERSION;
  parserVersion:typeof PARSER_VERSION;
  graderVersion:typeof GRADER_VERSION;
  contractId:string;
  contractHash:string;
  problem:{problemId:string;problemRevision:number;contentHash:string;lineageId:string;constructionFamilyId:string;legacy:boolean};
  presentation:{version:string;statement:string;assumptions:string[]};
  answer:AnswerType;
  instructions:string;
  domain:'real';
  branch:'real-principal';
  allowedOperators:string[];
  review:{version:string;evidenceHash:string;referenceVerified:boolean};
  fixtures:{source:string;expected:'correct'|'incorrect'|'invalid'|'unsupported'|'indeterminate';reason:string}[];
  difficulty:'easy'|'medium'|'hard'|'olympiad';
}
export interface MultipleChoiceContract { version:'multiple-choice-1'; format:'multiple-choice'; choiceOrder:string[]; answerChoiceId:string }
export type QuestionAnswerContract = MultipleChoiceContract | {version:'free-response-1';format:'free-response';contract:FreeResponseContract};
export type UngradedOutcome = 'invalid'|'unsupported'|'indeterminate';
export type Verdict = {version:typeof GRADER_VERSION;outcome:'correct'|'incorrect'|UngradedOutcome;feedback:string;interpretation:string;work:number};
export type Finalization = 'graded'|'skipped'|'revealed';
