import { renderHook, waitFor } from '@testing-library/react-native';
import * as Battery from 'expo-battery';

import { useBatteryGuard } from '../../src/hooks/useBatteryGuard';

describe('useBatteryGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('flags low battery levels below the threshold', async () => {
    (Battery.getPowerStateAsync as jest.Mock).mockResolvedValue({ batteryLevel: 0.1, lowPowerMode: false });

    const { result } = renderHook(() => useBatteryGuard());

    await waitFor(() => expect(result.current.level).toBe(0.1));
    expect(result.current.percent).toBe(10);
    expect(result.current.isLow).toBe(true);
    expect(result.current.shouldThrottle).toBe(true);
  });

  it('throttles when low power mode is enabled even with healthy battery', async () => {
    (Battery.getPowerStateAsync as jest.Mock).mockResolvedValue({ batteryLevel: 0.75, lowPowerMode: true });

    const { result } = renderHook(() => useBatteryGuard());

    await waitFor(() => expect(result.current.lowPowerMode).toBe(true));
    expect(result.current.isLow).toBe(false);
    expect(result.current.shouldThrottle).toBe(true);
  });

  it('does not crash when battery listeners are unavailable on web', async () => {
    const batteryApi = Battery as unknown as {
      addBatteryLevelListener?: unknown;
      addLowPowerModeListener?: unknown;
    };
    const addBatteryLevelListener = batteryApi.addBatteryLevelListener;
    const addLowPowerModeListener = batteryApi.addLowPowerModeListener;
    batteryApi.addBatteryLevelListener = undefined;
    batteryApi.addLowPowerModeListener = undefined;
    (Battery.getPowerStateAsync as jest.Mock).mockResolvedValue({ batteryLevel: 0.6, lowPowerMode: false });

    const { result, unmount } = renderHook(() => useBatteryGuard());

    await waitFor(() => expect(result.current.percent).toBe(60));
    expect(() => unmount()).not.toThrow();
    batteryApi.addBatteryLevelListener = addBatteryLevelListener;
    batteryApi.addLowPowerModeListener = addLowPowerModeListener;
  });
});
