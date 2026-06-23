# Play Launch Plan

Updated: 2026-06-24

Official Play Console references checked on 2026-06-24:

- App testing requirements for new personal developer accounts: `https://support.google.com/googleplay/android-developer/answer/14151465?hl=en`
- Preview asset requirements and recommendations: `https://support.google.com/googleplay/android-developer/answer/9866151?hl=en`

## Current Release State

- Package: `com.snoopuppy582.aivoicedetector`
- Version: `1.0.0`
- Current tracked Android versionCode: `8`
- Existing Play upload artifact: `builds/AI_Voice_Scam_Detector_production_v8.aab`
- Existing v8 SHA256: `43ED4E7DC550AC9E9C61126EE33AC15A8AF6D9FF682DB115F680662509703081`
- Important: the v8 AAB was built before the current `src/` refactor. Current source has passed local Android release compilation, but a new EAS Play-signed AAB still needs EAS Android quota reset or a paid Expo plan.
- Privacy policy URL: `https://snoopuppy582.github.io/ai-voice-detector-mobile/privacy-policy.html`

## Product Positioning

Primary goal: reach the first 200 downloads with a curious, lightweight AI voice checker.

Use this framing:

- Record a short voice clip.
- Get an AI-vs-human acoustic estimate.
- See a few simple voice signal cues.
- Processed on device.

Avoid leading with:

- Scam or fraud enforcement
- Guaranteed detection
- Deepfake proof
- Legal, medical, security, or identity-verification claims

Working naming direction for assets and future listing tests:

- `AI Voice Detector`
- `AI Voice Check`
- `Real or AI?`

The current package and app name still use `AI Voice Scam Detector`; rename separately after store copy and assets are aligned.

## Play Console Setup

- App type: App
- Pricing: Free
- Default language: English
- Korean listing can be added after English is complete.
- Upload path: `Play Console > Test and release > Testing > Closed testing > Create release`
- Upload only an EAS-signed production AAB, not a local debug APK/AAB.

Before another EAS production build:

```powershell
npx eas-cli login
npx eas-cli whoami
npm run build:aab
```

## Data Safety Direction

For the current MVP:

- Data collected/shared: `No`, if no analytics, crash reporting, ads, cloud inference, remote logging, or server upload is added.
- Microphone: used only for user-triggered app functionality.
- Audio data: processed on device only.
- Account creation: not supported.
- Data deletion: no account data; temporary sample clears when a new recording starts.
- Encryption in transit: not applicable for audio if there is no server upload.

Safe phrasing:

> The app accesses microphone audio only for user-triggered recording, processes it on device, and does not collect or share it off device.

Do not say the app does not handle sensitive data. It accesses microphone audio locally.

## Content Rating And Policy Guardrails

Suggested framing:

- Utility/tools app
- Not designed for children
- No user-generated public sharing
- No gambling, violence, sexual content, medical diagnosis, legal evidence, or security authentication
- Contains microphone-based acoustic analysis

Never use:

- `100% accurate`
- `guaranteed detection`
- `detects every AI voice`
- `deepfake proof`
- `legal evidence`
- `court-grade`
- `security authentication`
- `medical diagnosis`
- official Google/FTC/police detector language

Use:

- `AI voice estimate`
- `acoustic signals`
- `on-device privacy`
- `may be incorrect`
- `verify important messages through another trusted channel`

## Store Listing Draft

Short description:

```text
Check whether a short voice clip sounds human or AI-generated.
```

Alternative short description:

```text
Record a voice clip and get an on-device AI voice estimate.
```

Full description:

```text
AI Voice Detector helps you check whether a short voice sample sounds human or AI-generated using lightweight acoustic signals on your Android device.

Record a 3-8 second voice clip and get a simple estimate with a confidence score. The app reviews HNR, high-frequency ratio, a CPPS-style cepstral signal, F0 variation, voiced ratio, spectral flatness, spectral centroid, and zero-crossing rate.

Main features:
- Record a short voice sample
- On-device acoustic signal analysis
- AI voice estimate with confidence score
- HNR, pitch, cepstral, and spectral signal cards
- English and Korean interface
- No account required
- No server upload in the current MVP

Use cases:
- Try a quick AI voice check
- Compare human speech and synthetic speech samples
- Learn which acoustic cues can affect an AI voice estimate
- Get a second opinion before trusting an unfamiliar voice clip

Important note:
This app is an acoustic estimate tool. It may be wrong. Do not use the result as legal evidence, medical advice, identity verification, or security proof. For important decisions, verify the voice through another trusted channel.
```

Korean short description:

```text
짧은 음성이 사람 음성인지 AI 음성인지 기기 내에서 추정합니다.
```

Korean full description:

