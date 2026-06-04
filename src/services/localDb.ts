import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { ActivityLog, ActivityReflection, SensorSample, TeamProfile } from '../types/models';

// NOTE: For simplicity we keep SQLite sync APIs (openDatabaseSync, execSync, …).
// On native devices this works fine, but it blocks the JS thread.
// In a future iteration consider using the async APIs (openDatabaseAsync, execAsync, etc.).

let database: SQLite.SQLiteDatabase | null = null;

// export function getDb(): SQLite.SQLiteDatabase {
//   if (!database) {
//     database = SQLite.openDatabaseSync('stemmlab_offline.db');
//   }
//   return database;
// }

export function getDb(): SQLite.SQLiteDatabase {
  if (!database) {
    if (Platform.OS === 'web') {
      // Web fallback – use a simple in‑memory stub so calls are no‑ops.
      // This prevents the SharedArrayBuffer crash.
      const noop = {
        execSync: () => { },
        runSync: () => { },
        getFirstSync: () => null,
        getAllSync: () => [],
      } as unknown as SQLite.SQLiteDatabase;
      database = noop;
    } else {
      // Native platforms – use real SQLite.
      database = SQLite.openDatabaseSync('stemmlab_offline.db');
    }
  }
  return database;
}

export async function initializeDatabase(): Promise<void> {
  const db = getDb();

  db.execSync('PRAGMA foreign_keys = ON;');

  db.execSync(`
    CREATE TABLE IF NOT EXISTS team_profile (
      id TEXT PRIMARY KEY,
      teamId TEXT NOT NULL,
      teamName TEXT NOT NULL,
      members TEXT NOT NULL,
      yearLevel TEXT NOT NULL
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS experiment_records (
      id TEXT PRIMARY KEY,
      teamId TEXT NOT NULL,
      activityId TEXT NOT NULL,
      score REAL NOT NULL,
      timestamp INTEGER NOT NULL,
      details TEXT,
      FOREIGN KEY (teamId) REFERENCES team_profile(id) ON DELETE CASCADE
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      collectionName TEXT NOT NULL,
      payload TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS sensor_samples (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id TEXT NOT NULL,
      metric TEXT NOT NULL,
      value REAL NOT NULL,
      x REAL,
      y REAL,
      z REAL,
      latitude REAL,
      longitude REAL,
      timestamp INTEGER NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS activity_reflections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id TEXT NOT NULL,
      team_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      answers_json TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id TEXT NOT NULL,
      team_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );
  `);

  console.log('Local SQLite Database relational schema initialized successfully.');
}

export function saveTeamLocal(team: { id: string; teamId: string; teamName: string; members: string[]; yearLevel: string }): void {
  const db = getDb();
  db.runSync(
    'INSERT OR REPLACE INTO team_profile (id, teamId, teamName, members, yearLevel) VALUES (?, ?, ?, ?, ?)',
    [team.id, team.teamId, team.teamName, JSON.stringify(team.members), team.yearLevel]
  );
  // Note: Firestore sync is handled directly by teamContext.tsx — no enqueueSync needed here.
}

export function getTeamLocal(): any {
  const db = getDb();
  const row: any = db.getFirstSync('SELECT * FROM team_profile LIMIT 1');
  if (!row) return null;
  return {
    id: row.id,
    teamId: row.teamId,
    teamName: row.teamName,
    members: JSON.parse(row.members),
    yearLevel: row.yearLevel
  };
}

export function saveExperimentRecordLocal(record: { id: string; teamId: string; activityId: string; score: number; timestamp: number; details?: any }): void {
  const db = getDb();
  db.runSync(
    'INSERT INTO experiment_records (id, teamId, activityId, score, timestamp, details) VALUES (?, ?, ?, ?, ?, ?)',
    [record.id, record.teamId, record.activityId, record.score, record.timestamp, record.details ? JSON.stringify(record.details) : null]
  );

  enqueueSync('experiment_records', record.id, record);
}

export function getExperimentRecordsLocal(teamId: string): any[] {
  const db = getDb();
  const rows = db.getAllSync(
    'SELECT * FROM experiment_records WHERE teamId = ? ORDER BY timestamp DESC',
    [teamId]
  );
  return rows.map((row: any) => ({
    id: row.id,
    teamId: row.teamId,
    activityId: row.activityId,
    score: row.score,
    timestamp: row.timestamp,
    details: row.details ? JSON.parse(row.details) : null
  }));
}

export function enqueueSync(collectionName: string, id: string, data: any): void {
  const db = getDb();
  const payload = JSON.stringify({ id, ...data });
  db.runSync(
    'INSERT OR REPLACE INTO sync_queue (id, collectionName, payload, timestamp) VALUES (?, ?, ?, ?)',
    [id, collectionName, payload, Date.now()]
  );
}

