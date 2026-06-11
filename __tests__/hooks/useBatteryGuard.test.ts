import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Battery from 'expo-battery';

import { useBatteryGuard } from '../../src/hooks/useBatteryGuard';

describe('useBatteryGuard', () => {
  it('reports normal battery state without throttling', async () => {
    jest.mocked(Battery.getPowerStateAsync).mockResolvedValueOnce({ batteryLevel: 0.75, lowPowerMode: false } as never);

    const { result } = renderHook(() => useBatteryGuard());

    await waitFor(() => expect(result.current.percent).toBe(75));
    expect(result.current.isLow).toBe(false);
    expect(result.current.shouldThrottle).toBe(false);
  });

  it('throttles when battery level listener reports low level', async () => {
    let levelListener: ((event: { batteryLevel: number }) => void) | undefined;
    jest.mocked(Battery.addBatteryLevelListener).mockImplementationOnce((listener) => {
      levelListener = listener as typeof levelListener;
      return { remove: jest.fn() };
    });

    const { result } = renderHook(() => useBatteryGuard());

    act(() => levelListener?.({ batteryLevel: 0.1 }));
    expect(result.current.percent).toBe(10);
    expect(result.current.shouldThrottle).toBe(true);
  });

  it('throttles in low power mode', () => {
    let powerListener: ((event: { lowPowerMode: boolean }) => void) | undefined;
    jest.mocked(Battery.addLowPowerModeListener).mockImplementationOnce((listener) => {
      powerListener = listener as typeof powerListener;
      return { remove: jest.fn() };
    });

    const { result } = renderHook(() => useBatteryGuard());

    act(() => powerListener?.({ lowPowerMode: true }));
    expect(result.current.lowPowerMode).toBe(true);
    expect(result.current.shouldThrottle).toBe(true);
  });
});
