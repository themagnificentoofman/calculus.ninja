// Authored draft topic/tier routes; admission and exposure remain pending.
export const strategyPaths=[
  {
    "id": "easy-mixed",
    "title": "Easy Mixed: quantities, graphs and discrete totals",
    "summary": "Connect domains, rates, signed accumulation and finite sums, then choose the requested objects in exact graph and delivery records.",
    "objectives": [
      "Identify the requested object and its domain, sign, scale and units.",
      "Construct and interpret a polygonal rate graph from exact vertices and verify it algebraically.",
      "Distinguish a finite total, the next contribution and the whole infinite remainder."
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
        "purpose": "Begin with the allowed inputs and distinguish a composition from a formula without a domain."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Compare logarithmic expressions whose algebraic appearance hides different real domains."
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
        "purpose": "Connect a secant and tangent picture to exact slope and local-change formulas, including physical units."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Supply the elementary, product, quotient and chain calculations used by later steps."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Switch deliberately between signed accumulation and geometric area when the requested object changes."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Add a second object distinction: an individual term, a retained finite sum and an infinite limit."
      },
      {
        "lessonId": "strategy-object",
        "purpose": "Apply the object distinctions to new graph and discrete records without a supplied method; verify the results with units and a second representation."
      }
    ],
    "readiness": [
      {
        "lessonId": "functions",
        "exerciseId": "composition-domain",
        "prompt": "Find the complete real domain, including its permitted and excluded endpoints."
      },
      {
        "lessonId": "exp-log",
        "exerciseId": "log-magnitude",
        "prompt": "Explain why the two related logarithmic equations have different solution sets."
      },
      {
        "lessonId": "strategy-object",
        "exerciseId": "tank-record",
        "prompt": "Select the requested amounts, maximum and instantaneous rate from a graph, then verify them algebraically."
      },
      {
        "lessonId": "strategy-object",
        "exerciseId": "pulse-record",
        "prompt": "Distinguish the finite total, next delivery and whole tail, and justify the least count meeting a strict tolerance."
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
    "id": "medium-mixed",
    "title": "Medium Mixed: integral and series method selection",
    "summary": "Choose between useful representations for finite integrals and geometric-series calculus, then separate exact evaluation from a justified error certificate.",
    "objectives": [
      "State the requested object and choose an applicable representation before calculating.",
      "Compare two valid routes while keeping domains, endpoint speeds and finite terms.",
      "Prove the convergence or remainder condition needed by an infinite calculation."
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
        "lessonId": "partial-sums",
        "purpose": "Make convergence a limit of finite indexed sums, including every surviving endpoint term."
      },
      {
        "lessonId": "strategy-object",
        "purpose": "Settle which quantity and representation the request needs before comparing more elaborate techniques."
      },
      {
        "lessonId": "ftc",
        "purpose": "Use endpoint motion to distinguish a changing integral’s value from its derivative."
      },
      {
        "lessonId": "substitution",
        "purpose": "Recognize the chain-rule structure and verify the transformed domain and endpoint direction."
      },
      {
        "lessonId": "parts",
        "purpose": "Use the product rule in reverse and check that finite boundary data survive."
      },
      {
        "lessonId": "rational-trig",
        "purpose": "Choose an algebraic simplification before integrating, then recognize the resulting primitive kernels."
      },
      {
        "lessonId": "taylor-remainders",
        "purpose": "Compare an exact finite algebraic remainder with a valid derivative-based bound rather than assuming both lose the same information."
      },
      {
        "lessonId": "convergence-tests",
        "purpose": "Prove the series convergence needed before an error bound or power-series operation."
      },
      {
        "lessonId": "series-errors",
        "purpose": "Control the whole omitted tail before using an infinite representation."
      },
      {
        "lessonId": "analysis",
        "purpose": "Distinguish pointwise from uniform control before exchanging a limit and an operation."
      },
      {
        "lessonId": "power-series",
        "purpose": "Complete the connection from geometric partial sums to a differentiable interior function, retaining the factor and endpoint tests."
      },
      {
        "lessonId": "strategy-choice",
        "purpose": "Choose and justify a calculation without a method label, verify a second representation, and distinguish exact area from a certified truncation."
      }
    ],
    "readiness": [
      {
        "lessonId": "taylor-remainders",
        "exerciseId": "exact-geometric-remainder",
        "prompt": "Compare an exact finite remainder with the independently justified Lagrange bound."
      },
      {
        "lessonId": "ftc",
        "exerciseId": "crossing-endpoints",
        "prompt": "Keep the endpoint speeds even when an accumulated value is zero."
      },
      {
        "lessonId": "strategy-choice",
        "exerciseId": "exact-integral-record",
        "prompt": "Choose a useful representation, evaluate exactly and check the same integral through another calculation."
      },
      {
        "lessonId": "strategy-choice",
        "exerciseId": "series-defined-area",
        "prompt": "Choose routes to an exact area and a strict error claim, justify the infinite step and test the boundary expression."
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
