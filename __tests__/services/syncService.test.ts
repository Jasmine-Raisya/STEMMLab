describe('syncService', () => {
  afterEach(() => {
    jest.resetModules();
  });

  async function loadSyncService(options: { configured: boolean; failSamples?: boolean } = { configured: true }) {
    const localDb = {
      getUnsyncedSensorSamples: jest.fn(async () => [{ id: 1, activityId: 'earthquake', metric: 'acceleration', value: 2, timestamp: 100 }]),
      markSensorSamplesSynced: jest.fn(async () => undefined),
      getUnsyncedActivityLogs: jest.fn(async () => [{ id: 2, activity_id: 'reaction', team_id: 'team-1', payload_json: '{"score":240}', timestamp: 200 }]),
      markActivityLogsSynced: jest.fn(async () => undefined),
    };
    const firestoreService = {
      syncSensorSamples: jest.fn(options.failSamples ? async () => { throw new Error('sync failed'); } : async () => undefined),
      syncActivityLog: jest.fn(async () => undefined),
    };

    jest.doMock('../../src/services/firebaseConfig', () => ({ isFirebaseConfigured: options.configured }));
    jest.doMock('../../src/services/localDb', () => localDb);
    jest.doMock('../../src/services/firestoreService', () => firestoreService);

    return { localDb, firestoreService, syncService: require('../../src/services/syncService') };
  }

  it('skips sync when Firebase is not configured', async () => {
    const { syncService, localDb } = await loadSyncService({ configured: false });

    await expect(syncService.syncPendingLocalData()).resolves.toEqual({ skipped: true, samples: 0, logs: 0 });
    expect(localDb.getUnsyncedSensorSamples).not.toHaveBeenCalled();
  });

  it('syncs pending samples and logs, then marks them synced', async () => {
    const { syncService, localDb, firestoreService } = await loadSyncService({ configured: true });

    await expect(syncService.syncPendingLocalData()).resolves.toEqual({ skipped: false, samples: 1, logs: 1 });

    expect(firestoreService.syncSensorSamples).toHaveBeenCalledWith([
      { id: 1, activityId: 'earthquake', metric: 'acceleration', value: 2, timestamp: 100 },
    ]);
    expect(localDb.markSensorSamplesSynced).toHaveBeenCalledWith([1]);
    expect(firestoreService.syncActivityLog).toHaveBeenCalledWith({
      id: 2,
      activityId: 'reaction',
      teamId: 'team-1',
      payload: { score: 240 },
      timestamp: 200,
    });
    expect(localDb.markActivityLogsSynced).toHaveBeenCalledWith([2]);
  });

  it('retains local rows when sample sync fails', async () => {
    const { syncService, localDb } = await loadSyncService({ configured: true, failSamples: true });

    await expect(syncService.syncPendingLocalData()).rejects.toThrow('sync failed');
    expect(localDb.markSensorSamplesSynced).not.toHaveBeenCalled();
    expect(localDb.markActivityLogsSynced).not.toHaveBeenCalled();
  });
});
