// Independently reviewed teaching scope; publication and exposure admission remain pending.
const use=(tier,topic,concept,role,explanation,...anchors)=>({tier,topic,concept,role,explanation,anchors});
export const limitsTierUse={
 'standard-limits':[
  use('medium','limits','standard','core','Normalize trigonometric, exponential and logarithmic arguments, retain their scales and justify a positive variable-power limit.','derivative-limits','scaling','quadratic-trig','example-positive-variable-power'),
  use('easy','limits','continuity','extension','Check the continuity of an outer operation; a floor at an integer requires knowing the side of approach.','outer-operation','example-floor-from-two-sides'),
  use('hard','limits','asymptotics','foundation','Recognize the first nonzero order and the failure of a first-order comparison after cancellation. Controlled higher-order estimates require the Taylor lesson.','quadratic-trig','boundary-cases'),
 ],
 growth:[
  use('easy','limits','infinity','core','Interpret a tail limit and preserve the sign of a dominant algebraic scale, including a principal square root on the negative tail.','infinity-meaning','dominant-scale','example-negative-tail-root'),
  use('medium','limits','standard','core','Prove fixed-power exponential and logarithmic growth comparisons and choose the actual large variable in a composite expression.','finite-growth-bound','logarithm-scale','example-square-root-exponential-scale'),
  use('hard','limits','asymptotics','foundation','Use an explicit bound tending to zero before more delicate multi-scale estimates. Variable exponents and sharp asymptotic corrections are beyond this lesson.','finite-growth-bound'),
 ],
 lhopital:[
  use('medium','limits','lhopital','core','Check indeterminate form, interval, denominator derivative and derivative-ratio limit before applying or repeating the rule.','rule','why-rule','exercise-product-to-quotient'),
  use('medium','differentiation','mvt','core','State and derive Rolle, mean-value and Cauchy mean-value results under their closed/open interval hypotheses, including a derivative bound for sine.','mean-value','cauchy-mean-value'),
  use('hard','mixed','exceptions','foundation','Separate a failed sufficient test from a false conclusion, and detect omitted differentiability or indeterminate-form hypotheses.','boundary-cases'),
 ],
 recurrences:[
  use('medium','limits','sequences','core','Find fixed-point candidates, prove invariant ranges and convergence separately, and compare monotone and shrinking-error routes.','sequence-meaning','monotone-convergence','fixed-point','error-bound','example-alternating-contracting-error'),
  use('easy','series','partial-sums','foundation','Establish what convergence of a sequence means before a series is defined by its partial-sum sequence. No new infinite-sum formula is taught here.','sequence-meaning','monotone-convergence'),
  use('hard','limits','parameters','foundation','See how an initial value can select an equilibrium or unbounded growth; general parameter-dependent bifurcation and nonuniform limits need further work.','exercise-equilibrium-or-escape'),
 ],
};
