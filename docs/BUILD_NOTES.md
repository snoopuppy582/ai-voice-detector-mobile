# AI Voice Scam Detector Build Notes

Generated on: 2026-06-23

## Expo / EAS

- Expo account: `snoopy554`
- EAS project: `@snoopy554/ai-voice-detector-mobile`
- EAS project ID: `7aed659b-578d-4b00-b5e7-1fb29fb305b5`
- GitHub repo: `https://github.com/snoopuppy582/ai-voice-detector-mobile`
- Privacy policy URL: `https://snoopuppy582.github.io/ai-voice-detector-mobile/privacy-policy.html`
- Current release commit: `36b87e6`

## Android App

- App name: `AI Voice Scam Detector`
- Package name: `com.snoopuppy582.aivoicedetector`
- Version: `1.0.0`
- Android versionCode: `8`
- Target SDK verified from production v8 AAB manifest: `36`
- Permissions in production v8 AAB manifest: `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`, app-local dynamic receiver permission
- Local audio processing: on-device only in the current MVP
- Privacy policy: public URL plus in-app link
- Acoustic features: HNR, HF Ratio, CPPS-style cepstral signal, F0 mean/std/range, voiced ratio, spectral flatness, spectral centroid, ZCR
- v8 release note: includes the v7 linear soft-margin SVM calibration embedded in `App.js`; EAS auto-incremented Play build version from 7 to 8.

## Production AAB

- Build ID: `4bb8379c-bdf6-48c0-a748-e434a547e03f`
- EAS logs: `https://expo.dev/accounts/snoopy554/projects/ai-voice-detector-mobile/builds/4bb8379c-bdf6-48c0-a748-e434a547e03f`
- Artifact URL: `https://expo.dev/artifacts/eas/2fpH_vrm_XhDhoM9WbNKA6KKgStAD1ilLTgUwMycY_Q.aab`
- Local file: `builds/AI_Voice_Scam_Detector_production_v8.aab`
- SHA256: `43ED4E7DC550AC9E9C61126EE33AC15A8AF6D9FF682DB115F680662509703081`
- Build profile: `production`
- Distribution: `STORE`
- Remote credentials: Expo server keystore `Build Credentials mvksss7rVC`

Upload this AAB to Google Play closed testing.

## Preview APK

No v8 EAS preview APK was generated in this session because the Expo Free plan Android build quota was exhausted after the production AAB build.

The previous v6 preview APK is superseded and should not be used as the current release candidate.

## Local Debug Build Artifacts

These files prove that the SVM source built and ran locally, but they are signed with the Android Debug certificate and are not Google Play upload artifacts.

- Local debug AAB: `builds/AI_Voice_Scam_Detector_local_v7.aab`
- Local debug AAB SHA256: `CDB3A7B3F7E226449833E74D969F503FF903400962F6BE4D26BC528D8590D56B`
- Local debug APK: `builds/AI_Voice_Scam_Detector_local_v7.apk`
- Local debug APK SHA256: `B545A602554CA1323E59CFD27440F823302A704594A3B512EBA9A3EAF8D749EF`
- Local debug APK signer: `CN=Android Debug, OU=Android, O=Unknown, L=Unknown, ST=Unknown, C=US`

Do not upload local debug-signed artifacts to Google Play.

## Superseded v6 EAS Build Artifacts

These were the latest EAS-signed artifacts before the SVM source change. They no longer represent the current source.

- Production AAB build ID: `08979062-065b-4dd4-b86d-47cc47e0d2ec`
- Production AAB artifact URL: `https://expo.dev/artifacts/eas/hKaw6QMmg_OGRcj3Wq4I7BCEnqNqGltiOVoTB1IEf8M.aab`
- Production AAB SHA256: `5D25EDAA64897590C92B4419313C3D72DC0745088B2A98876119761C3C3A3F1C`
- Preview APK build ID: `832efd65-7542-429e-980f-b6ed975524ab`
- Preview APK artifact URL: `https://expo.dev/artifacts/eas/Ump32uLKsCWYeJOfGrV--9bRsKsA2LHnFib_ULwIpCk.apk`
- Preview APK SHA256: `6C2D3B02316ED38A83896D4D45ACF0B676F2F77240D6FB9A2E61D9899B8DAF67`

## Store Assets

- App icon: `store-assets/icons/play_icon_512.png`
- Feature graphic: `store-assets/feature_graphic/feature_graphic_1024x500.png`
- Phone screenshots:
  - `store-assets/screenshots_phone/01_record_1080x1920.png`
  - `store-assets/screenshots_phone/02_signals_1080x1920.png`
  - `store-assets/screenshots_phone/03_result_1080x1920.png`
  - `store-assets/screenshots_phone/04_privacy_1080x1920.png`

## Verification

Completed for the SVM source:

- `node --check App.js`
- `npm run doctor`
- `npx expo export --platform android --output-dir dist-android`
- `npx expo prebuild --platform android --no-install`
- `.\android\gradlew.bat -p android assembleRelease bundleRelease`
- Local debug APK install and launch on `Pixel_10_API_36`
- Local debug APK record flow reached the expected `too quiet` guard in the emulator

Completed for production v8 AAB:

- EAS production build completed successfully
- Production v8 AAB downloaded locally
- Production v8 AAB SHA256 recorded
- Production v8 AAB manifest inspected with bundletool
- Production v8 AAB JAR signature verified with `jarsigner`

External / remaining:

- Google Play closed testing with 12+ opted-in testers for 14 continuous days if this is a new personal developer account.
- Real Android microphone runtime test using actual human/AI voice playback.
