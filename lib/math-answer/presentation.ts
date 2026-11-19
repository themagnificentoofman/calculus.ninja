import type {AnswerType} from './contracts.ts';
/** Only call after an authorized finalization/review boundary. */
export function referenceAnswer(answer:AnswerType):string {
 if(answer.kind==='scalar'||answer.kind==='function'||answer.kind==='approximate')return answer.expected;
 if(answer.kind==='antiderivative')return answer.reference;
 if(answer.kind==='tuple')return `\\left(${answer.components.map(referenceAnswer).join(',\\;')}\\right)`;
 if(answer.kind==='finite-set')return `\\left\\{${answer.elements.map(referenceAnswer).join(',\\;')}\\right\\}`;
 if(answer.kind==='interval')return `${answer.lowerClosed?'[':'('}${answer.lower},${answer.upper}${answer.upperClosed?']':')'}`;
 return ({'positive-infinity':'\\infty','negative-infinity':'-\\infty','does-not-exist':'\\text{DNE}',diverges:'\\text{diverges}',converges:'\\text{converges}',absolute:'\\text{absolutely convergent}',conditional:'\\text{conditionally convergent}'})[answer.expected];
}
