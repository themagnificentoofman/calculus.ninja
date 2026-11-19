export const advancedSequenceFourierTierUse={
  "stolz-cesaro": [
    {
      "tier": "hard",
      "topic": "limits",
      "concept": "sequences",
      "role": "core",
      "explanation": "Prove and apply the finite-limit theorem for an eventually increasing denominator tending to positive infinity; assess a cumulative ratio and a transformed recurrence.",
      "anchors": [
        "theorem",
        "telescoping-proof",
        "exercise-weighted-oscillation",
        "exercise-decaying-recurrence",
        "boundary-cases"
      ]
    },
    {
      "tier": "medium",
      "topic": "limits",
      "concept": "sequences",
      "role": "extension",
      "explanation": "Extend established recurrence convergence to a normalized rate after proving positivity and the behavior of the iterates.",
      "anchors": [
        "recurrence-normalization",
        "example-growing-recurrence"
      ]
    },
    {
      "tier": "olympiad",
      "topic": "limits",
      "concept": "normalization",
      "role": "foundation",
      "explanation": "Practice a power or reciprocal normalization whose increments reveal a rate. More delicate asymptotic scales require further estimates.",
      "anchors": [
        "example-growing-recurrence",
        "exercise-decaying-recurrence"
      ]
    }
  ],
  "fourier-orthogonality": [
    {
      "tier": "olympiad",
      "topic": "series",
      "concept": "transforms",
      "role": "core",
      "explanation": "Derive real Fourier coefficients and finite orthogonal projections, then prove the pointwise convergence rule for the specified piecewise smooth functions. General transform inversion is a further topic.",
      "anchors": [
        "orthogonality",
        "coefficients",
        "finite-projection",
        "pointwise-convergence",
        "exercise-half-period-ramp"
      ]
    },
    {
      "tier": "hard",
      "topic": "series",
      "concept": "uniform",
      "role": "core",
      "explanation": "Contrast the proved pointwise limit with the impossibility of uniform convergence across a jump.",
      "anchors": [
        "limits-of-the-conclusion",
        "example-two-level-periodic-function",
        "exercise-half-period-ramp"
      ]
    },
    {
      "tier": "hard",
      "topic": "series",
      "concept": "operations",
      "role": "foundation",
      "explanation": "Keep coefficient integrals and finite projections separate from operations on an infinite expansion. Termwise differentiation needs its own theorem.",
      "anchors": [
        "coefficients",
        "finite-projection",
        "boundary-cases"
      ]
    },
    {
      "tier": "olympiad",
      "topic": "integration",
      "concept": "transforms",
      "role": "foundation",
      "explanation": "Learn periodic coefficient integrals and finite orthogonality before studying transform convolution or inversion. Those broader integral methods are not established here.",
      "anchors": [
        "coefficients",
        "oscillatory-lemma",
        "pointwise-convergence"
      ]
    },
    {
      "tier": "olympiad",
      "topic": "mixed",
      "concept": "extremal",
      "role": "foundation",
      "explanation": "Use a finite projection and an explicit coefficient constraint to solve an exact least-squares problem. This supplies finite quadratic geometry rather than general spectral theory.",
      "anchors": [
        "finite-projection",
        "exercise-constrained-approximation"
      ]
    }
  ]
};
