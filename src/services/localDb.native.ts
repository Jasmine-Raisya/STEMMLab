import * as SQLite from 'expo-sqlite';

import { ActivityLog, ActivityReflection, SensorSample, TeamProfile } from '../types/models';

const DB_NAME = 'stemm_lab.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb() {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  return dbPromise;
}

export async function initializeDatabase() {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS team_profiles (
      id TEXT PRIMARY KEY NOT NULL,
      auth_uid TEXT,
      representative_email TEXT,
      team_name TEXT NOT NULL,
      members_json TEXT NOT NULL,
      grade_level TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
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
    CREATE TABLE IF NOT EXISTS activity_reflections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id TEXT NOT NULL,
      team_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      answers_json TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id TEXT NOT NULL,
      team_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );
  `);
}

export async function saveTeamProfile(profile: TeamProfile) {
  const db = await getDb();
  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO team_profiles (id, auth_uid, representative_email, team_name, members_json, grade_level, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [profile.id, profile.authUid ?? null, profile.representativeEmail, profile.teamName, JSON.stringify(profile.members), profile.gradeLevel, profile.createdAt],
    );
  } catch (error) {
    await db.execAsync('ALTER TABLE team_profiles ADD COLUMN auth_uid TEXT;').catch(() => undefined);
    await db.execAsync('ALTER TABLE team_profiles ADD COLUMN representative_email TEXT;').catch(() => undefined);
    await db.runAsync(
      `INSERT OR REPLACE INTO team_profiles (id, auth_uid, representative_email, team_name, members_json, grade_level, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [profile.id, profile.authUid ?? null, profile.representativeEmail, profile.teamName, JSON.stringify(profile.members), profile.gradeLevel, profile.createdAt],
    );
  }
}

export async function getTeamProfile(id: string) {
  const db = await getDb();
  const row = await db.getFirstAsync<{
    id: string;
    auth_uid?: string;
    representative_email?: string;
    team_name: string;
    members_json: string;
    grade_level: string;
    created_at: number;
  }>('SELECT * FROM team_profiles WHERE id = ?', [id]);

  if (!row) return null;
  return {
    id: row.id,
    authUid: row.auth_uid,
    representativeEmail: row.representative_email ?? '',
    teamName: row.team_name,
    members: JSON.parse(row.members_json) as string[],
    gradeLevel: row.grade_level,
    createdAt: row.created_at,
  } satisfies TeamProfile;
}

export async function insertSensorSample(sample: SensorSample) {
  const db = await getDb();
  await db.runAsync(
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

export async function getUnsyncedSensorSamples(limit = 200) {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: number;
    activity_id: string;
    metric: string;
    value: number;
    x?: number;
    y?: number;
    z?: number;
    latitude?: number;
    longitude?: number;
    timestamp: number;
    synced: number;
  }>('SELECT * FROM sensor_samples WHERE synced = 0 ORDER BY timestamp ASC LIMIT ?', [limit]);
  return rows.map(mapSensorRow);
}

export async function getRecentSensorSamples(activityId: string, limit = 100) {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: number;
    activity_id: string;
    metric: string;
    value: number;
    x?: number;
    y?: number;
    z?: number;
    latitude?: number;
    longitude?: number;
    timestamp: number;
    synced: number;
  }>('SELECT * FROM sensor_samples WHERE activity_id = ? ORDER BY timestamp DESC LIMIT ?', [activityId, limit]);
  return rows.map(mapSensorRow);
}

export async function markSensorSamplesSynced(ids: number[]) {
  if (ids.length === 0) return;
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await Promise.all(ids.map((id) => db.runAsync('UPDATE sensor_samples SET synced = 1 WHERE id = ?', [id])));
  });
}

function mapSensorRow(row: {
  id: number;
  activity_id: string;
  metric: string;
  value: number;
  x?: number;
  y?: number;
  z?: number;
  latitude?: number;
  longitude?: number;
  timestamp: number;
  synced: number;
}): SensorSample {
  return {
    id: row.id,
    activityId: row.activity_id as SensorSample['activityId'],
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

export async function insertActivityReflection(reflection: ActivityReflection) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO activity_reflections (activity_id, team_id, rating, answers_json, timestamp, synced)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [reflection.activityId, reflection.teamId, reflection.rating, JSON.stringify(reflection.answers), reflection.timestamp, reflection.synced ? 1 : 0],
  );
}

export async function insertActivityLog(log: ActivityLog) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO activity_logs (activity_id, team_id, payload_json, timestamp, synced)
     VALUES (?, ?, ?, ?, ?)`,
    [log.activityId, log.teamId, JSON.stringify(log.payload), log.timestamp, log.synced ? 1 : 0],
  );
}

export async function getUnsyncedActivityLogs(limit = 100) {
  const db = await getDb();
  return db.getAllAsync<{
    id: number;
    activity_id: string;
    team_id: string;
    payload_json: string;
    timestamp: number;
  }>('SELECT * FROM activity_logs WHERE synced = 0 ORDER BY timestamp ASC LIMIT ?', [limit]);
}

export async function markActivityLogsSynced(ids: number[]) {
  if (ids.length === 0) return;
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await Promise.all(ids.map((id) => db.runAsync('UPDATE activity_logs SET synced = 1 WHERE id = ?', [id])));
  });
}
