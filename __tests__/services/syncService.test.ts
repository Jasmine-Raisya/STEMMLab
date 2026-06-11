import AsyncStorage from '@react-native-async-storage/async-storage';

import { syncPendingLocalData } from '../../src/services/syncService';
import * as localDb from '../../src/services/localDb';
import { syncExperimentRecords } from '../../src/services/firestoreService';

jest.mock('../../src/services/firebaseConfig', () => ({
  isFirebaseConfigured: true,
}));

jest.mock('../../src/services/firestoreService', () => ({
  syncExperimentRecords: jest.fn(async () => undefined),
}));

jest.mock('../../src/services/localDb', () => ({
  getUnsyncedSensorSamples: jest.fn(),
  getUnsyncedActivityLogs: jest.fn(),
  getUnsyncedActivityReflections: jest.fn(),
  markSensorSamplesSynced: jest.fn(async () => undefined),
  markActivityLogsSynced: jest.fn(async () => undefined),
  markActivityReflectionsSynced: jest.fn(async () => undefined),
}));

describe('syncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify({
      id: 'team-1',
      authUid: 'uid-1',
      representativeEmail: 'team@example.com',
      teamName: 'Team One',
    }));
  });

  it('syncs local samples, logs, and reflections into experiment_records shape', async () => {
    jest.mocked(localDb.getUnsyncedSensorSamples).mockResolvedValue([{ id: 1, activityId: 'earthquake', metric: 'acceleration', value: 1.8, timestamp: 10 }]);
    jest.mocked(localDb.getUnsyncedActivityLogs).mockResolvedValue([{ id: 2, activity_id: 'parachute', team_id: 'team-1', payload_json: '{"score":7}', timestamp: 20, synced: 0 }]);
    jest.mocked(localDb.getUnsyncedActivityReflections).mockResolvedValue([{ id: 3, activityId: 'reaction', teamId: 'team-1', rating: 5, answers: { q: 'a' }, timestamp: 30, synced: false }]);

    await expect(syncPendingLocalData()).resolves.toEqual({ skipped: false, samples: 1, logs: 1, reflections: 1 });

    expect(syncExperimentRecords).toHaveBeenCalledTimes(3);
    expect(jest.mocked(syncExperimentRecords).mock.calls[0][0][0]).toMatchObject({
      teamId: 'team-1',
      activityId: 'earthquake',
      details: expect.objectContaining({ type: 'sensor_sample' }),
    });
    expect(localDb.markSensorSamplesSynced).toHaveBeenCalledWith([1]);
    expect(localDb.markActivityLogsSynced).toHaveBeenCalledWith([2]);
    expect(localDb.markActivityReflectionsSynced).toHaveBeenCalledWith([3]);
  });

  it('returns zero counts when there is nothing pending', async () => {
    jest.mocked(localDb.getUnsyncedSensorSamples).mockResolvedValue([]);
    jest.mocked(localDb.getUnsyncedActivityLogs).mockResolvedValue([]);
    jest.mocked(localDb.getUnsyncedActivityReflections).mockResolvedValue([]);

    await expect(syncPendingLocalData()).resolves.toEqual({ skipped: false, samples: 0, logs: 0, reflections: 0 });
    expect(syncExperimentRecords).not.toHaveBeenCalled();
  });
});
