const use=(tier,concept,role,explanation,...anchors)=>({tier,topic:'multivariable',concept,role,explanation,anchors});
export const multivariableTierUse={
 'multi-chain':[
  use('easy','linearization','extension','Extend a simple local approximation to a point moving along a curve. The general chain rule and mixed-partial analysis go beyond the introductory linearization requirement.','first-order','example-curve-with-log'),
  use('medium','chain','core','Track every changing coordinate through a total derivative and justify the local implicit branch before differentiating it.','two-parameters','implicit-branch','example-cubic-local-branch'),
  use('hard','regularity','core','Check the continuity needed to interchange mixed partials and retain the extra terms caused by nonlinear coordinates or path acceleration.','mixed-order','second-order','boundary-cases','exercise-two-input-mixed'),
  use('olympiad','parameters','foundation','Supply local implicit and second-order tools for later parameter arguments. Global optimizer existence, envelope identities and variational methods require further instruction.','implicit-branch','second-order'),
 ],
 'multi-critical':[
  use('easy','local','extension','Use gradient fluency to begin studying extrema. Hessian classification and constrained optimization extend beyond the introductory partial-derivative concepts.','local-candidates'),
  use('medium','optimization','core','Classify a stationary point, check an attained global bound, and solve one regular equality constraint.','hessian-test','example-quadratic-global-minimum','regular-constraint','example-ellipse-regular-constraint'),
  use('hard','optimization','core','Compare interior and boundary candidates, distinguish local from global results, and resolve degenerate or singular cases by direct reasoning.','global-checklist','exercise-ellipse-boundary-comparison','exercise-degenerate-fourth-order','exercise-singular-constraint'),
  use('olympiad','parameters','foundation','Keep attainment, constraint regularity and necessary conditions explicit before advanced extremal arguments. Multiple constraints, inequality multipliers and duality are separate topics.','global-checklist','regular-constraint','exercise-singular-constraint'),
 ],
 'multiple-integrals':[
  use('easy','integration','core','Integrate over a rectangle with one variable fixed at each stage, then distinguish an integral from its area-normalized average.','area-sums','proper-fubini','example-rectangle-signed-average'),
  use('medium','integration','core','Describe the same planar region in either order and use the geometry to simplify a double integral. Triple integrals and three-dimensional bounds require further study.','same-region','example-triangular-order-choice','exercise-parabolic-lens'),
  use('hard','coordinates','foundation','Establish integrability and independent cutoff limits before applying a transformation on a singular or unbounded region. Nonlinear transformations are taught in the next lesson.','singular-fubini','exercise-positive-unbounded-product','boundary-cases'),
  use('olympiad','integration','foundation','Justify a nonnegative unbounded exchange and identify a signed integral where absolute integrability fails. General multidimensional identities and measure theory need additional methods.','singular-fubini','exercise-positive-unbounded-product','boundary-cases'),
 ],
 coordinates:[
  use('easy','integration','extension','Continue from rectangular integration to polar area and angular bounds. This is optional preparation beyond the basic rectangular-integral requirement.','determinant-area','polar-coordinates'),
  use('medium','coordinates','core','Derive the planar area factor, transform an annular sector, and combine scaling with polar coordinates on an ellipse. Cylindrical and spherical coordinates are not covered here.','polar-coordinates','example-annular-sector-moment','exercise-elliptic-disk-moment'),
  use("hard","coordinates","core","Track an actual inverse branch, transformed region and absolute determinant for linear and nonlinear planar maps. The positive product-and-ratio transfer keeps coupled bounds and a variable area factor, with a direct check in the original coordinates.","change-theorem","example-reversing-parallelogram","example-nonlinear-positive-branch","exercise-positive-product-ratio-region"),
  use('olympiad','integration','foundation','Separate global image coverage from a nonzero local determinant, and distinguish area from multiplicity and signed cancellation. The general area and coarea formulas require further study.','branches-multiplicity','exercise-folded-rectangle','boundary-cases'),
 ],
};
