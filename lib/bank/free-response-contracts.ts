import type {ContentCredit, ProblemPedagogy} from './contracts';
import type {FreeResponseContract} from '../math-answer/versioned-contracts';

/** Private, independently authored task. Its identity is separate from an MC
 * source revision: changing the served question cannot reuse that source hash. */
export interface FreeResponseTask {
 schemaVersion:3;
 responseFormat:'free-response';
 problemId:string;
 problemRevision:number;
 contentHash:string;
 familyId:string;
 constructionFamilyId:string;
 lineageId:string;
 legacy:boolean;
 origin:{kind:'original'}|{kind:'bank';problemId:string;problemRevision:number;contentHash:string;familyId:string;constructionFamilyId:string;lineageId:string;bankRelease:string;mcDifficulty:string};
 topic:string;
 difficulty:'easy'|'medium'|'hard'|'olympiad';
 presentationVersion:'problem-tex-1';
 statement:string;
 assumptions:string[];
 solutionSteps:string[];
 pedagogy:Omit<ProblemPedagogy,'responseFormat'>&{responseFormat:'free-response'};
 provenance:{kind:'original';author:string;sourceReferences:string[]}|{kind:'adapted';author:string;credit:ContentCredit;permissionEvidenceHash:string};
}
export interface FreeResponseRecord {task:FreeResponseTask;contract:FreeResponseContract}
/** Publicly committable hash-only registration; no expected answer or hidden
 * question-to-method mapping. Review files stay in the private authoring input. */
export interface FreeResponseAdmission {
 recordHash:string;
 selectionHash:string;
 reviewHash:string;
 checkerSourceHash:string;
}
