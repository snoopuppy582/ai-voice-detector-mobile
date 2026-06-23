# ML Evaluation Summary

Generated on: 2026-06-23 from local dataset `03_metrics_table.csv`.

Rechecked on 2026-06-24 by rerunning `ml-eval/evaluate_app_classifier.py` in the private validation workspace. The rerun reproduced best model `svm_linear_c0.1` with sentence-grouped balanced accuracy `0.9553`.

## Dataset

- Total rows: `280`
- Human rows: `220`
- AI rows: `60`
- Sentence groups: `10`
- Human speakers: `22`
- AI sources: `kling3.0`, `sora2pro`, `veo3.1`

The CSV includes `f0_std_hz`, HNR, HF ratios, and voiced ratio. It does not include CPPS. For v7 calibration, CPPS-style signal, spectral flatness, spectral centroid, ZCR, and app-aligned HNR/F0/HF features were re-extracted from `analysis_wav_path` at 16 kHz to match the app feature extractor more closely.

## Validation Design

- Primary validation: sentence-grouped 5-fold CV.
- Stress validation: entity-grouped CV, holding out speakers / AI sources.
- Optimistic reference: row-stratified CV only.
- Excluded leakage-prone fields: file paths, source names, source scope, take index, entity id, sentence id, and transcript-derived speed fields.

## Selected Model

- Model: linear soft-margin SVM, `C=0.1`
- Feature set: app-aligned 10 features
- Deployment form: scaler means/stds, weight vector, intercept, and two tri-state decision thresholds in `src/model/linearSvmModel.js`

Sentence-grouped CV:

- Balanced accuracy: `0.9553`
- AI precision / recall / F1: `0.9180` / `0.9333` / `0.9256`
- ROC AUC: `0.9817`
- Confusion matrix [human TN, human->AI FP, AI->human FN, AI TP]: `215`, `5`, `4`, `56`

Tri-state app thresholds:

- Likely human: decision `<= -0.5`
- Likely AI: decision `>= 0`
- Uncertain: middle region or very low voiced ratio
- Certain coverage: `0.9607`
- Certain-only confusion [TN, FP, FN, TP]: `206`, `5`, `2`, `56`

Entity-grouped stress CV for the same model:

- Balanced accuracy: `0.9220`
- AI precision / recall / F1: `0.9123` / `0.8667` / `0.8889`
- Confusion matrix [TN, FP, FN, TP]: `215`, `5`, `8`, `52`

## Recommendations

- Keep the SVM as the deployable model because it materially improves over the v6 heuristic while staying small enough for on-device JavaScript.
- Continue to use `Uncertain` near the boundary. This reduces overconfident calls on ordinary human voices and weak recordings.
- Treat CPPS as `CPPS-style`, not as a formal clinical CPPS measurement.
- Do not claim guaranteed AI detection. Keep store copy and in-app copy in estimate/probability language.
- Next data improvement: add more AI engines and real phone-microphone recordings, then repeat speaker/source holdout validation before producing a final Play production AAB.

Full artifacts were generated under local `ml-eval/` in the validation workspace. Dataset-derived CSVs and model artifacts are intentionally kept local unless privacy review approves publishing them:

- `evaluation_report.md`
- `classifier_leaderboard.csv`
- `app_linear_svm_export.json`
- `best_app_linear_svm.joblib`
- `best_oof_predictions.csv`
