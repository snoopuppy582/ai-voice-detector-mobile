# Design And Store Asset System

Updated: 2026-06-24

Research checked on 2026-06-24:

- Google Play preview assets: `https://support.google.com/googleplay/android-developer/answer/9866151?hl=en`
- Google Play icon specifications: `https://developer.android.com/distribute/google-play/resources/icon-design-specifications`
- Google Play store listing best practices: `https://support.google.com/googleplay/android-developer/answer/13393723`
- Google Play store listing experiments: `https://play.google.com/console/about/store-listing-experiments/`
- AppTweak screenshot ASO guidance: `https://www.apptweak.com/en/aso-blog/how-to-optimize-your-app-screenshots`
- AppScreens feature graphic guidance: `https://appscreens.com/blog/google-play-feature-graphic-examples`

## Goal

Replace the current generic, security-coded image set with a cohesive visual system that helps reach the first 200 downloads. The app should feel like a curious AI voice checker, not a scam-reporting or forensic product.

## Current Asset Problems

- Overuses `Scam`, which frames the app as fraud/security software.
- Uses shield/security imagery that does not match the lightweight utility goal.
- Feature graphic is a dark tech banner with small metric chips and low emotional hook.
- Screenshots look like documentation pages instead of conversion assets.
- Design language is inconsistent: shield, cyber grid, app card, metric chips, waveform, and disclaimers compete for attention.

## Design Direction

Positioning:

- `AI voice check`
- `Real voice or AI?`
- `On-device voice estimate`

Core identity: `Signal Split`.

The visual hook is a human, organic waveform and a geometric AI pulse stream converging around one microphone/check mark. The emotional frame is curiosity, not threat.

Avoid in images:

- `Scam`
- shield, lock, police, hacker, cybercrime visuals
- `100%`, `Best`, `#1`, `Top`, `Free`, discount or ranking claims
- dense metrics in hero art
- generated text inside model output

Visual identity:

- One symbol: a microphone/waveform split between organic human wave and geometric AI pulses.
- Friendly modern tech, not fear-based security.
- Large simple forms, high contrast, readable at small size.
- A small check mark can be built into the mic/waveform, but avoid security-badge shapes.

Palette:

- Deep ink: `#111827`
- Electric cyan: `#00B8D9`
- Signal violet: `#7C3AED`
- Warm coral: `#FF5A5F`
- Soft lime: `#A3E635`
- Off-white: `#F8FAFC`

Typography:

- Use locally rendered text only.
- Short captions, large font, no model-generated lettering.
- Keep screenshot taglines under 20% of image area.

## Required Asset Set

Keep this list aligned with `store-assets/STORE_ASSETS_MANIFEST.md`.

App assets:

- `assets/icon.png`
- `assets/splash-icon.png`
- `assets/android-icon-foreground.png`
- `assets/android-icon-background.png`
- `assets/android-icon-monochrome.png`

Play assets:

- `store-assets/icons/play_icon_512.png`
- `store-assets/feature_graphic/feature_graphic_1024x500.png`
- `store-assets/feature_graphic/feature_graphic_1024x500.jpg`
- `store-assets/screenshots_phone/01_record_1080x1920.png`
- `store-assets/screenshots_phone/02_result_1080x1920.png`
- `store-assets/screenshots_phone/03_signals_1080x1920.png`
- `store-assets/screenshots_phone/04_privacy_1080x1920.png`

## Asset Concepts

Icon:

- Bold vector-like mic/waveform mark.
- One side organic waveform, one side AI pulse blocks.
- No text, no shield, no small rings, no baked Play shadow.

Feature graphic:

- 1024x500, no alpha.
- Short headline: `Real voice or AI?`
- Secondary: `Check a short voice clip`
- Strong central mic/waveform visual.
- Optional small result pill, not a full app screenshot.

Screenshot sequence:

