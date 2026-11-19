export const multivariableExtensionPaths=[
  {
    "id": "multi-limits-methods",
    "revision": 1,
    "kind": "core",
    "title": "Multivariable limits and differentiability",
    "summary": "Use domain-wide bounds to prove limits, curved paths to disprove them, and a first-order remainder test to decide differentiability.",
    "objectives": [
      "State a limit relative to its domain and distinguish it from a path limit.",
      "Construct an estimate that controls every nearby point.",
      "Distinguish continuity, partial derivatives, directional derivatives and differentiability."
    ],
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Manipulate rational expressions, squares and constraints while preserving their domains."
      },
      {
        "lessonId": "functions",
        "purpose": "Read domains, graphs, composition and the distinction between an input point and a function value."
      },
      {
        "lessonId": "trig",
        "purpose": "Use radian parametrizations and trigonometric identities, including orientation along circles."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Use punctured-domain limits and exact algebra before discussing several-variable approaches."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Interpret a derivative as a limit of difference quotients."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Use the elementary exponential and logarithmic rules when differentiating functions of several variables."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Compute the ordinary derivatives needed on slices, paths and constraint parametrizations."
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Use norms, projections, orthonormal eigenvectors and quadratic forms."
      },
      {
        "lessonId": "multi-local",
        "purpose": "Introduce partial derivatives, gradients, tangent planes and unit versus velocity directions."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Supply the actual mean-value theorem and derivative-sign comparisons used in the new proofs."
      },
      {
        "lessonId": "multi-limits",
        "purpose": "Separate relative limits, continuity and differentiability using uniform distance bounds and curved witnesses."
      }
    ],
    "readiness": [
      {
        "lessonId": "multi-limits",
        "exerciseId": "continuous-not-linear",
        "prompt": "Prove continuity with an all-path bound and then decide differentiability by the normalized remainder."
      },
      {
        "lessonId": "multi-limits",
        "exerciseId": "domain-cusp-limit",
        "prompt": "Keep the relative domain in both the bound and the candidate counterexample."
      }
    ],
    "review": {
      "status": "draft"
    }
  },
  {
    "id": "multi-constraints-methods",
    "revision": 1,
    "kind": "core",
    "title": "Global constrained extrema",
    "summary": "Find feasible candidates, handle active boundaries, and prove global bounds with equality points rather than stopping at multiplier equations.",
    "objectives": [
      "Check regularity for one or two equality constraints.",
      "Compare all boundary pieces and verify global attainment.",
      "Use orthogonal coordinates and squares to optimize quadratic forms."
    ],
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Manipulate rational expressions, squares and constraints while preserving their domains."
      },
      {
        "lessonId": "functions",
        "purpose": "Read domains, graphs, composition and the distinction between an input point and a function value."
      },
      {
        "lessonId": "trig",
        "purpose": "Use radian parametrizations and trigonometric identities, including orientation along circles."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Use punctured-domain limits and exact algebra before discussing several-variable approaches."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Interpret a derivative as a limit of difference quotients."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Use the elementary exponential and logarithmic rules when differentiating functions of several variables."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Compute the ordinary derivatives needed on slices, paths and constraint parametrizations."
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Use norms, projections, orthonormal eigenvectors and quadratic forms."
      },
      {
        "lessonId": "multi-local",
        "purpose": "Introduce partial derivatives, gradients, tangent planes and unit versus velocity directions."
      },
      {
        "lessonId": "multi-chain",
        "purpose": "Differentiate a composition along a path and use the regular implicit-function setting."
      },
      {
        "lessonId": "multi-critical",
        "purpose": "Identify interior, regular-boundary and singular candidates before the stronger global examples."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Interpret definite integrals as signed accumulation."
      },
      {
        "lessonId": "inequalities",
        "purpose": "Use Cauchy–Schwarz and explicit equality cases for global certificates."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Supply the actual mean-value theorem and derivative-sign comparisons used in the new proofs."
      },
      {
        "lessonId": "multi-constraints",
        "purpose": "Compare all feasible boundary cases and prove attained quadratic or projection bounds."
      }
    ],
    "readiness": [
      {
        "lessonId": "multi-constraints",
        "exerciseId": "rotated-quadratic-sphere",
        "prompt": "Find every quadratic equality point and prove the global bounds."
      },
      {
        "lessonId": "multi-constraints",
        "exerciseId": "unbounded-constraint-attainment",
        "prompt": "Separate attainment of a minimum from unboundedness of the feasible set."
      }
    ],
    "review": {
      "status": "draft"
    }
  },
  {
    "id": "vector-calculus-methods",
    "revision": 1,
    "kind": "core",
    "title": "Line integrals and planar boundary theorems",
    "summary": "Distinguish scalar accumulation from directed work, use a genuine potential for endpoint evaluation, and check the region and orientation in Green’s theorem.",
    "objectives": [
      "Parametrize a directed curve and distinguish work from scalar arc-length accumulation.",
      "Construct and verify a potential on its actual domain.",
      "Use Green’s theorem with correct boundary orientation, including a region with a hole."
    ],
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Manipulate rational expressions, squares and constraints while preserving their domains."
      },
      {
        "lessonId": "functions",
        "purpose": "Read domains, graphs, composition and the distinction between an input point and a function value."
      },
      {
        "lessonId": "trig",
        "purpose": "Use radian parametrizations and trigonometric identities, including orientation along circles."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Use punctured-domain limits and exact algebra before discussing several-variable approaches."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Interpret a derivative as a limit of difference quotients."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Use the elementary exponential and logarithmic rules when differentiating functions of several variables."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Compute the ordinary derivatives needed on slices, paths and constraint parametrizations."
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Use norms, projections, orthonormal eigenvectors and quadratic forms."
      },
      {
        "lessonId": "multi-local",
        "purpose": "Introduce partial derivatives, gradients, tangent planes and unit versus velocity directions."
      },
      {
        "lessonId": "multi-chain",
        "purpose": "Differentiate a composition along a path and use the regular implicit-function setting."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Interpret definite integrals as signed accumulation."
      },
      {
        "lessonId": "ftc",
        "purpose": "Turn derivatives along a path or coordinate slice into endpoint and face differences."
      },
      {
        "lessonId": "substitution",
        "purpose": "Justify one-variable reparametrization and the elementary substitutions used in the integral prerequisites."
      },
      {
        "lessonId": "parts",
        "purpose": "Retain boundary terms when integration by parts is used in a convergence argument."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Connect finite sums with limits before studying improper integration."
      },
      {
        "lessonId": "improper",
        "purpose": "Distinguish convergence from formal cancellation before changing integral representations."
      },
      {
        "lessonId": "multiple-integrals",
        "purpose": "Describe planar regions and justify the order of proper double integration."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Supply the actual mean-value theorem and derivative-sign comparisons used in the new proofs."
      },
      {
        "lessonId": "vector-calculus",
        "purpose": "Build work/scalar line integrals, verified potentials and the circulation form of Green’s theorem."
      }
    ],
    "readiness": [
      {
        "lessonId": "vector-calculus",
        "exerciseId": "mass-versus-work",
        "prompt": "Distinguish scalar speed accumulation from signed work."
      },
      {
        "lessonId": "vector-calculus",
        "exerciseId": "ellipse-around-hole",
        "prompt": "Use the actual punctured domain and correct hole orientation."
      }
    ],
    "review": {
      "status": "draft"
    }
  },
  {
    "id": "vector-surfaces-methods",
    "revision": 1,
    "kind": "core",
    "title": "Surface flux and boundary theorems",
    "summary": "Build oriented area elements from cross products, distinguish surface area from flux, and select a boundary theorem with all of its geometric hypotheses.",
    "objectives": [
      "Calculate a graph’s scalar and oriented area elements.",
      "Match a surface normal with its induced boundary orientation.",
      "Use Stokes’ theorem for circulation and the divergence theorem for outward flux.",
      "Set up the triple integrals needed for boxes and vertically sliced solids."
    ],
    "steps": [
      {
        "lessonId": "algebra",
        "purpose": "Manipulate rational expressions, squares and constraints while preserving their domains."
      },
      {
        "lessonId": "functions",
        "purpose": "Read domains, graphs, composition and the distinction between an input point and a function value."
      },
      {
        "lessonId": "trig",
        "purpose": "Use radian parametrizations and trigonometric identities, including orientation along circles."
      },
      {
        "lessonId": "limit-foundations",
        "purpose": "Use punctured-domain limits and exact algebra before discussing several-variable approaches."
      },
      {
        "lessonId": "derivative-meaning",
        "purpose": "Interpret a derivative as a limit of difference quotients."
      },
      {
        "lessonId": "exp-log",
        "purpose": "Use the elementary exponential and logarithmic rules when differentiating functions of several variables."
      },
      {
        "lessonId": "derivative-rules",
        "purpose": "Compute the ordinary derivatives needed on slices, paths and constraint parametrizations."
      },
      {
        "lessonId": "linear-algebra",
        "purpose": "Use norms, projections, orthonormal eigenvectors and quadratic forms."
      },
      {
        "lessonId": "multi-local",
        "purpose": "Introduce partial derivatives, gradients, tangent planes and unit versus velocity directions."
      },
      {
        "lessonId": "multi-chain",
        "purpose": "Differentiate a composition along a path and use the regular implicit-function setting."
      },
      {
        "lessonId": "accumulation",
        "purpose": "Interpret definite integrals as signed accumulation."
      },
      {
        "lessonId": "ftc",
        "purpose": "Turn derivatives along a path or coordinate slice into endpoint and face differences."
      },
      {
        "lessonId": "substitution",
        "purpose": "Justify one-variable reparametrization and the elementary substitutions used in the integral prerequisites."
      },
      {
        "lessonId": "parts",
        "purpose": "Retain boundary terms when integration by parts is used in a convergence argument."
      },
      {
        "lessonId": "partial-sums",
        "purpose": "Connect finite sums with limits before studying improper integration."
      },
      {
        "lessonId": "improper",
        "purpose": "Distinguish convergence from formal cancellation before changing integral representations."
      },
      {
        "lessonId": "multiple-integrals",
        "purpose": "Describe planar regions and justify the order of proper double integration."
      },
      {
        "lessonId": "derivative-shape",
        "purpose": "Supply the actual mean-value theorem and derivative-sign comparisons used in the new proofs."
      },
      {
        "lessonId": "vector-calculus",
        "purpose": "Build work/scalar line integrals, verified potentials and the circulation form of Green’s theorem."
      },
      {
        "lessonId": "coordinates",
        "purpose": "Use planar polar coordinates, the Jacobian and single-cover domain checks."
      },
      {
        "lessonId": "vector-surfaces",
        "purpose": "Build the cross product and vertical-volume bridge before regular graph flux, Stokes and divergence."
      }
    ],
    "readiness": [
      {
        "lessonId": "vector-surfaces",
        "exerciseId": "close-paraboloid-with-sides",
        "prompt": "Identify every boundary piece, its normal and its added flux before applying divergence."
      },
      {
        "lessonId": "vector-surfaces",
        "exerciseId": "replace-curl-surface",
        "prompt": "Check the field, integrand and induced orientation when replacing a Stokes surface."
      }
    ],
    "review": {
      "status": "draft"
    }
  }
];
