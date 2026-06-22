# AI Voice Scam Detector

AI Voice Scam Detector is a multilingual Android app for checking suspicious short voice samples with on-device acoustic signals.

The app records a microphone sample, analyzes it locally, and returns an AI voice estimate with a confidence score. It is designed as a lightweight scam/deepfake audio checker, not as legal evidence, identity verification, medical advice, or a guaranteed detector.

## Current Scope

- Expo SDK 56 / React Native 0.85 Android app
- `expo-audio` PCM microphone stream
- On-device acoustic analysis only
- English and Korean interface
- No account, ads, analytics, crash SDK, cloud inference, or server upload in the current MVP
- Google Play assets under `store-assets/`

## Current Release Status

Current release candidate: `v6`

- Android package: `com.snoopuppy582.aivoicedetector`
- App version: `1.0.0`
- Android versionCode: `6`
- Play upload AAB: `builds/AI_Voice_Scam_Detector_production_v6.aab`
- Direct install APK: `builds/AI_Voice_Scam_Detector_preview_v6.apk`
- Public privacy policy: `https://snoopuppy582.github.io/ai-voice-detector-mobile/privacy-policy.html`
- Release details and hashes: `docs/BUILD_NOTES.md`
- Play Console quick guide: `docs/PLAY_CONSOLE_LAUNCH_GUIDE.md`

Completed so far:

- English/Korean app UI
- Local microphone recording and PCM analysis
- On-device feature extraction with no cloud/API inference
- Google Play icon, feature graphic, screenshots, privacy policy, and listing draft
- v6 scoring adjustment to reduce normal male-voice false positives by increasing HF Ratio influence, treating low HF Ratio as stronger human evidence, and requiring stronger high-frequency/spectral evidence before returning `Likely AI voice`
- EAS production AAB and preview APK builds
- Basic verification with `node --check App.js`, `npm run doctor`, Android export, privacy URL check, and AAB manifest permission inspection

## Acoustic Signals

The current heuristic combines several lightweight features:

- HNR-style harmonicity
- HF Ratio
- CPPS-style cepstral peak signal
- F0 variation and range
- Voiced-frame ratio
- Spectral flatness
- Spectral centroid
- Zero-crossing rate

These signals are combined conservatively. There is no hard rule such as `F0 std < 10 Hz means AI voice`; F0 variation is only a weak supporting signal because speaker, language, phone microphone, codec, noise, and speaking style can change it heavily.

## Next Work: Real-Sample SVM Calibration

The next major improvement is to replace or calibrate the hand-tuned boundary with an SVM trained on real human and AI voice samples. Do this on the computer that has access to the sample dataset.

Goal:

- Use the same feature family currently shown in the app.
- Train a lightweight classifier that can still run on-device.
- Reduce false positives on ordinary human voices, especially male voices.
- Keep the UI language as an estimate, not a guaranteed detector.

Recommended dataset setup:

- Keep raw audio outside this repository. Do not commit private voice samples.
- Create a balanced local dataset with labels: `human` and `ai`.
- Include male/female speakers, different microphones, quiet/noisy rooms, Korean/English speech, short clips, and different AI voice engines if available.
- Split by speaker or source, not randomly by clip, so the validation set is not too easy.

Recommended feature CSV:

```text
file,label,hnr,hf_ratio,cpps,f0_mean,f0_std,f0_range,voiced_ratio,spectral_flatness,spectral_centroid,zcr,duration
```

Suggested SVM workflow:

1. Reproduce the app's feature extraction as closely as possible in Python or export features from test runs.
2. Normalize features with `StandardScaler`.
3. Train `SVC(kernel="linear")` first, then compare with `SVC(kernel="rbf")`.
4. Use cross-validation and a held-out validation set.
5. Track confusion matrix, precision, recall, false-positive rate on human voices, and false-negative rate on AI voices.
6. Tune for low human false positives before chasing high AI recall.
7. Convert the chosen model into a small on-device rule:
   - Linear SVM: export scaler means/stds, feature weights, and intercept into `App.js`.
   - RBF SVM: use only if model size and runtime remain acceptable on Android.
8. Rebuild the preview APK and test it on real Android microphones before creating the next AAB.

Do not use a single hard threshold such as `F0 std < 10 Hz` as the final detector. F0 variation can help, but should remain one feature among several.

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
node --check App.js
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

The latest release candidate and hashes are tracked in `docs/BUILD_NOTES.md`.

## Store Assets

Generated Play Console assets:

- `store-assets/icons/play_icon_512.png`
- `store-assets/feature_graphic/feature_graphic_1024x500.png`
- `store-assets/screenshots_phone/01_record_1080x1920.png`
- `store-assets/screenshots_phone/02_signals_1080x1920.png`
- `store-assets/screenshots_phone/03_result_1080x1920.png`
- `store-assets/screenshots_phone/04_privacy_1080x1920.png`

Regenerate:

```bash
python store-assets/source/render_store_assets.py
```

## Documentation Map

- `READCODEX.md`: handoff instructions for future Codex sessions
- `docs/BUILD_NOTES.md`: release build IDs, local artifacts, hashes, verification status
- `docs/PLAY_CONSOLE_LAUNCH_GUIDE.md`: Play Console submission steps
- `docs/STORE_LISTING_DRAFT.md`: English/Korean listing copy
- `docs/PRIVACY_POLICY.md` and `docs/privacy-policy.html`: privacy policy source and public page
- `store-assets/STORE_ASSETS_MANIFEST.md`: image asset inventory

## Important Limitation

The app is an acoustic estimate tool. Synthetic voice detection research generally uses normalized feature sets and classifiers, not one absolute threshold. Keep copy, UI, and Play Store text in estimate/probability language.
