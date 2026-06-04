import { TeamProfile } from '../../src/types/models';

describe('localDb native adapter', () => {
  afterEach(() => {
    jest.resetModules();
  });

  function loadLocalDb(row: unknown = null) {
    const db = {
      execAsync: jest.fn(async () => undefined),
      runAsync: jest.fn(async () => undefined),
      getFirstAsync: jest.fn(async () => row),
      getAllAsync: jest.fn(async () => []),
      withTransactionAsync: jest.fn(async (task: () => Promise<void>) => task()),
    };

    jest.doMock('expo-sqlite', () => ({
      openDatabaseAsync: jest.fn(async () => db),
    }));

    return { db, localDb: require('../../src/services/localDb.native') };
  }

  it('saves a team profile with serialized members', async () => {
    const { db, localDb } = loadLocalDb();
    const profile: TeamProfile = {
      id: 'team-1',
      authUid: 'uid-1',
      representativeEmail: 'rep@example.com',
      teamName: 'STEMM Team',
      members: ['Ari', 'Bima'],
      gradeLevel: '10',
      createdAt: 1000,
    };

    await localDb.saveTeamProfile(profile);

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO team_profiles'),
      ['team-1', 'uid-1', 'rep@example.com', 'STEMM Team', JSON.stringify(['Ari', 'Bima']), '10', 1000],
    );
  });

  it('maps a stored team profile row back to the app model', async () => {
    const { localDb } = loadLocalDb({
      id: 'team-1',
      auth_uid: 'uid-1',
      representative_email: 'rep@example.com',
      team_name: 'STEMM Team',
      members_json: JSON.stringify(['Ari']),
      grade_level: '10',
      created_at: 1000,
    });

    await expect(localDb.getTeamProfile('team-1')).resolves.toEqual({
      id: 'team-1',
      authUid: 'uid-1',
      representativeEmail: 'rep@example.com',
      teamName: 'STEMM Team',
      members: ['Ari'],
      gradeLevel: '10',
      createdAt: 1000,
    });
  });

  it('inserts activity logs with serialized payloads', async () => {
    const { db, localDb } = loadLocalDb();

    await localDb.insertActivityLog({
      activityId: 'reaction',
      teamId: 'team-1',
      payload: { score: 240 },
      timestamp: 2000,
      synced: false,
    });

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO activity_logs'),
      ['reaction', 'team-1', JSON.stringify({ score: 240 }), 2000, 0],
    );
  });
});
