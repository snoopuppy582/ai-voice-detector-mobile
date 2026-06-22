import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getLocales } from 'expo-localization';
import { requestRecordingPermissionsAsync, setAudioModeAsync, useAudioStream } from 'expo-audio';

const TARGET_SAMPLE_RATE = 16000;
const MAX_SECONDS = 12;
const MIN_SECONDS = 2;
const STREAM_ENCODING = 'int16';

const COPY = {
  en: {
    eyebrow: 'On-device acoustic estimate',
    title: 'AI Voice Scam Detector',
    subtitle: 'Record a suspicious voice sample and check AI cloning risk with on-device acoustic signals.',
    record: 'Start recording',
    stop: 'Stop and analyze',
    starting: 'Starting microphone',
    analyzing: 'Analyzing voice signals',
    ready: 'Ready',
    recording: 'Recording',
    seconds: 'sec',
    result: 'Result',
    likelyAi: 'Likely AI voice',
    likelyHuman: 'Likely human voice',
    uncertain: 'Uncertain',
    estimateOnly: 'Estimate only',
    confidence: 'Confidence',
    aiScore: 'AI voice score',
    signals: 'Acoustic signals',
    hnr: 'HNR',
    hfRatio: 'HF Ratio',
    cpps: 'CPPS',
    privacy: 'Processed on device. No account required.',
    delete: 'Samples are cleared when you start a new recording.',
    sampleHint: 'Speak naturally for 3-8 seconds in a quiet place.',
    tooShort: 'Record at least 2 seconds of speech.',
    tooQuiet: 'The sample is too quiet. Move closer to the microphone and try again.',
    permissionTitle: 'Microphone permission needed',
    permissionBody: 'Allow microphone access to record and analyze a short voice sample.',
    language: 'KO',
    disclaimer: 'This is an acoustic estimate and may be incorrect. Do not use it as legal, medical, or security proof.',
  },
  ko: {
    eyebrow: '기기 내 음향 신호 추정',
    title: 'AI Voice Scam Detector',
    subtitle: '수상한 음성을 녹음하고 기기 내 음향 신호로 AI 클론 위험을 추정합니다.',
    record: '녹음 시작',
    stop: '중지 후 분석',
    starting: '마이크 시작 중',
    analyzing: '음성 신호 분석 중',
    ready: '대기',
    recording: '녹음 중',
    seconds: '초',
    result: '결과',
    likelyAi: 'AI 음성 가능성이 높음',
    likelyHuman: '사람 음성 가능성이 높음',
    uncertain: '판정 불확실',
    estimateOnly: '추정 결과',
    confidence: '신뢰도',
    aiScore: 'AI 음성 점수',
    signals: '음향 신호',
    hnr: 'HNR',
    hfRatio: 'HF Ratio',
    cpps: 'CPPS',
    privacy: '기기 내에서 처리됩니다. 계정은 필요하지 않습니다.',
    delete: '새 녹음을 시작하면 이전 샘플은 앱 메모리에서 지워집니다.',
    sampleHint: '조용한 곳에서 3-8초 동안 자연스럽게 말하세요.',
    tooShort: '최소 2초 이상 음성을 녹음하세요.',
    tooQuiet: '음성이 너무 작습니다. 마이크에 조금 더 가까이 대고 다시 녹음하세요.',
    permissionTitle: '마이크 권한 필요',
    permissionBody: '짧은 음성을 녹음하고 분석하려면 마이크 접근을 허용해야 합니다.',
    language: 'EN',
    disclaimer: '이 결과는 음향 신호 기반 추정이며 틀릴 수 있습니다. 법적, 의료, 보안 증거로 사용하지 마세요.',
  },
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function nextPowerOfTwo(value) {
  let power = 1;
  while (power < value) power <<= 1;
  return power;
}

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

function estimateHnr(frame, sampleRate) {
  let mean = 0;
  for (let i = 0; i < frame.length; i += 1) mean += frame[i];
  mean /= frame.length;

  const centered = new Float32Array(frame.length);
  let energy = 0;
  for (let i = 0; i < frame.length; i += 1) {
    centered[i] = frame[i] - mean;
    energy += centered[i] * centered[i];
  }
  if (energy <= 1e-8) return 0;

  const minLag = Math.max(1, Math.floor(sampleRate / 350));
  const maxLag = Math.min(centered.length - 1, Math.floor(sampleRate / 60));
  let best = 0;
  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let corr = 0;
    for (let i = 0; i < centered.length - lag; i += 1) {
      corr += centered[i] * centered[i + lag];
    }
    best = Math.max(best, corr / energy);
  }
  const harmonicity = clamp(best, 0.01, 0.99);
  return 10 * Math.log10(harmonicity / Math.max(1 - harmonicity, 1e-6));
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
  const logMag = new Array(n);
  const threshold = Math.min(4000, sampleRate * 0.35);
  for (let i = 0; i < n; i += 1) {
    const mag2 = real[i] * real[i] + imag[i] * imag[i];
    total += mag2;
    const frequency = (i * sampleRate) / n;
    if (i <= n / 2 && frequency >= threshold) high += mag2;
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
    cpps,
  };
}

