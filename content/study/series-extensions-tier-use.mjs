// Author proposals; exact real concept IDs with scoped teaching anchors. No bank coverage certificate.
const use=(tier,topic,concept,role,explanation,...anchors)=>({tier,topic,concept,role,explanation,anchors});
export const seriesExtensionTierUse={
 generating:[
  use('medium','series','power','extension','Extend established power-series operations to sequence encoding and coefficient extraction. Formal identities still need convergence before evaluation.','formal-and-analytic','coefficient-rules','example-inhomogeneous-recurrence'),
  use('hard','series','generating','core','Derive a recurrence generating function, a harmonic prefix transform and a factorial-normalized encoding, retaining initial terms and convergence domains. Nonlinear generating differential equations need a further bridge.','initial-terms','factorial-normalization','example-harmonic-prefix-coefficients','exercise-factorial-growth-two-encodings'),
  use('hard','series','operations','core','Justify products by an absolute double-tail estimate, and distinguish finite coefficient extraction from evaluation of an infinite series. Conditional Cauchy-product theorems are outside this scope.','coefficient-rules','example-harmonic-prefix-coefficients'),
  use('olympiad','series','coefficients','foundation','Prepare convolution, weighted finite selections and normalization before nonroutine coefficient extraction. No singularity asymptotics or inversion formula is established here.','coefficient-rules','exercise-weighted-pair-extraction','factorial-normalization'),
  use('olympiad','differentiation','coefficients','foundation','Relate coefficient shifts and formal derivatives to ordinary and exponential generating functions. High-order inversion and specialized coefficient methods remain separate.','coefficient-rules','factorial-normalization'),
 ],
 rearrangements:[
  use('medium','series','errors','extension','Use absolute versus conditional convergence to investigate a new ordering, extending the Medium distinction beyond ordinary alternating tails.','absolute-order','conditional-reservoirs','example-absolute-sign-blocks'),
  use('hard','series','operations','core','Prove absolute rearrangement invariance and analyze conditional orders with finite cutoffs, including unfinished growing blocks.','absolute-order','example-growing-positive-blocks','exercise-greedy-target-one'),
  use('hard','limits','interchange','core','Separate two iterated limits, square cutoffs and a joint rectangular limit through an exact sparse-array calculation; state the sufficient total absolute bound.','double-order','exercise-sparse-double-order'),
  use('olympiad','series','parameters','foundation','Make the order of a conditional sum explicit and detect a missing global absolute bound. Advanced summability methods and special-function identities are not derived.','what-order-means','double-order','boundary-cases'),
 ],
 products:[
  use('medium','series','errors','extension','Transfer convergence and absolute-tail ideas to finite logarithmic sums of positive products. Infinite-product conventions and conditional losses extend the basic series tests.','partial-products','logarithm-criterion','example-finite-telescope-product'),
  use('hard','series','operations','core','Use the exact finite logarithm identity and absolute log convergence before rearranging a product; demonstrate failure when the log series is only conditional.','logarithm-criterion','factor-order','exercise-ordered-exponential-factors'),
  use('olympiad','series','products','core','Prove the positive-product logarithm criterion and a quadratic defect bound, then classify conditional and normalized product thresholds. Euler prime products, special-function products and Fourier products remain uncovered.','log-defect','example-conditional-quadratic-threshold','exercise-normalized-positive-product'),
  use('olympiad','limits','objects','core','Evaluate a finite product telescope and classify positive or zero limits from controlled logarithmic sums. This covers real positive products, not arbitrary limiting integrals or complex products.','example-finite-telescope-product','log-defect','example-conditional-quadratic-threshold'),
  use('olympiad','series','parameters','foundation','Check the equality parameter, positive-factor domain, finite zero-factor exception and prescribed order before advanced product identities. No special-function identity is assumed.','partial-products','example-conditional-quadratic-threshold','boundary-cases'),
 ],
};
