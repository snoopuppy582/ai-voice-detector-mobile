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
- Android versionCode: `3`
- Permission: `RECORD_AUDIO`
- Local audio processing: on-device only in the current MVP

## Production AAB

- Build ID: `cf6b70af-0048-4e94-bb67-23da49b87299`
- EAS logs: `https://expo.dev/accounts/snoopy554/projects/ai-voice-detector-mobile/builds/cf6b70af-0048-4e94-bb67-23da49b87299`
- Artifact URL: `https://expo.dev/artifacts/eas/peWD0p6kkeh3Q_8tYKiNgGnmmGOlVLXi12Nnkz1Z8fM.aab`
- Local file: `builds/AI_Voice_Scam_Detector_production_v3.aab`

Upload this AAB to Google Play closed testing.

## Preview APK

- Build ID: `3942f2e4-53a5-4456-8176-a74b88be13e4`
- EAS logs/install page: `https://expo.dev/accounts/snoopy554/projects/ai-voice-detector-mobile/builds/3942f2e4-53a5-4456-8176-a74b88be13e4`
- Artifact URL: `https://expo.dev/artifacts/eas/yO3OEPrKUQwY3Osc1-AaDomOkOsUpgzIFgN9KYQy-iQ.apk`
- Local file: `builds/AI_Voice_Scam_Detector_preview_v3.apk`

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

Not completed locally:

- Real Android microphone runtime test
- Google Play closed testing with 12+ opted-in testers for 14 continuous days

