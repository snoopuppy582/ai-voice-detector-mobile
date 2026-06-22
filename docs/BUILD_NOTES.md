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
- Android versionCode: `4`
- Permissions in final AAB: `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`, app-local dynamic receiver permission
- Local audio processing: on-device only in the current MVP
- Privacy policy: public URL plus in-app link

## Production AAB

- Build ID: `3e22af85-2519-46db-b493-e1d64a2a8d15`
- EAS logs: `https://expo.dev/accounts/snoopy554/projects/ai-voice-detector-mobile/builds/3e22af85-2519-46db-b493-e1d64a2a8d15`
- Artifact URL: `https://expo.dev/artifacts/eas/LySMp0Ag94VBtQDaFMhSgHR-urCEHlRZ5t7PRfMMMxk.aab`
- Local file: `builds/AI_Voice_Scam_Detector_production_v4.aab`
- SHA256: `D090646817E91CCA51AD91AA8CCE4A33578292ADD03ED09AE9A11471DB2D563F`

Upload this AAB to Google Play closed testing.

## Preview APK

- Build ID: `9691f7b9-77e2-4100-8a40-128153d37f5b`
- EAS logs/install page: `https://expo.dev/accounts/snoopy554/projects/ai-voice-detector-mobile/builds/9691f7b9-77e2-4100-8a40-128153d37f5b`
- Artifact URL: `https://expo.dev/artifacts/eas/RbqKiLoOowib_HpNzmoPKjwgEIzGbtBHR_V_3-xLFSE.apk`
- Local file: `builds/AI_Voice_Scam_Detector_preview_v4.apk`
- SHA256: `1A931D99D5772EC0DB2753EDA8199E6B357D8AFAEF230E35C78D9EFEFCBC1103`

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
