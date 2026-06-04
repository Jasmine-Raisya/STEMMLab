describe('syncService', () => {
  afterEach(() => {
    jest.resetModules();
  });

  async function loadSyncService(options: { configured: boolean; failRecords?: boolean } = { configured: true }) {
    const teamProfile = {
      id: 'team-1',
      authUid: 'uid-1',
      representativeEmail: 'team@example.com',
      teamName: 'Newton Squad',
      members: ['Ari', 'Bima'],
      gradeLevel: '7',
      createdAt: 50,
    };
    const localDb = {
      getUnsyncedSensorSamples: jest.fn(async () => [{ id: 1, activityId: 'earthquake', metric: 'acceleration', value: 2, timestamp: 100 }]),
      markSensorSamplesSynced: jest.fn(async () => undefined),
      getUnsyncedActivityLogs: jest.fn(async () => [{ id: 2, activity_id: 'reaction', team_id: 'team-1', payload_json: '{"score":240}', timestamp: 200 }]),
      markActivityLogsSynced: jest.fn(async () => undefined),
      getUnsyncedActivityReflections: jest.fn(async () => [{ id: 3, activityId: 'reaction', teamId: 'team-1', rating: 4, answers: { observation: 'Faster after practice' }, timestamp: 300 }]),
      markActivityReflectionsSynced: jest.fn(async () => undefined),
    };
    const firestoreService = {
      syncExperimentRecords: jest.fn(options.failRecords ? async () => { throw new Error('sync failed'); } : async () => undefined),
    };

    jest.doMock('@react-native-async-storage/async-storage', () => ({
      getItem: jest.fn(async (key: string) => (key === 'stemm.activeTeamProfile' ? JSON.stringify(teamProfile) : null)),
      setItem: jest.fn(async () => undefined),
      removeItem: jest.fn(async () => undefined),
    }));
    jest.doMock('../../src/services/firebaseConfig', () => ({ isFirebaseConfigured: options.configured }));
    jest.doMock('../../src/services/localDb', () => localDb);
    jest.doMock('../../src/services/firestoreService', () => firestoreService);

    return { localDb, firestoreService, syncService: require('../../src/services/syncService') };
  }

  it('skips sync when Firebase is not configured', async () => {
    const { syncService, localDb } = await loadSyncService({ configured: false });

    await expect(syncService.syncPendingLocalData()).resolves.toEqual({ skipped: true, samples: 0, logs: 0, reflections: 0 });
    expect(localDb.getUnsyncedSensorSamples).not.toHaveBeenCalled();
  });

  it('syncs pending experiment data to experiment_records, then marks them synced', async () => {
    const { syncService, localDb, firestoreService } = await loadSyncService({ configured: true });

    await expect(syncService.syncPendingLocalData()).resolves.toEqual({ skipped: false, samples: 1, logs: 1, reflections: 1 });

    expect(firestoreService.syncExperimentRecords).toHaveBeenNthCalledWith(1, [
      expect.objectContaining({
        id: 'team-1_sensor_sample_earthquake_1',
        activityId: 'earthquake',
        teamId: 'team-1',
        authUid: 'uid-1',
        score: 2,
        timestamp: 100,
        details: {
          type: 'sensor_sample',
          localRowId: 1,
          sensorData: [{ id: 1, activityId: 'earthquake', metric: 'acceleration', value: 2, timestamp: 100 }],
        },
      }),
    ]);
    expect(localDb.markSensorSamplesSynced).toHaveBeenCalledWith([1]);
    expect(firestoreService.syncExperimentRecords).toHaveBeenNthCalledWith(2, [
      expect.objectContaining({
        id: 'team-1_activity_result_reaction_2',
        score: 240,
        timestamp: 200,
        details: {
          type: 'activity_result',
          localRowId: 2,
          results: { score: 240 },
        },
      }),
    ]);
    expect(localDb.markActivityLogsSynced).toHaveBeenCalledWith([2]);
    expect(firestoreService.syncExperimentRecords).toHaveBeenNthCalledWith(3, [
      expect.objectContaining({
        id: 'team-1_reflection_reaction_3',
        score: 4,
        timestamp: 300,
        details: {
          type: 'reflection',
          localRowId: 3,
          reflection: { rating: 4, answers: { observation: 'Faster after practice' } },
        },
      }),
    ]);
    expect(localDb.markActivityReflectionsSynced).toHaveBeenCalledWith([3]);
  });

  it('retains local rows when experiment record sync fails', async () => {
    const { syncService, localDb } = await loadSyncService({ configured: true, failRecords: true });

    await expect(syncService.syncPendingLocalData()).rejects.toThrow('sync failed');
    expect(localDb.markSensorSamplesSynced).not.toHaveBeenCalled();
    expect(localDb.markActivityLogsSynced).not.toHaveBeenCalled();
    expect(localDb.markActivityReflectionsSynced).not.toHaveBeenCalled();
  });
});
