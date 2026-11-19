// Draft prerequisite-closed routes; admission remains pending.
export const seriesExtensionPaths=[
  {
    "id": "series-generating-coefficients",
    "title": "Generating functions from power-series operations",
    "summary": "Build one justified coefficient-encoding route, ending with finite selection and factorial normalization.",
    "objectives": [
      "Preserve initial coefficients in recurrence identities.",
      "Distinguish formal coefficient extraction from convergent evaluation."
    ],
    "readiness": [
      {
        "lessonId": "generating",
        "exerciseId": "weighted-pair-extraction",
        "prompt": "Extract distinct weighted pairs and remove repeated selections."
      },
      {
        "lessonId": "generating",
        "exerciseId": "factorial-growth-two-encodings",
        "prompt": "Prove the different convergence domains of the ordinary and exponential encodings."
      }
    ],
    "revision": 1,
    "kind": "core",
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Keep factorization, indices, signs and expression restrictions exact."
      },
      {
        "lessonId": "functions",
        "purpose": "Identify domains and the meaning of composition before limiting operations."
      },
      {
        "lessonId": "trig",
        "purpose": "Establish the elementary function context needed by the prerequisite limits lessons."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Distinguish a limit from finite observations and keep its quantifiers explicit."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Define a series through finite cutoffs with correct endpoint terms."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Establish derivatives before using derivative tests and power-series calculus."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Use positive real logarithms and the inverse relation between logarithm and exponential."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Check derivative identities and monotonicity hypotheses."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Interpret finite definite integrals before comparison arguments."
      },
      {
        "lessonId": "ftc",
        "purpose": "Evaluate the finite comparison integrals that justify later limits."
      },
      {
        "lessonId": "convergence-tests",
        "purpose": "Choose a valid convergence test and distinguish absolute and conditional convergence."
      },
      {
        "lessonId": "series-errors",
        "purpose": "Prove explicit bounds for an entire omitted tail."
      },
      {
        "lessonId": "analysis",
        "purpose": "Understand uniform control and conditions for exchanging limits."
      },
      {
        "lessonId": "parts",
        "purpose": "Retain finite integration boundary terms before Taylor remainder estimates."
      },
      {
        "lessonId": "taylor-remainders",
        "purpose": "Control finite expansion errors before claiming infinite representations."
      },
      {
        "lessonId": "power-series",
        "purpose": "Justify power-series operations inside the radius and check endpoints separately."
      },
      {
        "lessonId": "generating",
        "purpose": "Encode sequences and extract coefficients with the normalization and evaluation domain stated."
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
    "id": "series-order-and-products",
    "title": "Conditional order and positive infinite products",
    "summary": "Move from convergent series and tail bounds to rearrangements and controlled logarithmic product limits.",
    "objectives": [
      "Check a permutation and every unfinished cutoff.",
      "Classify a product using its positive factors and logarithmic defects."
    ],
    "readiness": [
      {
        "lessonId": "rearrangements",
        "exerciseId": "sparse-double-order",
        "prompt": "Compute both iterated orders and square cutoffs, and identify the missing global absolute bound."
      },
      {
        "lessonId": "products",
        "exerciseId": "normalized-positive-product",
        "prompt": "Cancel the linear log drift and prove the exact threshold and a nonzero enclosure."
      },
      {
        "lessonId": "products",
        "exerciseId": "ordered-exponential-factors",
        "prompt": "Transfer the proved greedy series order to two distinct positive product limits."
      }
    ],
    "revision": 1,
    "kind": "core",
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Keep factorization, indices, signs and expression restrictions exact."
      },
      {
        "lessonId": "functions",
        "purpose": "Identify domains and the meaning of composition before limiting operations."
      },
      {
        "lessonId": "trig",
        "purpose": "Establish the elementary function context needed by the prerequisite limits lessons."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Distinguish a limit from finite observations and keep its quantifiers explicit."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Define a series through finite cutoffs with correct endpoint terms."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Establish derivatives before using derivative tests and power-series calculus."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Use positive real logarithms and the inverse relation between logarithm and exponential."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Check derivative identities and monotonicity hypotheses."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Interpret finite definite integrals before comparison arguments."
      },
      {
        "lessonId": "ftc",
        "purpose": "Evaluate the finite comparison integrals that justify later limits."
      },
      {
        "lessonId": "convergence-tests",
        "purpose": "Choose a valid convergence test and distinguish absolute and conditional convergence."
      },
      {
        "lessonId": "series-errors",
        "purpose": "Prove explicit bounds for an entire omitted tail."
      },
      {
        "lessonId": "rearrangements",
        "purpose": "Control a new order through absolute tails or an explicit finite-cutoff argument."
      },
      {
        "lessonId": "products",
        "purpose": "Classify positive product limits through finite logarithms and a proved quadratic bound."
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