1. `Real or AI?` with recording UI.
2. `Instant estimate` with result UI.
3. `What changed the score?` with signal cards.
4. `Private by default` with privacy panel.

The first three screenshots must sell the app before the user reads the description. Keep the image order fixed: curiosity, result, explanation, privacy.

## Play And ASO Rules To Apply

- Icon: 512x512, 32-bit PNG, sRGB, under 1024 KB, full square. Do not bake a drop shadow into the Play icon.
- Feature graphic: 1024x500, JPEG or 24-bit PNG, no alpha. Keep important elements away from edges and make one promise obvious at small size.
- Phone screenshots: use four 1080x1920 portrait images for better eligibility across Play recommendation surfaces.
- Preview assets must show the app experience accurately. Do not use ranking, price, store badge, or performance claims.
- Keep captions short and under 20% of each screenshot. The headline should be readable in the first three images without zooming.
- Use store listing experiments later to test icon/feature/screenshot variants one variable at a time.

## Generation Workflow

Do not ask the image model to render final text. Generate only background or hero imagery, then compose final dimensions, captions, UI frames, and exports locally.

With `OPENAI_API_KEY`:

- Use image CLI fallback with `gpt-image-2`, `quality high`.
- Generate concept visuals only: icon mark concept, feature hero, screenshot background system.
- Compose final text, layout, dimensions, and exports with Pillow.

Without `OPENAI_API_KEY`:

- Use built-in `$imagegen` for concept imagery.
- Still compose final assets deterministically with Pillow.
- Do not claim a specific model or `gpt-image-2`.

Fallback if generated imagery is not good enough:

- Build a fully deterministic vector-like set in `store-assets/source/render_store_assets.py`.
- Use the same `Signal Split` mark and palette.
- Keep this as the stable production fallback until better generated art is available.

## Prompt Seeds

Icon:

```text
Use case: logo-brand
Asset type: mobile app icon concept
Primary request: a clean modern icon mark for an AI voice checker app, showing a microphone and waveform split between human voice and AI signal
Style/medium: vector-like app icon, bold simple geometry, premium mobile utility
Composition/framing: centered symbol, strong silhouette, readable at small size, generous padding
Color palette: deep ink, electric cyan, signal violet, warm coral accent
Constraints: no text, no shield, no lock, no police/security imagery, no tiny details, no watermark, no drop shadow
```

Feature visual:

```text
Use case: ads-marketing
Asset type: Google Play feature graphic background and hero visual
Primary request: a premium visual for an AI voice checker app, with a microphone waveform transforming from organic human wave into geometric AI pulses
Style/medium: polished modern tech editorial, friendly not scary
Composition/framing: wide 1024x500 layout, strong central visual, open area for locally rendered headline text
Lighting/mood: crisp, curious, high contrast, vibrant but trustworthy
Color palette: deep ink, cyan, violet, coral, off-white
Constraints: no text inside generated image, no shield, no scam/fraud/security imagery, no store badges, no rankings, no watermark, avoid fine detail
```

Screenshot background:

```text
Use case: productivity-visual
Asset type: Google Play screenshot background system
Primary request: clean premium mobile app screenshot background for an AI voice checker, abstract waveform ribbons and soft geometric AI signal shapes
Style/medium: polished app store editorial background, not cyberpunk
Composition/framing: portrait 1080x1920, ample clean space for a phone frame and a large caption
Color palette: off-white base with cyan, violet, and coral accents
Constraints: no text, no logos, no device brand marks, no watermark, no dense detail
```

## Acceptance Checklist

- Icon is recognizable at 48px.
- Icon does not look like a scam/security app.
- Feature graphic communicates one promise in under two seconds.
- First three screenshots sell curiosity and function, not disclaimers.
- No image embeds `Scam` unless naming is explicitly reverted.
- All text is locally rendered.
- All assets meet Play format and dimension rules.
- The full image set looks like one product family.
- The visuals remain honest: estimate, not proof.
