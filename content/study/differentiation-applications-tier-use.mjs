// Suggested public teaching relationships; private problem-family joins live elsewhere.
const use=(tier,topic,concept,role,explanation,...anchors)=>({tier,topic,concept,role,explanation,anchors});
export const differentiationApplicationTierUse={
 'derivative-geometry':[
 use('easy','differentiation','meaning','core','Connect a derivative to tangent direction and a time rate with appropriate units.','lines','rates'),
 use('easy','differentiation','point','core','Compute a local linear estimate and separate it from the true value using an exact remainder.','linearization','example-reciprocal-local-lines'),
 use('medium','differentiation','applications','core','Differentiate a constraint before inserting measurements, including two changing lengths and a distance rate.','example-elliptic-related-motion','exercise-rectangle-two-rates'),
 use('medium','differentiation','inverse-parametric','foundation','Handle a horizontal tangent and vertical normal; general parametric singularities belong to the separate inverse and parametric lesson.','lines','exercise-horizontal-normal-remainder'),
 use('hard','differentiation','taylor','foundation','Use an exact algebraic remainder to certify a local estimate; this does not teach general high-order Taylor bounds.','example-reciprocal-local-lines','exercise-horizontal-normal-remainder')],
 'derivative-shape':[
 use('easy','differentiation','meaning','extension','Use slope signs to compare values on intervals rather than only interpreting a derivative at a point.','monotonicity'),
 use('medium','differentiation','applications','core','Classify stationary points, concavity changes, corners and boundary extrema on the actual domain.','extrema','concavity','example-quartic-sign-and-boundary','exercise-corner-and-endpoints'),
 use('medium','differentiation','mvt','core','State continuity and differentiability hypotheses and derive quantitative interval bounds.','mvt','example-logarithm-mean-slope','exercise-unique-root-residual'),
 use('hard','mixed','exceptions','foundation','Check excluded endpoints, nondifferentiability and whether a bound is attained.','boundary-cases','exercise-corner-and-endpoints'),
 use('olympiad','differentiation','structure','foundation','Subtract a secant line to create an auxiliary function and convert derivative bounds into inequalities. This does not cover all olympiad auxiliary-function constructions.','mvt','example-logarithm-mean-slope')],
 'higher-derivatives':[
 use('medium','differentiation','inverse-parametric','extension','Organize repeated ordinary differentiation; the distinct parametric second-derivative formula is taught elsewhere.','orders','exercise-operator-versus-derivative'),
 use('hard','differentiation','higher','core','Derive the finite Leibniz rule, retain low orders, and build exact differential recurrences.','leibniz','example-quadratic-exponential-order','example-gaussian-derivative-recurrence','exercise-vanishing-polynomial-factor'),
 use('olympiad','differentiation','coefficients','foundation','Compute high-order values with finite recurrences; generating-function inversion and general coefficient extraction remain outside this lesson.','recurrences','example-gaussian-derivative-recurrence'),
 use('olympiad','differentiation','operators','foundation','Explain why variable-coefficient differentiation operators do not commute; no operator inequality or extremal theorem is claimed.','operators','exercise-operator-versus-derivative')],
 'parameter-integrals':[
 use('medium','integration','bounds','extension','Combine endpoint motion with parameter dependence in the integrand under finite-rectangle conditions.','moving-bounds','exercise-both-moving-endpoints'),
 use('hard','differentiation','interchange','core','Justify one parameter derivative by finite uniform continuity or an explicit locally uniform integrable majorant.','finite','improper-domination','boundary-cases','exercise-exponential-tail-derivative'),
 use('hard','integration','reduction','core','Differentiate a supplied parameter-dependent integral, simplify its derivative, and handle an apparent singularity in the resulting formula.','example-finite-log-parameter','integral-to-ode'),
 use('hard','limits','interchange','core','Separate pointwise convergence on finite cutoffs from uniform control of improper tails.','improper-domination','boundary-cases'),
 use("olympiad","integration","structure","core","Derive and solve parameter equations from integrals, checking each differentiation, the finite-cutoff boundary terms and the initial data. The Gaussian example and a damped sine-remainder transfer use different closure identities; general kernels may need other estimates.","integral-to-ode","example-normalized-gaussian-ode","exercise-damped-sine-remainder-ode"),
 use('olympiad','integration','transforms','foundation','An oscillatory Gaussian kernel provides preparation for transform methods. No inversion, convolution or contour theory is taught here.','example-normalized-gaussian-ode')]
};
