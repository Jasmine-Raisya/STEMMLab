import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';

import { getCurrentCoordinates } from '../services/locationService';
import { insertSensorSample } from '../services/localDb';
import { fireSafetyAlert } from '../services/notificationService';
import { SensorSample } from '../types/models';
import { useBatteryGuard } from './useBatteryGuard';

interface SoundMeterState {
  samples: SensorSample[];
  decibel: number;
  recording: boolean;
  permissionGranted: boolean;
  meteringAvailable: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  battery: ReturnType<typeof useBatteryGuard>;
}

function meteringToDecibels(metering?: number) {
  if (typeof metering !== 'number') return 0;
  if (metering <= -120) return 0;
  const normalized = Math.max(0, Math.min(1, (metering + 90) / 90));
  return Math.max(0, Math.min(100, Math.round(normalized * 90)));
}

export function useSoundMeter(): SoundMeterState {
  const [samples, setSamples] = useState<SensorSample[]>([]);
  const [decibel, setDecibel] = useState(0);
  const [recording, setRecording] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const battery = useBatteryGuard();
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const recorderState = useAudioRecorderState(recorder, battery.shouldThrottle ? 1000 : 500);
  const coordinatesRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const lastSampleAtRef = useRef(0);
  const isStartingRef = useRef(false);
  const stopRef = useRef<() => Promise<void>>(async () => undefined);

  const start = useCallback(async () => {
    if (isStartingRef.current || recording || recorderState.isRecording || recorder.isRecording) return;
    isStartingRef.current = true;

    try {
      setError(null);
      const permission = await requestRecordingPermissionsAsync();
      setPermissionGranted(permission.granted);
      if (!permission.granted) {
        setError('Microphone permission was not granted.');
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        interruptionMode: 'mixWithOthers',
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        shouldRouteThroughEarpiece: false,
      });
      coordinatesRef.current = await getCurrentCoordinates();
      if (!recorderState.canRecord) {
        await recorder.prepareToRecordAsync();
      }
      recorder.record();
      setRecording(true);
    } catch (startError) {
      setRecording(false);
      setError(startError instanceof Error ? startError.message : 'Unable to start the microphone.');
    } finally {
      isStartingRef.current = false;
    }
  }, [recorder, recorderState.canRecord, recorderState.isRecording, recording]);

  const stop = useCallback(async () => {
    setRecording(false);
    setDecibel(0);
    try {
      if (recorder.isRecording) {
        await recorder.stop();
      }
    } catch (stopError) {
      setError(stopError instanceof Error ? stopError.message : 'Unable to stop the microphone.');
    }
    await setAudioModeAsync({
      allowsRecording: false,
      interruptionMode: 'mixWithOthers',
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
    }).catch(() => undefined);
  }, [recorder]);

  useEffect(() => {
    if (!recording || !recorderState.isRecording) return;
    const now = Date.now();
    const minInterval = battery.shouldThrottle ? 1000 : 500;
    if (now - lastSampleAtRef.current < minInterval) return;

    lastSampleAtRef.current = now;
    const nextDb = meteringToDecibels(recorderState.metering);
    setDecibel(nextDb);
    const sample: SensorSample = {
      activityId: 'sound',
      metric: 'decibel',
      value: nextDb,
      latitude: coordinatesRef.current?.latitude,
      longitude: coordinatesRef.current?.longitude,
      timestamp: now,
    };
    setSamples((previous) => [...previous.slice(-59), sample]);
    void insertSensorSample(sample);
    if (nextDb >= 85) {
      void fireSafetyAlert('Sound safety alert', 'Noise levels are above the safe classroom threshold.');
    }
  }, [battery.shouldThrottle, recorderState.isRecording, recorderState.metering, recording]);

  useEffect(() => {
    stopRef.current = stop;
  }, [stop]);

  useEffect(() => () => {
    void stopRef.current();
  }, []);

  return useMemo(
    () => ({
      samples,
      decibel,
      recording,
      permissionGranted,
      meteringAvailable: typeof recorderState.metering === 'number',
      error,
      start,
      stop,
      battery,
    }),
    [battery, decibel, error, permissionGranted, recorderState.metering, recording, samples, start, stop],
  );
}