function analyzeSamples(samples, sampleRate) {
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
  analysisFrames.forEach((frame) => {
    hnrValues.push(estimateHnr(windowedFrame(frame), sampleRate));
    const spectral = estimateSpectralFeatures(frame, sampleRate);
    hfValues.push(spectral.hfRatio);
    cppsValues.push(spectral.cpps);
  });

  const hnr = median(hnrValues);
  const hfRatio = median(hfValues);
  const cpps = median(cppsValues);
  let zcr = 0;
  for (let i = 1; i < samples.length; i += 1) {
    if ((samples[i - 1] >= 0) !== (samples[i] >= 0)) zcr += 1;
  }
  zcr /= Math.max(samples.length - 1, 1);

  const aiScore = clamp(
    50 + clamp((14 - hnr) * 2.2, -18, 28) + clamp((hfRatio - 0.24) * 90, -20, 32) + clamp((12 - cpps) * 2, -15, 22) + clamp((zcr - 0.08) * 80, -8, 12),
    4,
    96
  );

  const label = aiScore >= 58 ? 'likelyAi' : aiScore <= 42 ? 'likelyHuman' : 'uncertain';
  const confidence = clamp(Math.round(54 + Math.abs(aiScore - 50) * 1.25), 51, 94);
  const bars = makeBarsFromSamples(samples, 28);

  return {
    label,
    confidence,
    aiScore: Math.round(aiScore),
    hnr: Number(hnr.toFixed(1)),
    hfRatio: Number(hfRatio.toFixed(2)),
    cpps: Number(cpps.toFixed(1)),
    zcr: Number(zcr.toFixed(3)),
    duration: Number((samples.length / sampleRate).toFixed(1)),
    bars,
  };
}

