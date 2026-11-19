// Draft prerequisite-closed paths; admission remains pending.
export const specialIntegralPaths=[
  {
    "id": "spatial-volume-coordinates",
    "title": "Triple integrals and spatial coordinate changes",
    "summary": "Extend planar region and Jacobian checks to three-dimensional slices and cylindrical or spherical volume.",
    "objectives": [
      "Build all three bounds from one solid.",
      "Derive the volume factor and verify one-to-one angular coverage."
    ],
    "readiness": [
      {
        "lessonId": "coordinates-spatial",
        "exerciseId": "cartesian-tetrahedral-slices",
        "prompt": "Describe one solid in two correct integration orders."
      },
      {
        "lessonId": "coordinates-spatial",
        "exerciseId": "radial-singularity-threshold",
        "prompt": "Prove a radial convergence threshold using finite shell cutoffs."
      }
    ],
    "revision": 1,
    "kind": "core",
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Keep powers, equations, factorization and signs exact."
      },
      {
        "lessonId": "functions",
        "purpose": "State real domains before substitutions and inverse branches."
      },
      {
        "lessonId": "trig",
        "purpose": "Use radians and determine trigonometric signs on the chosen angle interval."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Define the limits used at improper endpoints."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Introduce derivatives before differentiating coordinate maps and boundary terms."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Interpret real powers through the natural exponential and logarithm."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Compute elementary derivatives and parameter-map entries."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Interpret a definite integral as signed accumulation."
      },
      {
        "lessonId": "ftc",
        "purpose": "Evaluate finite integrals before passing to improper limits."
      },
      {
        "lessonId": "substitution",
        "purpose": "Carry transformed endpoints and all differential factors."
      },
      {
        "lessonId": "parts",
        "purpose": "Derive recurrences with every finite boundary term retained."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Use finite cutoffs to distinguish a limit from a partial calculation."
      },
      {
        "lessonId": "improper",
        "purpose": "Prove separate endpoint and tail convergence."
      },
      {
        "lessonId": "multiple-integrals",
        "purpose": "Describe planar slices and justify positive or absolute integral interchange."
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Read vector coordinates, symmetric quadratic forms and an orthogonal eigenbasis."
      },
      {
        "lessonId": "multi-local",
        "purpose": "Establish partial derivatives used in a coordinate derivative matrix."
      },
      {
        "lessonId": "multi-chain",
        "purpose": "Compute the derivative matrix of a composed multivariable map."
      },
      {
        "lessonId": "coordinates",
        "purpose": "Check planar inverse branches, region translation and absolute Jacobians."
      },
      {
        "lessonId": "coordinates-spatial",
        "purpose": "Construct triple slices and derive cylindrical/spherical volume maps with coverage checks."
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
    "id": "special-integrals-and-moments",
    "title": "Beta and Gamma integrals through simplex and Gaussian moments",
    "summary": "Combine convergent one-variable special integrals, spatial volume and positive quadratic forms in exact normalization and moment calculations.",
    "objectives": [
      "Justify the special-function domain and each transformed measure.",
      "Distinguish raw mass, normalized moments and positive-definite Gaussian convergence."
    ],
    "readiness": [
      {
        "lessonId": "beta-gamma",
        "exerciseId": "rational-tail-parameter-range",
        "prompt": "Find both strict endpoint conditions before evaluating the Beta quotient."
      },
      {
        "lessonId": "multi-moments",
        "exerciseId": "tetrahedron-slack-moment",
        "prompt": "Recover every simplex parameter and verify a three-dimensional mass by slices."
      },
      {
        "lessonId": "multi-moments",
        "exerciseId": "gaussian-parameter-threshold",
        "prompt": "Prove the exact convergence threshold and retain the covariance normalization factor."
      }
    ],
    "revision": 1,
    "kind": "core",
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Keep powers, equations, factorization and signs exact."
      },
      {
        "lessonId": "functions",
        "purpose": "State real domains before substitutions and inverse branches."
      },
      {
        "lessonId": "trig",
        "purpose": "Use radians and determine trigonometric signs on the chosen angle interval."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Define the limits used at improper endpoints."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Introduce derivatives before differentiating coordinate maps and boundary terms."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Interpret real powers through the natural exponential and logarithm."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Compute elementary derivatives and parameter-map entries."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Interpret a definite integral as signed accumulation."
      },
      {
        "lessonId": "ftc",
        "purpose": "Evaluate finite integrals before passing to improper limits."
      },
      {
        "lessonId": "parts",
        "purpose": "Derive recurrences with every finite boundary term retained."
      },
      {
        "lessonId": "substitution",
        "purpose": "Carry transformed endpoints and all differential factors."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Use finite cutoffs to distinguish a limit from a partial calculation."
      },
      {
        "lessonId": "improper",
        "purpose": "Prove separate endpoint and tail convergence."
      },
      {
        "lessonId": "multiple-integrals",
        "purpose": "Describe planar slices and justify positive or absolute integral interchange."
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Read vector coordinates, symmetric quadratic forms and an orthogonal eigenbasis."
      },
      {
        "lessonId": "multi-local",
        "purpose": "Establish partial derivatives used in a coordinate derivative matrix."
      },
      {
        "lessonId": "multi-chain",
        "purpose": "Compute the derivative matrix of a composed multivariable map."
      },
      {
        "lessonId": "coordinates",
        "purpose": "Check planar inverse branches, region translation and absolute Jacobians."
      },
      {
        "lessonId": "beta-gamma",
        "purpose": "Prove positive-parameter normalization identities and their usable substitutions."
      },
      {
        "lessonId": "coordinates-spatial",
        "purpose": "Construct triple slices and derive cylindrical/spherical volume maps with coverage checks."
      },
      {
        "lessonId": "multi-moments",
        "purpose": "Derive simplex and positive-definite Gaussian moments with exact convergence and normalization."
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
