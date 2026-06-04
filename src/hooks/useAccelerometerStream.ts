import { useEffect, useMemo, useState } from 'react';
import { Accelerometer } from 'expo-sensors';

import { insertSensorSample } from '../services/localDb';
import { fireSafetyAlert } from '../services/notificationService';
import { ActivityId, SensorSample } from '../types/models';
import { useBatteryGuard } from './useBatteryGuard';

interface Options {
  activityId: ActivityId;
  metric?: string;
  active: boolean;
  threshold?: number;
  latitude?: number;
  longitude?: number;
}

export function useAccelerometerStream({
  activityId,
  metric = 'acceleration',
  active,
  threshold = 1.8,
  latitude,
  longitude,
}: Options) {
  const [samples, setSamples] = useState<SensorSample[]>([]);
  const [available, setAvailable] = useState(true);
  const [alerted, setAlerted] = useState(false);
  const battery = useBatteryGuard();

  const interval = battery.shouldThrottle ? 650 : 250;

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;
    let mounted = true;

    Accelerometer.isAvailableAsync().then((isAvailable) => {
      if (!mounted) return;
      setAvailable(isAvailable);
      if (!isAvailable || !active) return;

      Accelerometer.setUpdateInterval(interval);
      subscription = Accelerometer.addListener((reading) => {
        const value = Math.sqrt(reading.x ** 2 + reading.y ** 2 + reading.z ** 2);
        const sample: SensorSample = {
          activityId,
          metric,
          value,
          x: reading.x,
          y: reading.y,
          z: reading.z,
          latitude,
          longitude,
          timestamp: Date.now(),
        };

        setSamples((previous) => [...previous.slice(-59), sample]);
        void insertSensorSample(sample);

        if (value > threshold && !alerted) {
          setAlerted(true);
          void fireSafetyAlert('STEMM Lab Alert', 'High vibration detected. Check the structure before continuing.');
        }
      });
    });

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, [activityId, active, alerted, interval, latitude, longitude, metric, threshold]);

  return useMemo(() => ({ samples, available, battery }), [available, battery, samples]);
}
