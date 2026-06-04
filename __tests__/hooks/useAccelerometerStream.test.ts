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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('subscribes to accelerometer readings and stores computed samples', async () => {
    const { result } = renderHook(() => useAccelerometerStream({ activityId: 'earthquake', active: true, threshold: 10 }));

    await waitFor(() => expect(result.current.samples).toHaveLength(1));

    expect(Accelerometer.setUpdateInterval).toHaveBeenCalledWith(250);
    expect(insertSensorSample).toHaveBeenCalledWith(expect.objectContaining({
      activityId: 'earthquake',
      metric: 'acceleration',
      value: expect.any(Number),
      x: 0.1,
      y: 0.2,
      z: 1,
    }));
  });

  it('does not subscribe when inactive', async () => {
    renderHook(() => useAccelerometerStream({ activityId: 'earthquake', active: false }));

    await waitFor(() => expect(Accelerometer.isAvailableAsync).toHaveBeenCalled());
    expect(Accelerometer.addListener).not.toHaveBeenCalled();
    expect(fireSafetyAlert).not.toHaveBeenCalled();
  });
});
