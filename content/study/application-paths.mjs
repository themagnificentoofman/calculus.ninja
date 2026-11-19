import {calculusPreparation} from './core-paths.mjs';
const step=(lessonId,purpose)=>({lessonId,purpose});
const check=(lessonId,exerciseId,prompt)=>({lessonId,exerciseId,prompt});
const accumulation=step('accumulation','Distinguish signed accumulation, geometric area and an antiderivative.');
const ftc=step('ftc','Connect derivatives and accumulation, retaining endpoints and continuity conditions.');
const substitution=step('substitution','Change the variable together with its differential, endpoints and branch.');
const parts=step('parts','Reverse the product rule and keep the resulting boundary terms.');
const integrationPreparation=[...calculusPreparation,accumulation,ftc,substitution];
const path=(id,title,summary,objectives,steps,readiness)=>({id,revision:1,kind:'core',title,summary,objectives,steps,readiness,review:{status:'draft'}});

// Independent branches: unrelated methods are not prerequisites just because
// they occur next to each other in a textbook or the library.
export const applicationPaths=[
 path('derivative-geometry-and-shape','Tangent lines, related rates and graph analysis',
  'Use derivatives to describe local geometry and changing quantities, then justify conclusions about a whole interval.',
  ['Find tangent and normal directions, including horizontal and vertical cases.','Differentiate a constraint before substituting measured values.','Use derivative signs and theorem hypotheses to distinguish local behavior, extrema and global claims.'],
  [...calculusPreparation,step('linear-algebra','Use perpendicular vectors to describe a normal direction.'),step('implicit-logarithmic','Check the nonzero coefficient needed to differentiate a selected implicit branch.'),step('derivative-geometry','Apply those derivatives to lines, local error and related rates with units.'),step('derivative-shape','Extend pointwise information to interval sign arguments, extrema and mean-value bounds.')],
  [check('derivative-geometry','rectangle-two-rates','Explain how area and perimeter can change in different directions when both dimensions vary.'),check('derivative-shape','corner-and-endpoints','Include a corner and inspect an excluded endpoint before claiming an absolute extremum.'),check('derivative-shape','unique-root-residual','Use a derivative bound to turn a residual into a guaranteed root error.')]),
 path('higher-derivative-methods','Repeated derivatives and Leibniz formulas',
  'Organize repeated product differentiation and distinguish ordinary derivatives from repeated application of a variable-coefficient operator.',
  ['Define the finite coefficients and justify the product formula.','Use a vanishing factor to identify which derivative terms survive.','Check low-order and operator exceptions instead of extrapolating a pattern.'],
  [...calculusPreparation,step('higher-derivatives','Use finite induction, product formulas and exact recurrences to control higher derivatives.')],
  [check('higher-derivatives','vanishing-polynomial-factor','Identify the one surviving product term at the specified point.'),check('higher-derivatives','operator-versus-derivative','Compute the variable-coefficient operator separately from the ordinary second derivative.')]),
 path('parameter-integral-methods','Differentiation under integrals and integral-defined ODEs',
  'Establish local derivative control, justify finite and improper interchanges, and solve the differential equation produced by an integral.',
  ['Separate a parameter from the integration variable and moving endpoints.','Verify finite-interval hypotheses and a common integrable bound for an improper integral.','Retain the boundary terms and initial value when an integral defines an ODE.'],
  [...calculusPreparation,step('derivative-shape','Use the mean value theorem to control changes over an interval.'),accumulation,ftc,parts,substitution,step('partial-sums','Prepare the divergence comparison used in improper integration.'),step('improper','Justify the one-sided limits and boundary terms of ordinary improper integrals.'),step('ode-meaning','Verify an equation together with its initial condition and interval.'),step('linear-ode','Solve a first-order linear equation with an integrating factor.'),step('analysis','Distinguish a pointwise estimate from one that controls the entire domain.'),step('parameter-integrals','Combine these tools in finite moving-bound and improper parameter-dependent integrals.')],
  [check('parameter-integrals','both-moving-endpoints','Retain the derivative of the integrand and both moving-boundary terms.'),check('parameter-integrals','exponential-tail-derivative','Construct a common integrable derivative bound and explain why the excluded endpoint cannot be included.')]),
 path('partial-fractions-and-radicals','Partial fractions and radical substitutions',
  'Choose a rational decomposition or a trigonometric branch from the actual structure of the integrand.',
  ['Divide before decomposing an improper rational expression.','Choose numerators and powers appropriate to the denominator factors.','Retain the principal-root sign and differential when making a trigonometric substitution.'],
  [...integrationPreparation,step('rational-trig','Distinguish repeated poles, irreducible quadratic factors and branch-sensitive radicals.')],
  [check('rational-trig','divide-before-decomposing','Perform the polynomial division and verify the resulting primitive on its stated interval.'),check('rational-trig','tangent-root-transfer','Track the remaining secant factor after the differential and radical are transformed.')]),
 path('integral-geometric-applications','Averages, areas, volumes and curve geometry',
  'Build an integral from a geometric or average-value model, choosing the slices, axis distances and dimensions before calculating.',
  ['Distinguish an average from an accumulated quantity.','Choose a nonnegative strip, washer or shell without counting a region twice.','Use the arc-speed factor for graph length and lateral surface area.'],
  [...integrationPreparation,step('integral-applications','Translate the requested quantity into a justified integral and check it against geometry and units.')],
  [check('integral-applications','root-line-area-and-shells','Use the same region to form area, mean separation and shell-volume integrals.'),check('integral-applications','shifted-axis-frustum','Measure the radius from the shifted axis and distinguish the swept surface from end caps.')]),
 path('integral-symmetry-methods','Parity, reflection and reciprocal pairing',
  'Compare two representations of an integral while retaining its interval, orientation and transformed measure.',
  ['Use odd and even parts on a genuinely symmetric interval.','Pair a function with its reflected or reciprocal expression.','Detect a missing Jacobian or an invalid cancellation of divergent integrals.'],
  [...integrationPreparation,step('symmetry','Recognize transformations that preserve the integral and check the differential weight before pairing.')],
  [check('symmetry','centered-first-moment','Identify the symmetry center and account for its contribution to the first moment.'),check('symmetry','reciprocal-without-weight','Explain why a complement identity alone does not preserve an unweighted integral.')]),
 path('quadrature-error-bounds','Midpoint and trapezoidal error estimates',
  'Derive finite quadrature error bounds, combine independent enclosures and test whether the required smoothness holds.',
  ['Use the exact grid and endpoint weights of each rule.','Derive and apply a uniform second-derivative bound.','Combine error intervals and distinguish a guaranteed panel count from the actual best count.'],
  [...calculusPreparation,accumulation,ftc,parts,step('taylor-remainders','Control a finite local approximation with a justified remainder.'),step('approximation','Turn those local errors into midpoint and trapezoidal bounds and inspect curvature and corners.')],
  [check('approximation','combine-sampled-enclosures','Intersect the two guaranteed intervals and state every error direction they imply.'),check('approximation','corner-breaks-curvature-bound','Explain why a corner invalidates a smooth second-derivative error estimate.')]),
];