export function getPendingSyncsLocal(): any[] {
  const db = getDb();
  return db.getAllSync('SELECT * FROM sync_queue ORDER BY timestamp ASC');
}

export function dequeueSyncLocal(id: string): void {
  const db = getDb();
  db.runSync('DELETE FROM sync_queue WHERE id = ?', [id]);
}

export async function saveTeamProfile(profile: TeamProfile): Promise<void> {
  saveTeamLocal({
    id: profile.id,
    teamId: profile.authUid ?? profile.id,
    teamName: profile.teamName,
    members: profile.members,
    yearLevel: profile.gradeLevel,
  });
}

export async function getTeamProfile(id: string): Promise<TeamProfile | null> {
  const localTeam = getTeamLocal();
  if (!localTeam || localTeam.id !== id) return null;
  return {
    id: localTeam.id,
    authUid: localTeam.ownerUid,
    representativeEmail: localTeam.representativeEmail ?? localTeam.ownerEmail ?? '',
    teamName: localTeam.teamName,
    members: localTeam.members,
    gradeLevel: localTeam.gradeLevel ?? localTeam.yearLevel,
    createdAt: localTeam.createdAt ?? Date.now(),
  };
}

export async function insertSensorSample(sample: SensorSample): Promise<void> {
  const db = getDb();
  db.runSync(
    `INSERT INTO sensor_samples (activity_id, metric, value, x, y, z, latitude, longitude, timestamp, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sample.activityId,
      sample.metric,
      sample.value,
      sample.x ?? null,
      sample.y ?? null,
      sample.z ?? null,
      sample.latitude ?? null,
      sample.longitude ?? null,
      sample.timestamp,
      sample.synced ? 1 : 0,
    ],
  );
}

function mapSensorRow(row: any): SensorSample {
  return {
    id: row.id,
    activityId: row.activity_id,
    metric: row.metric,
    value: row.value,
    x: row.x,
    y: row.y,
    z: row.z,
    latitude: row.latitude,
    longitude: row.longitude,
    timestamp: row.timestamp,
    synced: row.synced === 1,
  };
}

export async function getUnsyncedSensorSamples(limit = 200): Promise<SensorSample[]> {
  const db = getDb();
  const rows = db.getAllSync('SELECT * FROM sensor_samples WHERE synced = 0 ORDER BY timestamp ASC LIMIT ?', [limit]);
  return rows.map(mapSensorRow);
}

export async function getRecentSensorSamples(activityId: string, limit = 100): Promise<SensorSample[]> {
  const db = getDb();
  const rows = db.getAllSync('SELECT * FROM sensor_samples WHERE activity_id = ? ORDER BY timestamp DESC LIMIT ?', [activityId, limit]);
  return rows.map(mapSensorRow);
}

export async function markSensorSamplesSynced(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const db = getDb();
  ids.forEach((id) => db.runSync('UPDATE sensor_samples SET synced = 1 WHERE id = ?', [id]));
}

export async function insertActivityReflection(reflection: ActivityReflection): Promise<void> {
  const db = getDb();
  db.runSync(
    `INSERT INTO activity_reflections (activity_id, team_id, rating, answers_json, timestamp, synced)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      reflection.activityId,
      reflection.teamId,
      reflection.rating,
      JSON.stringify(reflection.answers),
      reflection.timestamp,
      reflection.synced ? 1 : 0,
    ],
  );
}

export async function insertActivityLog(log: ActivityLog): Promise<void> {
  const db = getDb();
  db.runSync(
    `INSERT INTO activity_logs (activity_id, team_id, payload_json, timestamp, synced)
     VALUES (?, ?, ?, ?, ?)`,
    [log.activityId, log.teamId, JSON.stringify(log.payload), log.timestamp, log.synced ? 1 : 0],
  );
}

export async function getUnsyncedActivityLogs(limit = 100): Promise<Array<{
  id: number;
  activity_id: string;
  team_id: string;
  payload_json: string;
  timestamp: number;
}>> {
  const db = getDb();
  return db.getAllSync('SELECT * FROM activity_logs WHERE synced = 0 ORDER BY timestamp ASC LIMIT ?', [limit]) as Array<{
    id: number;
    activity_id: string;
    team_id: string;
    payload_json: string;
    timestamp: number;
  }>;
}

export async function markActivityLogsSynced(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const db = getDb();
  ids.forEach((id) => db.runSync('UPDATE activity_logs SET synced = 1 WHERE id = ?', [id]));
}
