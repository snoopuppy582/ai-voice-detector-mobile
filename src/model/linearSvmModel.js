import { clamp } from '../utils/math';

export const LINEAR_SVM_MODEL = {
  // Order: hnr, hfRatio, cpps, f0Mean, f0Std, f0Range, voicedRatio, spectralFlatness, spectralCentroid, zcr.
  means: [
    2.096359419744551,
    0.0008997698195521911,
    9.110353300437263,
    130.11837626518235,
    31.26317939756632,
    140.33247919559972,
    0.8450357969046987,
    0.0024928983493653824,
    426.75571322590844,
    0.08859856559905437,
  ],
  scales: [
    1.5919866357292574,
    0.0015051045990674208,
    0.3465518509317387,
    23.28621418602766,
    18.426816099091567,
    88.76593264088487,
    0.09518580414336397,
    0.003939684101367465,
    187.19002125558325,
    0.03443683069697528,
  ],
  weights: [
    -0.33214132502551663,
    0.057457366679561375,
    -0.7332251104266105,
    0.22173994497970312,
    0.05767594931937886,
    -0.27867417951575907,
    0.20180398397140537,
    0.5907033981017875,
    0.7255058848245302,
    0.6631755473620784,
  ],
  intercept: -0.9202382765063358,
  humanDecisionCutoff: -0.5,
  aiDecisionCutoff: 0,
};

export function scoreWithLinearSvm(features) {
  const values = [
    features.hnr,
    features.hfRatio,
    features.cpps,
    features.f0Mean,
    features.f0Std,
    features.f0Range,
    features.voicedRatio,
    features.spectralFlatness,
    features.spectralCentroid,
    features.zcr,
  ];

  let decision = LINEAR_SVM_MODEL.intercept;
  values.forEach((value, index) => {
    const scale = LINEAR_SVM_MODEL.scales[index] || 1;
    decision += ((value - LINEAR_SVM_MODEL.means[index]) / scale) * LINEAR_SVM_MODEL.weights[index];
  });

  const aiScore = clamp(Math.round(100 / (1 + Math.exp(-4 * (decision + 0.25)))), 4, 96);
  const nearestBoundaryDistance =
    decision >= LINEAR_SVM_MODEL.aiDecisionCutoff
      ? decision - LINEAR_SVM_MODEL.aiDecisionCutoff
      : decision <= LINEAR_SVM_MODEL.humanDecisionCutoff
        ? LINEAR_SVM_MODEL.humanDecisionCutoff - decision
        : 0;
  const confidence = clamp(Math.round(56 + Math.min(nearestBoundaryDistance * 30, 38)), 45, 94);

  return {
    decision,
    aiScore,
    confidence,
  };
}
