import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getLocales } from 'expo-localization';
import { requestRecordingPermissionsAsync, setAudioModeAsync, useAudioStream } from 'expo-audio';

import { analyzeSamples, makeBarsFromSamples, mergeChunks, pcmFromBuffer } from './audio/analysis';
import { SignalCard } from './components/SignalCard';
import { Waveform } from './components/Waveform';
import { MAX_SECONDS, MIN_SECONDS, PRIVACY_POLICY_URL, STREAM_ENCODING, TARGET_SAMPLE_RATE } from './config/audio';
import { COPY } from './i18n/copy';
import { styles } from './styles';

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

  const openPrivacyPolicy = () => {
    Linking.openURL(PRIVACY_POLICY_URL).catch(() => {
      Alert.alert(copy.privacyPolicy, PRIVACY_POLICY_URL);
    });
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
              <SignalCard label={copy.f0Std} value={result.f0Std.toFixed(1)} unit="Hz" />
              <SignalCard label={copy.voicedRatio} value={`${Math.round(result.voicedRatio * 100)}`} unit="%" />
              <SignalCard label={copy.flatness} value={result.spectralFlatness.toFixed(2)} />
              <SignalCard label={copy.centroid} value={`${result.spectralCentroid}`} unit="Hz" />
            </View>
          </View>
        ) : null}

        <View style={styles.privacyPanel}>
          <Text style={styles.privacyTitle}>{copy.privacy}</Text>
          <Text style={styles.privacyBody}>{copy.delete}</Text>
          <Text style={styles.disclaimer}>{copy.disclaimer}</Text>
          <TouchableOpacity style={styles.privacyLink} onPress={openPrivacyPolicy} activeOpacity={0.78}>
            <Text style={styles.privacyLinkText}>{copy.privacyPolicy}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
