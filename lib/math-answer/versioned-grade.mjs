// Saved contracts select their exact checker. Current admission policy never
// decides how an already-issued question or receipt is interpreted.
import {gradeAnswer as gradeV1,OPERATORS as operatorsV1} from './grade.mjs';
import {gradeAnswer as gradeV2,OPERATORS as operatorsV2} from './v2/grade.mjs';

const legacy=Object.freeze({key:'exact-algebra-1/bounded-latex-1',graderVersion:'exact-algebra-1',parserVersion:'bounded-latex-1',operators:Object.freeze([...operatorsV1]),grade:gradeV1});
const current=Object.freeze({key:'exact-algebra-2/bounded-latex-2',graderVersion:'exact-algebra-2',parserVersion:'bounded-latex-2',operators:Object.freeze([...operatorsV2]),grade:gradeV2});
export const CHECKERS=Object.freeze([legacy,current]);
export const CURRENT_CHECKER=current;
export function checkerFor(contract){
 return CHECKERS.find(c=>contract?.graderVersion===c.graderVersion&&contract?.parserVersion===c.parserVersion)??null;
}
export function gradeAnswer(contract,source){
 const checker=checkerFor(contract);
 if(checker)return checker.grade(contract,source);
 return {version:'unavailable',outcome:'indeterminate',feedback:'This saved question cannot be graded right now. You can skip it or reveal the solution without a wrong-answer penalty.',interpretation:'',work:0};
}
