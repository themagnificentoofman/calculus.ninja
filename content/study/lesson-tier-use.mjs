// The previous relationship revision remains available for exact historical review.
import {lessonTierUse as prior} from './lesson-tier-use-2026111804.mjs';

export const lessonTierUse = {
  ...prior,
  nonuniform: [...prior.nonuniform, {
    tier: 'olympiad', topic: 'integration', concept: 'asymptotics', role: 'foundation',
    explanation: 'Rescale an endpoint layer to find the part of an integral that survives in the limit. Track the change of width, then bound the remaining tail before passing to the limit.',
    anchors: ['locate-the-layer', 'width-times-height', 'weighted-observation', 'example-exponential-layer-area'],
  }],
  'fourier-orthogonality': [...prior['fourier-orthogonality'], {
    tier: 'olympiad', topic: 'integration', concept: 'asymptotics', role: 'foundation',
    explanation: 'Prove decay for a rapidly oscillating sine with linear phase. Bound a short endpoint interval and integrate by parts on the remaining smooth pieces. Stationary points of a nonlinear phase require further methods.',
    anchors: ['oscillatory-lemma'],
  }],
};

export const lessonTierUseReview = {status: 'draft', revision: 2026111901};
