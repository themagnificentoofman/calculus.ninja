// Separate prerequisite-closed branches; no forced chain of unrelated methods.
export const odeMethodPaths=[
  {
    "id": "ode-exact-bernoulli-methods",
    "revision": 1,
    "kind": "core",
    "title": "Exact equations and Bernoulli substitutions",
    "summary": "Find a constant potential or a linear transformed equation while retaining the solution graph, lost branches and interval of validity.",
    "objectives": [
      "Verify and construct a potential for an exact equation.",
      "Distinguish an implicit level curve from a single-valued solution graph.",
      "Derive the Bernoulli substitution and restore solutions excluded by division.",
      "Use initial data, sign conditions and denominator zeros to choose the actual solution interval."
    ],
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Preserve domains while rearranging equations, fractions and powers."
      },
      {
        "lessonId": "functions",
        "purpose": "Choose function domains and distinguish a function from one of its values."
      },
      {
        "lessonId": "trig",
        "purpose": "Use radians, signs and trigonometric identities for oscillatory solutions."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Distinguish limits, continuity and one-sided behavior at interval boundaries."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Interpret derivatives as rates before verifying a differential equation."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Use real exponential and logarithm identities on their allowed domains."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Differentiate products and compositions when changing variables or testing a solution."
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Use vector components, matrix multiplication, eigenvectors and norms."
      },
      {
        "lessonId": "multi-local",
        "purpose": "Differentiate a potential along a graph using partial derivatives and a path derivative."
      },
      {
        "lessonId": "implicit-logarithmic",
        "purpose": "Check the nonzero derivative coefficient before treating a level curve as a graph."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Interpret an integral as a signed accumulated change."
      },
      {
        "lessonId": "ftc",
        "purpose": "Connect a potential or antiderivative to its derivative and endpoint values."
      },
      {
        "lessonId": "ode-meaning",
        "purpose": "Verify the equation, initial conditions and solution interval together."
      },
      {
        "lessonId": "linear-ode",
        "purpose": "Solve a first-order linear equation with its homogeneous term and integrating factor."
      },
      {
        "lessonId": "existence-uniqueness",
        "purpose": "Use local uniqueness and continuation with the actual time-state domain."
      },
      {
        "lessonId": "separable-ode",
        "purpose": "Separate on a valid nonzero branch and restore excluded equilibria."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Use derivative signs, monotonicity and mean-value reasoning to justify global claims."
      },
      {
        "lessonId": "ode-exact-bernoulli",
        "purpose": "After path differentiation, implicit graphs and first-order methods, construct a potential or linear power substitution and justify the chosen branch."
      }
    ],
    "readiness": [
      {
        "lessonId": "ode-exact-bernoulli",
        "exerciseId": "exact-circle-graph-endpoint",
        "prompt": "Distinguish a complete level curve from its differentiable solution graph at vertical tangencies."
      },
      {
        "lessonId": "ode-exact-bernoulli",
        "exerciseId": "reciprocal-global-minimum",
        "prompt": "Prove the transformed denominator never vanishes before claiming a global branch."
      }
    ],
    "review": {
      "status": "draft"
    }
  },
  {
    "id": "ode-reduction-methods",
    "revision": 1,
    "kind": "core",
    "title": "Euler–Cauchy equations and reduction of order",
    "summary": "Change the independent variable on a fixed sign interval, or use one known homogeneous solution to reduce a second-order equation to first order.",
    "objectives": [
      "Derive the logarithmic-time transformation for an Euler–Cauchy equation.",
      "Transform derivative initial data with the correct sign.",
      "Reduce order using a known nonvanishing solution and retain its constant multiple.",
      "Distinguish a method boundary from a genuine boundary of the posed differential equation."
    ],
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Preserve domains while rearranging equations, fractions and powers."
      },
      {
        "lessonId": "functions",
        "purpose": "Choose function domains and distinguish a function from one of its values."
      },
      {
        "lessonId": "trig",
        "purpose": "Use radians, signs and trigonometric identities for oscillatory solutions."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Distinguish limits, continuity and one-sided behavior at interval boundaries."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Interpret derivatives as rates before verifying a differential equation."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Use real exponential and logarithm identities on their allowed domains."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Differentiate products and compositions when changing variables or testing a solution."
      },
      {
        "lessonId": "ode-meaning",
        "purpose": "Verify the equation, initial conditions and solution interval together."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Interpret an integral as a signed accumulated change."
      },
      {
        "lessonId": "linear-ode",
        "purpose": "Solve a first-order linear equation with its homogeneous term and integrating factor."
      },
      {
        "lessonId": "complex",
        "purpose": "Connect conjugate characteristic roots with real oscillatory modes."
      },
      {
        "lessonId": "existence-uniqueness",
        "purpose": "Use local uniqueness and continuation with the actual time-state domain."
      },
      {
        "lessonId": "second-order-ode",
        "purpose": "Build independent constant-coefficient modes and fit two initial data."
      },
      {
        "lessonId": "ode-reduction",
        "purpose": "After constant-coefficient second-order solutions and first-order integrating factors, change logarithmic time or factor out one known mode."
      }
    ],
    "readiness": [
      {
        "lessonId": "ode-reduction",
        "exerciseId": "negative-euler-interval",
        "prompt": "Transform the velocity with its negative-time sign and preserve the posed domain."
      },
      {
        "lessonId": "ode-reduction",
        "exerciseId": "known-mode-zero",
        "prompt": "Verify global continuation in the original equation after removing a method restriction."
      }
    ],
    "review": {
      "status": "draft"
    }
  },
  {
    "id": "ode-systems-methods",
    "revision": 1,
    "kind": "core",
    "title": "Constant linear systems, Jordan modes and stability",
    "summary": "Solve planar constant linear systems through eigenvectors, a short Jordan chain or rotation, and distinguish stability from attraction using the actual solutions.",
    "objectives": [
      "Verify a vector solution component by component and fit its initial vector.",
      "Use independent eigenvectors when they exist and a polynomial time factor for a defective repeated eigenvalue.",
      "Read the direction and frequency of a real rotation.",
      "Prove stability or instability using an all-time bound or a small growing mode, and distinguish attraction."
    ],
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Preserve domains while rearranging equations, fractions and powers."
      },
      {
        "lessonId": "functions",
        "purpose": "Choose function domains and distinguish a function from one of its values."
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Use vector components, matrix multiplication, eigenvectors and norms."
      },
      {
        "lessonId": "trig",
        "purpose": "Use radians, signs and trigonometric identities for oscillatory solutions."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Distinguish limits, continuity and one-sided behavior at interval boundaries."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Interpret derivatives as rates before verifying a differential equation."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Use real exponential and logarithm identities on their allowed domains."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Differentiate products and compositions when changing variables or testing a solution."
      },
      {
        "lessonId": "ode-meaning",
        "purpose": "Verify the equation, initial conditions and solution interval together."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Interpret an integral as a signed accumulated change."
      },
      {
        "lessonId": "linear-ode",
        "purpose": "Solve a first-order linear equation with its homogeneous term and integrating factor."
      },
      {
        "lessonId": "existence-uniqueness",
        "purpose": "Use local uniqueness and continuation with the actual time-state domain."
      },
      {
        "lessonId": "ode-systems",
        "purpose": "After matrix/vector algebra, scalar linear equations and initial-value meaning, construct planar vector solutions and prove stability directly."
      }
    ],
    "readiness": [
      {
        "lessonId": "ode-systems",
        "exerciseId": "rotation-without-attraction",
        "prompt": "Prove stability for arbitrary initial vectors and distinguish it from attraction."
      },
      {
        "lessonId": "ode-systems",
        "exerciseId": "zero-eigenvalue-defect",
        "prompt": "Compare two systems with identical eigenvalues using their actual solution matrices."
      }
    ],
    "review": {
      "status": "draft"
    }
  },
  {
    "id": "ode-nonlinear-methods",
    "revision": 1,
    "kind": "core",
    "title": "Phase lines and Riccati equations with a known solution",
    "summary": "Use scalar signs and uniqueness to prove long-term behavior, then use a supplied particular solution to turn a Riccati equation into a linear one.",
    "objectives": [
      "Classify scalar equilibria using signs on both sides and the stated stability definition.",
      "Prove invariance, forward continuation and the limiting equilibrium before claiming a first hitting time.",
      "Derive a reciprocal linear equation from a supplied Riccati particular solution.",
      "Restore the excluded particular branch and distinguish a pole from an imposed coefficient-domain boundary."
    ],
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Preserve domains while rearranging equations, fractions and powers."
      },
      {
        "lessonId": "functions",
        "purpose": "Choose function domains and distinguish a function from one of its values."
      },
      {
        "lessonId": "trig",
        "purpose": "Use radians, signs and trigonometric identities for oscillatory solutions."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Distinguish limits, continuity and one-sided behavior at interval boundaries."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Interpret derivatives as rates before verifying a differential equation."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Use real exponential and logarithm identities on their allowed domains."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Differentiate products and compositions when changing variables or testing a solution."
      },
      {
        "lessonId": "ode-meaning",
        "purpose": "Verify the equation, initial conditions and solution interval together."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Interpret an integral as a signed accumulated change."
      },
      {
        "lessonId": "existence-uniqueness",
        "purpose": "Use local uniqueness and continuation with the actual time-state domain."
      },
      {
        "lessonId": "separable-ode",
        "purpose": "Separate on a valid nonzero branch and restore excluded equilibria."
      },
      {
        "lessonId": "linear-ode",
        "purpose": "Solve a first-order linear equation with its homogeneous term and integrating factor."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Use derivative signs, monotonicity and mean-value reasoning to justify global claims."
      },
      {
        "lessonId": "ode-nonlinear",
        "purpose": "After separation, uniqueness/continuation and derivative signs, prove phase-line behavior and reduce a supplied Riccati solution to a linear deviation equation."
      }
    ],
    "readiness": [
      {
        "lessonId": "ode-nonlinear",
        "exerciseId": "rational-growth-first-hit",
        "prompt": "Prove existence and uniqueness of the first hit before evaluating its elapsed-time integral."
      },
      {
        "lessonId": "ode-nonlinear",
        "exerciseId": "oscillatory-particular-global-branch",
        "prompt": "Track the nonzero deviation, its interval and the excluded particular solution."
      }
    ],
    "review": {
      "status": "draft"
    }
  }
];
