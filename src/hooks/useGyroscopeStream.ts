import { useEffect, useMemo, useState } from 'react';
import { Gyroscope } from 'expo-sensors';

import { insertSensorSample } from '../services/localDb';
import { ActivityId, SensorSample } from '../types/models';
import { useBatteryGuard } from './useBatteryGuard';

export function useGyroscopeStream(activityId: ActivityId, active: boolean) {
  const [samples, setSamples] = useState<SensorSample[]>([]);
  const battery = useBatteryGuard();
  const interval = battery.shouldThrottle ? 700 : 300;

  useEffect(() => {
    if (!active) return undefined;

    Gyroscope.setUpdateInterval(interval);
    const subscription = Gyroscope.addListener((reading) => {
      const value = Math.sqrt(reading.x ** 2 + reading.y ** 2 + reading.z ** 2);
      const sample: SensorSample = {
        activityId,
        metric: 'rotation',
        value,
        x: reading.x,
        y: reading.y,
        z: reading.z,
        timestamp: Date.now(),
      };
      setSamples((previous) => [...previous.slice(-59), sample]);
      void insertSensorSample(sample);
    });

    return () => subscription.remove();
  }, [activityId, active, interval]);

  return useMemo(() => ({ samples, battery }), [battery, samples]);
}
