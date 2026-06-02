import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

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
