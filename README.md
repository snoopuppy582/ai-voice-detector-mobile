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

