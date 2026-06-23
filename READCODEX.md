# READCODEX

This file is for future Codex sessions continuing AI Voice Scam Detector. General project users should read `README.md` instead.

## Current Objective

Improve AI Voice Scam Detector as an English-first, globally targeted Android app that can plausibly reach 200+ downloads while staying honest about false positives and acoustic-estimate limitations.

## Operating Rules

- Do not introduce guaranteed detection language.
- Keep code, build docs, Play Console docs, privacy policy, and store copy aligned after every release build.
- Prefer official/primary sources for Play Console policy and speech-analysis claims.
- For image generation requests, use the `imagegen` skill first unless the user explicitly asks for a different path.
- Do not commit private voice samples or local `ml-eval/` artifacts without privacy review.
- The previous raw handoff used older workspace paths; its important model context is summarized in `핸드오프문서.md` and `docs/ML_EVALUATION.md`.

## Release Baseline

- App name: `AI Voice Scam Detector`
- Package: `com.snoopuppy582.aivoicedetector`
- App version: `1.0.0`
- Android versionCode: `8`
- Current release candidate artifact: `builds/AI_Voice_Scam_Detector_production_v8.aab`
- Production v8 AAB SHA256: `43ED4E7DC550AC9E9C61126EE33AC15A8AF6D9FF682DB115F680662509703081`
- Latest EAS production build ID: `4bb8379c-bdf6-48c0-a748-e434a547e03f`
- Latest scoring change: v7 linear soft-margin SVM calibrated from local `03_metrics_table.csv`
- Latest EAS preview APK build ID: not generated for v8 because the Expo Free plan Android build quota was exhausted
- Privacy URL: `https://snoopuppy582.github.io/ai-voice-detector-mobile/privacy-policy.html`
- GitHub: `https://github.com/snoopuppy582/ai-voice-detector-mobile`

The current workspace refactors the v7 SVM app source into `src/` modules after the production v8 AAB was built. If code or assets change after a release build, the existing AAB is no longer exact source-to-artifact proof. Rebuild production AAB, then update `app.json`, `docs/BUILD_NOTES.md`, `docs/PLAY_LAUNCH.md`, and any external quick guide.

## Active Truth Sources

- Release artifacts, hashes, permissions, and validation: `docs/BUILD_NOTES.md`
- SVM validation, model caveats, and local experiment summary: `docs/ML_EVALUATION.md`
- Play upload, Data Safety, closed testing, tester scripts, listing copy, and launch notes: `docs/PLAY_LAUNCH.md`
- Privacy policy wording: `docs/PRIVACY_POLICY.md` and `docs/privacy-policy.html`
- Store image inventory: `store-assets/STORE_ASSETS_MANIFEST.md`
- Next asset refresh plan: `docs/DESIGN_ASSETS.md`
- Current compact handoff: `핸드오프문서.md`

## Code Landmarks

- `App.js`: thin Expo entrypoint
- `src/App.js`: app UI, recording flow, permissions, and result rendering
- `src/audio/analysis.js`: on-device acoustic feature extraction
- `src/model/linearSvmModel.js`: SVM scaler, weights, thresholds, and score mapping
- `app.json`: Expo config, Android package, versionCode, blocked permissions

## Verification Commands

Before final handoff after source changes:

```bash
npm run doctor
npx expo export --platform android --output-dir dist-android
git status --short
```

If preparing a Play upload:

```bash
npm run build:aab
npm run build:apk
```

Record the new EAS build IDs, artifact URLs, local paths, SHA256 hashes, and manifest permissions in `docs/BUILD_NOTES.md`.

## Play Console Reminders

- Upload the latest production AAB only, not APK.
- Use the public privacy policy URL above.
- Current MVP Data Safety direction: no data collected/shared, assuming no analytics, crash reporting, ads, cloud inference, remote logs, or server upload is added.
- Explain microphone as app functionality for user-triggered local audio analysis.
- New personal Google Play developer accounts require closed testing before production access; recheck the official Play Console Help page before submission.
- Avoid `100% accurate`, `guaranteed`, `proof`, legal/medical/security-authentication claims, and official-agency implications.

## Cleanup Rules

- `builds/`: keep only current release-candidate artifacts in the active folder.
- `dist-android/`: generated verification output; delete when not actively inspecting exports.
- `.expo/`: generated cache/logs; delete if it causes confusion.
- `node_modules/`: never preserve for handoff; reinstall with `npm install`.
- `store-assets/`: keep tracked final assets plus source renderer.
- `docs/`: keep active docs compact; summarize superseded long-form notes into the relevant canonical doc before removing them.
