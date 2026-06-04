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
  start: () => Promise<void>;
  stop: () => Promise<void>;
  battery: ReturnType<typeof useBatteryGuard>;
}

function meteringToDecibels(metering?: number) {
  if (typeof metering !== 'number') return 0;
  return Math.max(0, Math.min(120, Math.round(120 + metering)));
}

export function useSoundMeter(): SoundMeterState {
  const [samples, setSamples] = useState<SensorSample[]>([]);
  const [decibel, setDecibel] = useState(0);
  const [recording, setRecording] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const battery = useBatteryGuard();
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const recorderState = useAudioRecorderState(recorder, battery.shouldThrottle ? 1000 : 500);
  const coordinatesRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const lastSampleAtRef = useRef(0);

  const start = useCallback(async () => {
    const permission = await requestRecordingPermissionsAsync();
    setPermissionGranted(permission.granted);
    if (!permission.granted) return;

    await setAudioModeAsync({
      allowsRecording: true,
      interruptionMode: 'mixWithOthers',
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
    });
    coordinatesRef.current = await getCurrentCoordinates();
    await recorder.prepareToRecordAsync();
    recorder.record();
    setRecording(true);
  }, [recorder]);

  const stop = useCallback(async () => {
    setRecording(false);
    if (recorder.isRecording) {
      await recorder.stop();
    }
    await setAudioModeAsync({
      allowsRecording: false,
      interruptionMode: 'mixWithOthers',
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
    });
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

  useEffect(() => () => {
    void stop();
  }, [stop]);

  return useMemo(
    () => ({ samples, decibel, recording, permissionGranted, start, stop, battery }),
    [battery, decibel, permissionGranted, recording, samples],
  );
}
