export interface ProblemReference {
  problemId: string;
  problemRevision: number;
  contentHash: string;
  bankRelease: string;
  familyId: string;
  /** Private, reviewed mathematical identity across revisions/renamed copies. */
  lineageId?: string;
  constructionFamilyId?: string;
  /** Stable IDs in the actual displayed order; never identifies the answer. */
  choiceOrder?: string[];
  responseFormat?: 'multiple-choice'|'free-response';
  answerContractId?:string;
  answerContractHash?:string;
  graderVersion?:string;
  parserVersion?:string;
}
export type VersionedProblemReference =
 | (ProblemReference & {responseFormat:'multiple-choice';choiceOrder:string[]})
 | (ProblemReference & {responseFormat:'free-response';choiceOrder?:never;answerContractId:string;answerContractHash:string;graderVersion:string;parserVersion:string});
export interface RoundSnapshot {
  schemaVersion: 1 | 2 | 3;
  selectionPolicy: 'family-uniform-v1' | 'exposure-weighted-v2' | 'free-response-capped-v1' | 'joint-capped-v1' | 'joint-capped-v2' | 'joint-capped-v3' | 'unrecorded-v1';
  relaxation: 'none' | 'recent-families' | 'recent-problems' | 'family-cap';
  diagnostics?: RoundSelectionDiagnostics;
  questions: (ProblemReference & { ordinal: number })[];
}
export interface BankProblem {
  schemaVersion: 1 | 2;
  pedagogy?: ProblemPedagogy;
  problemId: string;
  problemRevision: number;
  contentHash: string;
  semanticHash: string;
  statement: string;
  choices: { choiceId: string; math: string }[];
  answerChoiceId: string;
  solutionSteps: string[];
  assumptions: string[];
  topic: string;
  difficulty: string;
  subtopic: string;
  techniqueTags: string[];
  familyId: string;
  templateVersion: string;
  parameters: Record<string, number>;
  provenance: { kind: string; sourceUrl: string | null; sourceItem: string | null; license: string; attribution: string; authoring: Record<string, unknown> };
  validation: { status: 'passed'; methods: string[]; evidence: Record<string, unknown>; humanReviewed: boolean };
  estimates: { difficulty: string; solveSeconds: number; basis: string };
}

/** Private mathematical metadata. Never included in a pre-answer projection. */
export interface ProblemPedagogy {
  constructionId: string;
  relatedIdeaGroupId: string;
  structuralSignature: string;
  primaryTechnique: string;
  alternativeTechniques: string[];
  prerequisites: string[];
  reasoningDemand: ('execution' | 'recognition' | 'method-selection' | 'reframing' | 'convergence' | 'synthesis')[];
  answerForm: string;
  difficultyRationale: string;
  sourceRecordIds: string[];
  responseFormat: 'multiple-choice';
}

export interface SelectionDiagnostics {
  policy: 'exposure-weighted-v2';
  candidateCount: number;
  probes: number;
  statements: number;
  catalogFamilies: number;
  catalogPools?: number;
  fallbackRows?: number;
  exhaustedInventory: boolean;
  reasons: ('family-cap-impossible' | 'recent-items-exhausted' | 'unseen-family-capacity-exhausted' | 'candidate-sampling-limit' | 'adjacency-unavoidable')[];
}
export interface FreeResponseSelectionDiagnostics {
  policy:'free-response-capped-v1';
  candidateCount:number; statements:number; payloadsDecoded:number;
  catalogFamilies:number; reservedRounds:number;
}
export interface JointSelectionDiagnostics {
  policy:'joint-capped-v1' | 'joint-capped-v2' | 'joint-capped-v3';
  candidateCount:number; catalogFamilies:number; statements:number; payloadsDecoded:number;
  requiredRounds:number; remainingRounds:number;
  initialCatalogBinding:string; finalCatalogBinding:string; remainingRank:number[];
  algorithm:{
    candidateVisits:number; cutChecks:number; scoreEvaluations:number; familySummaryVisits:number;
    regimeRebuilds:number; fallbackFamilyScans:number; numericTreeRebuilds:number; summaryScoreVisits:number;
    aggregateCount:number; rounds:number; relaxation:'none'; verticesPerSide:number;
    regularizedEdges:number; augmentVisits:number; currentColor:number; rawRows:number; lineages:number;
  };
}
export type RoundSelectionDiagnostics=SelectionDiagnostics|FreeResponseSelectionDiagnostics|JointSelectionDiagnostics;

/** Credit and license are public; detailed modifications can mention a solution. */
export type ContentNotice = Omit<ContentCredit,'modifications'>;
export interface ContentCredit { credit:string; sourceUrl:string; sourceItem:string; license:string; licenseUrl:string; modifications:string }
