export const odeContinuationPaths=[
  {
    "id": "ode-variation-methods",
    "revision": 1,
    "kind": "core",
    "title": "Variation of parameters and forced-response kernels",
    "summary": "Derive a particular solution from two homogeneous modes, preserve initial data, and recognize when an exact integral is the useful answer.",
    "objectives": [
      "Derive the two coefficient equations and identify the nonzero Wronskian condition.",
      "Use a fixed integration base to separate zero-data forcing from the initial state.",
      "Verify variable-coefficient and constant-coefficient responses on their actual domains."
    ],
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Factor, simplify and solve while keeping track of forbidden values and reversible steps."
      },
      {
        "lessonId": "functions",
        "purpose": "Read a function as a rule together with its allowed inputs, and check what happens when rules are composed or reversed."
      },
      {
        "lessonId": "trig",
        "purpose": "Use the unit circle to control signs, angles and the branches of inverse trigonometric functions."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Use cancellation, one-sided analysis, rationalization and squeeze with their precise conditions."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Build the derivative from a difference quotient, interpret its units, and recognize when the two sides disagree."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Use logarithms to turn products into sums without losing positivity, absolute values or the meaning of a variable exponent."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Use a formula’s structure to choose a rule, retain every changing factor, and check the domain before simplifying."
      },
      {
        "lessonId": "ode-meaning",
        "purpose": "Check a proposed function by its residual and initial data; read direction and equilibria from the equation."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate a net change from a total area, and use antiderivatives with their domains and constants."
      },
      {
        "lessonId": "linear-ode",
        "purpose": "Normalize the equation, choose an integrating factor on the correct interval, and verify the complete solution with its initial value."
      },
      {
        "lessonId": "complex",
        "purpose": "Use real and imaginary coordinates, polar form and explicit branch choices before applying complex methods."
      },
      {
        "lessonId": "existence-uniqueness",
        "purpose": "Supply uniqueness, maximal intervals and the compact-continuation mechanism."
      },
      {
        "lessonId": "second-order-ode",
        "purpose": "Supply homogeneous modes, total-solution fitting, repeated roots and the vector form of a second-order initial-value problem."
      },
      {
        "lessonId": "ftc",
        "purpose": "Differentiate finite base-point integrals with their boundary terms."
      },
      {
        "lessonId": "parts",
        "purpose": "Derive coefficient primitives and transform derivative identities without dropping endpoints."
      },
      {
        "lessonId": "ode-variation",
        "purpose": "Derive the nonzero-Wronskian forced response and verify exact quadratures."
      }
    ],
    "readiness": [
      {
        "lessonId": "ode-variation",
        "exerciseId": "hyperbolic-response",
        "prompt": "Can you obtain the same total solution from a kernel and a simple trial?"
      },
      {
        "lessonId": "ode-variation",
        "exerciseId": "quadrature-response",
        "prompt": "Can you justify a response by differentiation without an elementary primitive?"
      }
    ],
    "review": {
      "status": "draft"
    }
  },
  {
    "id": "ode-energy-methods",
    "revision": 1,
    "kind": "core",
    "title": "Energy, turning points and travel times",
    "summary": "Use a conserved quantity to bound motion, then prove whether the bound is reached; contrast conservative motion with dissipation.",
    "objectives": [
      "Derive a first integral without dividing by a velocity that may vanish.",
      "Use the connected accessible energy region and a continuation theorem to justify global motion.",
      "Distinguish finite turning-point travel, asymptotic approach and a dissipative energy estimate."
    ],
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Factor, simplify and solve while keeping track of forbidden values and reversible steps."
      },
      {
        "lessonId": "functions",
        "purpose": "Read a function as a rule together with its allowed inputs, and check what happens when rules are composed or reversed."
      },
      {
        "lessonId": "trig",
        "purpose": "Use the unit circle to control signs, angles and the branches of inverse trigonometric functions."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Use cancellation, one-sided analysis, rationalization and squeeze with their precise conditions."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Build the derivative from a difference quotient, interpret its units, and recognize when the two sides disagree."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Use logarithms to turn products into sums without losing positivity, absolute values or the meaning of a variable exponent."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Use a formula’s structure to choose a rule, retain every changing factor, and check the domain before simplifying."
      },
      {
        "lessonId": "ode-meaning",
        "purpose": "Check a proposed function by its residual and initial data; read direction and equilibria from the equation."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate a net change from a total area, and use antiderivatives with their domains and constants."
      },
      {
        "lessonId": "linear-ode",
        "purpose": "Normalize the equation, choose an integrating factor on the correct interval, and verify the complete solution with its initial value."
      },
      {
        "lessonId": "complex",
        "purpose": "Use real and imaginary coordinates, polar form and explicit branch choices before applying complex methods."
      },
      {
        "lessonId": "existence-uniqueness",
        "purpose": "Supply uniqueness, maximal intervals and the compact-continuation mechanism."
      },
      {
        "lessonId": "second-order-ode",
        "purpose": "Supply homogeneous modes, total-solution fitting, repeated roots and the vector form of a second-order initial-value problem."
      },
      {
        "lessonId": "separable-ode",
        "purpose": "Supply signed branch separation while retaining equilibrium solutions."
      },
      {
        "lessonId": "ftc",
        "purpose": "Differentiate finite base-point integrals with their boundary terms."
      },
      {
        "lessonId": "substitution",
        "purpose": "Reverse the chain rule while tracking the differential, endpoint order and any inverse branches."
      },
      {
        "lessonId": "parts",
        "purpose": "Derive coefficient primitives and transform derivative identities without dropping endpoints."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Track indexing, uncover cancellation, and distinguish vanishing terms from convergent totals."
      },
      {
        "lessonId": "improper",
        "purpose": "Test the transform integral and turning-time endpoints before interpreting the result."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Supply monotonicity, mean-value estimates and attained-bound distinctions."
      },
      {
        "lessonId": "ode-energy",
        "purpose": "Derive conservative and dissipative identities, choose an accessible component and prove travel-time attainment."
      }
    ],
    "readiness": [
      {
        "lessonId": "ode-energy",
        "exerciseId": "pendulum-quarter-time",
        "prompt": "Can you prove finite travel and the least return period?"
      },
      {
        "lessonId": "ode-energy",
        "exerciseId": "damped-energy-bound",
        "prompt": "Can you prove compact continuation and avoid an unsupported asymptotic claim?"
      }
    ],
    "review": {
      "status": "draft"
    }
  },
  {
    "id": "ode-laplace-methods",
    "revision": 1,
    "kind": "core",
    "title": "Laplace transforms, initial data and step forcing",
    "summary": "Convert a forward initial-value problem into algebra while keeping boundary terms, transform convergence and switching conditions visible.",
    "objectives": [
      "Derive the basic real Laplace transform and derivative formulas under sufficient hypotheses.",
      "Recover solutions using algebraic decompositions and direct verification.",
      "Distinguish delayed functions, bounded forcing switches and impulses."
    ],
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Factor, simplify and solve while keeping track of forbidden values and reversible steps."
      },
      {
        "lessonId": "functions",
        "purpose": "Read a function as a rule together with its allowed inputs, and check what happens when rules are composed or reversed."
      },
      {
        "lessonId": "trig",
        "purpose": "Use the unit circle to control signs, angles and the branches of inverse trigonometric functions."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Use cancellation, one-sided analysis, rationalization and squeeze with their precise conditions."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Build the derivative from a difference quotient, interpret its units, and recognize when the two sides disagree."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Use logarithms to turn products into sums without losing positivity, absolute values or the meaning of a variable exponent."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Use a formula’s structure to choose a rule, retain every changing factor, and check the domain before simplifying."
      },
      {
        "lessonId": "ode-meaning",
        "purpose": "Check a proposed function by its residual and initial data; read direction and equilibria from the equation."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate a net change from a total area, and use antiderivatives with their domains and constants."
      },
      {
        "lessonId": "linear-ode",
        "purpose": "Normalize the equation, choose an integrating factor on the correct interval, and verify the complete solution with its initial value."
      },
      {
        "lessonId": "complex",
        "purpose": "Use real and imaginary coordinates, polar form and explicit branch choices before applying complex methods."
      },
      {
        "lessonId": "existence-uniqueness",
        "purpose": "Supply uniqueness, maximal intervals and the compact-continuation mechanism."
      },
      {
        "lessonId": "second-order-ode",
        "purpose": "Supply homogeneous modes, total-solution fitting, repeated roots and the vector form of a second-order initial-value problem."
      },
      {
        "lessonId": "ftc",
        "purpose": "Differentiate finite base-point integrals with their boundary terms."
      },
      {
        "lessonId": "substitution",
        "purpose": "Reverse the chain rule while tracking the differential, endpoint order and any inverse branches."
      },
      {
        "lessonId": "parts",
        "purpose": "Derive coefficient primitives and transform derivative identities without dropping endpoints."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Track indexing, uncover cancellation, and distinguish vanishing terms from convergent totals."
      },
      {
        "lessonId": "improper",
        "purpose": "Test the transform integral and turning-time endpoints before interpreting the result."
      },
      {
        "lessonId": "rational-trig",
        "purpose": "Supply partial-fraction algebra for rational transform expressions."
      },
      {
        "lessonId": "growth",
        "purpose": "Justify polynomial times decaying exponential boundary limits and exponential-order estimates."
      },
      {
        "lessonId": "ode-laplace",
        "purpose": "Turn forward initial data and bounded switches into algebra, then verify piecewise solutions."
      }
    ],
    "readiness": [
      {
        "lessonId": "ode-laplace",
        "exerciseId": "repeated-transform-pole",
        "prompt": "Can you preserve all initial-data terms at a repeated pole?"
      },
      {
        "lessonId": "ode-laplace",
        "exerciseId": "unshifted-ramp-input",
        "prompt": "Can you distinguish a delayed input from an activated unshifted one?"
      }
    ],
    "review": {
      "status": "draft"
    }
  },
  {
    "id": "ode-frobenius-methods",
    "revision": 1,
    "kind": "core",
    "title": "Power-series solutions and regular-singular Frobenius methods",
    "summary": "Derive coefficient recurrences, justify convergent solutions, and detect a resonant obstruction without confusing formal algebra with a function.",
    "objectives": [
      "Distinguish ordinary points, regular singular points and analytic coefficient hypotheses.",
      "Construct convergent series using indexed coefficient identities and ratio bounds.",
      "Check resonant recurrence compatibility instead of dividing by zero or predicting logarithms from root spacing alone."
    ],
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Factor, simplify and solve while keeping track of forbidden values and reversible steps."
      },
      {
        "lessonId": "functions",
        "purpose": "Read a function as a rule together with its allowed inputs, and check what happens when rules are composed or reversed."
      },
      {
        "lessonId": "trig",
        "purpose": "Use the unit circle to control signs, angles and the branches of inverse trigonometric functions."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Use cancellation, one-sided analysis, rationalization and squeeze with their precise conditions."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Build the derivative from a difference quotient, interpret its units, and recognize when the two sides disagree."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Use logarithms to turn products into sums without losing positivity, absolute values or the meaning of a variable exponent."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Use a formula’s structure to choose a rule, retain every changing factor, and check the domain before simplifying."
      },
      {
        "lessonId": "ode-meaning",
        "purpose": "Check a proposed function by its residual and initial data; read direction and equilibria from the equation."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Separate a net change from a total area, and use antiderivatives with their domains and constants."
      },
      {
        "lessonId": "linear-ode",
        "purpose": "Normalize the equation, choose an integrating factor on the correct interval, and verify the complete solution with its initial value."
      },
      {
        "lessonId": "complex",
        "purpose": "Use real and imaginary coordinates, polar form and explicit branch choices before applying complex methods."
      },
      {
        "lessonId": "existence-uniqueness",
        "purpose": "Supply uniqueness, maximal intervals and the compact-continuation mechanism."
      },
      {
        "lessonId": "second-order-ode",
        "purpose": "Supply homogeneous modes, total-solution fitting, repeated roots and the vector form of a second-order initial-value problem."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Track indexing, uncover cancellation, and distinguish vanishing terms from convergent totals."
      },
      {
        "lessonId": "ftc",
        "purpose": "Differentiate finite base-point integrals with their boundary terms."
      },
      {
        "lessonId": "convergence-tests",
        "purpose": "Choose a test from the structure of the terms, check its hypotheses, and distinguish convergence from a value for the sum."
      },
      {
        "lessonId": "series-errors",
        "purpose": "Turn convergence into a quantitative guarantee, keeping the first omitted index, the sign of a tail and the distinction between a bound and an exact error."
      },
      {
        "lessonId": "analysis",
        "purpose": "Understand what an estimate must control before exchanging a limit with integration, differentiation or another operation."
      },
      {
        "lessonId": "parts",
        "purpose": "Derive coefficient primitives and transform derivative identities without dropping endpoints."
      },
      {
        "lessonId": "taylor-remainders",
        "purpose": "Match derivatives exactly at a center, then prove how far the polynomial can be trusted using a remainder bound."
      },
      {
        "lessonId": "power-series",
        "purpose": "Supply absolute and local uniform convergence and the stronger theorem for termwise differentiation."
      },
      {
        "lessonId": "ode-reduction",
        "purpose": "Supply Euler singular equations and known-solution reduction before resonant Frobenius exceptions."
      },
      {
        "lessonId": "ode-frobenius",
        "purpose": "Build ordinary and regular-singular series with convergence and recurrence compatibility checks."
      }
    ],
    "readiness": [
      {
        "lessonId": "ode-frobenius",
        "exerciseId": "resonance-obstruction",
        "prompt": "Can you detect an incompatible recurrence and prove the other branch converges?"
      },
      {
        "lessonId": "ode-frobenius",
        "exerciseId": "ordinary-data-recurrence",
        "prompt": "Can you track both parity channels and justify the infinite series?"
      }
    ],
    "review": {
      "status": "draft"
    }
  }
];
