// Authored routes integrated from independently reviewed source; exposure admission remains pending.
export const seriesPaths=[
  {
    "id": "series-convergence-errors",
    "revision": 1,
    "title": "Series convergence tests and remainder bounds",
    "summary": "Build from finite partial sums and finite integrals to justified convergence decisions and quantitative tails.",
    "objectives": [
      "Choose and justify a convergence test.",
      "Separate absolute and conditional convergence.",
      "Track a tail index and prove its error guarantee."
    ],
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Use exact factorization, conjugates, sign intervals and restrictions in all later algebra."
      },
      {
        "lessonId": "functions",
        "purpose": "Identify formula domains and composition inputs before applying a test."
      },
      {
        "lessonId": "trig",
        "purpose": "Supply the bounded sine factors and periodic coefficients used by limits and later cancellation."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Establish positive logarithm domains and exponential identities before calculus."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Understand the quantifiers and valid transformations behind limiting comparisons."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Define the derivative as a local rate before using rules to check monotonicity."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Differentiate powers and logarithmic compositions to verify test hypotheses."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Interpret signed integrals and primitives before integral comparisons."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Define an infinite sum through finite partial sums and retain their endpoint terms."
      },
      {
        "lessonId": "ftc",
        "purpose": "Evaluate the finite integrals that will be sent to a tail limit."
      },
      {
        "lessonId": "convergence-tests",
        "purpose": "Choose a convergence test and prove all of its applicable hypotheses."
      },
      {
        "lessonId": "series-errors",
        "purpose": "Turn convergence into a remainder guarantee with exact indexing."
      }
    ],
    "readiness": [
      {
        "lessonId": "convergence-tests",
        "exerciseId": "factorial-in-two-positions",
        "prompt": "Cancel factorials in both orientations and distinguish the two ratio-test conclusions."
      },
      {
        "lessonId": "convergence-tests",
        "exerciseId": "alternating-two-exponents",
        "prompt": "Prove ordinary convergence and test absolute convergence separately."
      },
      {
        "lessonId": "series-errors",
        "exerciseId": "factorial-geometric-tail",
        "prompt": "Bound every term of an omitted tail using one explicit valid geometric ratio."
      }
    ],
    "review": {
      "status": "draft"
    },
    "kind": "core"
  },
  {
    "id": "series-power-cancellation",
    "revision": 1,
    "title": "Power series and cancellation by summation by parts",
    "summary": "After numerical-series tests, justify analytic power-series operations and then control conditional cancellation.",
    "objectives": [
      "Check power-series endpoints separately.",
      "Justify a termwise operation strictly inside its radius.",
      "Distinguish Dirichlet, Abel testing and an Abel boundary limit."
    ],
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Use exact factorization, conjugates, sign intervals and restrictions in all later algebra."
      },
      {
        "lessonId": "functions",
        "purpose": "Identify formula domains and composition inputs before applying a test."
      },
      {
        "lessonId": "trig",
        "purpose": "Supply the bounded sine factors and periodic coefficients used by limits and later cancellation."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Establish positive logarithm domains and exponential identities before calculus."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Understand the quantifiers and valid transformations behind limiting comparisons."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Define the derivative as a local rate before using rules to check monotonicity."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Differentiate powers and logarithmic compositions to verify test hypotheses."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Interpret signed integrals and primitives before integral comparisons."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Define an infinite sum through finite partial sums and retain their endpoint terms."
      },
      {
        "lessonId": "ftc",
        "purpose": "Evaluate the finite integrals that will be sent to a tail limit."
      },
      {
        "lessonId": "convergence-tests",
        "purpose": "Choose a convergence test and prove all of its applicable hypotheses."
      },
      {
        "lessonId": "series-errors",
        "purpose": "Turn convergence into a remainder guarantee with exact indexing."
      },
      {
        "lessonId": "parts",
        "purpose": "Learn finite boundary terms and the integration method used in the Taylor remainder lesson."
      },
      {
        "lessonId": "taylor-remainders",
        "purpose": "Control finite Taylor errors before asserting an infinite representation."
      },
      {
        "lessonId": "analysis",
        "purpose": "Distinguish pointwise from uniform estimates and invalid exchanges of limits."
      },
      {
        "lessonId": "power-series",
        "purpose": "Use the radius and compact-interval bounds to justify power-series calculus."
      },
      {
        "lessonId": "summation-parts",
        "purpose": "Keep finite discrete boundary terms while exploiting bounded partial sums."
      }
    ],
    "readiness": [
      {
        "lessonId": "convergence-tests",
        "exerciseId": "factorial-in-two-positions",
        "prompt": "Cancel factorials in both orientations and distinguish the two ratio-test conclusions."
      },
      {
        "lessonId": "convergence-tests",
        "exerciseId": "alternating-two-exponents",
        "prompt": "Prove ordinary convergence and test absolute convergence separately."
      },
      {
        "lessonId": "series-errors",
        "exerciseId": "factorial-geometric-tail",
        "prompt": "Bound every term of an omitted tail using one explicit valid geometric ratio."
      },
      {
        "lessonId": "power-series",
        "exerciseId": "weighted-geometric-center",
        "prompt": "Restore the exponent factor, inspect both endpoints and evaluate the correctly centered sum."
      },
      {
        "lessonId": "summation-parts",
        "exerciseId": "quarter-turn-log-weight",
        "prompt": "Bound periodic partial sums and prove both conditional convergence and a tail estimate."
      }
    ],
    "review": {
      "status": "draft"
    },
    "kind": "core"
  }
];
