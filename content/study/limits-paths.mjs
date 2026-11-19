import {calculusPreparation} from './core-paths.mjs';
export const limitsPaths=[
 {id:'limits-growth-derivative-ratios',revision:1,kind:'core',title:'Standard limits, comparative growth and L’Hôpital’s rule',
  summary:'Choose an appropriate scale, justify finite growth bounds, and use derivative ratios only after checking the indeterminate form and interval hypotheses.',
  objectives:['Keep the small or large argument and its scale explicit.','Prove a growth comparison with a bound that tends to zero.','Check every hypothesis of L’Hôpital’s rule and recognize when an alternative is clearer.'],
  steps:[...calculusPreparation,
   {lessonId:'standard-limits',purpose:'Use known elementary derivative limits without circularly treating them as new proofs of those derivatives.'},
   {lessonId:'accumulation',purpose:'Interpret signed integration and primitives before deriving a finite exponential bound.'},
   {lessonId:'ftc',purpose:'Connect the finite integral to its primitive before using the growth induction.'},
   {lessonId:'growth',purpose:'Normalize dominant terms and prove fixed-power growth comparisons without an infinite series.'},
   {lessonId:'lhopital',purpose:'Derive the mean-value bridge, then distinguish a valid derivative-ratio argument from a failed sufficient test.'},
  ],readiness:[
   {lessonId:'standard-limits',exerciseId:'half-angle-transfer',prompt:'Preserve the squared argument scale in a trigonometric limit.'},
   {lessonId:'growth',exerciseId:'nested-log-and-sign',prompt:'Choose the actual large variable and distinguish a vanishing ratio from a signed divergent product.'},
   {lessonId:'lhopital',exerciseId:'product-to-quotient',prompt:'Transform an indeterminate product into a justified quotient and check all the rule’s interval conditions.'},
  ],review:{status:'draft'}},
 {id:'recurrence-convergence',revision:1,kind:'core',title:'Recurrence limits, invariant intervals and error bounds',
  summary:'Study recursively defined sequences without derivatives: find possible limits, prove a valid invariant range, and distinguish convergence from periodic behavior or escape.',
  objectives:['Check that every iterate is defined.','Use monotonicity or shrinking errors to prove convergence.','Separate a fixed-point candidate from a convergence proof.'],
  steps:[
   {lessonId:'algebra',purpose:'Preserve denominator restrictions and reversible equations when finding fixed-point candidates.'},
   {lessonId:'functions',purpose:'Track the input and output domains through repeated composition.'},
   {lessonId:'trig',purpose:'Supply the bounded-function background used in the shared limit foundation.'},
   {lessonId:'limit-foundations',purpose:'Understand a limiting claim and the role of a bound before applying it to a sequence.'},
   {lessonId:'recurrences',purpose:'Prove invariant ranges and use monotone or geometric-error arguments to establish the actual behavior.'},
  ],readiness:[
   {lessonId:'recurrences',exerciseId:'equilibrium-or-escape',prompt:'Use the initial value to distinguish an equilibrium from an unbounded sequence.'},
   {lessonId:'recurrences',exerciseId:'period-two-transfer',prompt:'Check whether alternating errors decay before claiming that a bounded recurrence converges.'},
  ],review:{status:'draft'}},
];
