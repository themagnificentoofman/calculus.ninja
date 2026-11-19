// The original contracts.ts is part of the frozen v1 checker source identity.
import type {FreeResponseContract as LegacyContract,Verdict as LegacyVerdict} from './contracts';
export type FreeResponseContract = LegacyContract | (Omit<LegacyContract,'parserVersion'|'graderVersion'> & {
 parserVersion:'bounded-latex-2';
 graderVersion:'exact-algebra-2';
});
export type Verdict = Omit<LegacyVerdict,'version'> & {version:'exact-algebra-1'|'exact-algebra-2'|'unavailable'};
