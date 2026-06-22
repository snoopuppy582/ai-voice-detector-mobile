# AI Voice Scam Detector

AI Voice Scam Detector is a multilingual Android MVP for checking short voice samples with on-device acoustic signals.

The app records a short microphone sample, calculates lightweight HNR, HF Ratio, and CPPS-style cepstral features on the device, and shows an AI voice estimate with a confidence score. The result is an acoustic estimate, not legal, medical, or security proof.

## Current Scope

- Expo SDK 56 / React Native 0.85 Android app
- `expo-audio` PCM microphone stream
- On-device HNR, HF Ratio, CPPS-style cepstral signal calculation
- English and Korean UI toggle
- No account requirement
- No server upload in the MVP
- Google Play store assets generated under `store-assets/`

## Run

```bash
npm install
npm start
```

For Android:

```bash
npm run android
```

This app needs a real Android device or an emulator with microphone input. Real device testing is preferred because Android emulator microphone behavior is not reliable enough for voice quality checks.

## Verify

```bash
node --check App.js
npx expo-doctor
npx expo export --platform android --output-dir dist-android
```

## Build

```bash
npm run build:apk
npm run build:aab
```

- `build:apk`: internal install/test APK
- `build:aab`: Google Play Android App Bundle

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

## Important Limitation

HNR, HF Ratio, and CPPS-style acoustic signals can be useful clues, but they cannot prove whether a voice is AI-generated. The app intentionally uses estimate/confidence language and avoids guaranteed detection claims.
