export const intervalAndEnergyTierUse = {
  "spectral": [
    {
      "tier": "olympiad",
      "topic": "ode",
      "concept": "comparison",
      "role": "core",
      "explanation": "Use a boundary energy identity to restrict the sign, classify zero-slope modes, and recover the compatibility condition for a prescribed forcing with endpoint jumps.",
      "anchors": [
        "boundary-energy",
        "example-coupled-endpoint-jumps",
        "exercise-zero-slope-spectrum"
      ]
    },
    {
      "tier": "olympiad",
      "topic": "mixed",
      "concept": "extremal",
      "role": "foundation",
      "explanation": "Use a mean constraint to remove the constant solution and identify the smallest remaining eigenvalue from the ordered frequencies.",
      "anchors": [
        "frequency-selection",
        "exercise-zero-slope-spectrum"
      ]
    }
  ],
  "variational": [
    {
      "tier": "olympiad",
      "topic": "multivariable",
      "concept": "parameters",
      "role": "core",
      "explanation": "Apply a quadratic comparison to a function with endpoint and signed-area constraints. One integration by parts certifies the minimum over all admissible curves.",
      "anchors": [
        "energy-difference",
        "attainment-and-uniqueness",
        "exercise-prescribed-area-energy"
      ]
    },
    {
      "tier": "olympiad",
      "topic": "mixed",
      "concept": "extremal",
      "role": "foundation",
      "explanation": "Construct an admissible curve with a constant or affine weighted derivative. Compare it with every competitor and use equality in the square to prove uniqueness.",
      "anchors": [
        "competitor-difference",
        "example-weighted-bridge",
        "exercise-prescribed-area-energy"
      ]
    }
  ]
};
