export type StudyBlock={kind:'prose';text:string}|{kind:'math';latex:string}|{kind:'diagram';id:'cubic-tangent'|'signed-area'|'constant-slope-rows'};
export interface StudyExample {id:string;revision:number;title:string;problem:StudyBlock[];solution:StudyBlock[];verification:string[]}
export interface StudyExercise extends StudyExample {hints:StudyBlock[][]}
export interface StudyReadiness {lessonId:string;exerciseId:string;prompt:string}
export interface StudyLesson {
 id:string;revision:number;title:string;summary:string;objectives:string[];prerequisites:string[];
 sections:{id:string;title:string;body:StudyBlock[]}[];
 worked:StudyExample[];contrast:StudyBlock[];mistakes:string[];exercises:StudyExercise[];
 alternatives:StudyBlock[];related:string[];next:string[];references:{sourceId:string;url:string;use:'reference-only'}[];
 readiness?:StudyReadiness[];
 review:{status:'draft'|'reviewed';evidence?:string;contentHash?:string};
 exposureAudit:{status:'pending'|'distinct'|'mapped';evidence?:string};
}
export type StudyTier='easy'|'medium'|'hard'|'olympiad';
export interface StudyPath {tier:StudyTier;topic:string;title:string;objectives:string[];lessons:string[];readiness:{prompt:string;lessonId:string;exerciseId:string}[]}

// Public reading data contains no review evidence or private bank mappings.
export interface PublicStudyExample {id:string;revision:number;title:string;problem:StudyBlock[];solution:StudyBlock[]}
export interface PublicStudyExercise extends PublicStudyExample {hints:StudyBlock[][];editorial?:{difficulty:StudyTier;recommended:boolean;why?:string}}
export interface StudyLink {id:string;title:string;href:string;revision?:number}
export interface StudyNextLink extends StudyLink {prerequisites:StudyLink[]}
export type StudyTierRole='foundation'|'core'|'extension';
export interface PublicLessonTierUse {tier:StudyTier;tierTitle:string;tierHref:string;topicId:string;topicTitle:string;conceptTitle:string;conceptHref:string;role:StudyTierRole;explanation:string;sections:{title:string;href:string}[]}
export interface PublicStudyTier {
 id:StudyTier;title:string;href:string;revision:number;summary:string;prerequisites:string[];reasoning:string;progression:string;
 topics:{id:string;title:string;concepts:{id:string;title:string;lessons:(StudyLink&{role:StudyTierRole;explanation:string})[]}[]}[];
}
export interface StudySearchEntry extends StudyLink {
 summary:string; searchText:string; kind:'module'|'reading'|'exercise';
 resource:string; resultAnchor:string; locations:{id:string;title:string}[];
 difficulty?:StudyTier; recommendation?:'recommended'|'optional';
}
export interface PublicStudyPath {id:string;revision:number;kind:'foundation'|'core'|'division';title:string;summary:string;objectives:string[];href:string;steps:(StudyLink&{purpose:string})[];readiness:{prompt:string;title:string;href:string}[]}
export interface StudyPathPosition {id:string;title:string;href:string;index:number;total:number;purpose:string;previous?:StudyLink;next?:StudyLink}
export interface PublicStudyLesson {
 id:string;revision:number;title:string;summary:string;objectives:string[];
 prerequisites:StudyLink[];sections:StudyLesson['sections'];worked:PublicStudyExample[];
 contrast:StudyBlock[];mistakes:string[];exercises:PublicStudyExercise[];alternatives:StudyBlock[];
 readiness:{title:string;href:string;prompt:string}[];
 tierUse:PublicLessonTierUse[];
 related:StudyLink[];next:StudyNextLink[];references:{title:string;url:string;editorial?:{role:'recommended'|'optional';why?:string}}[];
}
