import * as SQLite from 'expo-sqlite';

import { deleteExperimentDraft, getExperimentDraft, getTeamProfile, initializeDatabase, insertActivityLog, insertActivityReflection, insertSensorSample, saveExperimentDraft, saveTeamProfile } from '../../src/services/localDb';

describe('localDb', () => {
  const db = {
    execAsync: jest.fn(async () => undefined),
    runAsync: jest.fn(async () => undefined),
    getFirstAsync: jest.fn(async () => null),
    getAllAsync: jest.fn(async () => []),
    withTransactionAsync: jest.fn(async (task: () => Promise<void>) => task()),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(SQLite.openDatabaseAsync).mockResolvedValue(db as never);
  });

  it('initializes required tables', async () => {
    await initializeDatabase();

    expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('stemm_lab.db');
    const schemaSql = (db.execAsync as jest.Mock).mock.calls[0][0] as string;
    expect(schemaSql).toContain('CREATE TABLE IF NOT EXISTS team_profiles');
    expect(schemaSql).toContain('CREATE TABLE IF NOT EXISTS sensor_samples');
    expect(schemaSql).toContain('CREATE TABLE IF NOT EXISTS experiment_drafts');
  });

  it('saves and maps a team profile', async () => {
    await saveTeamProfile({
      id: 'team-1',
      authUid: 'uid-1',
      representativeEmail: 'team@example.com',
      teamName: 'Team One',
      members: ['Ivy', 'Rai'],
      gradeLevel: '7',
      createdAt: 100,
    });

    expect(db.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT OR REPLACE INTO team_profiles'), expect.arrayContaining(['team-1', 'uid-1', 'team@example.com']));

    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce({
      id: 'team-1',
      auth_uid: 'uid-1',
      representative_email: 'team@example.com',
      team_name: 'Team One',
      members_json: '["Ivy","Rai"]',
      grade_level: '7',
      created_at: 100,
    });

    await expect(getTeamProfile('team-1')).resolves.toMatchObject({ teamName: 'Team One', members: ['Ivy', 'Rai'] });
  });

  it('inserts sensor samples, activity logs, and reflections', async () => {
    await insertSensorSample({ activityId: 'earthquake', metric: 'acceleration', value: 1.2, timestamp: 1 });
    await insertActivityLog({ activityId: 'parachute', teamId: 'team-1', payload: { score: 2 }, timestamp: 2 });
    await insertActivityReflection({ activityId: 'reaction', teamId: 'team-1', rating: 4, answers: { q: 'a' }, timestamp: 3 });

    expect(db.runAsync).toHaveBeenCalledTimes(3);
  });

  it('stores, loads, and deletes local experiment drafts', async () => {
    await saveExperimentDraft('sound', 'team-1', { rating: 4, answers: { q: 'draft' } });

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO experiment_drafts'),
      expect.arrayContaining(['team-1:sound', 'sound', 'team-1']),
    );

    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce({ payload_json: '{"rating":4,"answers":{"q":"draft"}}' });

    await expect(getExperimentDraft('sound', 'team-1')).resolves.toEqual({ rating: 4, answers: { q: 'draft' } });

    await deleteExperimentDraft('sound', 'team-1');

    expect(db.runAsync).toHaveBeenCalledWith('DELETE FROM experiment_drafts WHERE id = ?', ['team-1:sound']);
  });
});
