export const concentrationAndTransformsTierUse = {
  "nonuniform": [
    {
      "tier": "hard",
      "topic": "limits",
      "concept": "parameters",
      "role": "core",
      "explanation": "Follow a moving peak and compare fixed and rescaled inputs to distinguish pointwise convergence from uniform convergence.",
      "anchors": [
        "locate-the-layer",
        "example-exponential-layer-area"
      ]
    },
    {
      "tier": "hard",
      "topic": "limits",
      "concept": "interchange",
      "role": "core",
      "explanation": "Decide whether a limit can pass through an integral by computing the area in a shrinking strip and controlling the remaining mass.",
      "anchors": [
        "width-times-height",
        "weighted-observation",
        "exercise-rational-layer-mass"
      ]
    },
    {
      "tier": "olympiad",
      "topic": "limits",
      "concept": "singular",
      "role": "foundation",
      "explanation": "Use exact rescaling and a fixed-neighborhood tail estimate for one-sided concentration before attempting less explicit singular limits.",
      "anchors": [
        "weighted-observation",
        "exercise-rational-layer-mass"
      ]
    }
  ],
  "fourier-transforms": [
    {
      "tier": "olympiad",
      "topic": "mixed",
      "concept": "recognition",
      "role": "core",
      "explanation": "Combine parity, the finite interval and opposite translations to distinguish the original frequency zeros from the ones introduced by displacement.",
      "anchors": [
        "even-real-input",
        "continuity-and-shifts",
        "exercise-compact-cosine-window-resonances"
      ]
    },
    {
      "tier": "olympiad",
      "topic": "integration",
      "concept": "transforms",
      "role": "foundation",
      "explanation": "Build a real cosine integral from the whole-line transform convention and prove frequency continuity from absolute integrability. Inversion requires additional theory.",
      "anchors": [
        "whole-line-transform",
        "even-real-input",
        "continuity-and-shifts"
      ]
    }
  ]
};
