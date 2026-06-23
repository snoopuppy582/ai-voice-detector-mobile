# AI Voice Scam Detector

AI Voice Scam Detector is a multilingual Android app for checking suspicious short voice samples with on-device acoustic signals.

The app records a microphone sample, analyzes it locally, and returns an AI voice estimate with a confidence score. It is a lightweight scam/deepfake audio checker, not legal evidence, identity verification, medical advice, security proof, or a guaranteed detector.

## Current Scope

- Expo SDK 56 / React Native 0.85 Android app
- `expo-audio` PCM microphone stream
- On-device acoustic analysis only
- English and Korean interface
- No account, ads, analytics, crash SDK, cloud inference, or server upload in the current MVP
- Google Play assets under `store-assets/`

## Current Release Status

- Current release candidate: `v8`
- Android package: `com.snoopuppy582.aivoicedetector`
- App version: `1.0.0`
- Android versionCode: `8`
- Play upload AAB: `builds/AI_Voice_Scam_Detector_production_v8.aab`
- Production v8 AAB SHA256: `43ED4E7DC550AC9E9C61126EE33AC15A8AF6D9FF682DB115F680662509703081`
- Latest EAS production build ID: `4bb8379c-bdf6-48c0-a748-e434a547e03f`
- v8 preview APK: not generated because the Expo Free plan Android build quota was exhausted
- Public privacy policy: `https://snoopuppy582.github.io/ai-voice-detector-mobile/privacy-policy.html`

The current workspace refactors the same v7 SVM app source into `src/` modules after the production v8 AAB was built. Use the v8 AAB only if you intentionally submit that previously built artifact. For exact source-to-artifact traceability from this folder, create a new production AAB and update `docs/BUILD_NOTES.md`.

## Acoustic Model

The deployed classifier is a compact linear soft-margin SVM in `src/model/linearSvmModel.js`. It combines HNR-style harmonicity, HF Ratio, CPPS-style cepstral signal, F0 variation/range, voiced-frame ratio, spectral flatness, spectral centroid, and ZCR.

The app avoids hard claims such as `low F0 variation means AI voice`. F0 variation is one normalized feature among several, and results near the boundary are shown as uncertain. See `docs/ML_EVALUATION.md` for validation details and caveats.

## Run

```bash
npm install
npm start
```

For Android:

```bash
npm run android
```

A real Android device is preferred. Emulator microphone behavior is often unreliable for voice-quality testing.

## Verify

```bash
npm run doctor
npx expo export --platform android --output-dir dist-android
```

## Build

```bash
npm run build:apk
npm run build:aab
```

- `build:apk`: internal install/test APK
- `build:aab`: Google Play Android App Bundle

Record new EAS build IDs, artifact URLs, local paths, SHA256 hashes, permissions, and verification commands in `docs/BUILD_NOTES.md`.

## Store And Play

- Play Console submission, store listing copy, closed testing, and launch notes: `docs/PLAY_LAUNCH.md`
- Privacy policy source and public page: `docs/PRIVACY_POLICY.md`, `docs/privacy-policy.html`
- Store image inventory: `store-assets/STORE_ASSETS_MANIFEST.md`
- Asset refresh plan for the next image pass: `docs/DESIGN_ASSETS.md`

Regenerate current image assets:

```bash
python store-assets/source/render_store_assets.py
```

## Documentation Map

- `READCODEX.md`: current operating notes for future Codex sessions
- `핸드오프문서.md`: compact current handoff and prior raw-context summary
- `docs/BUILD_NOTES.md`: release build IDs, local artifacts, hashes, and verification status
- `docs/ML_EVALUATION.md`: local dataset validation summary for the embedded SVM
- `docs/PLAY_LAUNCH.md`: Play upload, Data Safety, closed testing, tester scripts, listing copy, and launch notes
- `docs/DESIGN_ASSETS.md`: asset redesign direction, prompt seeds, and acceptance checklist
- `docs/PRIVACY_POLICY.md`: privacy policy source
- `docs/privacy-policy.html`: public GitHub Pages privacy policy content
- `store-assets/STORE_ASSETS_MANIFEST.md`: generated image asset inventory

## Important Limitation

The app is an acoustic estimate tool. Synthetic voice detection research generally uses normalized feature sets and classifiers, not one absolute threshold. Keep UI, README, Play Store, and privacy copy in estimate/probability language.
