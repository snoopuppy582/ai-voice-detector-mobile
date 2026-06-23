# AI Voice Scam Detector Play Console Launch Guide

## App Setup

- App name: `AI Voice Scam Detector`
- Package name: `com.snoopuppy582.aivoicedetector`
- App type: App
- Pricing: Free
- Default language: English
- Add Korean store listing after English listing is complete

## Upload Build

Current upload target:

`builds/AI_Voice_Scam_Detector_production_v8.aab`

This v8 AAB was built before the current source layout was refactored into `src/`. The classifier and app behavior are intended to match, but rebuild a production AAB before upload if you need exact source-to-artifact traceability from this folder.

The local v7 file `builds/AI_Voice_Scam_Detector_local_v7.aab` is debug-signed and is only for local verification. Do not upload it to Play Console.

Current production v8 build:

- EAS build ID: `4bb8379c-bdf6-48c0-a748-e434a547e03f`
- Artifact URL: `https://expo.dev/artifacts/eas/2fpH_vrm_XhDhoM9WbNKA6KKgStAD1ilLTgUwMycY_Q.aab`
- SHA256: `43ED4E7DC550AC9E9C61126EE33AC15A8AF6D9FF682DB115F680662509703081`

Build AAB:

```bash
npm run build:aab
```

Before running this command, log in to the Expo account that owns the EAS project:

```bash
npx eas-cli login
npx eas-cli whoami
```

Upload the generated `.aab` to:

`Play Console > Test and release > Testing > Closed testing > Create release`

For a new personal developer account, prepare for 12 testers / 14 days before production access.

## Store Listing Assets

- App icon: `store-assets/icons/play_icon_512.png`
- Feature graphic: `store-assets/feature_graphic/feature_graphic_1024x500.png`
- Phone screenshots:
  - `store-assets/screenshots_phone/01_record_1080x1920.png`
  - `store-assets/screenshots_phone/02_signals_1080x1920.png`
  - `store-assets/screenshots_phone/03_result_1080x1920.png`
  - `store-assets/screenshots_phone/04_privacy_1080x1920.png`

## Privacy Policy

Use this public URL:

`https://snoopuppy582.github.io/ai-voice-detector-mobile/privacy-policy.html`

The app also includes an in-app Privacy policy link.

## Data Safety Direction

For the current MVP:

- Does your app collect or share user data? `No`, if this exact MVP is submitted without analytics, crash reporting, ads, cloud inference, remote logs, or any other SDK/network feature that sends user data off the device.
- Microphone permission: used for app functionality.
- Audio data: processed on device only.
- Final AAB permissions: microphone/audio settings only, plus app-local dynamic receiver permission.
- Account creation: not supported.
- Data deletion: no account data; temporary sample clears on new recording.
- Encryption in transit: not applicable for audio if no server upload.

Important: If any analytics, crash reporting, ads, cloud inference, or server upload is added, update this answer.

Do not say the app does not handle sensitive data. It accesses microphone audio locally. The safer phrasing is: the app accesses microphone audio only for the user-triggered recording feature, processes it on device, and does not collect or share it off device.

## Content Rating

Suggested framing:

- Utility / tools app
- No user-generated public sharing
- No gambling, violence, sexual content, medical diagnosis, legal evidence, or security authentication
- Contains microphone-based acoustic analysis

## Target Audience

Recommended:

- Not designed for children
- Target age: adults / general users, depending on Play Console choices

## Claims To Avoid

Do not use:

- `100% accurate`
- `guaranteed detection`
- `detects every AI voice`
- `deepfake proof`
- `legal evidence`
- `court-grade`
- `security authentication`
- `medical diagnosis`

Use:

- `AI voice estimate`
- `acoustic signals`
- `on-device privacy`
- `may be incorrect`
- `verify important messages through another trusted channel`

## Closed Testing

Recruit 15-20 testers, not exactly 12.

Required:

- Android phone
- Gmail used for Google Play
- Opt-in link opened with the same Google account
- Stay opted in for 14 days
- Install and use the app at least once

Ask testers to try:

- Microphone permission accept
- Microphone permission deny
- 3-8 second recording
- Very short recording
- Result screen
- Language toggle
- Privacy policy link

Keep a feedback log with date, device, version, issue, and fix status.
