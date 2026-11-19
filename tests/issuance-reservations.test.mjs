import test from 'node:test';
import assert from 'node:assert/strict';
import {recordExposures,recordAttemptedExposures} from '../lib/bank/exposure.ts';
import {freeResponseHistory} from '../lib/server/free-response-selection.mjs';
import {selectionHistoryToken} from '../lib/server/selection-history-token.mjs';
import {reserveQuestionSet,reservedIdentities,observeReservedQuestions,cancelPreparedReservation,reservationSnapshot,ReservationConflictError,MAX_RESERVED_QUESTIONS} from '../lib/bank/issuance-reservations.mjs';
const qs=(round,n=20)=>Array.from({length:n},(_,i)=>({problemId:`problem-${round}-${i}`,lineageId:`lineage-${round}-${i}`,familyId:'fixture-family'}));
const at=1000000;
test('all exposure stages preserve separate holds and overflow without changing attempted retention',async()=>{
 const attempted=recordExposures({},'old',Array.from({length:512},(_,i)=>({problemId:`old-${i}`,lineageId:`old-lineage-${i}`,familyId:'old-family'})),'attempted',at);
 const held=reserveQuestionSet(attempted,'pending',qs('hold',20),'prepared',at);
 let combined={...attempted,...held,reservationOverflowUntil:at+86400000};
 const original=structuredClone(combined),token=await selectionHistoryToken(combined);
 for(const stage of ['issued','displayed','attempted']){
  combined=recordExposures(combined,'fresh',qs('fresh',1),stage,at+100);
  assert.deepEqual(combined.reservations,held.reservations);assert.equal(combined.reservationOverflowUntil,at+86400000);
  assert.equal(combined.exposures.length,512);
 }
 assert.notEqual(await selectionHistoryToken(combined),token);assert.deepEqual(attempted.exposures,original.exposures);
 assert.throws(()=>freeResponseHistory(combined,at+100),ReservationConflictError);
 assert.equal(recordExposures(combined,'later',qs('later',1),'attempted',at+86400000).reservationOverflowUntil,0);
});
test('selection snapshots retain all 512 exposure pairs and 80 separate reservation pairs',async()=>{
 const history=recordExposures({},'old',Array.from({length:512},(_,i)=>({problemId:`old-${i}`,lineageId:`old-lineage-${i}`,familyId:'old-family'})),'attempted',at);
 let state={};for(let i=0;i<4;i++)state=reserveQuestionSet(state,`held-${i}`,qs(`hold-${i}`),'issued',at);
 const combined={...history,...state},selected=freeResponseHistory(combined,at);
 assert.equal(selected.ids.size,1184);assert.equal(history.exposures.length,512);
 const token=await selectionHistoryToken(combined),changed=structuredClone(combined);changed.reservations[0].lineageId='another-lineage';
 assert.notEqual(await selectionHistoryToken(changed),token);
 assert.equal(freeResponseHistory(combined,at+600000).ids.size,1024);
});
test('separate reservations survive a full attempted buffer and block a fresh cross-format equivalent',()=>{
 const history=recordExposures({},'old',Array.from({length:512},(_,i)=>({problemId:`old-${i}`,familyId:'old-family'})),'attempted',at);
 const questions=qs('new',1),state=reserveQuestionSet(history,'round-new',questions,'issued',at);
 const combined={...history,...state};assert.equal(combined.exposures.length,512);assert.equal(combined.reservations.length,1);
 assert(reservedIdentities(combined,at).has(questions[0].lineageId));
 assert.throws(()=>reserveQuestionSet(combined,'other-format',[{...questions[0],problemId:'converted'}],'issued',at+1),e=>e instanceof ReservationConflictError&&e.code==='reserved-question');
 assert.deepEqual(history.exposures,combined.exposures);
});
test('preparation is single-slot, cancellation releases only preparation, and activation preserves exact identity',()=>{
 const questions=qs('one',2),prepared=reserveQuestionSet({},'one',questions,'prepared',at);
 assert.throws(()=>reserveQuestionSet(prepared,'two',qs('two',2),'prepared',at+1),ReservationConflictError);
 assert.throws(()=>reserveQuestionSet(prepared,'one',qs('changed',2),'issued',at+1),/Changed reserved/);
 assert.throws(()=>observeReservedQuestions(prepared,'one',questions,'displayed',at+1),/prepared question cannot/);
 assert.equal(cancelPreparedReservation(prepared,'one',at+1).reservations.length,0);
 const issued=reserveQuestionSet(prepared,'one',questions,'issued',at+100);
 assert.equal(cancelPreparedReservation(issued,'one',at+200).reservations.length,2);
 assert.deepEqual(reserveQuestionSet(issued,'one',questions,'issued',at+200),issued);
 assert.equal(issued.reservations[0].expiresAt,at+100+10*60000);
});
test('live holds are never evicted to fit more rounds; exact expiry releases capacity',()=>{
 let state={};for(let i=0;i<4;i++)state=reserveQuestionSet(state,`round-${i}`,qs(i),'issued',at);
 assert.equal(state.reservations.length,MAX_RESERVED_QUESTIONS);
 assert.throws(()=>reserveQuestionSet(state,'fifth',qs('fifth',1),'issued',at+1),ReservationConflictError);
 assert.equal(reserveQuestionSet(state,'fifth',qs('fifth',1),'issued',at+600000).reservations.length,1);
});
test('first display extends the right hold without retry refresh; retained attempt releases only that question',()=>{
 const questions=qs('one',2),issued=reserveQuestionSet({},'round',questions,'issued',at);
 const displayed=observeReservedQuestions(issued,'round',[questions[0]],'displayed',at+500,at+1000);
 assert.equal(displayed.reservations[0].at,at+500);assert.equal(displayed.reservations[0].expiresAt,at+500+86400000);
 assert.deepEqual(observeReservedQuestions(displayed,'round',[questions[0]],'displayed',at+3000),displayed);
 assert.equal(observeReservedQuestions(displayed,'round',[questions[0]],'attempted',at+4000).reservations.length,2);
 const attempted=recordExposures({},'round',[questions[0]],'attempted',at+4000).exposures;
 const settled=observeReservedQuestions(displayed,'round',[questions[0]],'attempted',at+4000,at+4000,attempted);
 assert.equal(settled.reservations.length,1);assert.equal(settled.reservations[0].problemId,questions[1].problemId);
});
test('every alias collision is rejected within a question set and within a persisted round',()=>{
 const first={problemId:'P',lineageId:'L'};
 for(const second of [{problemId:'P',lineageId:'B'},{problemId:'B',lineageId:'L'},{problemId:'L',lineageId:'B'},{problemId:'B',lineageId:'P'}]){
  assert.throws(()=>reserveQuestionSet({},'round',[first,second],'issued',at),/Overlapping/);
  const a=reserveQuestionSet({},'round',[first],'issued',at),b=reserveQuestionSet({},'round',[second],'issued',at);
  assert.throws(()=>reservationSnapshot({reservations:[...a.reservations,...b.reservations]},at),/Duplicate|Overlapping/);
 }
 const a=reserveQuestionSet({},'old',[first],'issued',at);
 // An observed late display from another real round must remain representable.
 const late=observeReservedQuestions(a,'other',[{problemId:'L',lineageId:'B'}],'displayed',at-1,at);
 assert.equal(reservationSnapshot(late,at).reservations.length,2);
 assert.throws(()=>observeReservedQuestions(a,'old',[{problemId:'L',lineageId:'B'}],'displayed',at,at),/Overlapping/);
});
test('attempted transfer requires bounded detached current canonical evidence with the same lineage',()=>{
 const question=qs('proof',1)[0],held=reserveQuestionSet({},'round',[question],'issued',at);
 const proof=recordExposures({},'round',[question],'attempted',at+10).exposures;
 assert.equal(observeReservedQuestions(held,'round',[question],'attempted',at+10,at+10,proof).reservations.length,0);
 const wrong=structuredClone(proof);wrong[0].lineageId='different';
 assert.equal(observeReservedQuestions(held,'round',[question],'attempted',at+10,at+10,wrong).reservations.length,1);
 let reads=0;const accessor=structuredClone(proof);Object.defineProperty(accessor[0],'stage',{enumerable:true,get(){reads++;return 'attempted';}});
 assert.throws(()=>observeReservedQuestions(held,'round',[question],'attempted',at+10,at+10,accessor));assert.equal(reads,0);
 assert.throws(()=>observeReservedQuestions(held,'round',[question],'attempted',at+10,at+10,Array(513).fill(proof[0])));
 assert.throws(()=>observeReservedQuestions(held,'round',[question],'attempted',at+10,at+10,[{roundId:'round',problemId:question.problemId,stage:'attempted'}]));
 const historical={...question,lineageId:question.problemId},oldProof=recordExposures({},'round',[historical],'attempted',at+10).exposures;delete oldProof[0].lineageId;
 const oldHeld=reserveQuestionSet({},'round',[historical],'issued',at);
 assert.equal(observeReservedQuestions(oldHeld,'round',[historical],'attempted',at+10,at+10,oldProof).reservations.length,0);
 for(const invalid of [{reservations:null},{reservationOverflowUntil:null},null,[]])assert.throws(()=>reservationSnapshot(invalid,at));
});
test('valid historical fractional display times cannot block a later attempted transfer',()=>{
 const question=qs('current',1)[0],oldQuestion=qs('older',1)[0];
 const historical=recordExposures({},'old-round',[oldQuestion],'displayed',at-20.75);
 const original=structuredClone(historical.exposures[0]);
 const held={...historical,...reserveQuestionSet(historical,'current',[question],'issued',at)};
 const result=recordAttemptedExposures(held,'current',[question],at+10);
 assert.equal(result.reservations.length,0);
 assert.deepEqual(result.exposures.find(e=>e.roundId==='old-round'),original,'historical evidence is preserved byte-for-byte');
 for(const invalid of [Infinity,NaN,-0.5,at+100]){
  const proof=structuredClone(result.exposures);proof[0].at=invalid;
  assert.throws(()=>observeReservedQuestions(held,'current',[question],'attempted',at+10,at+10,proof));
 }
 assert.throws(()=>reserveQuestionSet({},'fractional-hold',[question],'issued',at+.5),'hold clocks stay integral');
});
test('a late real display at full capacity blocks new selection instead of silently losing exposure',()=>{
 let state={};for(let i=0;i<4;i++)state=reserveQuestionSet(state,`round-${i}`,qs(i),'issued',at);
 const late=observeReservedQuestions(state,'earlier',qs('earlier',1),'displayed',at-1000,at);
 assert.equal(late.reservations.length,80);assert.equal(late.reservationOverflowUntil,at-1000+86400000);
 assert.throws(()=>reservedIdentities(late,at+600001),ReservationConflictError);
 // Repeated validated reports use the ORIGINAL event clock, not receipt time.
 const repeated=observeReservedQuestions(late,'earlier',qs('earlier',1),'displayed',at-1000,at+1);
 assert.equal(repeated.reservationOverflowUntil,late.reservationOverflowUntil);
 assert.equal(reservedIdentities(repeated,late.reservationOverflowUntil).size,0);
});
test('reservation validation rejects malformed clocks, excess state and accessors without reading them',()=>{
 const good=reserveQuestionSet({},'round',qs('one',1),'issued',at),copy=()=>structuredClone(good);
 for(const alter of [s=>s.reservations[0].expiresAt++,s=>s.reservations[0].at=-1,s=>s.reservations[0].stage='attempted',s=>s.reservations[0].extra=true,s=>s.reservations.push({...s.reservations[0]}),s=>s.reservationOverflowUntil=Infinity]){const x=copy();alter(x);assert.throws(()=>reservationSnapshot(x,at));}
 let reads=0;const getter={get reservations(){reads++;return good.reservations;}};
 assert.throws(()=>reservationSnapshot(getter,at));assert.equal(reads,0);
 const question={get problemId(){reads++;return 'bad';},familyId:'test'};
 assert.throws(()=>reserveQuestionSet({},'round',[question],'issued',at));assert.equal(reads,0);
 assert.throws(()=>observeReservedQuestions(good,'round',qs('one',1),'displayed',at+1,at),/Invalid reservation observation/);
});
