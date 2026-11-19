// Proposed author mappings only; independent review and exposure admission pending.
const use=(tier,topic,concept,role,explanation,...anchors)=>({tier,topic,concept,role,explanation,anchors});
export const integrationApplicationTierUse={
 'rational-trig':[
  use('easy','integration','substitution','extension','Extend a direct change of variable to a principal-root integrand by choosing a sine or tangent branch and transforming the differential and both endpoints.','sine-branch','tangent-branch','example-negative-circle-branch','exercise-tangent-root-transfer'),
  use('medium','integration','methods','core','Divide rational functions, decompose repeated linear and simple irreducible quadratic factors, and integrate their logarithmic and inverse-tangent kernels. Two radical trigonometric substitutions are taught; general trigonometric-power methods are not.','rational-setup','factor-types','primitive-kernels','example-repeated-linear-factor','example-irreducible-quadratic','exercise-divide-before-decomposing'),
  use('hard','mixed','exceptions','foundation','Keep poles, connected primitive intervals and principal-root branches explicit before attempting a more complicated integral. This does not teach improper convergence across a pole.','primitive-kernels','sine-branch','boundary-cases'),
 ],
 'integral-applications':[
  use('easy','integration','accumulation','extension','Use signed accumulation to define an average, and split a geometric area at curve crossings so that its pieces are nonnegative.','average','area','example-temperature-average','example-crossing-curves-area'),
  use('medium','integration','applications','core','Construct actual averages, crossing-curve areas, washer and shell volumes, graph arc lengths, and surfaces of revolution. The axis, slice direction, regularity and requested boundary are part of the model.','volume','arc-length','surface-area','example-washers-and-horizontal-shells','example-arc-with-continuous-speed','example-surface-of-square-root-graph','exercise-root-line-area-and-shells','exercise-shifted-axis-frustum'),
  use('hard','mixed','exceptions','foundation','Distinguish the C1 hypothesis for graph length from a stronger second-derivative condition, and recognize overlapping-shell and shifted-axis errors. General singular or parametric geometry needs further instruction.','volume','arc-length','surface-area','boundary-cases'),
 ],
 symmetry:[
  use('easy','integration','accumulation','core','Separate continuous odd and even components on symmetric bounds and check when signed cancellation applies.','parity','example-odd-rational-plus-even-cosine','boundary-cases'),
  use('medium','mixed','method-selection','core','Choose reflection or a centered variable to pair complementary values and simplify a first moment; compare that route with a direct primitive.','reflection','symmetric-weight','example-logarithmic-reflection-pair','exercise-centered-first-moment'),
  use('hard','integration','structure','core','Account for a nonlinear reciprocal substitution, its orientation and its invariant logarithmic weight. A complement identity alone does not preserve an unweighted integral.','nonlinear-pairing','example-reciprocal-logistic-weight','exercise-reciprocal-without-weight'),
  use('olympiad','integration','structure','foundation','Use a rigorously stated proper-interval involution and weight-preservation test as preparation for nonroutine pairing. Improper weighted identities and parameter-to-ODE arguments are not taught here.','nonlinear-pairing','example-reciprocal-logistic-weight','exercise-reciprocal-without-weight'),
 ],
 approximation:[
  use('easy','integration','accumulation','extension','Connect midpoint rectangles and trapezoids to a finite approximation of a signed integral. The later error proofs require Taylor remainders and integration by parts.','grid-and-rules'),
  use('medium','mixed','method-selection','core','Choose a sufficient panel count from a proved global derivative bound, and combine two valid numerical enclosures without asserting an unstated curvature sign.','certified-estimate','example-guaranteed-panel-count','exercise-combine-sampled-enclosures'),
  use('hard','integration','convergence','core','Derive midpoint and trapezoidal bounds under C2 regularity, retain curvature information and reject a smooth error theorem across a corner. This is a finite quadrature-error component of the broader concept, not a general convergence theorem.','midpoint-bound','trapezoid-kernel','direction-and-sharpness','example-two-rules-one-enclosure','exercise-corner-breaks-curvature-bound'),
  use('olympiad','integration','special','foundation','Prove the standard constants are attained by a quadratic using constant-sign kernels. This prepares the sharp-bound viewpoint; arbitrary Peano kernels, nonattainment and special functions are not covered.','direction-and-sharpness','trapezoid-kernel'),
 ],
};
