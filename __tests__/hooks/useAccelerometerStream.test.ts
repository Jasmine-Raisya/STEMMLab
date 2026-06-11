import { renderHook, waitFor } from '@testing-library/react-native';
import { Accelerometer } from 'expo-sensors';

import { useAccelerometerStream } from '../../src/hooks/useAccelerometerStream';
import { insertSensorSample } from '../../src/services/localDb';
import { fireSafetyAlert } from '../../src/services/notificationService';

jest.mock('../../src/services/localDb', () => ({
  insertSensorSample: jest.fn(async () => undefined),
}));

jest.mock('../../src/services/notificationService', () => ({
  fireSafetyAlert: jest.fn(async () => undefined),
}));

describe('useAccelerometerStream', () => {
  beforeEach(() => jest.clearAllMocks());

  it('records accelerometer samples while active', async () => {
    const { result } = renderHook(() => useAccelerometerStream({ activityId: 'earthquake', active: true, threshold: 10 }));

    await waitFor(() => expect(result.current.samples.length).toBeGreaterThan(0));
    expect(Accelerometer.setUpdateInterval).toHaveBeenCalledWith(250);
    expect(insertSensorSample).toHaveBeenCalledWith(expect.objectContaining({
      activityId: 'earthquake',
      metric: 'acceleration',
      value: expect.any(Number),
    }));
  });

  it('does not subscribe when inactive', async () => {
    renderHook(() => useAccelerometerStream({ activityId: 'breathing', active: false }));

    await waitFor(() => expect(Accelerometer.isAvailableAsync).toHaveBeenCalled());
    expect(insertSensorSample).not.toHaveBeenCalled();
  });

  it('fires a safety alert when threshold is exceeded', async () => {
    renderHook(() => useAccelerometerStream({ activityId: 'earthquake', active: true, threshold: 0.01 }));

    await waitFor(() => expect(fireSafetyAlert).toHaveBeenCalledTimes(1));
  });
});
