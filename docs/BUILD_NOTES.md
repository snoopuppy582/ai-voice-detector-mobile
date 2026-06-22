# AI Voice Detector Build Notes

Generated on: 2026-06-22

## Expo / EAS

- Expo account: `snoopy554`
- EAS project: `@snoopy554/ai-voice-detector-mobile`
- EAS project ID: `7aed659b-578d-4b00-b5e7-1fb29fb305b5`
- GitHub repo: `https://github.com/snoopuppy582/ai-voice-detector-mobile`
- Privacy policy URL: `https://snoopuppy582.github.io/ai-voice-detector-mobile/privacy-policy.html`

## Android App

- App name: `AI Voice Detector`
- Package name: `com.snoopuppy582.aivoicedetector`
- Version: `1.0.0`
- Android versionCode: `2`
- Permission: `RECORD_AUDIO`

## Production AAB

- Build ID: `a865b5fd-a7bf-4e57-a0d8-b89b522604f1`
- EAS logs: `https://expo.dev/accounts/snoopy554/projects/ai-voice-detector-mobile/builds/a865b5fd-a7bf-4e57-a0d8-b89b522604f1`
- Artifact URL: `https://expo.dev/artifacts/eas/zogz2RUICTcC_GzSEqJ_DuJsbSzRLu8Bg42k59yw7eo.aab`
- Local file: `builds/AI_Voice_Detector_production_v2.aab`

Upload this AAB to Google Play closed testing.

## Preview APK

- Build ID: `c100ace7-97b5-4210-bf60-8e37c69657f4`
- EAS logs/install page: `https://expo.dev/accounts/snoopy554/projects/ai-voice-detector-mobile/builds/c100ace7-97b5-4210-bf60-8e37c69657f4`
- Artifact URL: `https://expo.dev/artifacts/eas/NLOiPWZB7hSZdBKvbnOo5Z__QitCUNvAwZEWZbbv06I.apk`
- Local file: `builds/AI_Voice_Detector_preview_v2.apk`

Use this APK only for quick manual install checks. Google Play upload should use the AAB.

## Verification

Completed:

- `node --check App.js`
- `npx expo-doctor`
- `npx expo export --platform android --output-dir dist-android`
- EAS production AAB build
- EAS preview APK build

Not completed locally:

- Real Android microphone runtime test
- Closed testing with 15-20 users