```text
AI Voice Detector는 짧은 음성 샘플이 사람 음성처럼 들리는지 AI 생성 음성처럼 들리는지 Android 기기 안에서 음향 신호로 추정하는 앱입니다.

사용자가 직접 3-8초 정도의 짧은 음성을 녹음하면 앱은 HNR, 고주파 비율, CPPS 스타일의 켑스트럼 신호, F0 변화, 유성 비율, 스펙트럼 평탄도, 스펙트럼 중심, 영교차율을 계산하고, 이를 바탕으로 신뢰도 점수와 함께 결과를 보여줍니다.

주요 기능:
- 짧은 음성 샘플 녹음
- 기기 내 음향 신호 분석
- AI 음성 가능성 추정 및 신뢰도 표시
- HNR, 피치, 켑스트럼, 스펙트럼 신호 카드
- 영어/한국어 화면 지원
- 계정 없이 사용
- 현재 MVP에서 서버 업로드 없음

활용 예시:
- AI 음성인지 간단히 확인
- 실제 음성과 합성 음성 샘플 비교
- AI 음성 추정에 영향을 주는 음향 단서 학습
- 낯선 음성을 신뢰하기 전 참고용 확인

주의:
이 앱은 음향 신호 기반 추정 도구이며 틀릴 수 있습니다. 결과를 법적 증거, 의료 판단, 본인 확인, 보안 인증으로 사용하면 안 됩니다. 중요한 상황에서는 반드시 다른 신뢰 가능한 경로로 추가 확인하세요.
```

## Store Assets

Current paths:

- App icon: `store-assets/icons/play_icon_512.png`
- Feature graphic: `store-assets/feature_graphic/feature_graphic_1024x500.png`
- Phone screenshots:
  - `store-assets/screenshots_phone/01_record_1080x1920.png`
  - `store-assets/screenshots_phone/02_result_1080x1920.png`
  - `store-assets/screenshots_phone/03_signals_1080x1920.png`
  - `store-assets/screenshots_phone/04_privacy_1080x1920.png`

These assets need redesign before serious user acquisition. See `docs/DESIGN_ASSETS.md`.

## Closed Test Recruitment

Target: 15-20 testers, not exactly 12.

For new personal developer accounts, Google Play Help currently says production access requires a closed test with at least 12 opted-in testers for 14 continuous days. Keep a tester buffer because wrong Google accounts, non-installs, or opt-outs can break the count.

Collect:

- Name or nickname
- Gmail used for Google Play
- Android phone model
- Android version if known
- Confirmation they can stay opted in for 14 days

Tester instructions:

Korean:

```text
Google Play 앱 출시 테스트 때문에 Android 테스터를 모집합니다.

앱 이름: AI Voice Detector
기능: 짧은 음성을 녹음하면 사람 음성인지 AI 음성인지 기기 내 음향 신호로 추정하는 앱입니다.

참여 방법:
1. 제가 보내는 테스트 링크 접속
2. Google Play 계정으로 테스트 참여 선택
3. 앱 설치
4. 마이크 권한 허용 후 3-8초 정도 음성 녹음
5. 결과 화면과 언어 전환 확인
6. 14일 동안 테스트 참여 상태 유지

중간에 테스트 나가기를 누르면 Google Play의 14일 조건이 꼬일 수 있어서, 2주 동안은 그대로 유지 부탁드립니다.

필요한 정보:
- Google Play에 쓰는 Gmail 주소
- Android 휴대폰 기종
- 문제가 생기면 캡처/기기명/상황을 알려주세요.
```

English:

```text
I am recruiting Android testers for a Google Play closed test.

App: AI Voice Detector
What it does: Records a short voice sample and estimates whether it sounds human or AI-generated using on-device acoustic signals.

How to test:
1. Open the test link I send.
2. Join the test with your Google Play account.
3. Install the app.
4. Allow microphone access and record a 3-8 second sample.
5. Check the result screen and language toggle.
6. Stay opted in for 14 days.

Please do not leave the test during the 14-day period because Google Play may reset the testing requirement.

Please send:
- Gmail address used for Google Play
- Android phone model
- Any screenshot or issue you find
```

Feedback fields:

- Tester name
- Gmail
- Device model
- Android version
- App version
- Did recording work?
- Did result screen appear?
- Was the language toggle clear?
- Any crash or frozen screen?
- Screenshot or short issue description
- Would you install this if you saw it on Google Play?

## 200 Download Plan

Phase 1: closed test

- Recruit 15-20 Android testers.
- Keep everyone opted in for 14 days.
- Gather basic feedback, screenshots, and crash reports.

Phase 2: first public week

- Target: 60-80 installs.
- Post short demo videos to Instagram Reels, TikTok, YouTube Shorts.
- Video idea: real voice vs AI TTS sample, then app result.
- English hook: `Can this app spot an AI voice?`
- Korean hook: `AI 목소리인지 앱으로 바로 확인해봄`

Phase 3: communities

- Target: 40-60 installs.
- Reddit: `r/AndroidApps`, `r/artificial`, relevant AI/audio communities where self-promotion is allowed.
- Korean Android/AI communities where posting is allowed.
- GitHub README with Play link after public release.

Phase 4: small paid test

- Target: 50-80 installs.
- Test a small Google Ads App Campaign only after the listing images are improved.
- Countries to test: US, Korea, India, Philippines, UK.
- Stop if CPI is too high.

## Experiment Ideas

Experiment one variable at a time.

Title/copy:

- `AI Voice Detector`
- `AI Voice Check`
- `Real or AI? Voice Check`

First screenshot:

- curiosity variant: `Real or AI?`
- utility variant: `Get an AI voice estimate`
- privacy variant: `Processed on your device`
