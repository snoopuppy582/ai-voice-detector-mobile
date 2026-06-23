# Audio Data Pipeline Design

Updated: 2026-06-24

Purpose: build an automated, legally safer pipeline for large-scale human-vs-AI voice model improvement. The immediate product problem is false positives on broadcast/YouTube/radio-style human speech.

## Non-Negotiable Guardrails

- Do not build a YouTube/radio scraping downloader for arbitrary copyrighted content.
- Do not train on platform content unless the license, permission, or dataset terms allow it.
- Keep raw private voice samples out of git.
- Store dataset provenance, license, consent status, and source URL/identifier for every sample.
- Separate "AI voice detection" from "broadcast/compressed/processed speech detection"; the model must learn that broadcast processing can still be human.

Useful source references checked on 2026-06-24:

- YouTube third-party training help: `https://support.google.com/youtube/answer/15509945?hl=en`
- YouTube API Services policy: `https://developers.google.com/youtube/terms/developer-policies`
- ASVspoof 2021: `https://www.asvspoof.org/index2021.html`
- Mozilla Common Voice: `https://github.com/common-voice/common-voice`
- Mozilla Common Voice release note: `https://www.mozillafoundation.org/en/blog/common-voice-18-dataset-release/`
- LibriSpeech: `https://www.openslr.org/12`
- LibriTTS: `https://www.openslr.org/60/`
- VoxCeleb: `https://www.robots.ox.ac.uk/~vgg/data/voxceleb/`

## Target Dataset Shape

Use four primary classes internally, then collapse to app labels only at export time:

- `human_clean`: direct microphone, audiobook, Common Voice, phone-recorded speech.
- `human_processed`: radio/podcast/broadcast-style speech, compressed speech, speaker playback, video-call style speech.
- `ai_clean`: direct TTS/voice-clone generation from allowed providers or licensed datasets.
- `ai_processed`: AI speech after compression, EQ, noise suppression, room playback, phone re-recording.

Training label:

- Human = `human_clean + human_processed`
- AI = `ai_clean + ai_processed`

App output:

- `likelyHuman`
- `likelyAi`
- `uncertain`

Why this matters: the current app appears to over-associate "processed, compressed, clean, broadcast-like audio" with AI. `human_processed` must become a first-class hard-negative class.

## Recommended Data Sources

### Human Speech

Priority 1: licensed/public datasets

- Mozilla Common Voice: large multilingual volunteer speech corpus. Use for speaker/language variety.
- LibriSpeech: about 1000 hours of 16 kHz read English speech from LibriVox-derived audiobook material.
- LibriTTS: about 585 hours of read English speech designed for TTS research; useful both as human source and TTS text material.
- VoxCeleb: in-the-wild interview speech, but check access/terms before use.

Priority 2: owned or consented recordings

- User's own recordings.
- Friend/tester recordings with written consent.
- Scripted recordings across phones, rooms, speakers, microphones, languages.

Priority 3: platform media only with permission

- Creator-provided clips with explicit permission.
- Open-license podcasts/radio archives only if terms permit ML training or derived feature extraction.

Do not use arbitrary YouTube/radio scraping as a default ingestion source.

### AI Speech

Use only sources where generation/training/evaluation use is allowed:

- User-generated TTS through provider APIs with retained generation metadata.
- Open licensed synthetic speech datasets.
- ASVspoof bonafide/spoof/deepfake datasets for research-style spoofing coverage.

Capture metadata:

- Provider/model name
- Voice ID
- Language
- Prompt/text
- Sample rate
- Direct generation or playback/re-recording
- Processing chain

## Pipeline Architecture

```text
sources/
  licensed_datasets/
  generated_tts/
  consented_recordings/
  processed_variants/

ingest registry
  -> license/provenance check
  -> source manifest
  -> audio normalization
  -> speech segmentation / VAD
  -> metadata enrichment
  -> quality gates
  -> augmentation / domain transforms
  -> feature extraction
  -> train/validation/test split
  -> model training
  -> error audit
  -> app model export
```

## Repository Layout

Keep large data outside the mobile app repo:

```text
ml-data/
  raw/
    common_voice/
    librispeech/
    asvspoof/
    generated_tts/
    consented_recordings/
  processed/
    wav_16k_mono/
    segments/
    augmented/
  manifests/
    sources.csv
    clips.csv
    segments.csv
    splits.csv
    licenses.csv
  features/
    app_features.parquet
    embeddings.parquet
  models/
    runs/
    exports/
  reports/
    error_audits/
    leaderboard.csv
```

Only commit:

- Pipeline scripts
- Small fixture samples with clear permission
- Manifests without private file paths if publishable
- Model export JSON/JS after privacy review
- Evaluation summary

Do not commit:

- Raw audio
- Private voice samples
- Downloaded dataset archives
- Provider API keys

## Ingestion Manifest Schema

`sources.csv`

```text
source_id,source_type,provider,dataset_name,license,terms_url,permission_status,download_method,notes
```

`clips.csv`

```text
clip_id,source_id,path,label4,label_binary,speaker_id,source_group,language,duration_sec,sample_rate,channel_count,codec,created_at,license,consent_id
```

`segments.csv`

```text
segment_id,clip_id,path,start_sec,end_sec,label4,label_binary,speaker_id,source_group,domain,processing_chain,rms_dbfs,snr_est,voiced_ratio
```

