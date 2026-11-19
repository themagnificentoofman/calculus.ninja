// Reviewed draft topic/tier routes; admission and exposure remain pending.
export const elementaryPaths=[
  {
    "id": "easy-limits",
    "title": "Easy Limits: one-sided limits, continuity and tails",
    "summary": "Compare one-sided limits with a point value, justify cancellation and squeeze, and evaluate both signs of input infinity.",
    "objectives": [
      "Distinguish a function value from its nearby limit and continuous extension.",
      "Justify cancellation, rationalization and squeeze.",
      "Keep the sign of a square root when examining a positive or negative tail."
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
        "lessonId": "one-sided-limits",
        "purpose": "Distinguish left/right approach, assigned values and endpoint continuity before the nearby-limit and derivative lessons."
      },
      {
        "lessonId": "trig",
        "purpose": "Fix radian measure and trigonometric signs before using bounds or derivative formulas."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Choose continuity, cancellation, a conjugate or squeeze before introducing a more advanced rule."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Keep the real logarithm domain and positive-base exponential identities explicit."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Introduce the derivative as a local rate before applying its computation rules."
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
        "lessonId": "growth",
        "purpose": "Compare the two tails of a rational expression and a square-root expression. Explain when the sign of the input affects the limit."
      }
    ],
    "readiness": [
      {
        "lessonId": "algebra",
        "exerciseId": "rational-equality",
        "prompt": "Preserve excluded inputs when simplifying a rational equation before using similar cancellations in a limit."
      },
      {
        "lessonId": "limit-foundations",
        "exerciseId": "conjugate-limit",
        "prompt": "State the punctured-domain conditions that make rationalization valid, then evaluate the limit."
      },
      {
        "lessonId": "one-sided-limits",
        "exerciseId": "match-three-data",
        "prompt": "Match both side limits and the assigned value, and reject an unrepairable jump."
      },
      {
        "lessonId": "one-sided-limits",
        "exerciseId": "restricting-a-jump",
        "prompt": "Separate full-domain continuity from an explicitly restricted one-sided extension."
      },
      {
        "lessonId": "growth",
        "exerciseId": "basic-positive-negative-tails",
        "prompt": "Evaluate both distant input tails with the correct square-root sign and quotient denominator."
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
    "id": "easy-ode",
    "title": "Easy ODE: slope fields, equilibria and separation",
    "summary": "Read a differential equation as an identity on an interval, verify initial data, and separate a nonconstant branch without losing its equilibria.",
    "objectives": [
      "Check the differential equation, initial value and solution interval.",
      "Use the sign of an autonomous field to describe rising, falling and equilibrium states.",
      "Record equilibria before dividing and retain the branch selected by initial data."
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
        "purpose": "Establish a nearby limit before using a derivative or a limiting sum."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Introduce the derivative as a local rate before applying its computation rules."
      },
      {
        "lessonId": "slope-fields",
        "purpose": "Read exact local slope data and verify whole curves before solving or invoking existence and uniqueness."
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
        "lessonId": "ode-meaning",
        "purpose": "First verify a full residual and initial value, then read equilibrium and direction from the autonomous field."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Interpret finite signed accumulation before using a primitive or an integral estimate."
      },
      {
        "lessonId": "existence-uniqueness",
        "purpose": "Supply the local uniqueness and interval conditions needed before claiming that separated branches cannot cross an equilibrium."
      },
      {
        "lessonId": "separable-ode",
        "purpose": "Separate only the nonzero state factor, preserve every equilibrium, and verify the recovered branch and interval."
      }
    ],
    "readiness": [
      {
        "lessonId": "ode-meaning",
        "exerciseId": "approach-equilibrium",
        "prompt": "Solve the initial-value problem and use your formula to determine the long-term behavior."
      },
      {
        "lessonId": "separable-ode",
        "exerciseId": "negative-reciprocal-branch",
        "prompt": "Which constant solutions and which initial-value branch does the equation allow? Determine the branch’s interval and whether it reaches an equilibrium."
      },
      {
        "lessonId": "slope-fields",
        "exerciseId": "choose-the-compatible-field",
        "prompt": "Use the sampled slopes to choose a field, then test the proposed line against that equation."
      },
      {
        "lessonId": "slope-fields",
        "exerciseId": "horizontal-at-one-time",
        "prompt": "Find the equilibria and decide which candidate curves satisfy the equation throughout the interval."
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
    "id": "easy-multivariable",
    "title": "Easy Multivariable: level curves, derivatives and rectangular integrals",
    "summary": "Read level sets, compute partial and directional derivatives, build tangent planes and evaluate proper rectangular integrals. The contour exercises use equations and substitution; the differentiability proof provides further Medium study.",
    "objectives": [
      "Distinguish a point, a displacement and a unit direction.",
      "Compute partial derivatives and a local linear model.",
      "Interpret a double integral over a rectangle and its average."
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
        "purpose": "Justify accumulation derivatives and finite endpoint evaluation before later operations."
      },
      {
        "lessonId": "level-sets",
        "purpose": "Focus on reading-levels, the ellipse example and the parabolic contour exercise. The later C1 proof and gradient/path transfer are Medium extensions, not this Easy exit requirement."
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Interpret displacements, unit vectors, dot products and real symmetric quadratic forms."
      },
      {
        "lessonId": "multi-local",
        "purpose": "Connect coordinate partials, a tangent plane and a unit directional rate, checking the same path by direct expansion."
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
        "purpose": "Focus on area-sums, proper-fubini and rectangle-signed-average; curved-region reversal and singular interchange are extensions beyond this Easy route."
      }
    ],
    "readiness": [
      {
        "lessonId": "multi-local",
        "exerciseId": "path-and-unit-direction",
        "prompt": "Find the tangent plane and compare the actual path derivative with change per unit distance."
      },
      {
        "lessonId": "level-sets",
        "exerciseId": "parabolic-level-reading",
        "prompt": "Read empty, zero and multibranch contours by exact equations and membership checks; no gradient proof is required for this exit."
      },
      {
        "lessonId": "multiple-integrals",
        "exerciseId": "rectangle-integral-and-average",
        "prompt": "Evaluate a continuous rectangle integral in both orders and distinguish its average from the center value."
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
    "id": "medium-ode",
    "title": "Medium ODE: solution methods, forcing and boundary data",
    "summary": "Solve first-order equations on justified intervals, combine second-order modes with forcing, and distinguish initial data from two-point boundary conditions.",
    "objectives": [
      "Construct an integrating factor or exact potential and check the original equation.",
      "Preserve equilibria and real branches in a Bernoulli substitution.",
      "Fit initial data to a full forced second-order solution and recognize resonance.",
      "Distinguish local uniqueness from a global solution interval.",
      "Classify two-point boundary data as uniquely solvable, incompatible or nonunique, including exceptional frequencies."
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
        "lessonId": "ode-meaning",
        "purpose": "Define a solution interval, residual and initial value before selecting an ODE method."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Interpret finite signed accumulation before using a primitive or an integral estimate."
      },
      {
        "lessonId": "linear-ode",
        "purpose": "Match a product derivative and verify the initial value and coefficient interval after integrating."
      },
      {
        "lessonId": "existence-uniqueness",
        "purpose": "Establish which local hypotheses support uniqueness and which boundary can stop a classical solution."
      },
      {
        "lessonId": "separable-ode",
        "purpose": "Preserve equilibria and selected nonconstant branches before the power substitutions that follow."
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
        "lessonId": "implicit-logarithmic",
        "purpose": "Justify local implicit branches before inverse, geometric or exact-equation applications."
      },
      {
        "lessonId": "ftc",
        "purpose": "Justify accumulation derivatives and finite endpoint evaluation before later operations."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Supply derivative-sign and attainment arguments used to prove global branch conditions."
      },
      {
        "lessonId": "ode-exact-bernoulli",
        "purpose": "Construct a potential without losing a variable-dependent constant, then compare level curves with solution graphs and invert the Bernoulli substitution on its valid branch."
      },
      {
        "lessonId": "complex",
        "purpose": "Supply complex conjugate roots and their real oscillatory modes."
      },
      {
        "lessonId": "second-order-ode",
        "purpose": "Use two independent homogeneous modes, add a correct forced response and impose both initial data on the total solution."
      },
      {
        "lessonId": "boundary-data",
        "purpose": "After the complete second-order family is known, impose two-point values and classify compatible, singular and zero-frequency cases."
      }
    ],
    "readiness": [
      {
        "lessonId": "linear-ode",
        "exerciseId": "linear-gaussian-factor",
        "prompt": "Choose the integrating factor and verify the residual, initial value and interval."
      },
      {
        "lessonId": "ode-exact-bernoulli",
        "exerciseId": "exact-circle-graph-endpoint",
        "prompt": "Distinguish a continuing implicit level curve from a solution graph that ends at a vertical tangent."
      },
      {
        "lessonId": "ode-exact-bernoulli",
        "exerciseId": "reciprocal-global-minimum",
        "prompt": "Recover the Bernoulli solution and prove its denominator stays positive for every real time."
      },
      {
        "lessonId": "second-order-ode",
        "exerciseId": "off-frequency-response",
        "prompt": "Fit both initial data to the forced solution and justify its boundedness."
      },
      {
        "lessonId": "second-order-ode",
        "exerciseId": "repeated-homogeneous-mode",
        "prompt": "Retain the second independent mode for a repeated root and verify the data."
      },
      {
        "lessonId": "existence-uniqueness",
        "exerciseId": "lipschitz-with-a-corner",
        "prompt": "Use an actual Lipschitz estimate when a sufficient derivative test fails."
      },
      {
        "lessonId": "boundary-data",
        "exerciseId": "forced-endpoint-fit",
        "prompt": "Fit a forced second-order equation at two endpoints and verify the residual and both values."
      },
      {
        "lessonId": "boundary-data",
        "exerciseId": "frequency-compatibility",
        "prompt": "Classify unique, absent and nonunique solutions, treating zero frequency separately."
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
