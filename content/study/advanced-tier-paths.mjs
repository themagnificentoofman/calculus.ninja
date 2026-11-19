export const advancedTierPaths = [
  {
    "id": "hard-differentiation",
    "title": "Hard Differentiation: higher derivatives, remainders and justified interchange",
    "summary": "Build higher derivatives from identities, check exceptional local branches, and justify the estimates and interchanges used in a longer calculation.",
    "objectives": [
      "Use Leibniz formulas and differential recurrences with their low-order cases.",
      "Distinguish an exceptional branch or parameterization from an invalid derivative quotient.",
      "Compare exact and theorem-based remainder bounds, and justify a parameter derivative."
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
      },
      {
        "lessonId": "implicit-logarithmic",
        "purpose": "Use local implicit conditions and positive-base logarithms before differentiating a relation or variable power."
      },
      {
        "lessonId": "inverse-parametric",
        "purpose": "Separate inverse branches and parameter speeds so a zero denominator triggers the correct local analysis."
      },
      {
        "lessonId": "higher-derivatives",
        "purpose": "Build finite Leibniz formulas and recurrences from the elementary rules, keeping low orders and operator order explicit."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate signed contribution from geometric area, and connect a primitive to its derivative."
      },
      {
        "lessonId": "ftc",
        "purpose": "Connect an accumulation function to its derivative, evaluate finite integrals by subtracting primitive values, and track both endpoint contributions when the bounds move."
      },
      {
        "lessonId": "parts",
        "purpose": "Derive reductions from the product rule and keep the finite boundary terms until their later limits are proved."
      },
      {
        "lessonId": "taylor-remainders",
        "purpose": "Turn local coefficients into justified estimates by controlling the remainder on the whole relevant interval."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Make convergence a limit of finite indexed sums, including every surviving endpoint term."
      },
      {
        "lessonId": "convergence-tests",
        "purpose": "Establish ordinary and absolute convergence using a test whose hypotheses fit the actual terms."
      },
      {
        "lessonId": "series-errors",
        "purpose": "Name the retained indices and control the entire omitted tail before using a sum as an approximation."
      },
      {
        "lessonId": "analysis",
        "purpose": "Distinguish pointwise choices from one error bound valid on the whole domain before exchanging operations."
      },
      {
        "lessonId": "power-series",
        "purpose": "Extend finite coefficient reasoning to infinite series only on a convergence domain that permits the operation."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Use mean-value hypotheses, sign charts and endpoint checks to turn derivatives into bounds and global conclusions."
      },
      {
        "lessonId": "substitution",
        "purpose": "Match an inner function with its derivative, transform the endpoints, and check that the resulting sign agrees with the original integrand."
      },
      {
        "lessonId": "improper",
        "purpose": "Apply the selected primitive method on truncated intervals before taking each required endpoint limit."
      },
      {
        "lessonId": "ode-meaning",
        "purpose": "First verify a full residual and initial value, then read equilibrium and direction from the autonomous field."
      },
      {
        "lessonId": "linear-ode",
        "purpose": "Match a product derivative and verify the initial value and coefficient interval after integrating."
      },
      {
        "lessonId": "parameter-integrals",
        "purpose": "Use uniform local control and finite boundary identities before deriving an equation in the parameter."
      }
    ],
    "readiness": [
      {
        "lessonId": "higher-derivatives",
        "exerciseId": "vanishing-polynomial-factor",
        "prompt": "Find which product terms survive at the specified point before computing the high derivative."
      },
      {
        "lessonId": "inverse-parametric",
        "exerciseId": "parametric-exceptions",
        "prompt": "Distinguish ordinary graph derivatives from regular vertical tangents."
      },
      {
        "lessonId": "taylor-remainders",
        "exerciseId": "exact-geometric-remainder",
        "prompt": "Compare an exact uniform remainder with a derivative-based bound and check attainment."
      },
      {
        "lessonId": "power-series",
        "exerciseId": "weighted-geometric-center",
        "prompt": "Obtain the weighted sum from a geometric identity and check both convergence endpoints."
      },
      {
        "lessonId": "parameter-integrals",
        "exerciseId": "exponential-tail-derivative",
        "prompt": "Build a local integrable majorant and explain why the endpoint parameter is excluded."
      }
    ]
  },
  {
    "id": "hard-integration",
    "title": "Hard Integration: symmetry, parameter methods and convergence",
    "summary": "Use transformations and parameter derivatives to simplify an integral, then retain the endpoint, convergence and error arguments that make the result valid.",
    "objectives": [
      "Check a nonlinear pairing through its differential and weight.",
      "Carry boundary terms through reductions and parameter differentiation.",
      "Evaluate Beta and Gamma integrals on their convergence domains and certify finite quadrature errors."
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
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate signed contribution from geometric area, and connect a primitive to its derivative."
      },
      {
        "lessonId": "ftc",
        "purpose": "Connect an accumulation function to its derivative, evaluate finite integrals by subtracting primitive values, and track both endpoint contributions when the bounds move."
      },
      {
        "lessonId": "substitution",
        "purpose": "Match an inner function with its derivative, transform the endpoints, and check that the resulting sign agrees with the original integrand."
      },
      {
        "lessonId": "rational-trig",
        "purpose": "Resolve rational factors and real inverse branches before using transformations inside a longer integral."
      },
      {
        "lessonId": "symmetry",
        "purpose": "Check how reflection or reciprocal substitution changes the interval, weight and differential before pairing values."
      },
      {
        "lessonId": "parts",
        "purpose": "Derive reductions from the product rule and keep the finite boundary terms until their later limits are proved."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Use mean-value hypotheses, sign charts and endpoint checks to turn derivatives into bounds and global conclusions."
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
        "lessonId": "ode-meaning",
        "purpose": "First verify a full residual and initial value, then read equilibrium and direction from the autonomous field."
      },
      {
        "lessonId": "linear-ode",
        "purpose": "Match a product derivative and verify the initial value and coefficient interval after integrating."
      },
      {
        "lessonId": "analysis",
        "purpose": "Distinguish pointwise choices from one error bound valid on the whole domain before exchanging operations."
      },
      {
        "lessonId": "parameter-integrals",
        "purpose": "Use uniform local control and finite boundary identities before deriving an equation in the parameter."
      },
      {
        "lessonId": "taylor-remainders",
        "purpose": "Turn local coefficients into justified estimates by controlling the remainder on the whole relevant interval."
      },
      {
        "lessonId": "approximation",
        "purpose": "Use the Taylor and integration tools to obtain an error enclosure with the required smoothness and curvature conditions."
      },
      {
        "lessonId": "multiple-integrals",
        "purpose": "Describe one region using two sets of slice bounds and justify both iterated integrals. The later improper section explains why conditional cancellation alone cannot justify an exchange."
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Review displacements, dot products and perpendicular directions before expressing tangent and normal lines. The quadratic-form material supports later multivariable study."
      },
      {
        "lessonId": "multi-local",
        "purpose": "Supply partial derivatives and tangent-plane meaning before equations in two variables."
      },
      {
        "lessonId": "multi-chain",
        "purpose": "Track every dependence in first and second derivatives, and state the continuity needed for mixed partials."
      },
      {
        "lessonId": "coordinates",
        "purpose": "Derive the determinant and inverse branch together, then check the image region and repeated coverage."
      },
      {
        "lessonId": "beta-gamma",
        "purpose": "Prove the defining integral domains and change-of-variable identity before using the special-function values."
      }
    ],
    "readiness": [
      {
        "lessonId": "symmetry",
        "exerciseId": "reciprocal-without-weight",
        "prompt": "Test the proposed reciprocal pairing against the transformed differential."
      },
      {
        "lessonId": "parts",
        "exerciseId": "twice-trigonometric",
        "prompt": "Reduce the polynomial degree while retaining every finite boundary term."
      },
      {
        "lessonId": "parameter-integrals",
        "exerciseId": "both-moving-endpoints",
        "prompt": "Account for the moving endpoints and changing integrand, then compare with direct evaluation."
      },
      {
        "lessonId": "beta-gamma",
        "exerciseId": "rational-tail-parameter-range",
        "prompt": "Prove the full parameter range before using a special-function value."
      },
      {
        "lessonId": "approximation",
        "exerciseId": "combine-sampled-enclosures",
        "prompt": "Combine the justified enclosures from two quadrature rules without assuming a curvature sign."
      }
    ]
  },
  {
    "id": "hard-limits",
    "title": "Hard Limits: Stolz–Cesàro, remainders and nonuniformity",
    "summary": "Use sequence differences and exact remainder bounds, distinguish pointwise statements from uniform control, and test whether two limiting operations may be exchanged.",
    "objectives": [
      "Use local remainder estimates and justified comparison of growth scales.",
      "Track the domain when proving or disproving uniform convergence.",
      "Keep independent cutoffs and improper tails under control before interchanging operations.",
      "Use consecutive differences to establish sequence quotient limits only after checking the denominator conditions."
    ],
    "revision": 20261118,
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
      },
      {
        "lessonId": "standard-limits",
        "purpose": "Normalize the actual arguments and use exact identities to identify the first surviving local scale."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate signed contribution from geometric area, and connect a primitive to its derivative."
      },
      {
        "lessonId": "ftc",
        "purpose": "Connect an accumulation function to its derivative, evaluate finite integrals by subtracting primitive values, and track both endpoint contributions when the bounds move."
      },
      {
        "lessonId": "growth",
        "purpose": "Control dominant algebraic, exponential and logarithmic scales with explicit tail bounds."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Use the mean-value theorem to turn a derivative bound on a closed piece into the local difference estimate needed in the convergence proof."
      },
      {
        "lessonId": "lhopital",
        "purpose": "Derive the quotient rule for limits from mean-value reasoning, then check the form and hypotheses at each application."
      },
      {
        "lessonId": "recurrences",
        "purpose": "Prove an invariant domain and actual limiting behavior before substituting a fixed-point candidate."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Make convergence a limit of finite indexed sums, including every surviving endpoint term."
      },
      {
        "lessonId": "stolz-cesaro",
        "purpose": "After finite-sum and recurrence limits, prove the positive-increment comparison and use it to determine a normalized sequence rate."
      },
      {
        "lessonId": "parts",
        "purpose": "Derive reductions from the product rule and keep the finite boundary terms until their later limits are proved."
      },
      {
        "lessonId": "taylor-remainders",
        "purpose": "Turn local coefficients into justified estimates by controlling the remainder on the whole relevant interval."
      },
      {
        "lessonId": "analysis",
        "purpose": "Distinguish pointwise choices from one error bound valid on the whole domain before exchanging operations."
      },
      {
        "lessonId": "convergence-tests",
        "purpose": "Establish ordinary and absolute convergence using a test whose hypotheses fit the actual terms."
      },
      {
        "lessonId": "series-errors",
        "purpose": "Name the retained indices and control the entire omitted tail before using a sum as an approximation."
      },
      {
        "lessonId": "rearrangements",
        "purpose": "Use finite cutoffs to decide when order is harmless and when conditional sums depend on it."
      },
      {
        "lessonId": "substitution",
        "purpose": "Match an inner function with its derivative, transform the endpoints, and check that the resulting sign agrees with the original integrand."
      },
      {
        "lessonId": "improper",
        "purpose": "Apply the selected primitive method on truncated intervals before taking each required endpoint limit."
      },
      {
        "lessonId": "nonuniform",
        "purpose": "Rescale a shrinking layer and split weighted integrals to distinguish pointwise behavior from concentration of area."
      },
      {
        "lessonId": "ode-meaning",
        "purpose": "First verify a full residual and initial value, then read equilibrium and direction from the autonomous field."
      },
      {
        "lessonId": "linear-ode",
        "purpose": "Match a product derivative and verify the initial value and coefficient interval after integrating."
      },
      {
        "lessonId": "parameter-integrals",
        "purpose": "Use uniform local control and finite boundary identities before deriving an equation in the parameter."
      }
    ],
    "readiness": [
      {
        "lessonId": "taylor-remainders",
        "exerciseId": "exact-geometric-remainder",
        "prompt": "Give an exact remainder and a uniform bound on the whole stated interval."
      },
      {
        "lessonId": "analysis",
        "exerciseId": "unbounded-domain",
        "prompt": "Prove uniform convergence on each fixed bounded interval and refute it on the half-line."
      },
      {
        "lessonId": "rearrangements",
        "exerciseId": "sparse-double-order",
        "prompt": "Compute the iterated and square-cutoff limits and identify the failed global hypothesis."
      },
      {
        "lessonId": "parameter-integrals",
        "exerciseId": "exponential-tail-derivative",
        "prompt": "Justify a local parameter limit under an improper integral and test the boundary parameter."
      },
      {
        "lessonId": "stolz-cesaro",
        "exerciseId": "weighted-oscillation",
        "prompt": "Determine the cumulative quotient before opening hints, and justify the role of its oscillating contribution."
      },
      {
        "lessonId": "stolz-cesaro",
        "exerciseId": "decaying-recurrence",
        "prompt": "Determine the normalized recurrence limit before opening hints, with a proof of the sequence behavior used."
      },
      {
        "lessonId": "taylor-remainders",
        "exerciseId": "oscillating-inner-cancellation",
        "prompt": "Decide whether the canceled quotient converges, and prove a quantitative remainder estimate that supports the conclusion before opening hints."
      },
      {
        "lessonId": "nonuniform",
        "exerciseId": "rational-layer-mass",
        "prompt": "Rescale a moving strip, account for its limiting area and justify the result for any continuous weight."
      }
    ]
  },
  {
    "id": "hard-series",
    "title": "Hard Series: generating functions, cancellation and justified operations",
    "summary": "Move between coefficients and functions while preserving initial terms, convergence domains, cancellation estimates and the prescribed order of summation.",
    "objectives": [
      "Derive generating functions with their correct normalization and initial terms.",
      "Use summation by parts to turn bounded cancellation into convergence and a tail bound.",
      "Distinguish uniform control, absolute rearrangement and conditional ordering."
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
        "lessonId": "partial-sums",
        "purpose": "Make convergence a limit of finite indexed sums, including every surviving endpoint term."
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
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate signed contribution from geometric area, and connect a primitive to its derivative."
      },
      {
        "lessonId": "ftc",
        "purpose": "Connect an accumulation function to its derivative, evaluate finite integrals by subtracting primitive values, and track both endpoint contributions when the bounds move."
      },
      {
        "lessonId": "convergence-tests",
        "purpose": "Establish ordinary and absolute convergence using a test whose hypotheses fit the actual terms."
      },
      {
        "lessonId": "series-errors",
        "purpose": "Name the retained indices and control the entire omitted tail before using a sum as an approximation."
      },
      {
        "lessonId": "analysis",
        "purpose": "Distinguish pointwise choices from one error bound valid on the whole domain before exchanging operations."
      },
      {
        "lessonId": "parts",
        "purpose": "Derive reductions from the product rule and keep the finite boundary terms until their later limits are proved."
      },
      {
        "lessonId": "taylor-remainders",
        "purpose": "Turn local coefficients into justified estimates by controlling the remainder on the whole relevant interval."
      },
      {
        "lessonId": "power-series",
        "purpose": "Extend finite coefficient reasoning to infinite series only on a convergence domain that permits the operation."
      },
      {
        "lessonId": "summation-parts",
        "purpose": "Transfer a discrete difference onto the weight and retain the endpoint term to control cancellation."
      },
      {
        "lessonId": "generating",
        "purpose": "Keep initial terms and coefficient normalization when converting a recurrence or weighted selection into a function."
      },
      {
        "lessonId": "rearrangements",
        "purpose": "Use finite cutoffs to decide when order is harmless and when conditional sums depend on it."
      }
    ],
    "readiness": [
      {
        "lessonId": "generating",
        "exerciseId": "factorial-growth-two-encodings",
        "prompt": "Choose the appropriate normalization and establish the convergence domains of both encodings."
      },
      {
        "lessonId": "summation-parts",
        "exerciseId": "quarter-turn-log-weight",
        "prompt": "Prove conditional convergence and a tail bound from the periodic coefficient sums."
      },
      {
        "lessonId": "analysis",
        "exerciseId": "unbounded-domain",
        "prompt": "Explain exactly which domain admits one common error bound."
      },
      {
        "lessonId": "power-series",
        "exerciseId": "weighted-geometric-center",
        "prompt": "Keep the factor introduced by differentiation and recheck the endpoints."
      },
      {
        "lessonId": "rearrangements",
        "exerciseId": "greedy-target-one",
        "prompt": "Prove both that every term is used and that all intermediate partial sums approach the target."
      }
    ]
  },
  {
    "id": "hard-ode",
    "title": "Hard Differential Equations: reductions, systems, series and lifetime",
    "summary": "Choose a method from the equation and its domain, verify the complete solution and data, and distinguish a method restriction from a genuine endpoint of the solution.",
    "objectives": [
      "Use substitutions, logarithmic time and variation of parameters on valid intervals.",
      "Analyze planar linear modes and distinguish stability from attraction.",
      "Justify series and Laplace solutions, and use continuation or energy to investigate lifetime."
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
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Review displacements, dot products and perpendicular directions before expressing tangent and normal lines. The quadratic-form material supports later multivariable study."
      },
      {
        "lessonId": "multi-local",
        "purpose": "Supply partial derivatives and tangent-plane meaning before equations in two variables."
      },
      {
        "lessonId": "implicit-logarithmic",
        "purpose": "Use local implicit conditions and positive-base logarithms before differentiating a relation or variable power."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate signed contribution from geometric area, and connect a primitive to its derivative."
      },
      {
        "lessonId": "ftc",
        "purpose": "Connect an accumulation function to its derivative, evaluate finite integrals by subtracting primitive values, and track both endpoint contributions when the bounds move."
      },
      {
        "lessonId": "ode-meaning",
        "purpose": "First verify a full residual and initial value, then read equilibrium and direction from the autonomous field."
      },
      {
        "lessonId": "linear-ode",
        "purpose": "Match a product derivative and verify the initial value and coefficient interval after integrating."
      },
      {
        "lessonId": "existence-uniqueness",
        "purpose": "Supply the local uniqueness and interval conditions needed before claiming that separated branches cannot cross an equilibrium."
      },
      {
        "lessonId": "separable-ode",
        "purpose": "Separate only the nonzero state factor, preserve every equilibrium, and verify the recovered branch and interval."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Use mean-value hypotheses, sign charts and endpoint checks to turn derivatives into bounds and global conclusions."
      },
      {
        "lessonId": "ode-exact-bernoulli",
        "purpose": "Check potential and substitution hypotheses while retaining the zero solutions and real inverse branches."
      },
      {
        "lessonId": "complex",
        "purpose": "Fix complex arithmetic and principal-branch conventions before interpreting any later complex-valued method."
      },
      {
        "lessonId": "second-order-ode",
        "purpose": "Use two independent homogeneous modes, add a correct forced response and impose both initial data on the total solution."
      },
      {
        "lessonId": "ode-reduction",
        "purpose": "Use logarithmic time or a nonvanishing known mode, then verify whether the method restriction survives in the solution."
      },
      {
        "lessonId": "parts",
        "purpose": "Derive reductions from the product rule and keep the finite boundary terms until their later limits are proved."
      },
      {
        "lessonId": "ode-variation",
        "purpose": "Normalize the forcing and vary coefficients of an independent pair, carrying both initial data into the response."
      },
      {
        "lessonId": "ode-systems",
        "purpose": "Construct planar modes and inspect their time dependence before asserting stability or attraction."
      },
      {
        "lessonId": "ode-nonlinear",
        "purpose": "Use phase-line motion and a supplied Riccati solution to track invariant intervals, reciprocal branches and poles."
      },
      {
        "lessonId": "substitution",
        "purpose": "Match an inner function with its derivative, transform the endpoints, and check that the resulting sign agrees with the original integrand."
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
        "lessonId": "ode-energy",
        "purpose": "Derive the invariant or dissipation law, then check continuation and travel-time integrability before claiming global motion."
      },
      {
        "lessonId": "rational-trig",
        "purpose": "Resolve rational factors and real inverse branches before using transformations inside a longer integral."
      },
      {
        "lessonId": "growth",
        "purpose": "Control dominant algebraic, exponential and logarithmic scales with explicit tail bounds."
      },
      {
        "lessonId": "ode-laplace",
        "purpose": "Use the real transform domain, initial-value boundary terms and exact delayed input to solve a forced equation."
      },
      {
        "lessonId": "convergence-tests",
        "purpose": "Establish ordinary and absolute convergence using a test whose hypotheses fit the actual terms."
      },
      {
        "lessonId": "series-errors",
        "purpose": "Name the retained indices and control the entire omitted tail before using a sum as an approximation."
      },
      {
        "lessonId": "analysis",
        "purpose": "Distinguish pointwise choices from one error bound valid on the whole domain before exchanging operations."
      },
      {
        "lessonId": "taylor-remainders",
        "purpose": "Turn local coefficients into justified estimates by controlling the remainder on the whole relevant interval."
      },
      {
        "lessonId": "power-series",
        "purpose": "Extend finite coefficient reasoning to infinite series only on a convergence domain that permits the operation."
      },
      {
        "lessonId": "ode-frobenius",
        "purpose": "Obtain all-order recurrences and test singular compatibility before justifying the resulting infinite solution."
      }
    ],
    "readiness": [
      {
        "lessonId": "ode-reduction",
        "exerciseId": "known-mode-zero",
        "prompt": "Decide whether a zero of the chosen mode is also a boundary of the actual solution."
      },
      {
        "lessonId": "ode-variation",
        "exerciseId": "quadrature-response",
        "prompt": "Construct and verify a solution with exact integral terms and both initial values."
      },
      {
        "lessonId": "ode-systems",
        "exerciseId": "zero-eigenvalue-defect",
        "prompt": "Explain why the same eigenvalues need not give the same stability."
      },
      {
        "lessonId": "ode-laplace",
        "exerciseId": "unshifted-ramp-input",
        "prompt": "Preserve the activated input and verify continuity and the equation at each side of the switch."
      },
      {
        "lessonId": "ode-frobenius",
        "exerciseId": "resonance-obstruction",
        "prompt": "Check a singular recurrence for compatibility before division, then justify the constructed branch."
      },
      {
        "lessonId": "ode-energy",
        "exerciseId": "damped-energy-bound",
        "prompt": "Use the energy inequality for continuation without asserting an unproved limiting state."
      }
    ]
  },
  {
    "id": "hard-multivariable",
    "title": "Hard Multivariable Calculus: regularity, global extrema and vector integrals",
    "summary": "Combine all-path estimates, global feasible-set analysis, coordinate changes and oriented boundary theorems while checking their distinct hypotheses.",
    "objectives": [
      "Separate continuity, directional behavior, differentiability and mixed-partial conditions.",
      "Compare regular, boundary, degenerate and noncompact optimization cases.",
      "Track coverage, Jacobians and orientation in planar, spatial and vector integral arguments."
    ],
    "revision": 2,
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
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Review displacements, dot products and perpendicular directions before expressing tangent and normal lines. The quadratic-form material supports later multivariable study."
      },
      {
        "lessonId": "multi-local",
        "purpose": "Supply partial derivatives and tangent-plane meaning before equations in two variables."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Use mean-value hypotheses, sign charts and endpoint checks to turn derivatives into bounds and global conclusions."
      },
      {
        "lessonId": "multi-limits",
        "purpose": "Use the full domain and distance to distinguish a path counterexample from a proof valid for every approach."
      },
      {
        "lessonId": "multi-chain",
        "purpose": "Track every dependence in first and second derivatives, and state the continuity needed for mixed partials."
      },
      {
        "lessonId": "multi-critical",
        "purpose": "Separate local Hessian information from a global comparison of interior, boundary and singular cases."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate signed contribution from geometric area, and connect a primitive to its derivative."
      },
      {
        "lessonId": "inequalities",
        "purpose": "Use a nonnegative square or inner-product bound, then check whether its equality conditions are feasible."
      },
      {
        "lessonId": "multi-constraints",
        "purpose": "Combine feasible-set boundaries, orthogonal coordinates and equality conditions to prove a global extremum."
      },
      {
        "lessonId": "ftc",
        "purpose": "Connect an accumulation function to its derivative, evaluate finite integrals by subtracting primitive values, and track both endpoint contributions when the bounds move."
      },
      {
        "lessonId": "substitution",
        "purpose": "Match an inner function with its derivative, transform the endpoints, and check that the resulting sign agrees with the original integrand."
      },
      {
        "lessonId": "parts",
        "purpose": "Derive reductions from the product rule and keep the finite boundary terms until their later limits are proved."
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
        "lessonId": "multiple-integrals",
        "purpose": "Describe one region using two sets of slice bounds and justify both iterated integrals. The later improper section explains why conditional cancellation alone cannot justify an exchange."
      },
      {
        "lessonId": "coordinates",
        "purpose": "Derive the determinant and inverse branch together, then check the image region and repeated coverage."
      },
      {
        "lessonId": "coordinates-spatial",
        "purpose": "Extend the coordinate ledger to three dimensions, including angular ranges and singular radial thresholds."
      },
      {
        "lessonId": "vector-calculus",
        "purpose": "Distinguish scalar mass from oriented work and check the entire domain before using potentials or Green’s theorem."
      },
      {
        "lessonId": "vector-surfaces",
        "purpose": "Track surface orientation and all boundary pieces when moving between circulation, curl flux and volume integrals."
      }
    ],
    "readiness": [
      {
        "lessonId": "multi-limits",
        "exerciseId": "continuous-not-linear",
        "prompt": "Use an all-path bound for continuity and a separate remainder test for differentiability."
      },
      {
        "lessonId": "multi-chain",
        "exerciseId": "two-input-mixed",
        "prompt": "Retain the nonlinear coordinate contribution to a second derivative."
      },
      {
        "lessonId": "multi-critical",
        "exerciseId": "ellipse-boundary-comparison",
        "prompt": "Compare the interior with every regular boundary candidate and verify all equality points."
      },
      {
        "lessonId": "multi-critical",
        "exerciseId": "degenerate-fourth-order",
        "prompt": "Resolve an inconclusive Hessian by direct sign analysis."
      },
      {
        "lessonId": "multi-constraints",
        "exerciseId": "unbounded-constraint-attainment",
        "prompt": "Decide attainment and unboundedness directly when compactness is unavailable."
      },
      {
        "lessonId": "coordinates",
        "exerciseId": "folded-rectangle",
        "prompt": "Distinguish image area from multiplicity and signed coverage."
      },
      {
        "lessonId": "vector-calculus",
        "exerciseId": "ellipse-around-hole",
        "prompt": "Use the punctured domain and both boundary orientations correctly."
      },
      {
        "lessonId": "vector-surfaces",
        "exerciseId": "close-paraboloid-with-sides",
        "prompt": "Account for every boundary piece in a divergence-theorem calculation."
      },
      {
        "lessonId": "vector-surfaces",
        "exerciseId": "replace-curl-surface",
        "prompt": "Justify a surface replacement for curl flux and check it directly."
      },
      {
        "lessonId": "coordinates",
        "exerciseId": "positive-product-ratio-region",
        "prompt": "Establish the positive inverse, retain the coupled region bounds and compute both the area and weighted integral before opening hints."
      }
    ]
  },
  {
    "id": "hard-mixed",
    "title": "Hard Mixed: decomposition, representation and exceptional cases",
    "summary": "Practice several ways to reorganize a problem: an exact finite identity, a parameter derivative, a transformed equation and a geometric boundary argument.",
    "objectives": [
      "Separate recognition, calculation and the proof that each operation is valid.",
      "Compare representations without losing a branch, endpoint term or entire tail.",
      "Use domain and attainment checks to finish a multi-step argument."
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
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate signed contribution from geometric area, and connect a primitive to its derivative."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Make convergence a limit of finite indexed sums, including every surviving endpoint term."
      },
      {
        "lessonId": "strategy-object",
        "purpose": "Apply the object distinctions to new graph and discrete records without a supplied method; verify the results with units and a second representation."
      },
      {
        "lessonId": "ftc",
        "purpose": "Connect an accumulation function to its derivative, evaluate finite integrals by subtracting primitive values, and track both endpoint contributions when the bounds move."
      },
      {
        "lessonId": "substitution",
        "purpose": "Match an inner function with its derivative, transform the endpoints, and check that the resulting sign agrees with the original integrand."
      },
      {
        "lessonId": "rational-trig",
        "purpose": "Resolve rational factors and real inverse branches before using transformations inside a longer integral."
      },
      {
        "lessonId": "convergence-tests",
        "purpose": "Establish ordinary and absolute convergence using a test whose hypotheses fit the actual terms."
      },
      {
        "lessonId": "series-errors",
        "purpose": "Name the retained indices and control the entire omitted tail before using a sum as an approximation."
      },
      {
        "lessonId": "analysis",
        "purpose": "Distinguish pointwise choices from one error bound valid on the whole domain before exchanging operations."
      },
      {
        "lessonId": "parts",
        "purpose": "Derive reductions from the product rule and keep the finite boundary terms until their later limits are proved."
      },
      {
        "lessonId": "taylor-remainders",
        "purpose": "Turn local coefficients into justified estimates by controlling the remainder on the whole relevant interval."
      },
      {
        "lessonId": "power-series",
        "purpose": "Extend finite coefficient reasoning to infinite series only on a convergence domain that permits the operation."
      },
      {
        "lessonId": "strategy-choice",
        "purpose": "Separate the recognition step, exact calculation and error certification, using a second representation to check the argument."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Use mean-value hypotheses, sign charts and endpoint checks to turn derivatives into bounds and global conclusions."
      },
      {
        "lessonId": "improper",
        "purpose": "Apply the selected primitive method on truncated intervals before taking each required endpoint limit."
      },
      {
        "lessonId": "ode-meaning",
        "purpose": "First verify a full residual and initial value, then read equilibrium and direction from the autonomous field."
      },
      {
        "lessonId": "linear-ode",
        "purpose": "Match a product derivative and verify the initial value and coefficient interval after integrating."
      },
      {
        "lessonId": "parameter-integrals",
        "purpose": "Use uniform local control and finite boundary identities before deriving an equation in the parameter."
      },
      {
        "lessonId": "rearrangements",
        "purpose": "Use finite cutoffs to decide when order is harmless and when conditional sums depend on it."
      },
      {
        "lessonId": "products",
        "purpose": "Take logarithms of finite positive products first, then control the accumulated quadratic defect and order."
      },
      {
        "lessonId": "complex",
        "purpose": "Fix complex arithmetic and principal-branch conventions before interpreting any later complex-valued method."
      },
      {
        "lessonId": "existence-uniqueness",
        "purpose": "Supply the local uniqueness and interval conditions needed before claiming that separated branches cannot cross an equilibrium."
      },
      {
        "lessonId": "second-order-ode",
        "purpose": "Use two independent homogeneous modes, add a correct forced response and impose both initial data on the total solution."
      },
      {
        "lessonId": "ode-reduction",
        "purpose": "Use logarithmic time or a nonvanishing known mode, then verify whether the method restriction survives in the solution."
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Review displacements, dot products and perpendicular directions before expressing tangent and normal lines. The quadratic-form material supports later multivariable study."
      },
      {
        "lessonId": "multi-local",
        "purpose": "Supply partial derivatives and tangent-plane meaning before equations in two variables."
      },
      {
        "lessonId": "multi-chain",
        "purpose": "Track every dependence in first and second derivatives, and state the continuity needed for mixed partials."
      },
      {
        "lessonId": "multiple-integrals",
        "purpose": "Describe one region using two sets of slice bounds and justify both iterated integrals. The later improper section explains why conditional cancellation alone cannot justify an exchange."
      },
      {
        "lessonId": "vector-calculus",
        "purpose": "Distinguish scalar mass from oriented work and check the entire domain before using potentials or Green’s theorem."
      },
      {
        "lessonId": "multi-critical",
        "purpose": "Separate local Hessian information from a global comparison of interior, boundary and singular cases."
      },
      {
        "lessonId": "inequalities",
        "purpose": "Use a nonnegative square or inner-product bound, then check whether its equality conditions are feasible."
      },
      {
        "lessonId": "multi-constraints",
        "purpose": "Combine feasible-set boundaries, orthogonal coordinates and equality conditions to prove a global extremum."
      }
    ],
    "readiness": [
      {
        "lessonId": "strategy-choice",
        "exerciseId": "series-defined-area",
        "prompt": "Separate exact evaluation from the proof of the claimed approximation error."
      },
      {
        "lessonId": "parameter-integrals",
        "exerciseId": "both-moving-endpoints",
        "prompt": "Compare differentiation of the integral with direct evaluation."
      },
      {
        "lessonId": "products",
        "exerciseId": "normalized-positive-product",
        "prompt": "Determine the parameter threshold after the leading drift has been removed."
      },
      {
        "lessonId": "ode-reduction",
        "exerciseId": "known-mode-zero",
        "prompt": "Distinguish a method boundary from a boundary of the equation."
      },
      {
        "lessonId": "vector-calculus",
        "exerciseId": "ellipse-around-hole",
        "prompt": "Explain why a locally curl-free field need not have a global potential."
      },
      {
        "lessonId": "multi-constraints",
        "exerciseId": "unbounded-constraint-attainment",
        "prompt": "Prove the sharp bound, check all equality points and decide whether a maximum exists."
      }
    ]
  },
  {
    "id": "olympiad-differentiation",
    "title": "Olympiad Differentiation: auxiliary functions, coefficients and operators",
    "summary": "Construct auxiliary exponential factors and polynomial interpolation residuals, then connect finite coefficients, operator composition, exact remainders and equality arguments to further Olympiad differentiation methods.",
    "objectives": [
      "Construct positive exponential factors to prove derivative relations and zero bounds for finite real exponential sums.",
      "Construct and differentiate polynomial residuals from rational value-and-slope data, proving existence and uniqueness under the stated degree bound.",
      "Connect finite derivative recurrences with coefficient extraction and normalization.",
      "Preserve the order of variable-coefficient operators and distinguish a sharp bound from attainment."
    ],
    "revision": 3,
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
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Use mean-value hypotheses, sign charts and endpoint checks to turn derivatives into bounds and global conclusions."
      },
      {
        "lessonId": "higher-derivatives",
        "purpose": "Build finite Leibniz formulas and recurrences from the elementary rules, keeping low orders and operator order explicit."
      },
      {
        "lessonId": "auxiliary-functions",
        "purpose": "After Rolle and variable-coefficient differentiation, choose positive exponential factors to create equal boundary values, transfer zeros and prove a real exponential zero bound."
      },
      {
        "lessonId": "interpolation-constructions",
        "purpose": "Use a different auxiliary construction for rational samples: clear the denominator, factor polynomial zeros, retain the degree bound, and distinguish repeated values from value-and-slope conditions."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate signed contribution from geometric area, and connect a primitive to its derivative."
      },
      {
        "lessonId": "ftc",
        "purpose": "Connect an accumulation function to its derivative, evaluate finite integrals by subtracting primitive values, and track both endpoint contributions when the bounds move."
      },
      {
        "lessonId": "parts",
        "purpose": "Derive reductions from the product rule and keep the finite boundary terms until their later limits are proved."
      },
      {
        "lessonId": "taylor-remainders",
        "purpose": "Turn local coefficients into justified estimates by controlling the remainder on the whole relevant interval."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Make convergence a limit of finite indexed sums, including every surviving endpoint term."
      },
      {
        "lessonId": "convergence-tests",
        "purpose": "Establish ordinary and absolute convergence using a test whose hypotheses fit the actual terms."
      },
      {
        "lessonId": "series-errors",
        "purpose": "Name the retained indices and control the entire omitted tail before using a sum as an approximation."
      },
      {
        "lessonId": "analysis",
        "purpose": "Distinguish pointwise choices from one error bound valid on the whole domain before exchanging operations."
      },
      {
        "lessonId": "power-series",
        "purpose": "Extend finite coefficient reasoning to infinite series only on a convergence domain that permits the operation."
      },
      {
        "lessonId": "generating",
        "purpose": "Keep initial terms and coefficient normalization when converting a recurrence or weighted selection into a function."
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Use dot products, projections and quadratic-form signs to prepare inner-product bounds and equality conditions."
      },
      {
        "lessonId": "inequalities",
        "purpose": "Use a nonnegative square or inner-product bound, then check whether its equality conditions are feasible."
      }
    ],
    "readiness": [
      {
        "lessonId": "auxiliary-functions",
        "exerciseId": "three-sample-identity",
        "prompt": "Determine all coefficient triples from the three supplied samples, and justify completeness before opening hints."
      },
      {
        "lessonId": "auxiliary-functions",
        "exerciseId": "second-order-interior-relation",
        "prompt": "Establish the interior-point relation from the three zeros, preserving every variable-coefficient term, before opening hints."
      },
      {
        "lessonId": "interpolation-constructions",
        "exerciseId": "squared-denominator-data",
        "prompt": "Determine the requested slope and verify the polynomial against the three sample values before opening hints."
      },
      {
        "lessonId": "interpolation-constructions",
        "exerciseId": "two-value-slope-pairs",
        "prompt": "Determine the requested derivative and prove existence and uniqueness from the stated values, slopes and degree bound before opening hints."
      },
      {
        "lessonId": "higher-derivatives",
        "exerciseId": "operator-versus-derivative",
        "prompt": "Prove the derivative formula and distinguish the composed operator from the scaled second derivative."
      },
      {
        "lessonId": "generating",
        "exerciseId": "weighted-pair-extraction",
        "prompt": "Explain the coefficient encoding and remove repeated or double-counted choices."
      },
      {
        "lessonId": "taylor-remainders",
        "exerciseId": "exact-geometric-remainder",
        "prompt": "Compare two bounds and show where the exact error attains its maximum."
      },
      {
        "lessonId": "inequalities",
        "exerciseId": "fixed-sum-product",
        "prompt": "Separate the best bound from an attainable maximum when the feasible set changes."
      }
    ]
  },
  {
    "id": "olympiad-integration",
    "title": "Olympiad Integration: parameter equations, periodic coefficients and integral transforms",
    "summary": "Study parameter equations, finite periodic projections, real Laplace methods and special-function integrals with explicit hypotheses and convergence conventions.",
    "objectives": [
      "Check the weight in an involution and the boundary terms in a parameter equation.",
      "Use real Laplace and Beta/Gamma integrals only on justified domains.",
      "Distinguish a convergence convention from a theorem that permits an interchange or a sharp bound.",
      "Use finite orthogonality and periodic coefficient integrals while distinguishing them from transform inversion."
    ],
    "revision": 3,
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
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate signed contribution from geometric area, and connect a primitive to its derivative."
      },
      {
        "lessonId": "ftc",
        "purpose": "Connect an accumulation function to its derivative, evaluate finite integrals by subtracting primitive values, and track both endpoint contributions when the bounds move."
      },
      {
        "lessonId": "substitution",
        "purpose": "Match an inner function with its derivative, transform the endpoints, and check that the resulting sign agrees with the original integrand."
      },
      {
        "lessonId": "symmetry",
        "purpose": "Check how reflection or reciprocal substitution changes the interval, weight and differential before pairing values."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Use the mean-value theorem to turn a derivative bound on a closed piece into the local difference estimate needed in the convergence proof."
      },
      {
        "lessonId": "parts",
        "purpose": "Derive reductions from the product rule and keep the finite boundary terms until their later limits are proved."
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
        "lessonId": "ode-meaning",
        "purpose": "First verify a full residual and initial value, then read equilibrium and direction from the autonomous field."
      },
      {
        "lessonId": "linear-ode",
        "purpose": "Match a product derivative and verify the initial value and coefficient interval after integrating."
      },
      {
        "lessonId": "analysis",
        "purpose": "Distinguish pointwise choices from one error bound valid on the whole domain before exchanging operations."
      },
      {
        "lessonId": "parameter-integrals",
        "purpose": "Use uniform local control and finite boundary identities before deriving an equation in the parameter."
      },
      {
        "lessonId": "multiple-integrals",
        "purpose": "Describe one region using two sets of slice bounds and justify both iterated integrals. The later improper section explains why conditional cancellation alone cannot justify an exchange."
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Use vectors and orthogonal projection as the finite-dimensional model for the integral pairing introduced next."
      },
      {
        "lessonId": "fourier-orthogonality",
        "purpose": "After trigonometric integrals, mean-value bounds, convergence and vector geometry, derive periodic coefficients and distinguish finite approximation from pointwise series convergence."
      },
      {
        "lessonId": "multi-local",
        "purpose": "Supply partial derivatives and tangent-plane meaning before equations in two variables."
      },
      {
        "lessonId": "multi-chain",
        "purpose": "Track every dependence in first and second derivatives, and state the continuity needed for mixed partials."
      },
      {
        "lessonId": "coordinates",
        "purpose": "Derive the determinant and inverse branch together, then check the image region and repeated coverage."
      },
      {
        "lessonId": "beta-gamma",
        "purpose": "Prove the defining integral domains and change-of-variable identity before using the special-function values."
      },
      {
        "lessonId": "complex",
        "purpose": "Fix complex arithmetic and principal-branch conventions before interpreting any later complex-valued method."
      },
      {
        "lessonId": "existence-uniqueness",
        "purpose": "Supply the local uniqueness and interval conditions needed before claiming that separated branches cannot cross an equilibrium."
      },
      {
        "lessonId": "second-order-ode",
        "purpose": "Use two independent homogeneous modes, add a correct forced response and impose both initial data on the total solution."
      },
      {
        "lessonId": "rational-trig",
        "purpose": "Resolve rational factors and real inverse branches before using transformations inside a longer integral."
      },
      {
        "lessonId": "growth",
        "purpose": "Control dominant algebraic, exponential and logarithmic scales with explicit tail bounds."
      },
      {
        "lessonId": "ode-laplace",
        "purpose": "Use the real transform domain, initial-value boundary terms and exact delayed input to solve a forced equation."
      },
      {
        "lessonId": "taylor-remainders",
        "purpose": "Turn local coefficients into justified estimates by controlling the remainder on the whole relevant interval."
      },
      {
        "lessonId": "approximation",
        "purpose": "Use the Taylor and integration tools to obtain an error enclosure with the required smoothness and curvature conditions."
      }
    ],
    "readiness": [
      {
        "lessonId": "symmetry",
        "exerciseId": "reciprocal-without-weight",
        "prompt": "Decide whether the transformed measure supports the proposed pairing."
      },
      {
        "lessonId": "parameter-integrals",
        "exerciseId": "exponential-tail-derivative",
        "prompt": "Prove the local domination needed for a parameter derivative."
      },
      {
        "lessonId": "ode-laplace",
        "exerciseId": "repeated-transform-pole",
        "prompt": "Recover the complete solution and data from the real transform calculation."
      },
      {
        "lessonId": "beta-gamma",
        "exerciseId": "rational-tail-parameter-range",
        "prompt": "Check both endpoint conditions and the special-function domain."
      },
      {
        "lessonId": "improper",
        "exerciseId": "double-pole-no-rescue",
        "prompt": "Decide separately whether the ordinary integral and the specified principal value exist."
      },
      {
        "lessonId": "fourier-orthogonality",
        "exerciseId": "constrained-approximation",
        "prompt": "Solve the finite integral minimization with its point constraint, including the minimum value and uniqueness."
      },
      {
        "lessonId": "parameter-integrals",
        "exerciseId": "damped-sine-remainder-ode",
        "prompt": "Derive an equation and its initial data from the integral, justify each parameter derivative and boundary term, and determine the function before opening hints."
      }
    ]
  },
  {
    "id": "olympiad-limits",
    "title": "Olympiad Limits: normalization, product thresholds and singular domains",
    "summary": "Use controlled logarithmic defects and explicit domain-dependent counterexamples to test a proposed normalization or interchange of limits.",
    "objectives": [
      "Remove a leading drift without discarding the error that determines the limit.",
      "Distinguish independent cutoffs from a chosen diagonal path.",
      "Keep the domain and uniformity requirement explicit in a singular limit."
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
        "lessonId": "exp-log",
        "purpose": "Keep the real logarithm domain and positive-base exponential identities explicit."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Derive an instantaneous rate from a difference quotient, then combine the point value and slope to form a tangent line."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "After the meaning is established, combine the elementary rules without enlarging the original domain."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate signed contribution from geometric area, and connect a primitive to its derivative."
      },
      {
        "lessonId": "ftc",
        "purpose": "Connect an accumulation function to its derivative, evaluate finite integrals by subtracting primitive values, and track both endpoint contributions when the bounds move."
      },
      {
        "lessonId": "growth",
        "purpose": "Control dominant algebraic, exponential and logarithmic scales with explicit tail bounds."
      },
      {
        "lessonId": "parts",
        "purpose": "Derive reductions from the product rule and keep the finite boundary terms until their later limits are proved."
      },
      {
        "lessonId": "taylor-remainders",
        "purpose": "Turn local coefficients into justified estimates by controlling the remainder on the whole relevant interval."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Make convergence a limit of finite indexed sums, including every surviving endpoint term."
      },
      {
        "lessonId": "analysis",
        "purpose": "Distinguish pointwise choices from one error bound valid on the whole domain before exchanging operations."
      },
      {
        "lessonId": "convergence-tests",
        "purpose": "Establish ordinary and absolute convergence using a test whose hypotheses fit the actual terms."
      },
      {
        "lessonId": "series-errors",
        "purpose": "Name the retained indices and control the entire omitted tail before using a sum as an approximation."
      },
      {
        "lessonId": "rearrangements",
        "purpose": "Use finite cutoffs to decide when order is harmless and when conditional sums depend on it."
      },
      {
        "lessonId": "products",
        "purpose": "Take logarithms of finite positive products first, then control the accumulated quadratic defect and order."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Use mean-value hypotheses, sign charts and endpoint checks to turn derivatives into bounds and global conclusions."
      },
      {
        "lessonId": "substitution",
        "purpose": "Match an inner function with its derivative, transform the endpoints, and check that the resulting sign agrees with the original integrand."
      },
      {
        "lessonId": "improper",
        "purpose": "Apply the selected primitive method on truncated intervals before taking each required endpoint limit."
      },
      {
        "lessonId": "ode-meaning",
        "purpose": "First verify a full residual and initial value, then read equilibrium and direction from the autonomous field."
      },
      {
        "lessonId": "linear-ode",
        "purpose": "Match a product derivative and verify the initial value and coefficient interval after integrating."
      },
      {
        "lessonId": "parameter-integrals",
        "purpose": "Use uniform local control and finite boundary identities before deriving an equation in the parameter."
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Review displacements, dot products and perpendicular directions before expressing tangent and normal lines. The quadratic-form material supports later multivariable study."
      },
      {
        "lessonId": "multi-local",
        "purpose": "Supply partial derivatives and tangent-plane meaning before equations in two variables."
      },
      {
        "lessonId": "multi-limits",
        "purpose": "Use the full domain and distance to distinguish a path counterexample from a proof valid for every approach."
      }
    ],
    "readiness": [
      {
        "lessonId": "products",
        "exerciseId": "normalized-positive-product",
        "prompt": "Determine the complete threshold and include its equality case."
      },
      {
        "lessonId": "rearrangements",
        "exerciseId": "sparse-double-order",
        "prompt": "Compare the iterated and square-cutoff limits, and decide whether a joint rectangular limit exists."
      },
      {
        "lessonId": "analysis",
        "exerciseId": "unbounded-domain",
        "prompt": "Find the domain on which one error bound works and explain the failure beyond it."
      },
      {
        "lessonId": "multi-limits",
        "exerciseId": "domain-cusp-limit",
        "prompt": "Test whether an approach path is actually allowed by the domain."
      },
      {
        "lessonId": "taylor-remainders",
        "exerciseId": "exact-geometric-remainder",
        "prompt": "Use an exact remainder rather than an unsupported cancellation heuristic."
      }
    ]
  },
  {
    "id": "olympiad-series",
    "title": "Olympiad Series: Fourier coefficients, products and coefficient methods",
    "summary": "Connect coefficient identities, periodic expansions, normalized products and conditional sums, retaining the convention and convergence proof behind each operation.",
    "objectives": [
      "Choose a coefficient encoding and distinguish formal extraction from numerical evaluation.",
      "Classify normalized positive products using a quantitative logarithmic error.",
      "Explain the role of cancellation, ordering and ordinary versus Abel boundary limits.",
      "Derive periodic coefficients and determine the correct limit at interior points and periodic seams."
    ],
    "revision": 2,
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
        "lessonId": "partial-sums",
        "purpose": "Make convergence a limit of finite indexed sums, including every surviving endpoint term."
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
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate signed contribution from geometric area, and connect a primitive to its derivative."
      },
      {
        "lessonId": "ftc",
        "purpose": "Connect an accumulation function to its derivative, evaluate finite integrals by subtracting primitive values, and track both endpoint contributions when the bounds move."
      },
      {
        "lessonId": "convergence-tests",
        "purpose": "Establish ordinary and absolute convergence using a test whose hypotheses fit the actual terms."
      },
      {
        "lessonId": "series-errors",
        "purpose": "Name the retained indices and control the entire omitted tail before using a sum as an approximation."
      },
      {
        "lessonId": "analysis",
        "purpose": "Distinguish pointwise choices from one error bound valid on the whole domain before exchanging operations."
      },
      {
        "lessonId": "parts",
        "purpose": "Derive reductions from the product rule and keep the finite boundary terms until their later limits are proved."
      },
      {
        "lessonId": "taylor-remainders",
        "purpose": "Turn local coefficients into justified estimates by controlling the remainder on the whole relevant interval."
      },
      {
        "lessonId": "power-series",
        "purpose": "Extend finite coefficient reasoning to infinite series only on a convergence domain that permits the operation."
      },
      {
        "lessonId": "generating",
        "purpose": "Keep initial terms and coefficient normalization when converting a recurrence or weighted selection into a function."
      },
      {
        "lessonId": "summation-parts",
        "purpose": "Transfer a discrete difference onto the weight and retain the endpoint term to control cancellation."
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Use vectors and orthogonal projection as the finite-dimensional model for the integral pairing introduced next."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Use the mean-value theorem to turn a derivative bound on a closed piece into the local difference estimate needed in the convergence proof."
      },
      {
        "lessonId": "fourier-orthogonality",
        "purpose": "After trigonometric integrals, mean-value bounds, convergence and vector geometry, derive periodic coefficients and distinguish finite approximation from pointwise series convergence."
      },
      {
        "lessonId": "rearrangements",
        "purpose": "Use finite cutoffs to decide when order is harmless and when conditional sums depend on it."
      },
      {
        "lessonId": "products",
        "purpose": "Take logarithms of finite positive products first, then control the accumulated quadratic defect and order."
      }
    ],
    "readiness": [
      {
        "lessonId": "generating",
        "exerciseId": "weighted-pair-extraction",
        "prompt": "Build and justify the finite encoding instead of assuming an uncorrected square counts the desired choices."
      },
      {
        "lessonId": "generating",
        "exerciseId": "factorial-growth-two-encodings",
        "prompt": "Compare the analytic meaning of ordinary and factorial-normalized coefficients."
      },
      {
        "lessonId": "products",
        "exerciseId": "normalized-positive-product",
        "prompt": "Classify the positive-product threshold with a controlled remainder."
      },
      {
        "lessonId": "products",
        "exerciseId": "ordered-exponential-factors",
        "prompt": "Use the logarithms to determine how the prescribed order changes the product."
      },
      {
        "lessonId": "summation-parts",
        "exerciseId": "quarter-turn-log-weight",
        "prompt": "Prove the cancellation estimate and distinguish ordinary from absolute convergence."
      },
      {
        "lessonId": "fourier-orthogonality",
        "exerciseId": "half-period-ramp",
        "prompt": "Construct the requested representation, identify every exceptional point, and decide the whole-period convergence question before opening hints."
      },
      {
        "lessonId": "fourier-orthogonality",
        "exerciseId": "constrained-approximation",
        "prompt": "Find the unique constrained coefficients and the exact minimum before opening hints."
      }
    ]
  },
  {
    "id": "olympiad-ode",
    "title": "Olympiad Differential Equations: first integrals, Riccati reductions and boundary compatibility",
    "summary": "Use an invariant, a known particular solution or an endpoint relation to reorganize a differential equation, then verify its interval and compatibility conditions.",
    "objectives": [
      "Use energy and signed motion to justify a travel time or least period.",
      "Track the branch removed by a Riccati reciprocal substitution.",
      "Combine response kernels, boundary data and singular recurrences without assuming a general spectral theorem."
    ],
    "revision": 2026111802,
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
      },
      {
        "lessonId": "ode-meaning",
        "purpose": "First verify a full residual and initial value, then read equilibrium and direction from the autonomous field."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate signed contribution from geometric area, and connect a primitive to its derivative."
      },
      {
        "lessonId": "existence-uniqueness",
        "purpose": "Supply the local uniqueness and interval conditions needed before claiming that separated branches cannot cross an equilibrium."
      },
      {
        "lessonId": "separable-ode",
        "purpose": "Separate only the nonzero state factor, preserve every equilibrium, and verify the recovered branch and interval."
      },
      {
        "lessonId": "linear-ode",
        "purpose": "Match a product derivative and verify the initial value and coefficient interval after integrating."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Use mean-value hypotheses, sign charts and endpoint checks to turn derivatives into bounds and global conclusions."
      },
      {
        "lessonId": "ode-nonlinear",
        "purpose": "Use phase-line motion and a supplied Riccati solution to track invariant intervals, reciprocal branches and poles."
      },
      {
        "lessonId": "complex",
        "purpose": "Fix complex arithmetic and principal-branch conventions before interpreting any later complex-valued method."
      },
      {
        "lessonId": "second-order-ode",
        "purpose": "Use two independent homogeneous modes, add a correct forced response and impose both initial data on the total solution."
      },
      {
        "lessonId": "ftc",
        "purpose": "Connect an accumulation function to its derivative, evaluate finite integrals by subtracting primitive values, and track both endpoint contributions when the bounds move."
      },
      {
        "lessonId": "substitution",
        "purpose": "Match an inner function with its derivative, transform the endpoints, and check that the resulting sign agrees with the original integrand."
      },
      {
        "lessonId": "parts",
        "purpose": "Derive reductions from the product rule and keep the finite boundary terms until their later limits are proved."
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
        "lessonId": "ode-energy",
        "purpose": "Derive the invariant or dissipation law, then check continuation and travel-time integrability before claiming global motion."
      },
      {
        "lessonId": "ode-variation",
        "purpose": "Normalize the forcing and vary coefficients of an independent pair, carrying both initial data into the response."
      },
      {
        "lessonId": "boundary-data",
        "purpose": "Fit the full solution family to both endpoints and retain zero modes and exceptional frequency cases."
      },
      {
        "lessonId": "spectral",
        "purpose": "Use a slope jump to test a prescribed forcing. For zero-slope modes, use the boundary identity and the mean constraint to locate the first surviving frequency."
      },
      {
        "lessonId": "convergence-tests",
        "purpose": "Establish ordinary and absolute convergence using a test whose hypotheses fit the actual terms."
      },
      {
        "lessonId": "series-errors",
        "purpose": "Name the retained indices and control the entire omitted tail before using a sum as an approximation."
      },
      {
        "lessonId": "analysis",
        "purpose": "Distinguish pointwise choices from one error bound valid on the whole domain before exchanging operations."
      },
      {
        "lessonId": "taylor-remainders",
        "purpose": "Turn local coefficients into justified estimates by controlling the remainder on the whole relevant interval."
      },
      {
        "lessonId": "power-series",
        "purpose": "Extend finite coefficient reasoning to infinite series only on a convergence domain that permits the operation."
      },
      {
        "lessonId": "ode-reduction",
        "purpose": "Use logarithmic time or a nonvanishing known mode, then verify whether the method restriction survives in the solution."
      },
      {
        "lessonId": "ode-frobenius",
        "purpose": "Obtain all-order recurrences and test singular compatibility before justifying the resulting infinite solution."
      }
    ],
    "readiness": [
      {
        "lessonId": "ode-energy",
        "exerciseId": "pendulum-quarter-time",
        "prompt": "Prove finite travel, the velocity signs and the least-period claim."
      },
      {
        "lessonId": "ode-nonlinear",
        "exerciseId": "oscillatory-particular-global-branch",
        "prompt": "Verify the transformed solution, its maximal interval and the excluded particular branch."
      },
      {
        "lessonId": "ode-variation",
        "exerciseId": "quadrature-response",
        "prompt": "Keep both initial data in the exact response integral."
      },
      {
        "lessonId": "boundary-data",
        "exerciseId": "frequency-compatibility",
        "prompt": "Classify zero frequency and the exceptional nonzero parameters before dividing."
      },
      {
        "lessonId": "ode-frobenius",
        "exerciseId": "resonance-obstruction",
        "prompt": "Distinguish an incompatible proposed series from nonexistence of all solutions."
      },
      {
        "lessonId": "spectral",
        "exerciseId": "zero-slope-spectrum",
        "prompt": "Find every mode with zero endpoint slopes, then decide which survive a zero-mean constraint."
      }
    ]
  },
  {
    "id": "olympiad-multivariable",
    "title": "Olympiad Multivariable Calculus: quadratic forms, coordinate changes and moments",
    "summary": "Use orthogonal coordinates, exact changes of variables and normalized moments to turn geometric or matrix structure into a justified calculation.",
    "objectives": [
      "Prove global quadratic bounds and determine every equality case.",
      "Track regions, multiplicity and positive definiteness through a change of variables.",
      "Distinguish raw mass, normalized moments and Gaussian covariance conventions."
    ],
    "revision": 20261118,
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
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Review displacements, dot products and perpendicular directions before expressing tangent and normal lines. The quadratic-form material supports later multivariable study."
      },
      {
        "lessonId": "multi-local",
        "purpose": "Supply partial derivatives and tangent-plane meaning before equations in two variables."
      },
      {
        "lessonId": "multi-chain",
        "purpose": "Track every dependence in first and second derivatives, and state the continuity needed for mixed partials."
      },
      {
        "lessonId": "multi-critical",
        "purpose": "Separate local Hessian information from a global comparison of interior, boundary and singular cases."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate signed contribution from geometric area, and connect a primitive to its derivative."
      },
      {
        "lessonId": "inequalities",
        "purpose": "Use a nonnegative square or inner-product bound, then check whether its equality conditions are feasible."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Use mean-value hypotheses, sign charts and endpoint checks to turn derivatives into bounds and global conclusions."
      },
      {
        "lessonId": "multi-constraints",
        "purpose": "Combine feasible-set boundaries, orthogonal coordinates and equality conditions to prove a global extremum."
      },
      {
        "lessonId": "ftc",
        "purpose": "Connect an accumulation function to its derivative, evaluate finite integrals by subtracting primitive values, and track both endpoint contributions when the bounds move."
      },
      {
        "lessonId": "substitution",
        "purpose": "Match an inner function with its derivative, transform the endpoints, and check that the resulting sign agrees with the original integrand."
      },
      {
        "lessonId": "parts",
        "purpose": "Derive reductions from the product rule and keep the finite boundary terms until their later limits are proved."
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
        "lessonId": "multiple-integrals",
        "purpose": "Describe one region using two sets of slice bounds and justify both iterated integrals. The later improper section explains why conditional cancellation alone cannot justify an exchange."
      },
      {
        "lessonId": "coordinates",
        "purpose": "Derive the determinant and inverse branch together, then check the image region and repeated coverage."
      },
      {
        "lessonId": "coordinates-spatial",
        "purpose": "Extend the coordinate ledger to three dimensions, including angular ranges and singular radial thresholds."
      },
      {
        "lessonId": "beta-gamma",
        "purpose": "Prove the defining integral domains and change-of-variable identity before using the special-function values."
      },
      {
        "lessonId": "multi-moments",
        "purpose": "Use convergent simplex and Gaussian normalizations to distinguish mass from first and second weighted moments."
      },
      {
        "lessonId": "variational",
        "purpose": "Use a signed integral as a constraint on a whole curve. Subtract a feasible candidate and use the remaining square to prove the energy minimum."
      }
    ],
    "readiness": [
      {
        "lessonId": "multi-constraints",
        "exerciseId": "rotated-quadratic-sphere",
        "prompt": "Find the sharp quadratic bounds and all points attaining them."
      },
      {
        "lessonId": "coordinates",
        "exerciseId": "folded-rectangle",
        "prompt": "Separate image measure, absolute multiplicity and signed coverage."
      },
      {
        "lessonId": "coordinates-spatial",
        "exerciseId": "radial-singularity-threshold",
        "prompt": "Prove the spatial integrability threshold rather than discarding the excluded origin."
      },
      {
        "lessonId": "multi-moments",
        "exerciseId": "tetrahedron-slack-moment",
        "prompt": "Compute the mass and normalized moment and check the mass by a different integration order."
      },
      {
        "lessonId": "multi-moments",
        "exerciseId": "gaussian-parameter-threshold",
        "prompt": "Prove the exact positive-definiteness threshold and retain the normalization in the second moment."
      },
      {
        "lessonId": "variational",
        "exerciseId": "prescribed-area-energy",
        "prompt": "Find a curve with the prescribed endpoints and signed area, then prove it uniquely minimizes derivative energy."
      }
    ]
  },
  {
    "id": "olympiad-mixed",
    "title": "Olympiad Mixed: symmetry, normalization, invariants and sharp bounds",
    "summary": "Compare several structural routes through calculus: pairing, a parameter equation, a product normalization, an energy invariant and an elementary equality argument.",
    "objectives": [
      "Explain the feature that makes a representation useful before calculating.",
      "Carry a normalization, domain restriction and convergence proof through a change of method.",
      "Compare a differential or multiplier argument with an exact identity and its equality conditions."
    ],
    "revision": 2026111802,
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
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate signed contribution from geometric area, and connect a primitive to its derivative."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Make convergence a limit of finite indexed sums, including every surviving endpoint term."
      },
      {
        "lessonId": "strategy-object",
        "purpose": "Apply the object distinctions to new graph and discrete records without a supplied method; verify the results with units and a second representation."
      },
      {
        "lessonId": "ftc",
        "purpose": "Connect an accumulation function to its derivative, evaluate finite integrals by subtracting primitive values, and track both endpoint contributions when the bounds move."
      },
      {
        "lessonId": "substitution",
        "purpose": "Match an inner function with its derivative, transform the endpoints, and check that the resulting sign agrees with the original integrand."
      },
      {
        "lessonId": "rational-trig",
        "purpose": "Resolve rational factors and real inverse branches before using transformations inside a longer integral."
      },
      {
        "lessonId": "convergence-tests",
        "purpose": "Establish ordinary and absolute convergence using a test whose hypotheses fit the actual terms."
      },
      {
        "lessonId": "series-errors",
        "purpose": "Name the retained indices and control the entire omitted tail before using a sum as an approximation."
      },
      {
        "lessonId": "analysis",
        "purpose": "Distinguish pointwise choices from one error bound valid on the whole domain before exchanging operations."
      },
      {
        "lessonId": "parts",
        "purpose": "Derive reductions from the product rule and keep the finite boundary terms until their later limits are proved."
      },
      {
        "lessonId": "taylor-remainders",
        "purpose": "Turn local coefficients into justified estimates by controlling the remainder on the whole relevant interval."
      },
      {
        "lessonId": "power-series",
        "purpose": "Extend finite coefficient reasoning to infinite series only on a convergence domain that permits the operation."
      },
      {
        "lessonId": "strategy-choice",
        "purpose": "Separate the recognition step, exact calculation and error certification, using a second representation to check the argument."
      },
      {
        "lessonId": "symmetry",
        "purpose": "Check how reflection or reciprocal substitution changes the interval, weight and differential before pairing values."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Use mean-value hypotheses, sign charts and endpoint checks to turn derivatives into bounds and global conclusions."
      },
      {
        "lessonId": "improper",
        "purpose": "Apply the selected primitive method on truncated intervals before taking each required endpoint limit."
      },
      {
        "lessonId": "ode-meaning",
        "purpose": "First verify a full residual and initial value, then read equilibrium and direction from the autonomous field."
      },
      {
        "lessonId": "linear-ode",
        "purpose": "Match a product derivative and verify the initial value and coefficient interval after integrating."
      },
      {
        "lessonId": "parameter-integrals",
        "purpose": "Use uniform local control and finite boundary identities before deriving an equation in the parameter."
      },
      {
        "lessonId": "rearrangements",
        "purpose": "Use finite cutoffs to decide when order is harmless and when conditional sums depend on it."
      },
      {
        "lessonId": "products",
        "purpose": "Take logarithms of finite positive products first, then control the accumulated quadratic defect and order."
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Review displacements, dot products and perpendicular directions before expressing tangent and normal lines. The quadratic-form material supports later multivariable study."
      },
      {
        "lessonId": "multi-local",
        "purpose": "Supply partial derivatives and tangent-plane meaning before equations in two variables."
      },
      {
        "lessonId": "multi-chain",
        "purpose": "Track every dependence in first and second derivatives, and state the continuity needed for mixed partials."
      },
      {
        "lessonId": "multi-critical",
        "purpose": "Separate local Hessian information from a global comparison of interior, boundary and singular cases."
      },
      {
        "lessonId": "inequalities",
        "purpose": "Use a nonnegative square or inner-product bound, then check whether its equality conditions are feasible."
      },
      {
        "lessonId": "multi-constraints",
        "purpose": "Combine feasible-set boundaries, orthogonal coordinates and equality conditions to prove a global extremum."
      },
      {
        "lessonId": "complex",
        "purpose": "Fix complex arithmetic and principal-branch conventions before interpreting any later complex-valued method."
      },
      {
        "lessonId": "fourier-transforms",
        "purpose": "Separate parity and translation effects in a continuous-frequency transform, and handle the frequencies at which a trigonometric formula has a removable singularity."
      },
      {
        "lessonId": "existence-uniqueness",
        "purpose": "Supply the local uniqueness and interval conditions needed before claiming that separated branches cannot cross an equilibrium."
      },
      {
        "lessonId": "second-order-ode",
        "purpose": "Use two independent homogeneous modes, add a correct forced response and impose both initial data on the total solution."
      },
      {
        "lessonId": "separable-ode",
        "purpose": "Separate only the nonzero state factor, preserve every equilibrium, and verify the recovered branch and interval."
      },
      {
        "lessonId": "ode-energy",
        "purpose": "Derive the invariant or dissipation law, then check continuation and travel-time integrability before claiming global motion."
      }
    ],
    "readiness": [
      {
        "lessonId": "symmetry",
        "exerciseId": "reciprocal-without-weight",
        "prompt": "Test the measure as well as the complementary values in a symmetry argument."
      },
      {
        "lessonId": "parameter-integrals",
        "exerciseId": "both-moving-endpoints",
        "prompt": "Compare the parameter-derivative and direct-evaluation routes."
      },
      {
        "lessonId": "products",
        "exerciseId": "normalized-positive-product",
        "prompt": "Locate the parameter threshold left after the leading normalization."
      },
      {
        "lessonId": "multi-constraints",
        "exerciseId": "unbounded-constraint-attainment",
        "prompt": "Find a complete sharp-bound argument on a noncompact set."
      },
      {
        "lessonId": "ode-energy",
        "exerciseId": "pendulum-quarter-time",
        "prompt": "Turn the invariant into a justified first-return and least-period argument."
      },
      {
        "lessonId": "fourier-transforms",
        "exerciseId": "compact-cosine-window-resonances",
        "prompt": "Find a compact window’s transform at ordinary and exceptional frequencies, then classify all cancellations after two opposite shifts."
      }
    ]
  }
];
