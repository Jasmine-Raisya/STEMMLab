import AsyncStorage from '@react-native-async-storage/async-storage';

import { submitFinalExperimentRecord, syncPendingLocalData } from '../../src/services/syncService';
import * as localDb from '../../src/services/localDb';
import { syncExperimentRecords } from '../../src/services/firestoreService';

jest.mock('../../src/services/firebaseConfig', () => ({
  isFirebaseConfigured: true,
}));

jest.mock('../../src/services/firestoreService', () => ({
  syncExperimentRecords: jest.fn(async () => undefined),
}));

jest.mock('../../src/services/localDb', () => ({
  deletePendingExperimentRecords: jest.fn(async () => undefined),
  getPendingExperimentRecords: jest.fn(),
  getRecentSensorSamples: jest.fn(),
  insertActivityReflection: jest.fn(),
  markActivityReflectionsSynced: jest.fn(async () => undefined),
  queueExperimentRecord: jest.fn(async () => undefined),
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
    jest.mocked(localDb.insertActivityReflection).mockResolvedValue(7);
    jest.mocked(localDb.getRecentSensorSamples).mockResolvedValue([
      { id: 1, activityId: 'reaction', metric: 'tap', value: 210, timestamp: 10 },
    ]);
    jest.mocked(localDb.getPendingExperimentRecords).mockResolvedValue([]);
  });

  it('submits one complete final experiment record with results, reflection, and sensor context', async () => {
    await expect(submitFinalExperimentRecord({
      activityId: 'reaction',
      teamId: 'team-1',
      rating: 5,
      answers: { q: 'a' },
      results: { bestTime: 210, attempts: 1 },
      timestamp: 30,
    })).resolves.toMatchObject({ skipped: false });

    expect(syncExperimentRecords).toHaveBeenCalledTimes(1);
    expect(jest.mocked(syncExperimentRecords).mock.calls[0][0]).toHaveLength(1);
    expect(jest.mocked(syncExperimentRecords).mock.calls[0][0][0]).toMatchObject({
      id: 'team-1_experiment_reaction_7',
      teamId: 'team-1',
      activityId: 'reaction',
      score: 210,
      details: {
        type: 'experiment_record',
        localRowId: 7,
        results: { bestTime: 210, attempts: 1 },
        reflection: { rating: 5, answers: { q: 'a' } },
        sensorData: [expect.objectContaining({ metric: 'tap', value: 210 })],
      },
    });
    expect(localDb.queueExperimentRecord).toHaveBeenCalledTimes(1);
    expect(localDb.deletePendingExperimentRecords).toHaveBeenCalledWith(['team-1_experiment_reaction_7']);
    expect(localDb.markActivityReflectionsSynced).toHaveBeenCalledWith([7]);
  });

  it('syncs only queued final experiment records during background sync', async () => {
    jest.mocked(localDb.getPendingExperimentRecords).mockResolvedValue([
      {
        id: 'team-1_experiment_reaction_7',
        teamId: 'team-1',
        activityId: 'reaction',
        score: 5,
        timestamp: 30,
        details: { type: 'experiment_record' },
      },
    ]);

    await expect(syncPendingLocalData()).resolves.toEqual({ skipped: false, samples: 0, logs: 0, reflections: 0, records: 1 });

    expect(syncExperimentRecords).toHaveBeenCalledTimes(1);
    expect(localDb.deletePendingExperimentRecords).toHaveBeenCalledWith(['team-1_experiment_reaction_7']);
  });

  it('returns zero counts when there are no queued final records', async () => {
    jest.mocked(localDb.getPendingExperimentRecords).mockResolvedValue([]);

    await expect(syncPendingLocalData()).resolves.toEqual({ skipped: false, samples: 0, logs: 0, reflections: 0, records: 0 });
    expect(syncExperimentRecords).not.toHaveBeenCalled();
  });
});
