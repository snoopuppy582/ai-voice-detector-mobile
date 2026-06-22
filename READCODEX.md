# READCODEX

This file is for future Codex sessions continuing AI Voice Scam Detector. Keep it operational and current. General project users should read `README.md` instead.

## Current Objective

Improve AI Voice Scam Detector as an English-first, globally targeted Android app that can plausibly reach 200+ downloads while staying honest about false positives and acoustic-estimate limitations.

## Required Working Style

- Use parallel sub-agents when the task needs research, policy review, ASO review, code review, or store-asset review.
- For image generation requests, use the `imagegen` skill first. The built-in image tool is the default path. If CLI fallback is explicitly requested, use `gpt-image-2` unless true native transparency requires an approved `gpt-image-1.5` fallback.
- Prefer official/primary sources for Play Console policy and speech-analysis claims.
- Do not introduce guaranteed detection language.
- Keep code and docs aligned after every build.

## Latest Release Baseline

- App name: `AI Voice Scam Detector`
- Package: `com.snoopuppy582.aivoicedetector`
- Current tracked versionCode before the next build: `4`
- Latest published code commit at last handoff: check `git log -1 --oneline`
- Privacy URL: `https://snoopuppy582.github.io/ai-voice-detector-mobile/privacy-policy.html`
- GitHub: `https://github.com/snoopuppy582/ai-voice-detector-mobile`

If code changes after a release build, the existing AAB is no longer the true release candidate. Rebuild production AAB, then update `app.json`, `docs/BUILD_NOTES.md`, `docs/PLAY_CONSOLE_LAUNCH_GUIDE.md`, and any external quick guide.

## Acoustic Engine Notes

Current heuristic features:

- HNR-style harmonicity
- HF Ratio
- CPPS-style cepstral signal
- F0 variation/range
- Voiced-frame ratio
- Spectral flatness
- Spectral centroid
- ZCR

Research guardrails:

- Do not implement `F0 std < 10 Hz` as a hard AI-voice rule.
- Do not use `F0 std 35/45 Hz` as a real/fake cutoff.
- F0, jitter, shimmer, HNR, CPPS, and spectral features are valid supporting features, but reliable spoof detection research normally uses feature normalization plus classifiers such as GMM/CNN/raw-waveform models.
- Use low voiced-ratio mainly as a confidence gate or uncertainty signal.
- Keep additional features weakly weighted unless there is local validation data.

Useful source families to re-check:

- ASVspoof challenge baseline docs and papers
- LFCC/CQCC/MFCC spoofing feature papers
- Jitter/shimmer/HNR deepfake speech studies
- CPPS/CPP voice-quality literature
- Spectral flatness/centroid/contrast spoofing papers

## File Roles

- `README.md`: public developer onboarding
- `READCODEX.md`: Codex handoff and operating rules
- `App.js`: app UI and acoustic engine
- `app.json`: Expo config, Android package, versionCode, blocked permissions
- `docs/BUILD_NOTES.md`: release candidate truth source
- `docs/PLAY_CONSOLE_LAUNCH_GUIDE.md`: Play Console procedure
- `docs/STORE_LISTING_DRAFT.md`: listing text only
- `docs/PRIVACY_POLICY.md`: markdown privacy policy source
- `docs/privacy-policy.html`: public GitHub Pages policy content
- `store-assets/`: Play Store images and generation source

## Cleanup Rules

Keep the repository easy to resume:

- `builds/`: keep only the latest `production_v{versionCode}.aab` and latest `preview_v{versionCode}.apk` in the active folder. Move or delete older builds.
- `dist-android/`: generated verification output; delete when not actively inspecting exports.
- `.expo/`: generated cache/logs; delete if it causes confusion.
- `node_modules/`: never preserve for handoff; reinstall with `npm install`.
- `store-assets/`: keep tracked final assets plus source renderer.
- `docs/`: keep current docs aligned with the latest app name, package, versionCode, and artifact paths.

Before final handoff:

```bash
node --check App.js
npm run doctor
npx expo export --platform android --output-dir dist-android
git status --short
```

If preparing a Play upload:

```bash
npm run build:aab
npm run build:apk
```

Then record the new EAS build IDs, artifact URLs, local paths, SHA256 hashes, and manifest permissions in `docs/BUILD_NOTES.md`.

## Play Console Checklist

- Upload the latest production AAB only, not APK.
- Use the public privacy policy URL above.
- Current MVP Data Safety direction: no data collected/shared, assuming no analytics/crash/ad/cloud/server upload is added.
- Explain microphone as app functionality for user-triggered local audio analysis.
- New personal developer account requires closed testing before production access. Current Google requirement should be rechecked before submission.

## Store Asset Guidance

Current assets are English-first. That matches the 200+ global-download goal.

If regenerating images:

- Use `imagegen` skill.
- Keep exact app name spelling: `AI Voice Scam Detector`.
- Avoid `100% accurate`, `guaranteed`, `proof`, `legal evidence`, or official-agency implications.
- Export feature graphic/screenshots as RGB/no-alpha Play-compatible files.
- Keep app icon 512x512 PNG under 1024KB.