function makeBarsFromSamples(samples, count) {
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

function mergeChunks(chunks, maxSamples) {
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

function pcmFromBuffer(buffer, encoding = STREAM_ENCODING) {
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

function SignalCard({ label, value, unit }) {
  return (
    <View style={styles.signalCard}>
      <Text style={styles.signalLabel}>{label}</Text>
      <Text style={styles.signalValue}>
        {value}
        {unit ? <Text style={styles.signalUnit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

function Waveform({ bars, active }) {
  return (
    <View style={styles.waveform}>
      {bars.map((value, index) => (
        <View key={`${index}-${value}`} style={styles.waveSlot}>
          <View style={[styles.waveBar, { height: `${Math.round(value * 100)}%`, opacity: active ? 1 : 0.65 }]} />
        </View>
      ))}
    </View>
  );
}

export default function App() {
  const deviceLanguage = getLocales()?.[0]?.languageCode === 'ko' ? 'ko' : 'en';
  const [language, setLanguage] = useState(deviceLanguage);
  const [permissionReady, setPermissionReady] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [levelBars, setLevelBars] = useState(new Array(28).fill(0.12));
  const [result, setResult] = useState(null);

  const copy = COPY[language];
  const chunksRef = useRef([]);
  const sampleRateRef = useRef(TARGET_SAMPLE_RATE);
  const sampleCountRef = useRef(0);
  const elapsedRef = useRef(0);
  const recordingRef = useRef(false);
  const startSessionRef = useRef(0);
  const startRequestedRef = useRef(false);
  const timerRef = useRef(null);

  const handleAudioBuffer = useCallback((buffer) => {
    if (!recordingRef.current) return;
    sampleRateRef.current = buffer.sampleRate || TARGET_SAMPLE_RATE;
    const samples = pcmFromBuffer(buffer, STREAM_ENCODING);
    if (!samples.length) return;

    const channels = Math.max(buffer.channels || 1, 1);
    const mono = channels === 1 ? samples : samples.filter((_, index) => index % channels === 0);
    const maxSamples = Math.ceil(sampleRateRef.current * MAX_SECONDS);
    const remaining = maxSamples - sampleCountRef.current;
    if (remaining > 0) {
      const slice = mono.length > remaining ? mono.subarray(0, remaining) : mono;
      chunksRef.current.push(slice);
      sampleCountRef.current += slice.length;
    }
    setLevelBars(makeBarsFromSamples(mono, 28));
  }, []);

  const streamOptions = useMemo(
    () => ({
      sampleRate: TARGET_SAMPLE_RATE,
      channels: 1,
      encoding: STREAM_ENCODING,
      onBuffer: handleAudioBuffer,
    }),
    [handleAudioBuffer]
  );
  const { stream, isStreaming } = useAudioStream(streamOptions);

  const clearRecordingTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const beginRecordingTimer = () => {
    clearRecordingTimer();
    const startedAt = Date.now();
    timerRef.current = setInterval(() => {
      const next = Math.min((Date.now() - startedAt) / 1000, MAX_SECONDS);
      elapsedRef.current = Number(next.toFixed(1));
      setElapsed(elapsedRef.current);
      if (next >= MAX_SECONDS) {
        stopRecording();
      }
    }, 100);
  };

  useEffect(() => {
    return () => {
      clearRecordingTimer();
      if (recordingRef.current) stream?.stop?.();
    };
  }, [stream]);

  const ensurePermission = async () => {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(copy.permissionTitle, copy.permissionBody);
      return false;
    }
    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
      interruptionMode: 'doNotMix',
    });
    setPermissionReady(true);
    return true;
  };

  const startRecording = async () => {
    if (isStarting || recordingRef.current) return;
    const granted = permissionReady || (await ensurePermission());
    if (!granted) return;

    const sessionId = startSessionRef.current + 1;
    startSessionRef.current = sessionId;
    startRequestedRef.current = true;
    chunksRef.current = [];
    sampleRateRef.current = TARGET_SAMPLE_RATE;
    sampleCountRef.current = 0;
    elapsedRef.current = 0;
    setResult(null);
    setElapsed(0);
    setLevelBars(new Array(28).fill(0.12));
    setIsStarting(true);

    try {
      await stream.start();
      if (!startRequestedRef.current || startSessionRef.current !== sessionId) {
        stream.stop();
        return;
      }
      recordingRef.current = true;
      setIsRecording(true);
      beginRecordingTimer();
    } catch (error) {
      Alert.alert('Audio stream error', error?.message ?? 'Unable to start microphone stream.');
    } finally {
      if (startSessionRef.current === sessionId) {
        setIsStarting(false);
      }
    }
  };

  const stopRecording = async () => {
    startRequestedRef.current = false;
    if (isStarting && !recordingRef.current) {
      setIsStarting(false);
      try {
        stream.stop();
      } catch {
        // Ignore stop races while the native stream is still starting.
      }
      return;
    }
    if (!recordingRef.current && !isStreaming) return;
    recordingRef.current = false;
    setIsRecording(false);
    clearRecordingTimer();

    try {
      await stream.stop();
    } catch {
      // Some platforms stop the stream before the UI callback completes.
    }

    setIsAnalyzing(true);
    setTimeout(() => {
      const sampleRate = sampleRateRef.current || TARGET_SAMPLE_RATE;
      const maxSamples = Math.ceil(sampleRate * MAX_SECONDS);
      const samples = mergeChunks(chunksRef.current, maxSamples);
      if (samples.length < sampleRate * MIN_SECONDS) {
        setIsAnalyzing(false);
        Alert.alert(copy.result, copy.tooShort);
        return;
      }
      const rms = Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / samples.length);
      if (rms < 0.006) {
        setIsAnalyzing(false);
        Alert.alert(copy.result, copy.tooQuiet);
        return;
      }
      const nextResult = analyzeSamples(samples, sampleRate);
      setResult(nextResult);
      setLevelBars(nextResult.bars);
      setIsAnalyzing(false);
    }, 60);
  };

  const primaryAction = () => {
    if (isAnalyzing) return;
    if (isStarting || isRecording || isStreaming) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const status = isAnalyzing ? copy.analyzing : isStarting ? copy.starting : isRecording ? copy.recording : copy.ready;
  const resultTone = result?.label === 'likelyAi' ? '#D64545' : result?.label === 'likelyHuman' ? '#157F55' : '#B76B00';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FAFC" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
          <TouchableOpacity style={styles.languageButton} onPress={() => setLanguage(language === 'en' ? 'ko' : 'en')}>
            <Text style={styles.languageText}>{copy.language}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>

        <View style={styles.recorderPanel}>
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>{status}</Text>
            <Text style={styles.timer}>
              {elapsed.toFixed(1)}
              <Text style={styles.timerUnit}> {copy.seconds}</Text>
            </Text>
          </View>

          <Waveform bars={levelBars} active={isRecording || Boolean(result)} />

          <TouchableOpacity
            style={[styles.recordButton, isRecording ? styles.stopButton : null]}
            onPress={primaryAction}
            disabled={isAnalyzing}
            activeOpacity={0.86}
          >
            {isAnalyzing || isStarting ? <ActivityIndicator color="#FFFFFF" /> : <View style={[styles.recordDot, isRecording ? styles.stopDot : null]} />}
          </TouchableOpacity>
          <Text style={styles.actionText}>{isStarting ? copy.starting : isRecording ? copy.stop : copy.record}</Text>
          <Text style={styles.hint}>{copy.sampleHint}</Text>
        </View>

        {result ? (
          <View style={styles.resultPanel}>
            <View style={styles.resultHeader}>
              <Text style={styles.sectionTitle}>{copy.result}</Text>
              <Text style={[styles.estimateBadge, { color: resultTone, borderColor: resultTone }]}>{copy.estimateOnly}</Text>
            </View>
            <Text style={[styles.resultLabel, { color: resultTone }]}>{copy[result.label]}</Text>

            <View style={styles.scoreRow}>
              <View style={styles.scoreBlock}>
                <Text style={styles.scoreLabel}>{copy.aiScore}</Text>
                <Text style={styles.scoreValue}>{result.aiScore}/100</Text>
              </View>
              <View style={styles.scoreBlock}>
                <Text style={styles.scoreLabel}>{copy.confidence}</Text>
                <Text style={styles.scoreValue}>{result.confidence}%</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>{copy.signals}</Text>
            <View style={styles.signalGrid}>
              <SignalCard label={copy.hnr} value={result.hnr.toFixed(1)} unit="dB" />
              <SignalCard label={copy.hfRatio} value={result.hfRatio.toFixed(2)} />
              <SignalCard label={copy.cpps} value={result.cpps.toFixed(1)} unit="dB" />
            </View>
          </View>
        ) : null}

        <View style={styles.privacyPanel}>
          <Text style={styles.privacyTitle}>{copy.privacy}</Text>
          <Text style={styles.privacyBody}>{copy.delete}</Text>
          <Text style={styles.disclaimer}>{copy.disclaimer}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  container: {
    padding: 22,
    paddingBottom: 36,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  eyebrow: {
    color: '#177A8A',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  languageButton: {
    minWidth: 52,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E6F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageText: {
    color: '#0B5563',
    fontWeight: '900',
  },
  title: {
    color: '#101928',
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 41,
    marginBottom: 10,
  },
  subtitle: {
    color: '#526071',
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 20,
  },
  recorderPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCE6EE',
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  statusRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusText: {
    color: '#26384D',
    fontSize: 15,
    fontWeight: '800',
  },
  timer: {
    color: '#101928',
    fontSize: 23,
    fontWeight: '900',
  },
  timerUnit: {
    color: '#6A7788',
    fontSize: 13,
    fontWeight: '700',
  },
  waveform: {
    width: '100%',
    height: 112,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 18,
  },
  waveSlot: {
    width: 6,
    height: '100%',
    justifyContent: 'center',
  },
  waveBar: {
    minHeight: 8,
    borderRadius: 4,
    backgroundColor: '#00A6D6',
  },
  recordButton: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#0E6FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0E6FFF',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  stopButton: {
    backgroundColor: '#D64545',
    shadowColor: '#D64545',
  },
  recordDot: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
  },
  stopDot: {
    width: 38,
    height: 38,
    borderRadius: 7,
  },
  actionText: {
    color: '#101928',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 14,
  },
  hint: {
    color: '#6A7788',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  resultPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCE6EE',
    padding: 18,
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#101928',
    fontSize: 16,
    fontWeight: '900',
  },
  estimateBadge: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: '900',
  },
  resultLabel: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  scoreBlock: {
    flex: 1,
    backgroundColor: '#F3F7FA',
    borderRadius: 8,
    padding: 14,
  },
  scoreLabel: {
    color: '#6A7788',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 7,
  },
  scoreValue: {
    color: '#101928',
    fontSize: 22,
    fontWeight: '900',
  },
  signalGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  signalCard: {
    flex: 1,
    minHeight: 82,
    backgroundColor: '#F8FBFD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1EBF2',
    padding: 10,
    justifyContent: 'center',
  },
  signalLabel: {
    color: '#6A7788',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
  },
  signalValue: {
    color: '#101928',
    fontSize: 21,
    fontWeight: '900',
  },
  signalUnit: {
    color: '#6A7788',
    fontSize: 12,
    fontWeight: '800',
  },
  privacyPanel: {
    backgroundColor: '#0F1E2E',
    borderRadius: 8,
    padding: 18,
  },
  privacyTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 8,
  },
  privacyBody: {
    color: '#BFD0DF',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  disclaimer: {
    color: '#D7E5EF',
    fontSize: 12,
    lineHeight: 18,
  },
});
