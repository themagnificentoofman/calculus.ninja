import {intervalAndEnergyTierUse} from './interval-and-energy-tier-use.mjs';
import {concentrationAndTransformsTierUse} from './concentration-and-transforms-tier-use.mjs';
import {interpolationConstructionTierUse} from './interpolation-constructions-tier-use.mjs';
import {seriesSpatialTierUse} from './series-spatial-tier-use.mjs';
import {advancedSequenceFourierTierUse} from './advanced-sequence-fourier-tier-use.mjs';
import {elementaryTierUse,exerciseTierUse} from './elementary-tier-use.mjs';
import {specialIntegralTierUse} from './special-integrals-tier-use.mjs';
import {seriesExtensionTierUse} from './series-extensions-tier-use.mjs';
import {odeContinuationTierUse} from './ode-continuation-tier-use.mjs';
import {odeMethodTierUse} from './ode-methods-tier-use.mjs';
import {multivariableExtensionTierUse} from './multivariable-extensions-tier-use.mjs';
import {differentiationApplicationTierUse} from './differentiation-applications-tier-use.mjs';
import {integrationApplicationTierUse} from './integration-applications-tier-use.mjs';
import {limitsTierUse} from './limits-tier-use.mjs';
// Public curriculum relationships, never private question-to-technique mappings.
// Each relationship names actual teaching anchors and its bounded role.
import {multivariableTierUse} from './multivariable-tier-use.mjs';
import {seriesTierUse} from './series-tier-use.mjs';
const use=(tier,topic,concept,role,explanation,...anchors)=>({tier,topic,concept,role,explanation,anchors});
import {auxiliaryFunctionTierUse} from './auxiliary-functions-tier-use.mjs';
export const lessonTierUse={
 ...intervalAndEnergyTierUse,
 ...concentrationAndTransformsTierUse,
 ...interpolationConstructionTierUse,
 ...auxiliaryFunctionTierUse,
 ...advancedSequenceFourierTierUse,
 ...elementaryTierUse,
 ...strategyTierUse,
 ...specialIntegralTierUse,
 ...seriesExtensionTierUse,
 ...odeContinuationTierUse,
 ...odeMethodTierUse,
 ...multivariableExtensionTierUse,
 ...differentiationApplicationTierUse,
 ...integrationApplicationTierUse,
 ...multivariableTierUse,
 ...seriesTierUse,
 ...limitsTierUse,
 algebra:[
  use('easy','limits','algebra','core','Factor and rationalize before taking a limit, while preserving excluded inputs.','conjugates','equivalence'),
  use('easy','mixed','object-domain','foundation','Exact algebra and reversible equations support every introductory topic.','intervals','reversible'),
  use('hard','mixed','exceptions','foundation','Track which transformations can lose cases or introduce invalid answers.','reversible'),
 ],
 functions:[
  use('easy','mixed','object-domain','core','Find the allowed input set and the order of operations in a composition.','domain','composition'),
  use('medium','differentiation','inverse-parametric','foundation','Choose a one-to-one branch before asking for an inverse derivative. The derivative formula is taught in the later inverse lesson.','inverse'),
  use('hard','mixed','exceptions','foundation','Keep domains and branches explicit when changing a representation.','domain','inverse'),
 ],
 trig:[
  use('easy','differentiation','rules','foundation','Establish radians, signs and identities needed by trigonometric derivative rules.','circle','special-angles'),
  use('medium','integration','methods','foundation','Use special values and inverse branches before trigonometric substitutions. Integration techniques are taught separately.','special-angles','branches'),
  use('hard','mixed','exceptions','foundation','Check the range of an inverse trigonometric function instead of silently replacing an angle by its principal value.','branches'),
 ],
 'exp-log':[
  use('easy','differentiation','rules','foundation','Establish the logarithm domain and exponential identities used by elementary derivatives.','inverse-laws'),
  use('medium','differentiation','implicit','foundation','Rewrite a positive-base variable power using an exponential and logarithm before differentiation.','variable-powers'),
  use('hard','mixed','exceptions','foundation','Track signs and absolute values rather than extending logarithm identities outside their real domains.','inverse-laws'),
 ],
 'linear-algebra':[
  use('easy','multivariable','local','foundation','Normalize directions and compute dot products before interpreting directional derivatives.','vectors','projection'),
  use('medium','multivariable','optimization','foundation','Use quadratic forms and principal directions to prepare for Hessian classification. The full critical-point test comes later.','matrices'),
  use('olympiad','multivariable','structure','foundation','Recognize quadratic forms and use a unit-vector constraint to obtain sharp bounds. General determinant and invariance methods require further study.','matrices','exercise-quadratic-unit-circle'),
 ],
 inequalities:[
  use('hard','integration','convergence','foundation','Use inequalities with equality conditions to control an integral or approximation. This lesson supplies the bounding tool, not every convergence test.','square','attainment'),
  use('olympiad','mixed','extremal','core','Recognize a nonnegative square, prove a sharp bound and distinguish an attained optimum from a limiting value.','square','attainment','exercise-fixed-sum-product'),
 ],
 complex:[
  use('medium','ode','second-order','foundation','Use complex conjugate roots and Euler’s identity to understand real oscillatory solution modes.','arithmetic','polar'),
  use('hard','mixed','exceptions','foundation','Keep principal arguments, logarithms and roots consistent with their branch conventions.','branches'),
  use('olympiad','integration','transforms','foundation','Prepare the arithmetic and branch language needed before complex integration; this lesson does not teach contour or residue methods.','arithmetic','branches'),
 ],
 analysis:[
  use('hard','series','uniform','core','Distinguish pointwise control from one error bound valid over the whole stated domain.','quantifiers','exercise-unbounded-domain'),
  use('hard','limits','interchange','core','Check a theorem’s hypotheses before exchanging a limit with integration or differentiation.','operations'),
  use('olympiad','limits','singular','foundation','Use a domain-sensitive counterexample to detect a nonuniform limiting argument. More advanced singular limits need additional methods.','quantifiers','exercise-unbounded-domain'),
 ],
 'derivative-meaning':[
  use('easy','differentiation','meaning','core','Build the derivative from a difference quotient and interpret its slope and rate units.','idea'),
  use('easy','differentiation','point','core','Construct a tangent line and compare it with the function near the base point.','linear-model'),
  use('medium','differentiation','applications','foundation','Use local linearization as the starting point for applications and error estimates.','linear-model'),
 ],
 accumulation:[
  use('easy','integration','accumulation','core','Separate net accumulation from geometric area by keeping the sign of the integrand.','idea','exercise-area-with-two-crossings'),
  use('easy','integration','ftc','core','Verify a primitive and handle its constant on a connected domain. The full fundamental-theorem explanation is in the next lesson.','primitives'),
  use('medium','mixed','connections','foundation','Connect differentiation with the accumulated change that it measures.','primitives'),
 ],
 'limit-foundations':[
  use('easy','limits','continuity','core','Distinguish a function value from its limit and check both sides of the point.','meaning'),
  use('easy','limits','algebra','core','Choose cancellation, rationalization or squeeze and state why the operation is valid.','routes','exercise-conjugate-limit'),
  use('hard','mixed','exceptions','foundation','Use the precise domain and limiting definition before applying a more elaborate asymptotic argument.','meaning'),
 ],
 'partial-sums':[
  use('easy','series','partial-sums','core','Keep indexing explicit, sum geometric or telescoping finite expressions, then take their limits.','definition','geometric','example-two-step-telescope'),
  use('easy','series','tests','core','Explain why terms tending to zero are necessary but insufficient; harmonic grouping supplies a counterexample. This is not a complete p-series course.','boundary-cases','exercise-harmonic-blocks'),
  use('medium','series','errors','foundation','Use an exact geometric tail as the first example of a justified remainder bound.','exercise-alternating-geometric-tail'),
 ],
 'ode-meaning':[
  use('easy','ode','meaning','core','Check the equation, interval and initial value for a proposed solution.','residual'),
  use('easy','ode','separation','foundation','Identify equilibria and the direction of the field before choosing a solving method.','slope'),
  use('medium','ode','conditions','foundation','Separate verification of one function from a claim that it is the unique solution.','residual'),
 ],
 'multi-local':[
  use('easy','multivariable','local','core','Compute partial derivatives and gradients, then distinguish a unit direction from a path with its own speed.','slices','directions'),
  use('easy','multivariable','linearization','core','Construct and check a linear approximation to a two-variable function.','slices','exercise-path-and-unit-direction'),
  use('medium','multivariable','chain','foundation','Use a tangent plane and path derivative to prepare for the general multivariable chain rule.','directions'),
 ],
 'derivative-rules':[
  use('easy','differentiation','rules','core','Select elementary, product, quotient and direct chain rules from the expression’s structure.','basic-rates','product-quotient','chain'),
  use('medium','differentiation','implicit','foundation','Retain every changing factor before differentiating implicit relations and variable powers.','chain'),
  use('hard','differentiation','higher','foundation','Supply the product and chain rules used repeatedly in higher-order calculations; Leibniz formulas and recurrences are separate topics.','product-quotient','chain'),
 ],
 'implicit-logarithmic':[
  use('medium','differentiation','implicit','core','Differentiate implicit equations on a justified local branch and variable powers on a positive-base interval.','local-function','logarithms'),
  use('hard','differentiation','implicit','foundation','Inspect an exceptional denominator before treating the differentiated equation as a valid local formula. Parameter-dependent families need additional analysis.','exceptions'),
 ],
 'inverse-parametric':[
  use('medium','differentiation','inverse-parametric','core','Track the original input for an inverse derivative and divide parameter speeds only where the denominator is nonzero.','inverse','parametric'),
  use('hard','differentiation','implicit','foundation','Investigate zero-speed and vertical cases instead of assigning a slope by an invalid quotient.','exceptional-speeds','exercise-parametric-exceptions'),
 ],
 'taylor-remainders':[
  use('medium','limits','taylor','core','Match derivatives at a center and use a remainder bound to justify a local polynomial approximation.','coefficients','lagrange'),
  use('hard','differentiation','taylor','core','Derive and compare integral and derivative-based remainder bounds, including an exact algebraic remainder.','lagrange','integral','exercise-exact-geometric-remainder'),
  use('olympiad','differentiation','coefficients','foundation','Prepare coefficient matching and controlled error estimates before nonroutine extraction or asymptotics. This lesson does not teach inversion or generating functions.','coefficients','integral'),
  use("hard","limits","asymptotics","core","Control a finite Taylor remainder after higher-order cancellation, then determine whether an oscillating inner argument leaves a convergent quotient. Expand the smooth outer function only on a justified interval; general asymptotic methods require further study.","lagrange","exercise-oscillating-inner-cancellation"),
 ],
 ftc:[
  use('easy','integration','ftc','core','Justify why differentiating an accumulation recovers a continuous rate and why primitive endpoint subtraction works.','local-average','evaluation'),
  use('medium','integration','bounds','core','Apply the chain rule at both moving integration limits, including crossing endpoints.','two-moving-ends','exercise-crossing-endpoints'),
  use('medium','mixed','connections','core','Connect the local rate, the signed accumulated change and the sign of an accumulation derivative.','local-average','example-accumulation-shape'),
 ],
 substitution:[
  use('easy','integration','substitution','core','Recognize a derivative factor and change both bounds with the correct orientation.','chain-rule','orientation','example-decreasing-change'),
  use('medium','integration','methods','core','Verify an inverse-tangent primitive and separate signed substitutions from inverse-branch changes.','inverse-tangent-primitive','branches'),
  use('hard','integration','structure','foundation','Track repeated traversal and absolute factors before attempting a less obvious substitution. Nonroutine transformations require further examples.','branches','example-two-branches-absolute'),
 ],
 parts:[
  use('medium','integration','methods','core','Reverse the product rule, choose factors that simplify the integral, and keep both boundary values.','product-rule','choice','exercise-twice-trigonometric'),
  use('hard','integration','reduction','core','Build a reduction formula with its range, base case and endpoint contributions.','recursion'),
  use('hard','differentiation','taylor','foundation','Prepare the repeated integration-by-parts argument used for Taylor’s integral remainder.','product-rule'),
 ],
 improper:[
  use('medium','integration','bounds','core','Define each singular or infinite endpoint by a separate limit and choose the correct power comparison.','limits-first','comparison'),
  use('hard','integration','convergence','core','Prove oscillatory convergence with a tail bound and distinguish it from absolute convergence.','example-oscillatory-tail'),
  use('olympiad','integration','special','foundation','Keep ordinary improper integrals distinct from explicitly requested principal values. This supplies a convention check, not advanced special-function methods.','principal-value','exercise-double-pole-no-rescue'),
 ],
 'linear-ode':[
  use('medium','ode','first-order','core','Normalize a first-order linear equation and derive the integrating factor from a product derivative. Exact and Bernoulli equations are separate topics.','recognition','product-rule'),
  use('hard','ode','methods','foundation','Check the coefficient interval and complete solution before using linear equations inside a substitution or reduction.','verification'),
 ],
 'separable-ode':[
  use('easy','ode','separation','core','Separate variables only where division is valid, retaining equilibrium solutions. Start with the separation section before the more detailed branch examples.','separation'),
  use('medium','ode','conditions','extension','Use uniqueness to justify noncrossing and use initial data to select an implicit or explicit branch.','branches','implicit-solutions'),
  use('hard','ode','lifetime','foundation','Track the solution interval and possible poles instead of treating an algebraic formula as one solution across all branches.','exercise-negative-reciprocal-branch'),
 ],
 'second-order-ode':[
  use('medium','ode','second-order','core','Build the homogeneous basis for distinct, repeated and complex roots, add a forced response, and recognize resonance.','characteristic-roots','particular-response','interpretation'),
  use('hard','ode','systems','foundation','Use the explicitly introduced position–velocity pair as preparation for linear systems. General eigenstructure and stability methods are not covered here.','characteristic-roots'),
 ],
 'existence-uniqueness':[
  use('medium','ode','conditions','core','Distinguish continuity-based existence from uniqueness under a suitable Lipschitz condition.','local-theorems','exercise-lipschitz-with-a-corner'),
  use('hard','ode','lifetime','core','Use blowup, domain boundaries and continuation estimates to distinguish local and global solutions.','maximal-interval','example-bounded-slope-global-solution'),
  use('olympiad','ode','comparison','foundation','Prepare rigorous interval and continuation arguments before advanced comparison or oscillation methods. Those methods are not themselves taught in this lesson.','scope-check'),
 ],
};
export const lessonTierUseReview={status:'draft',revision:2026111804};
import {strategyTierUse} from './strategy-tier-use.mjs';

// Extend the existing concept relationship with its new assessment anchor.
for(const {targetLessonId,exerciseId,...relationship} of exerciseTierUse){
 lessonTierUse[targetLessonId]=lessonTierUse[targetLessonId].map(current=>
  current.tier===relationship.tier&&current.topic===relationship.topic&&current.concept===relationship.concept
   ?{...current,explanation:current.explanation+' '+relationship.explanation,anchors:[...current.anchors,...relationship.anchors]}
   :current);
}

// Preserve existing concept relationships while adding the new transfer.
for(const [lessonId,additions] of Object.entries(seriesSpatialTierUse)){
 const current=lessonTierUse[lessonId]??[];
 for(const addition of additions){
  const index=current.findIndex(row=>row.tier===addition.tier&&row.topic===addition.topic&&row.concept===addition.concept);
  if(index<0)current.push(addition);
  else current[index]={...current[index],explanation:current[index].explanation+" "+addition.explanation,anchors:[...new Set([...current[index].anchors,...addition.anchors])]};
 }
 lessonTierUse[lessonId]=current;
}
