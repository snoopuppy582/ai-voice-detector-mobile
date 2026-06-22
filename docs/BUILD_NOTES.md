# AI Voice Scam Detector Build Notes

Generated on: 2026-06-22

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
- Android versionCode: `5`
- Permissions in final AAB: `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`, app-local dynamic receiver permission
- Local audio processing: on-device only in the current MVP
- Privacy policy: public URL plus in-app link
- Acoustic features: HNR, HF Ratio, CPPS-style cepstral signal, F0 variation/range, voiced ratio, spectral flatness, spectral centroid, ZCR

## Production AAB

- Build ID: `eefbd9fc-8b03-4105-8af7-9ba02f42e344`
- EAS logs: `https://expo.dev/accounts/snoopy554/projects/ai-voice-detector-mobile/builds/eefbd9fc-8b03-4105-8af7-9ba02f42e344`
- Artifact URL: `https://expo.dev/artifacts/eas/IUFgqn2m2VtZMoG719zjd6QNZiG2xuHDCklc2RH6f24.aab`
- Local file: `builds/AI_Voice_Scam_Detector_production_v5.aab`
- SHA256: `CC331A4F50243776FCD3BBD00415455EFF7B4FB8AF36C5E056E40ED493FFEE15`

Upload this AAB to Google Play closed testing.

## Preview APK

- Build ID: `59c26ee4-a9a9-4f14-aedb-6fd88500d51a`
- EAS logs/install page: `https://expo.dev/accounts/snoopy554/projects/ai-voice-detector-mobile/builds/59c26ee4-a9a9-4f14-aedb-6fd88500d51a`
- Artifact URL: `https://expo.dev/artifacts/eas/raU-KBDEYaZ3cHDPyFGQRwDMurnc7klHy9JQGWn-KbI.apk`
- Local file: `builds/AI_Voice_Scam_Detector_preview_v5.apk`
- SHA256: `D72D040D0D368D6AF5A4B8055C56BCCAA5B98B75C686171EABB87910C9256112`

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
