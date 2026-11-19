/** Public wording only. Never changes a saved verdict, contract or replay event. */
const labels=Object.freeze({correct:'Correct',incorrect:'Incorrect',invalid:'Check your input',unsupported:'Answer form not supported',indeterminate:'Not graded',skipped:'Skipped',revealed:'Solution revealed'});
const unavailable=new Set([
'This saved answer version is not available for grading.','This answer contract is not supported.','This precision contract is unavailable.','The collection contract is unavailable.','This variable contract is unavailable.','This domain contract is unavailable.','This interval contract is unavailable.','This tolerance contract is unavailable.','The reference domain cannot be verified.','This answer type is not available.','The answer structure is too deeply nested.'
]);
const replacements=new Map([
['Unordered sets are not enabled in this grader version.','This checker cannot check an unordered set.'],
['General-family completeness is not graded in this version.','This checker cannot check an entire family of functions.'],
['This power is outside the verified answer grammar.','This power cannot be checked in this form.'],
['This derivative form is outside the verified capabilities.','This proposed antiderivative cannot be checked in this form.'],
['Root work limit reached.','This root expression is too large to check.']
]);
const safe=new Set([
'Enter an answer first.','Check the answer syntax.','Check the brackets.','Check the number of components and their brackets.','Enter the requested classification, such as DNE or infinity.','Use interval notation with the requested endpoints.','An interval needs two endpoints.','An infinite endpoint must use a round bracket.','For this approximation, enter a finite number.','The expression is not defined as a real value. Check denominators and function domains.','Division by zero is not a real number.','Use fewer nested groups.','Use at most 64 digits in one number.','The answer has too many parts.','The exact number is too large to check.','Use parentheses around this function argument.','Finish the expression.','Absolute-value form is not supported for this answer.','Factorial notation is not yet checked. Enter an evaluated final value.','Check unmatched brackets or use the requested answer structure.','Use 2*10^{-3} for scientific notation, or an explicit multiplication sign for Euler’s number.','Put a signed, multidigit or compound exponent inside braces, for example x^{-2} or x^{12}.','Put the complete exponent in braces, for example x^{12} or x^{-2}.','Use arcsin(x), arccos(x) or arctan(x) for an inverse function, or an explicit fraction for a reciprocal.','Put the complete function argument in parentheses or braces, for example ln(x) or sqrt{x}.','Only mathematical notation is allowed. Remove formatting or executable commands.','This exponent exceeds the supported work limit.','The form 0^0 needs an explicit convention and is not accepted here.'
]);
const neutral={invalid:'The answer syntax could not be read.',unsupported:'This answer form could not be checked.',indeterminate:'The checker could not determine whether this answer is correct.'};
export function displayVerdict(value,{context='practice'}={}){
 const outcome=typeof value?.outcome==='string'&&Object.hasOwn(labels,value.outcome)?value.outcome:null;
 const raw=typeof value?.feedback==='string'&&value.feedback.length<=600?value.feedback:null;
 let feedback;
 if(!outcome)feedback='The saved outcome is unavailable.';
 else if(outcome==='correct')feedback='Your answer is equivalent under the stated assumptions.';
 else if(outcome==='incorrect')feedback='The answer does not meet the stated mathematical conditions.';
 else if(outcome==='skipped')feedback='Skipped without answer credit.';
 else if(outcome==='revealed')feedback='Solution revealed without answer credit.';
 else if(raw&&unavailable.has(raw))feedback=context==='replay'?'Grading was unavailable for this saved question. No correct or incorrect result was recorded.':'This saved question cannot be graded right now. You can skip it or reveal the solution without a wrong-answer penalty.';
 else if(raw&&replacements.has(raw))feedback=replacements.get(raw);
 else if(raw&&safe.has(raw))feedback=raw;
 else if(raw&&/^Enter (?:[1-9]|1[0-6]) components in the requested order\.$/.test(raw))feedback=raw;
 else feedback=neutral[outcome];
 return Object.freeze({label:outcome?labels[outcome]:'Outcome unavailable',feedback,clarified:context==='replay'&&feedback!==raw});
}
