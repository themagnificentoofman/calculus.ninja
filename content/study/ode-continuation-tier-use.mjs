// Draft scoped proposals. A mapping does not certify the whole concept or difficulty.
const use=(tier,topic,concept,role,explanation,anchors)=>({tier,topic,concept,role,explanation,anchors});
export const odeContinuationTierUse={
 'ode-variation':[
  use('medium','ode','second-order','extension','Extends homogeneous-plus-particular reasoning beyond the short trial families; the zero-data base preserves the initial-state fit.',['coefficient-equations','example-secant-forcing','exercise-hyperbolic-response']),
  use('hard','ode','methods','core','Derives the second-order variation-of-parameters method with a nonzero Wronskian and normalized forcing, including a variable-coefficient equation. General systems and Green boundary-value operators remain separate.',['fundamental-pair','coefficient-equations','example-variable-coefficient-log','exercise-quadrature-response']),
  use('hard','ode','lifetime','foundation','Makes coefficient and forcing domains explicit; a method formula is not a license to cross a singular endpoint. Nonlinear blowup and singular envelopes are not taught here.',['example-secant-forcing','example-variable-coefficient-log','boundary-cases']),
  use('olympiad','ode','comparison','foundation','Constructs a Duhamel endpoint kernel as preparation for forced boundary and control problems. Orthogonal projections, Gram minimization and spectral compatibility still require dedicated teaching.',['response-kernel','exercise-hyperbolic-response','exercise-quadrature-response']),
 ],
 'ode-energy':[
  use('medium','ode','conditions','extension','Extends the compact-continuation reasoning from scalar equations to the two-state conservative system, with an explicit smooth-field bridge.',['continuation','example-mixed-potential-speed','exercise-damped-energy-bound']),
  use('hard','ode','lifetime','core','Uses compact energy sublevels for global continuation and contrasts a global but unbounded branch with a finite blowup example. The claim is these mechanisms, not all singular-solution theory.',['continuation','example-asymptotic-zero','boundary-cases','exercise-damped-energy-bound']),
  use('olympiad','ode','structure','core','Teaches the energy first integral, signed branches, travel-time integrability and a least-period proof. It does not derive Pinney invariants, inverse-period Abel transforms or general Hamiltonian structure.',['conserved-energy','turning-time','example-mixed-potential-speed','exercise-pendulum-quarter-time']),
  use('hard','integration','convergence','foundation','Uses endpoint comparison to distinguish an integrable turning point from an infinite-time approach. This supports convergence-sensitive ODE quadratures; no general special-function evaluation is claimed.',['turning-time','example-asymptotic-zero','exercise-pendulum-quarter-time']),
 ],
 'ode-laplace':[
  use('medium','ode','first-order','extension','Uses a transform as an alternative to an integrating factor, retaining the initial value and recovering a verified total solution.',['initial-boundaries','example-polynomial-input-data','exercise-unshifted-ramp-input']),
  use('medium','ode','second-order','extension','Connects repeated roots and initial-state fitting with repeated transform poles, and checks a switched oscillator interval by interval.',['example-finite-pulse','exercise-repeated-transform-pole']),
  use('hard','ode','series-transforms','core','Teaches the real Laplace integral, sufficient growth conditions, derivative transforms and delayed bounded forcing. Complex inversion, distributional impulses and convolution theorems remain outside this bounded scope.',['transform-domain','basic-pairs','initial-boundaries','delayed-switch','example-finite-pulse','exercise-unshifted-ramp-input']),
  use('hard','mixed','exceptions','core','Checks origin integrability, actual transform convergence, and matching conditions before treating an algebraic expression as a solution.',['transform-domain','boundary-cases','example-finite-pulse','exercise-unshifted-ramp-input']),
 ],
 'ode-frobenius':[
  use('hard','ode','series-transforms','core','Constructs convergent ordinary-point and real regular-singular series, with all-order recurrences and a resonant obstruction. Complex exponents, irregular singular points and full special-function theory remain gaps.',['ordinary-series','regular-singular','resonant-recurrence','example-fractional-indicial-pair','exercise-resonance-obstruction']),
  use('hard','limits','interchange','foundation','Uses the already-taught power-series theorem on compact interior intervals and separates a finite coefficient calculation from justified differentiation of an infinite sum.',['verify-series','example-gaussian-primitive-series','example-fractional-indicial-pair']),
  use('olympiad','ode','parameters','foundation','Prepares series-normalized special-function arguments through independent branches and singular-endpoint control. Bessel zero existence, orthogonality and normalization identities are not taught.',['example-fractional-indicial-pair','boundary-cases','exercise-resonance-obstruction']),
 ]
};
