// Independently inspected draft routes; final exposure and admission remain pending.
export const lowerTierPaths=[
  {
    "id": "easy-differentiation",
    "title": "Easy Differentiation: slopes, rules and tangent lines",
    "summary": "Move from a justified nearby limit to an instantaneous rate, then compute derivatives and use the value at a point in a tangent model.",
    "objectives": [
      "Interpret a derivative as a limit with its domain and units.",
      "Combine elementary, product, quotient and chain rules.",
      "Use a function value and derivative together in a local linear model."
    ],
    "revision": 1,
    "kind": "core",
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Preserve exact factorization, signs and excluded values before applying a calculus rule."
      },
      {
        "lessonId": "functions",
        "purpose": "State the allowed inputs and distinguish a formula, composition and inverse branch."
      },
      {
        "lessonId": "trig",
        "purpose": "Fix radian measure and trigonometric signs before using bounds or derivative formulas."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Learn how a nearby limit can exist independently of the value assigned at the point, then use that distinction in a difference quotient."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Derive an instantaneous rate from a difference quotient, then combine the point value and slope to form a tangent line."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Keep the real logarithm domain and positive-base exponential identities explicit."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "After the meaning is established, combine the elementary rules without enlarging the original domain."
      }
    ],
    "readiness": [
      {
        "lessonId": "derivative-meaning",
        "exerciseId": "reciprocal-rate",
        "prompt": "Derive the reciprocal derivative on its domain and form the tangent at the requested point."
      },
      {
        "lessonId": "derivative-rules",
        "exerciseId": "root-exponential-quotient",
        "prompt": "Combine the root, exponential and quotient while preserving the original domain."
      }
    ],
    "review": {
      "status": "draft"
    },
    "exposureAudit": {
      "status": "pending"
    }
  },
  {
    "id": "easy-integration",
    "title": "Easy Integration: signed area, primitives and substitution",
    "summary": "Identify whether the question asks for signed accumulation, area or a primitive, then evaluate using the fundamental theorem and a justified substitution.",
    "objectives": [
      "Keep signed integral and geometric area distinct.",
      "Use a primitive with its constant and interval restrictions.",
      "Carry the differential and endpoint direction through substitution."
    ],
    "revision": 1,
    "kind": "core",
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Preserve exact factorization, signs and excluded values before applying a calculus rule."
      },
      {
        "lessonId": "functions",
        "purpose": "State the allowed inputs and distinguish a formula, composition and inverse branch."
      },
      {
        "lessonId": "trig",
        "purpose": "Fix radian measure and trigonometric signs before using bounds or derivative formulas."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Establish a nearby limit before using a derivative or a limiting sum."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Introduce the derivative as a local rate before applying its computation rules."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Keep the real logarithm domain and positive-base exponential identities explicit."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Supply the elementary, product, quotient and chain calculations used by later steps."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate signed contribution from geometric area, and connect a primitive to its derivative."
      },
      {
        "lessonId": "ftc",
        "purpose": "Connect an accumulation function to its derivative, then evaluate a finite integral by subtracting primitive values. Return to the moving-bound examples when continuing to Medium integration."
      },
      {
        "lessonId": "substitution",
        "purpose": "Match an inner function with its derivative, transform the endpoints, and check that the resulting sign agrees with the original integrand."
      }
    ],
    "readiness": [
      {
        "lessonId": "accumulation",
        "exerciseId": "area-with-two-crossings",
        "prompt": "Split at the two zero crossings and compute the signed integral and geometric area separately."
      },
      {
        "lessonId": "substitution",
        "exerciseId": "cubic-orientation",
        "prompt": "Carry the nonlinear substitution and endpoint orientation through the definite integral."
      }
    ],
    "review": {
      "status": "draft"
    },
    "exposureAudit": {
      "status": "pending"
    }
  },
  {
    "id": "medium-differentiation",
    "title": "Medium Differentiation: implicit and parametric derivatives, rates and extrema",
    "summary": "Use derivative rules on equations, inverse maps and parametrized curves, then apply local models and interval-wide hypotheses to rates and extrema.",
    "objectives": [
      "Respect implicit and logarithmic branches.",
      "Compute inverse and parametric first and second derivatives and inspect exceptional speeds.",
      "Differentiate a time-dependent relationship before substituting its snapshot.",
      "Use mean-value and sign arguments with endpoints and nondifferentiable candidates included."
    ],
    "revision": 1,
    "kind": "core",
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Preserve exact factorization, signs and excluded values before applying a calculus rule."
      },
      {
        "lessonId": "functions",
        "purpose": "State the allowed inputs and distinguish a formula, composition and inverse branch."
      },
      {
        "lessonId": "trig",
        "purpose": "Fix radian measure and trigonometric signs before using bounds or derivative formulas."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Establish a nearby limit before using a derivative or a limiting sum."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Introduce the derivative as a local rate before applying its computation rules."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Keep the real logarithm domain and positive-base exponential identities explicit."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Supply the elementary, product, quotient and chain calculations used by later steps."
      },
      {
        "lessonId": "implicit-logarithmic",
        "purpose": "Extend explicit rules to a relation and a variable power, checking both graph and logarithm restrictions."
      },
      {
        "lessonId": "inverse-parametric",
        "purpose": "Recover the original point or parameter first; inspect first and second graph derivatives and zero-speed exceptions."
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Review displacements, dot products and perpendicular directions before expressing tangent and normal lines. The quadratic-form material supports later multivariable study."
      },
      {
        "lessonId": "derivative-geometry",
        "purpose": "Turn the local derivative into a tangent/normal, a controlled linear estimate or a related-rate relationship."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Use interval-wide hypotheses to justify monotonicity and concavity, then compare stationary points, corners and included endpoints before claiming an absolute extremum."
      }
    ],
    "readiness": [
      {
        "lessonId": "implicit-logarithmic",
        "exerciseId": "implicit-log-domain",
        "prompt": "Check the equation and logarithm restrictions before computing the implicit derivative."
      },
      {
        "lessonId": "implicit-logarithmic",
        "exerciseId": "positive-base-power",
        "prompt": "Differentiate the variable power only on its specified positive-base interval."
      },
      {
        "lessonId": "inverse-parametric",
        "exerciseId": "logarithmic-inverse",
        "prompt": "Justify the inverse range, recover the original point and compute both inverse derivatives."
      },
      {
        "lessonId": "inverse-parametric",
        "exerciseId": "parametric-exceptions",
        "prompt": "Find the second graph derivative and distinguish regular vertical tangents from arbitrary zero horizontal speed."
      },
      {
        "lessonId": "derivative-geometry",
        "exerciseId": "rectangle-two-rates",
        "prompt": "Compute area and perimeter rates with their units and explain why their signs can differ."
      },
      {
        "lessonId": "derivative-geometry",
        "exerciseId": "horizontal-normal-remainder",
        "prompt": "Construct the tangent and normal at the stationary point, then bound the exact difference between the function and its tangent estimate."
      },
      {
        "lessonId": "derivative-shape",
        "exerciseId": "unique-root-residual",
        "prompt": "Use existence, strict monotonicity and the mean value theorem to certify the root error."
      },
      {
        "lessonId": "derivative-shape",
        "exerciseId": "corner-and-endpoints",
        "prompt": "Include the corner and permitted boundary, and separate attained extrema from unattained bounds."
      }
    ],
    "review": {
      "status": "draft"
    },
    "exposureAudit": {
      "status": "pending"
    }
  },
  {
    "id": "medium-integration",
    "title": "Medium Integration: parts, partial fractions and geometric applications",
    "summary": "Choose a useful primitive method, retain improper limits and moving-endpoint signs, then build integral models for averages and geometry.",
    "objectives": [
      "Use parts, partial fractions or a branch-correct trigonometric substitution.",
      "Separate boundary motion from accumulated value and test each improper endpoint.",
      "Build area, volume, arc-length and surface-area integrands from the requested geometric object."
    ],
    "revision": 1,
    "kind": "core",
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Preserve exact factorization, signs and excluded values before applying a calculus rule."
      },
      {
        "lessonId": "functions",
        "purpose": "State the allowed inputs and distinguish a formula, composition and inverse branch."
      },
      {
        "lessonId": "trig",
        "purpose": "Fix radian measure and trigonometric signs before using bounds or derivative formulas."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Establish a nearby limit before using a derivative or a limiting sum."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Introduce the derivative as a local rate before applying its computation rules."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Keep the real logarithm domain and positive-base exponential identities explicit."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Supply the elementary, product, quotient and chain calculations used by later steps."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Interpret finite signed accumulation before using a primitive or an integral estimate."
      },
      {
        "lessonId": "ftc",
        "purpose": "Account for the upper and lower endpoint speeds separately when differentiating an integral with two moving bounds."
      },
      {
        "lessonId": "substitution",
        "purpose": "First look for an inner function and its differential; keep bounds, orientation and the real branch explicit before trying another primitive method."
      },
      {
        "lessonId": "parts",
        "purpose": "When a direct substitution does not simplify the product, choose a factor to differentiate and retain the boundary term through repeated steps."
      },
      {
        "lessonId": "rational-trig",
        "purpose": "Check degree and factor type before decomposing; for radicals choose an inverse-trigonometric branch and carry its sign."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Make convergence a limit of finite indexed sums, including every surviving endpoint term."
      },
      {
        "lessonId": "improper",
        "purpose": "Apply the selected primitive method on truncated intervals before taking each required endpoint limit."
      },
      {
        "lessonId": "integral-applications",
        "purpose": "Select a strip, cross-section, shell, arc speed or rotating radius from the actual geometric object before integrating."
      }
    ],
    "readiness": [
      {
        "lessonId": "parts",
        "exerciseId": "twice-trigonometric",
        "prompt": "Use parts twice without dropping the intermediate endpoint term."
      },
      {
        "lessonId": "rational-trig",
        "exerciseId": "divide-before-decomposing",
        "prompt": "Find all real primitives of the rational integrand, using polynomial division before decomposing the proper fraction."
      },
      {
        "lessonId": "rational-trig",
        "exerciseId": "tangent-root-transfer",
        "prompt": "Use the specified tangent branch and verify the transformed power and endpoint value."
      },
      {
        "lessonId": "ftc",
        "exerciseId": "crossing-endpoints",
        "prompt": "Differentiate both moving limits and explain zero value with nonzero rate."
      },
      {
        "lessonId": "improper",
        "exerciseId": "logarithmic-endpoint",
        "prompt": "Prove the singular boundary term has its required limit before evaluating the integral."
      },
      {
        "lessonId": "integral-applications",
        "exerciseId": "root-line-area-and-shells",
        "prompt": "Distinguish area, average separation and a rotation volume for the same bounded region."
      },
      {
        "lessonId": "integral-applications",
        "exerciseId": "shifted-axis-frustum",
        "prompt": "Compute curve length and lateral surface area with the shifted radius."
      }
    ],
    "review": {
      "status": "draft"
    },
    "exposureAudit": {
      "status": "pending"
    }
  },
  {
    "id": "medium-limits",
    "title": "Medium Limits: standard limits, L’Hôpital, Taylor and recurrences",
    "summary": "Normalize small or large arguments, compare valid limit methods, and prove convergence before solving a recurrence’s fixed-point equation.",
    "objectives": [
      "Apply local standard limits with their actual scaling.",
      "Check indeterminate form and hypotheses before L’Hôpital.",
      "Use a Taylor approximation with an explicit remainder.",
      "Prove an invariant bound or contracting error before taking a recurrence limit."
    ],
    "revision": 1,
    "kind": "core",
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Preserve exact factorization, signs and excluded values before applying a calculus rule."
      },
      {
        "lessonId": "functions",
        "purpose": "State the allowed inputs and distinguish a formula, composition and inverse branch."
      },
      {
        "lessonId": "one-sided-limits",
        "purpose": "Separate left and right approaches from the assigned point value, so endpoint hypotheses and two-sided conclusions remain explicit in the later limit methods."
      },
      {
        "lessonId": "trig",
        "purpose": "Fix radian measure and trigonometric signs before using bounds or derivative formulas."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Establish a nearby limit before using a derivative or a limiting sum."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Introduce the derivative as a local rate before applying its computation rules."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Keep the real logarithm domain and positive-base exponential identities explicit."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Supply the elementary, product, quotient and chain calculations used by later steps."
      },
      {
        "lessonId": "standard-limits",
        "purpose": "Use established derivative formulas to obtain local standard limits, then substitute the actual scaled argument. The derivative formulas are justified earlier in the route."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Interpret finite signed accumulation before using a primitive or an integral estimate."
      },
      {
        "lessonId": "ftc",
        "purpose": "Justify accumulation derivatives and finite endpoint evaluation before later operations."
      },
      {
        "lessonId": "growth",
        "purpose": "Compare fixed powers, exponentials and logarithms on a valid tail, with the sign retained."
      },
      {
        "lessonId": "lhopital",
        "purpose": "Check the approach interval, denominator and indeterminate form before applying the rule; compare the derivative ratio only when its hypotheses hold."
      },
      {
        "lessonId": "parts",
        "purpose": "Establish product-rule reversal with finite boundary terms before estimates or improper limits."
      },
      {
        "lessonId": "taylor-remainders",
        "purpose": "When a finite local expansion is useful, control its remainder rather than asserting an infinite identity."
      },
      {
        "lessonId": "recurrences",
        "purpose": "For an indexed process, prove an invariant interval, monotonicity or an error contraction before passing to a fixed-point equation; use subsequences to test a claimed limit."
      }
    ],
    "readiness": [
      {
        "lessonId": "standard-limits",
        "exerciseId": "half-angle-transfer",
        "prompt": "Use the exact quadratic trigonometric identity before taking the scaled ratio."
      },
      {
        "lessonId": "growth",
        "exerciseId": "nested-log-and-sign",
        "prompt": "State a common valid tail and distinguish a slow ratio from a negative divergent product."
      },
      {
        "lessonId": "lhopital",
        "exerciseId": "product-to-quotient",
        "prompt": "Rewrite the product into a genuine indeterminate quotient and verify the rule’s assumptions."
      },
      {
        "lessonId": "taylor-remainders",
        "exerciseId": "shifted-sine",
        "prompt": "Use the nonzero center and a valid third-derivative bound to certify the local approximation."
      },
      {
        "lessonId": "recurrences",
        "exerciseId": "equilibrium-or-escape",
        "prompt": "Track the initial value into an equilibrium or an escaping regime before claiming a limit."
      },
      {
        "lessonId": "recurrences",
        "exerciseId": "period-two-transfer",
        "prompt": "Use two exact subsequences to reject a false convergence conclusion."
      }
    ],
    "review": {
      "status": "draft"
    },
    "exposureAudit": {
      "status": "pending"
    }
  },
  {
    "id": "medium-series",
    "title": "Medium Series: convergence tests, remainder bounds and power series",
    "summary": "Select a convergence test, certify the omitted tail, and distinguish an interior power-series identity from its endpoint behavior.",
    "objectives": [
      "Use the term test, comparison, ratio, root, integral or alternating test with its hypotheses.",
      "Separate absolute from conditional convergence and bound the full remainder.",
      "Find a power-series radius and endpoints before differentiating or integrating the series."
    ],
    "revision": 1,
    "kind": "core",
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Preserve exact factorization, signs and excluded values before applying a calculus rule."
      },
      {
        "lessonId": "functions",
        "purpose": "State the allowed inputs and distinguish a formula, composition and inverse branch."
      },
      {
        "lessonId": "trig",
        "purpose": "Fix radian measure and trigonometric signs before using bounds or derivative formulas."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Establish a nearby limit before using a derivative or a limiting sum."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Make convergence a limit of finite indexed sums, including every surviving endpoint term."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Introduce the derivative as a local rate before applying its computation rules."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Keep the real logarithm domain and positive-base exponential identities explicit."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Supply the elementary, product, quotient and chain calculations used by later steps."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Interpret finite signed accumulation before using a primitive or an integral estimate."
      },
      {
        "lessonId": "ftc",
        "purpose": "Justify accumulation derivatives and finite endpoint evaluation before later operations."
      },
      {
        "lessonId": "convergence-tests",
        "purpose": "Choose a test from sign and scale, and test absolute convergence separately when cancellation is used."
      },
      {
        "lessonId": "series-errors",
        "purpose": "Name the first omitted index and bound the whole tail with an appropriate geometric, integral or alternating argument."
      },
      {
        "lessonId": "analysis",
        "purpose": "Learn what uniform tail control adds to pointwise convergence before integrating or differentiating a series of functions."
      },
      {
        "lessonId": "parts",
        "purpose": "Establish product-rule reversal with finite boundary terms before estimates or improper limits."
      },
      {
        "lessonId": "taylor-remainders",
        "purpose": "Supply finite polynomial remainders before identifying a function with its Taylor series."
      },
      {
        "lessonId": "power-series",
        "purpose": "Find the radius and test each endpoint; justify termwise calculus inside the radius and prove that a Taylor remainder vanishes before identifying an infinite expansion with its function."
      }
    ],
    "readiness": [
      {
        "lessonId": "convergence-tests",
        "exerciseId": "factorial-in-two-positions",
        "prompt": "Compute both factorial ratios and explain why moving the factorial reverses the convergence decision."
      },
      {
        "lessonId": "convergence-tests",
        "exerciseId": "alternating-two-exponents",
        "prompt": "Classify both ordinary and absolute convergence at the two supplied exponents."
      },
      {
        "lessonId": "series-errors",
        "exerciseId": "factorial-geometric-tail",
        "prompt": "Construct an explicit geometric bound for the entire omitted factorial tail."
      },
      {
        "lessonId": "power-series",
        "exerciseId": "weighted-geometric-center",
        "prompt": "Find the full interval and sum, preserving the variable factor after differentiation."
      }
    ],
    "review": {
      "status": "draft"
    },
    "exposureAudit": {
      "status": "pending"
    }
  }
