import { STREAM_ENCODING } from '../config/audio';
import { LINEAR_SVM_MODEL, scoreWithLinearSvm } from '../model/linearSvmModel';
import { clamp, mean, median, nextPowerOfTwo, standardDeviation } from '../utils/math';

function fft(real, imag, inverse = false) {
  const n = real.length;
  let j = 0;
  for (let i = 1; i < n; i += 1) {
    let bit = n >> 1;
    while (j & bit) {
      j ^= bit;
      bit >>= 1;
    }
    j ^= bit;
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const angle = ((inverse ? 2 : -2) * Math.PI) / len;
    const wLenReal = Math.cos(angle);
    const wLenImag = Math.sin(angle);
    for (let i = 0; i < n; i += len) {
      let wReal = 1;
      let wImag = 0;
      for (let k = 0; k < len / 2; k += 1) {
        const uReal = real[i + k];
        const uImag = imag[i + k];
        const vReal = real[i + k + len / 2] * wReal - imag[i + k + len / 2] * wImag;
        const vImag = real[i + k + len / 2] * wImag + imag[i + k + len / 2] * wReal;
        real[i + k] = uReal + vReal;
        imag[i + k] = uImag + vImag;
        real[i + k + len / 2] = uReal - vReal;
        imag[i + k + len / 2] = uImag - vImag;
        const nextReal = wReal * wLenReal - wImag * wLenImag;
        wImag = wReal * wLenImag + wImag * wLenReal;
        wReal = nextReal;
      }
    }
  }

  if (inverse) {
    for (let i = 0; i < n; i += 1) {
      real[i] /= n;
      imag[i] /= n;
    }
  }
}

function frameSignal(samples, sampleRate) {
  const frameSize = Math.max(512, Math.round(sampleRate * 0.04));
  const hopSize = Math.max(256, Math.round(sampleRate * 0.02));
  const frames = [];
  if (samples.length < frameSize) return frames;

  for (let start = 0; start + frameSize <= samples.length; start += hopSize) {
    frames.push(samples.subarray(start, start + frameSize));
  }
  return frames;
}

function windowedFrame(frame) {
  const output = new Float32Array(frame.length);
  for (let i = 0; i < frame.length; i += 1) {
    output[i] = frame[i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (frame.length - 1)));
  }
  return output;
}

function estimatePitchAndHnr(frame, sampleRate) {
  let frameMean = 0;
  for (let i = 0; i < frame.length; i += 1) frameMean += frame[i];
  frameMean /= frame.length;

  const centered = new Float32Array(frame.length);
  let energy = 0;
  for (let i = 0; i < frame.length; i += 1) {
    centered[i] = frame[i] - frameMean;
    energy += centered[i] * centered[i];
  }
  if (energy <= 1e-8) {
    return {
      hnr: 0,
      f0: 0,
      harmonicity: 0,
    };
  }

  const minLag = Math.max(1, Math.floor(sampleRate / 350));
  const maxLag = Math.min(centered.length - 1, Math.floor(sampleRate / 60));
  let best = 0;
  let bestLag = 0;
  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let corr = 0;
    for (let i = 0; i < centered.length - lag; i += 1) {
      corr += centered[i] * centered[i + lag];
    }
    const normalized = corr / energy;
    if (normalized > best) {
      best = normalized;
      bestLag = lag;
    }
  }
  const harmonicity = clamp(best, 0.01, 0.99);
  return {
    hnr: 10 * Math.log10(harmonicity / Math.max(1 - harmonicity, 1e-6)),
    f0: bestLag && best >= 0.35 ? sampleRate / bestLag : 0,
    harmonicity: best,
  };
}

function estimateSpectralFeatures(frame, sampleRate) {
  const n = nextPowerOfTwo(frame.length);
  const real = new Array(n).fill(0);
  const imag = new Array(n).fill(0);
  const windowed = windowedFrame(frame);
  for (let i = 0; i < windowed.length; i += 1) real[i] = windowed[i];
  fft(real, imag);

  let total = 0;
  let high = 0;
  let centroidNumerator = 0;
  let logPowerSum = 0;
  let binCount = 0;
  const logMag = new Array(n);
  const threshold = Math.min(4000, sampleRate * 0.35);
  for (let i = 0; i < n; i += 1) {
    const mag2 = real[i] * real[i] + imag[i] * imag[i];
    const frequency = (i * sampleRate) / n;
    if (i <= n / 2) {
      total += mag2;
      centroidNumerator += frequency * mag2;
      logPowerSum += Math.log(mag2 + 1e-12);
      binCount += 1;
      if (frequency >= threshold) high += mag2;
    }
    logMag[i] = Math.log(Math.sqrt(mag2) + 1e-8);
  }

  const cepReal = [...logMag];
  const cepImag = new Array(n).fill(0);
  fft(cepReal, cepImag, true);
  const minQuef = Math.max(1, Math.floor(sampleRate / 350));
  const maxQuef = Math.min(Math.floor(sampleRate / 60), Math.floor(n / 2));
  let peak = -Infinity;
  let baseline = 0;
  let count = 0;
  for (let q = minQuef; q <= maxQuef; q += 1) {
    const value = cepReal[q];
    peak = Math.max(peak, value);
    baseline += value;
    count += 1;
  }
  baseline = count ? baseline / count : 0;
  const cpps = clamp((peak - baseline) * 8 + 8, 0, 24);

  return {
    hfRatio: total > 1e-8 ? clamp(high / total, 0, 1) : 0,
    spectralCentroid: total > 1e-8 ? centroidNumerator / total : 0,
    spectralFlatness: total > 1e-8 && binCount ? clamp(Math.exp(logPowerSum / binCount) / (total / binCount), 0, 1) : 0,
    cpps,
  };
}

