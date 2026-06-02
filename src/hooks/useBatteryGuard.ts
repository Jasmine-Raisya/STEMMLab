import { useEffect, useMemo, useState } from 'react';
import * as Battery from 'expo-battery';

const LOW_BATTERY_THRESHOLD = 0.2;

export function useBatteryGuard() {
  const [level, setLevel] = useState(1);
  const [lowPowerMode, setLowPowerMode] = useState(false);

  useEffect(() => {
    let mounted = true;

    Battery.getPowerStateAsync().then((state) => {
      if (!mounted) return;
      if (typeof state.batteryLevel === 'number' && state.batteryLevel >= 0) {
        setLevel(state.batteryLevel);
      }
      setLowPowerMode(Boolean(state.lowPowerMode));
    });

    const levelSub = Battery.addBatteryLevelListener((event) => setLevel(event.batteryLevel));
    const powerSub = Battery.addLowPowerModeListener((event) => setLowPowerMode(event.lowPowerMode));

    return () => {
      mounted = false;
      levelSub.remove();
      powerSub.remove();
    };
  }, []);

  return useMemo(
    () => ({
      level,
      percent: Math.round(level * 100),
      lowPowerMode,
      isLow: level >= 0 && level < LOW_BATTERY_THRESHOLD,
      shouldThrottle: lowPowerMode || (level >= 0 && level < LOW_BATTERY_THRESHOLD),
    }),
    [level, lowPowerMode],
  );
}