`splits.csv`

```text
segment_id,split,split_strategy,heldout_group
```

## Processing Stages

### 1. License And Provenance Gate

Reject any source without a clear allowed use.

Required states:

- `allowed_public_dataset`
- `allowed_generated`
- `allowed_consent`
- `blocked_unknown`
- `blocked_platform_terms`

No audio enters `processed/` unless it passes this gate.

### 2. Audio Normalization

Target format:

- WAV
- mono
- 16 kHz
- 16-bit PCM or float32 for processing

Keep original file path and hash in the manifest.

### 3. Speech Segmentation

Use VAD to create 3-8 second speech-first segments because the app expects short samples.

Segment rules:

- Target: 3-8 sec
- Drop segments under 2 sec unless used for "too short" guard testing.
- Drop mostly-music/non-speech segments or label them as `non_speech_guard`.
- Preserve speaker/source grouping.

### 4. Hard-Negative Processing

Generate `human_processed` and `ai_processed` variants using deterministic transforms:

- MP3/AAC/Opus compression at multiple bitrates
- 8 kHz/16 kHz/44.1 kHz resampling
- phone-call bandpass
- broadcast EQ/compressor/limiter
- room impulse response
- additive background noise
- speaker playback simulation
- volume normalization
- clipping/over-compression

The goal is not realism for its own sake. The goal is to stop the model from treating "processed audio" as "AI".

### 5. Feature Extraction

Extract current app features:

- HNR-style harmonicity
- HF ratio
- CPPS-style cepstral signal
- F0 mean/std/range
- voiced ratio
- spectral flatness
- spectral centroid
- ZCR

Also store candidate features for future experiments:

- MFCC/LFCC/CQCC summaries
- spectral rolloff/bandwidth
- modulation spectrum features
- wav2vec2/WavLM embeddings for offline teacher models only

### 6. Split Strategy

Never use naive random row split as the main score.

Required splits:

- `speaker_holdout`: unseen human speakers
- `source_holdout`: unseen dataset/channel/source
- `tts_engine_holdout`: unseen AI engines/voices
- `domain_holdout`: unseen processing chain
- `playback_holdout`: unseen phone/speaker/room

Primary release gate should be a combined stress split, not the optimistic random split.

## Model Strategy

### Current App-Compatible Track

Keep a small on-device model:

- Logistic regression
- Linear SVM
- Tiny calibrated gradient-boosted trees if JS export remains small

Export:

- feature order
- scaler means/stds
- weights/intercept or compact tree rules
- thresholds
- calibration metadata

### Better Offline Teacher Track

Use heavier models only for training/auditing:

- wav2vec2/WavLM embeddings
- ECAPA-style speaker/speech embeddings
- CNN over LFCC/CQCC/MFCC

Then distill into an app-compatible model if it improves hard-negative performance.

## Confidence/Score Redesign

Do not expose the current margin score as statistical confidence.

Preferred app fields:

- `AI voice score`: monotonic score from model decision; not a probability unless calibrated.
- `Estimate strength`: distance from boundary, downgraded by low voiced ratio / poor audio quality.
- `Uncertain`: shown aggressively for low speech, music, noisy, or out-of-domain samples.

If probability is desired:

- Add Platt scaling or isotonic calibration on a held-out calibration set.
- Report calibration metrics: ECE, Brier score, reliability curve.
- Still avoid legal/security-proof wording.

## Evaluation Gates

Minimum report per candidate:

- Confusion matrix by domain:
  - human clean
  - human processed
  - AI clean
  - AI processed
- False-positive rate on `human_processed`
- Recall on `ai_processed`
- Entity/source holdout balanced accuracy
- Calibration metrics if showing probability
- Android microphone smoke test

Release block examples:

- `human_processed` false positive rate too high.
- One source/channel dominates feature importance.
- AI recall only works for seen TTS engines.
- Confidence remains high on uncertain/noisy audio.

## Automation Jobs

### Daily Or Manual Ingest

```text
python ml_pipeline/ingest_sources.py --manifest ml-data/manifests/sources.csv
python ml_pipeline/normalize_audio.py
python ml_pipeline/segment_speech.py
python ml_pipeline/build_augmented_domains.py
python ml_pipeline/extract_app_features.py
```

### Training Run

```text
python ml_pipeline/make_splits.py --strategy all_stress
python ml_pipeline/train_app_models.py
python ml_pipeline/evaluate_models.py
python ml_pipeline/export_mobile_model.py --run best
```

### Report

```text
python ml_pipeline/render_report.py --run best --out docs/ML_EVALUATION.md
```

## First Implementation Milestone

Goal: fix the current "radio/YouTube human voice -> AI" false positive.

Build only this first:

1. Add `ml_pipeline/` scripts skeleton.
2. Ingest Common Voice + LibriSpeech small subsets.
3. Add 1-2 allowed in-the-wild/broadcast-like datasets or consented recordings.
4. Generate compression/EQ/playback variants.
5. Re-extract current app10 features.
6. Train linear SVM/logistic regression.
7. Report false positives on `human_processed`.
8. Export only if false positives improve without destroying AI recall.

## Practical Warning

More data will not automatically fix the app. If labels or source grouping are sloppy, the model will learn source artifacts instead of AI-vs-human speech. The most important automation feature is not downloading; it is provenance, grouping, and stress-split evaluation.