export function analyzeSamples(samples, sampleRate) {
  const frames = frameSignal(samples, sampleRate);
  const step = Math.max(1, Math.ceil(frames.length / 80));
  const selected = frames.filter((_, index) => index % step === 0);

  const rmsValues = selected.map((frame) => {
    let sum = 0;
    for (let i = 0; i < frame.length; i += 1) sum += frame[i] * frame[i];
    return Math.sqrt(sum / frame.length);
  });
  const voicedFloor = Math.max(median(rmsValues) * 0.45, 0.008);
  const voiced = selected.filter((frame, index) => rmsValues[index] >= voicedFloor);
  const analysisFrames = voiced.length ? voiced : selected;

  const hnrValues = [];
  const hfValues = [];
  const cppsValues = [];
  const f0Values = [];
  const flatnessValues = [];
  const centroidValues = [];
  analysisFrames.forEach((frame) => {
    const pitch = estimatePitchAndHnr(windowedFrame(frame), sampleRate);
    hnrValues.push(pitch.hnr);
    if (pitch.f0 > 0) f0Values.push(pitch.f0);
    const spectral = estimateSpectralFeatures(frame, sampleRate);
    hfValues.push(spectral.hfRatio);
    cppsValues.push(spectral.cpps);
    flatnessValues.push(spectral.spectralFlatness);
    centroidValues.push(spectral.spectralCentroid);
  });

  const hnr = median(hnrValues);
  const hfRatio = median(hfValues);
  const cpps = median(cppsValues);
  const f0Mean = mean(f0Values);
  const f0Std = standardDeviation(f0Values);
  const f0Range = f0Values.length ? Math.max(...f0Values) - Math.min(...f0Values) : 0;
  const voicedRatio = analysisFrames.length ? f0Values.length / analysisFrames.length : 0;
  const spectralFlatness = median(flatnessValues);
  const spectralCentroid = median(centroidValues);
  let zcr = 0;
  for (let i = 1; i < samples.length; i += 1) {
    if ((samples[i - 1] >= 0) !== (samples[i] >= 0)) zcr += 1;
  }
  zcr /= Math.max(samples.length - 1, 1);

  const lowVoicedPenalty = voicedRatio < 0.25 ? 12 : voicedRatio < 0.4 ? 6 : 0;
  const svm = scoreWithLinearSvm({
    hnr,
    hfRatio,
    cpps,
    f0Mean,
    f0Std,
    f0Range,
    voicedRatio,
    spectralFlatness,
    spectralCentroid,
    zcr,
  });
  const label =
    lowVoicedPenalty >= 12
      ? 'uncertain'
      : svm.decision >= LINEAR_SVM_MODEL.aiDecisionCutoff
        ? 'likelyAi'
        : svm.decision <= LINEAR_SVM_MODEL.humanDecisionCutoff
          ? 'likelyHuman'
          : 'uncertain';
  const confidence = clamp(svm.confidence - lowVoicedPenalty, 45, 94);
  const bars = makeBarsFromSamples(samples, 28);

  return {
    label,
    confidence,
    aiScore: svm.aiScore,
    hnr: Number(hnr.toFixed(1)),
    hfRatio: Number(hfRatio.toFixed(2)),
    cpps: Number(cpps.toFixed(1)),
    f0Mean: Number(f0Mean.toFixed(1)),
    f0Std: Number(f0Std.toFixed(1)),
    f0Range: Number(f0Range.toFixed(1)),
    voicedRatio: Number(voicedRatio.toFixed(2)),
    spectralFlatness: Number(spectralFlatness.toFixed(2)),
    spectralCentroid: Math.round(spectralCentroid),
    zcr: Number(zcr.toFixed(3)),
    duration: Number((samples.length / sampleRate).toFixed(1)),
    bars,
  };
}

export function makeBarsFromSamples(samples, count) {
  if (!samples.length) return new Array(count).fill(0.12);
  const bucketSize = Math.max(1, Math.floor(samples.length / count));
  const bars = [];
  for (let i = 0; i < count; i += 1) {
    let sum = 0;
    const start = i * bucketSize;
    const end = Math.min(samples.length, start + bucketSize);
    for (let j = start; j < end; j += 1) sum += samples[j] * samples[j];
    bars.push(clamp(Math.sqrt(sum / Math.max(end - start, 1)) * 6, 0.08, 1));
  }
  return bars;
}

export function mergeChunks(chunks, maxSamples) {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Float32Array(Math.min(total, maxSamples));
  let offset = 0;
  for (const chunk of chunks) {
    if (offset >= output.length) break;
    const slice = chunk.subarray(0, output.length - offset);
    output.set(slice, offset);
    offset += slice.length;
  }
  return output;
}

export function pcmFromBuffer(buffer, encoding = STREAM_ENCODING) {
  if (!buffer?.data) return new Float32Array(0);
  if (encoding === 'float32') {
    if (buffer.data.byteLength % 4 !== 0) return new Float32Array(0);
    return new Float32Array(buffer.data);
  }
  if (buffer.data.byteLength % 2 !== 0) return new Float32Array(0);
  const int16 = new Int16Array(buffer.data);
  const output = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i += 1) {
    output[i] = int16[i] / 32768;
  }
  return output;
}
