const use=(tier,topic,concept,role,explanation,...anchors)=>({tier,topic,concept,role,explanation,anchors});
export const elementaryTierUse={
 'one-sided-limits':[
  use('easy','limits','continuity','core','Define left/right and relative-domain endpoint limits, compare both sides with the assigned value, and distinguish a removable defect from a jump.','nearby-and-sided','joining-sides','continuity-and-domain','example-nearby-value-and-assigned-value','example-root-domain-endpoint','exercise-match-three-data','exercise-restricting-a-jump'),
  use('easy','limits','algebra','foundation','Use exact sign-dependent absolute-value simplification on the actual sides of a missing input. Rationalization and squeeze remain elsewhere.','exercise-restricting-a-jump'),
  use('easy','mixed','object-domain','foundation','Separate a nearby limit from a point value and retain the original or explicitly restricted domain.','continuity-and-domain','exercise-restricting-a-jump'),
 ],
 'slope-fields':[
  use('easy','ode','meaning','core','Read exact sampled slopes with labeled axes, sketch the corresponding segments and verify entire candidate curves by a residual. Finite grids are not existence or uniqueness proofs.','field-and-axes','local-and-global','example-constant-rows','exercise-choose-the-compatible-field','exercise-horizontal-at-one-time'),
  use('easy','ode','separation','foundation','Recognize constant equilibria before any division or separation, and distinguish them from a time-dependent zero-slope locus. The act of separation is not taught here.','autonomous-and-equilibrium','example-slanted-zero-locus','exercise-horizontal-at-one-time'),
  use('medium','ode','conditions','foundation','Identify the exact point/interval and residual obligations before later existence/uniqueness theorems. This lesson deliberately does not certify those theorems from arrows.','local-and-global','boundary-cases'),
  use('easy','mixed','representations','core','Convert an exact coordinate/slope table into local line segments and distinguish a field arrow from a whole solution graph.','field-and-axes','exercise-choose-the-compatible-field'),
 ],
 'level-sets':[
  use('easy','multivariable','local','core','Read and evaluate constant-output sets, including empty, point and multibranch levels. This Easy focus uses no gradient proof and does not claim the rest of the local-calculus concept is assessed by the contour exercise.','reading-levels','example-ellipse-levels','exercise-parabolic-level-reading'),
  use('easy','multivariable','linearization','foundation','Introduce the local plane model and the quantities in it. The finite-FTC derivation is an additional Medium argument, not an Easy exit requirement.','plane-vectors-and-partials'),
  use('medium','multivariable','chain','core','Prove the C1 first-order model with finite coordinate increments, then distinguish a unit-distance derivative, a path rate and a level-curve tangent.','finite-ftc-local-model','unit-rates-and-contour-tangents','example-tangent-is-local','exercise-direction-and-path-speed'),
  use('hard','multivariable','regularity','foundation','Give a sufficient differentiability condition and an exact counterexample showing that pointwise partials alone do not suffice. General singular-level classification and mixed-partial theorems remain separate.','finite-ftc-local-model','boundary-cases'),
 ],
 'boundary-data':[
  use('medium','ode','conditions','core','Build the two-point endpoint system, classify unique/inconsistent/nonunique data and distinguish it from an initial-value problem.','initial-versus-boundary','endpoint-system','example-singular-sine-endpoints','exercise-frequency-compatibility'),
  use('medium','ode','second-order','extension','Apply already introduced homogeneous modes and a constant particular response to exact endpoint fitting. The full forcing/resonance repertoire remains in the prerequisite.','example-two-exponential-endpoints','exercise-forced-endpoint-fit'),
  use('hard','mixed','exceptions','foundation','Retain zero-frequency and singular-sine cases before dividing by a parameter. This is finite compatibility analysis, not a Hard spectral theorem.','zero-modes-and-checks','exercise-frequency-compatibility'),
  use('olympiad','ode','parameters','foundation','Supply a basic compatibility/zero-mode distinction before nonroutine boundary problems. General forcing compatibility, special functions and spectral ordering are not established.','endpoint-system','example-singular-sine-endpoints','boundary-cases'),
 ],
};
export const exerciseTierUse=[
 {targetLessonId:'growth',exerciseId:'basic-positive-negative-tails',...use('easy','limits','infinity','core','Assess both input tails by exact rational/root rewrites, retaining the sign of the absolute value and a nonzero limiting denominator.','exercise-basic-positive-negative-tails')},
 {targetLessonId:'multiple-integrals',exerciseId:'rectangle-integral-and-average',...use('easy','multivariable','integration','core','Assess continuous proper-rectangle integration in both orders and distinguish signed integral, positive area, average and center value. This assessment uses proper integrals of a continuous function on a closed rectangle.','exercise-rectangle-integral-and-average')},
];