,
{
  "id": "easy-series",
  "title": "Easy Series: partial sums, geometric tails and p-series",
  "summary": "Build finite partial sums and geometric identities, then prove the p-series threshold and choose correctly directed positive comparisons.",
  "objectives": [
    "Keep the starting index and the first omitted term explicit.",
    "Derive a sum from finite partial sums rather than a pattern.",
    "Explain why vanishing terms do not prove convergence and state the p-series threshold."
  ],
  "revision": 1,
  "kind": "core",
  "steps": [
    {
      "lessonId": "algebra",
      "purpose": "Preserve exact factorization, signs and excluded values before applying a calculus rule."
    },
    {
      "lessonId": "functions",
      "purpose": "State the allowed inputs and distinguish a formula, composition and inverse branch."
    },
    {
      "lessonId": "trig",
      "purpose": "Fix radian measure and trigonometric signs before using bounds or derivative formulas."
    },
    {
      "lessonId": "limit-foundations",
      "purpose": "Establish a nearby limit before using a derivative or a limiting sum."
    },
    {
      "lessonId": "partial-sums",
      "purpose": "Build exact geometric and telescoping identities before taking limits, then test the tempting small-term heuristic."
    },
    {
      "lessonId": "exp-log",
      "purpose": "Keep the real logarithm domain and positive-base exponential identities explicit."
    },
    {
      "lessonId": "series-benchmarks",
      "purpose": "Prove the term-test limitation and p-series threshold using finite geometric blocks, then classify shifted powers and positive comparisons without integral calculus."
    }
  ],
  "readiness": [
    {
      "lessonId": "partial-sums",
      "exerciseId": "alternating-geometric-tail",
      "prompt": "Find the geometric sum and exact error with the stated retained indices."
    },
    {
      "lessonId": "partial-sums",
      "exerciseId": "harmonic-blocks",
      "prompt": "Show that terms tending to zero can still produce unbounded partial sums."
    },
    {
      "lessonId": "series-benchmarks",
      "exerciseId": "shifted-power-threshold",
      "prompt": "Classify every real exponent, including the threshold, and justify why a fixed finite prefix does not change convergence."
    },
    {
      "lessonId": "series-benchmarks",
      "exerciseId": "rational-term-comparisons",
      "prompt": "Find the useful inequality direction for each rational sequence and distinguish a convergent upper bound from a divergent lower bound."
    }
  ],
  "review": {
    "status": "draft"
  },
  "exposureAudit": {
    "status": "pending"
  }
},
{
  "id": "medium-multivariable",
  "title": "Medium Multivariable: chain rules, extrema and spatial integration",
  "summary": "Combine local differential rules with global feasible-set checks, then build double and triple integrals using justified coordinate maps.",
  "objectives": [
    "Use the total differential and chain rule with the actual path velocity.",
    "Find interior and boundary candidates and check whether extrema are attained.",
    "Translate a region before changing integration order or coordinates.",
    "Use polar, cylindrical and spherical Jacobians with explicit angle ranges and coverage."
  ],
  "revision": 1,
  "kind": "core",
  "steps": [
    {
      "lessonId": "algebra",
      "purpose": "Preserve exact factorization, signs and excluded values before applying a calculus rule."
    },
    {
      "lessonId": "functions",
      "purpose": "State the allowed inputs and distinguish a formula, composition and inverse branch."
    },
    {
      "lessonId": "trig",
      "purpose": "Fix radian measure and trigonometric signs before using bounds or derivative formulas."
    },
    {
      "lessonId": "limit-foundations",
      "purpose": "Establish a nearby limit before using a derivative or a limiting sum."
    },
    {
      "lessonId": "derivative-meaning",
      "purpose": "Introduce the derivative as a local rate before applying its computation rules."
    },
    {
      "lessonId": "exp-log",
      "purpose": "Keep the real logarithm domain and positive-base exponential identities explicit."
    },
    {
      "lessonId": "derivative-rules",
      "purpose": "Supply the elementary, product, quotient and chain calculations used by later steps."
    },
    {
      "lessonId": "linear-algebra",
      "purpose": "Interpret displacements, unit vectors, dot products and real symmetric quadratic forms."
    },
    {
      "lessonId": "multi-local",
      "purpose": "Supply partial derivatives and tangent-plane meaning before equations in two variables."
    },
    {
      "lessonId": "multi-chain",
      "purpose": "Combine partial derivatives along curves and coordinate maps, keeping the path and any implicit branch conditions explicit."
    },
    {
      "lessonId": "multi-critical",
      "purpose": "Use Hessian and regular-constraint equations as candidate tools, then check every relevant boundary and equality point."
    },
    {
      "lessonId": "accumulation",
      "purpose": "Interpret finite signed accumulation before using a primitive or an integral estimate."
    },
    {
      "lessonId": "ftc",
      "purpose": "Justify accumulation derivatives and finite endpoint evaluation before later operations."
    },
    {
      "lessonId": "substitution",
      "purpose": "Track the transformed differential, bounds and branches required by the next integral methods."
    },
    {
      "lessonId": "parts",
      "purpose": "Establish product-rule reversal with finite boundary terms before estimates or improper limits."
    },
    {
      "lessonId": "partial-sums",
      "purpose": "Make convergence a limit of finite indexed sums, including every surviving endpoint term."
    },
    {
      "lessonId": "improper",
      "purpose": "Supply the endpoint and tail conditions required by the complete multiple-integral lesson."
    },
    {
      "lessonId": "multiple-integrals",
      "purpose": "Describe one region using two sets of slice bounds and justify both iterated integrals. The later improper section explains why conditional cancellation alone cannot justify an exchange."
    },
    {
      "lessonId": "coordinates",
      "purpose": "Transform the planar region, integrand and absolute area factor together, checking branches and coverage."
    },
    {
      "lessonId": "coordinates-spatial",
      "purpose": "Build Cartesian triple integrals, then derive the cylindrical and spherical volume factors from explicitly defined coordinates. Translate the solid into complete radial, angular and height bounds without repeated coverage."
    }
  ],
  "readiness": [
    {
      "lessonId": "multi-chain",
      "exerciseId": "accelerating-curve",
      "prompt": "Separate the field Hessian contribution from the acceleration of the actual path."
    },
    {
      "lessonId": "multi-critical",
      "exerciseId": "ellipse-boundary-comparison",
      "prompt": "Compare the interior point with all regular boundary candidates and justify the global conclusion."
    },
    {
      "lessonId": "multiple-integrals",
      "exerciseId": "parabolic-lens",
      "prompt": "Recover both slice orders and evaluate the integral and average over the actual region."
    },
    {
      "lessonId": "coordinates",
      "exerciseId": "elliptic-disk-moment",
      "prompt": "Scale the ellipse, retain the polar factor and explain the origin and angular seam."
    },
    {
      "lessonId": "coordinates-spatial",
      "exerciseId": "cartesian-tetrahedral-slices",
      "prompt": "Build and evaluate two correct triple-integral orders for the same solid."
    },
    {
      "lessonId": "coordinates-spatial",
      "exerciseId": "bounded-half-hemisphere-two-coordinates",
      "prompt": "Describe the bounded solid in cylindrical and spherical coordinates, include each Jacobian and coverage check, and verify the same volume and average height."
    }
  ],
  "review": {
    "status": "draft"
  },
  "exposureAudit": {
    "status": "pending"
  }
}
];
