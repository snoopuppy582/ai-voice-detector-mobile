# AI Voice Scam Detector Build Notes

Generated on: 2026-06-23

## Expo / EAS

- Expo account: `snoopy554`
- EAS project: `@snoopy554/ai-voice-detector-mobile`
- EAS project ID: `7aed659b-578d-4b00-b5e7-1fb29fb305b5`
- GitHub repo: `https://github.com/snoopuppy582/ai-voice-detector-mobile`
- Privacy policy URL: `https://snoopuppy582.github.io/ai-voice-detector-mobile/privacy-policy.html`

## Android App

- App name: `AI Voice Scam Detector`
- Package name: `com.snoopuppy582.aivoicedetector`
- Version: `1.0.0`
- Android versionCode: `6`
- Permissions in final AAB: `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`, app-local dynamic receiver permission
- Local audio processing: on-device only in the current MVP
- Privacy policy: public URL plus in-app link
- Acoustic features: HNR, HF Ratio, CPPS-style cepstral signal, F0 variation/range, voiced ratio, spectral flatness, spectral centroid, ZCR
- v6 scoring note: HF Ratio now has stronger influence, low-HF recordings are pulled more toward human voice, and AI classification requires stronger high-frequency/spectral evidence to reduce normal male-voice false positives.

## Production AAB

- Build ID: `08979062-065b-4dd4-b86d-47cc47e0d2ec`
- EAS logs: `https://expo.dev/accounts/snoopy554/projects/ai-voice-detector-mobile/builds/08979062-065b-4dd4-b86d-47cc47e0d2ec`
- Artifact URL: `https://expo.dev/artifacts/eas/hKaw6QMmg_OGRcj3Wq4I7BCEnqNqGltiOVoTB1IEf8M.aab`
- Local file: `builds/AI_Voice_Scam_Detector_production_v6.aab`
- SHA256: `5D25EDAA64897590C92B4419313C3D72DC0745088B2A98876119761C3C3A3F1C`

Upload this AAB to Google Play closed testing.

## Preview APK

- Build ID: `832efd65-7542-429e-980f-b6ed975524ab`
- EAS logs/install page: `https://expo.dev/accounts/snoopy554/projects/ai-voice-detector-mobile/builds/832efd65-7542-429e-980f-b6ed975524ab`
- Artifact URL: `https://expo.dev/artifacts/eas/Ump32uLKsCWYeJOfGrV--9bRsKsA2LHnFib_ULwIpCk.apk`
- Local file: `builds/AI_Voice_Scam_Detector_preview_v6.apk`
- SHA256: `6C2D3B02316ED38A83896D4D45ACF0B676F2F77240D6FB9A2E61D9899B8DAF67`

Use this APK only for quick manual install checks. Google Play upload should use the AAB.

## Store Assets

- App icon: `store-assets/icons/play_icon_512.png`
- Feature graphic: `store-assets/feature_graphic/feature_graphic_1024x500.png`
- Phone screenshots:
  - `store-assets/screenshots_phone/01_record_1080x1920.png`
  - `store-assets/screenshots_phone/02_signals_1080x1920.png`
  - `store-assets/screenshots_phone/03_result_1080x1920.png`
  - `store-assets/screenshots_phone/04_privacy_1080x1920.png`

## Verification

Completed:

- `node --check App.js`
- `npx expo-doctor`
- `npx expo export --platform android --output-dir dist-android`
- EAS production AAB build
- EAS preview APK build
- Store asset dimensions and RGB/RGBA modes checked
- Public privacy policy URL checked
- Final AAB manifest permissions checked with bundletool

Not completed locally:

- Real Android microphone runtime test
- Google Play closed testing with 12+ opted-in testers for 14 continuous days
