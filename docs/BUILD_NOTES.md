# AI Voice Scam Detector Build Notes

Generated on: 2026-06-23

## Expo / EAS

- Expo account: `snoopy554`
- EAS project: `@snoopy554/ai-voice-detector-mobile`
- EAS project ID: `7aed659b-578d-4b00-b5e7-1fb29fb305b5`
- GitHub repo: `https://github.com/snoopuppy582/ai-voice-detector-mobile`
- Privacy policy URL: `https://snoopuppy582.github.io/ai-voice-detector-mobile/privacy-policy.html`
- Current local checkout commit before local edits: `6c0727c`

## Android App

- App name: `AI Voice Scam Detector`
- Package name: `com.snoopuppy582.aivoicedetector`
- Version: `1.0.0`
- Android versionCode: `7`
- Target SDK verified from local v7 APK/AAB manifest: `36`
- Permissions in local v7 manifest: `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`, app-local dynamic receiver permission
- Local audio processing: on-device only in the current MVP
- Privacy policy: public URL plus in-app link
- Acoustic features: HNR, HF Ratio, CPPS-style cepstral signal, F0 mean/std/range, voiced ratio, spectral flatness, spectral centroid, ZCR
- v7 scoring note: the previous hand-tuned heuristic is replaced with an embedded linear soft-margin SVM calibrated from local human/AI samples in `03_metrics_table.csv`.

## v7 Local Build Artifacts

These files prove that the v7 source builds and runs locally, but they are signed with the Android Debug certificate and are not the final Google Play upload artifacts.

- Local AAB: `builds/AI_Voice_Scam_Detector_local_v7.aab`
- Local AAB SHA256: `CDB3A7B3F7E226449833E74D969F503FF903400962F6BE4D26BC528D8590D56B`
- Local APK: `builds/AI_Voice_Scam_Detector_local_v7.apk`
- Local APK SHA256: `B545A602554CA1323E59CFD27440F823302A704594A3B512EBA9A3EAF8D749EF`
- Local APK signer: `CN=Android Debug, OU=Android, O=Unknown, L=Unknown, ST=Unknown, C=US`

Do not upload the local debug-signed AAB to Google Play. After Expo login, run:

```bash
npm run build:aab
npm run build:apk
```

Then record the new EAS build IDs, artifact URLs, SHA256 hashes, and manifest permissions here.

## Superseded v6 EAS Build Artifacts

These were the latest EAS-signed artifacts before the v7 SVM source change. They no longer represent the current source.

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

Completed for v7 local source:

- `node --check App.js`
- `npm run doctor`
- `npx expo export --platform android --output-dir dist-android`
- `npx expo prebuild --platform android --no-install`
- `.\android\gradlew.bat -p android assembleRelease bundleRelease`
- Local v7 APK install and launch on `Pixel_10_API_36`
- Local v7 AAB manifest inspected with bundletool
- Local v7 APK package inspected with `aapt2`

Blocked / external:

- EAS production AAB build: blocked because `npx eas-cli whoami` reports `Not logged in`.
- Google Play closed testing with 12+ opted-in testers for 14 continuous days if this is a new personal developer account.
- Real Android microphone runtime test using actual human/AI voice playback.
