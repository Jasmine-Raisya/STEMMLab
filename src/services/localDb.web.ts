import { ActivityLog, ActivityReflection, SensorSample, TeamProfile } from '../types/models';

let teams: Record<string, TeamProfile> = {};
let samples: SensorSample[] = [];
let logs: ActivityLog[] = [];
let reflections: ActivityReflection[] = [];

function readStore<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const value = window.localStorage.getItem(key);
  return value ? (JSON.parse(value) as T) : fallback;
}

function writeStore<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export async function initializeDatabase() {
  teams = readStore('stemm.teams', {});
  samples = readStore('stemm.samples', []);
  logs = readStore('stemm.logs', []);
  reflections = readStore('stemm.reflections', []);
}

export async function saveTeamProfile(profile: TeamProfile) {
  teams[profile.id] = profile;
  writeStore('stemm.teams', teams);
}

export async function getTeamProfile(id: string) {
  return teams[id] ?? null;
}

export async function insertSensorSample(sample: SensorSample) {
  samples = [...samples, { ...sample, id: samples.length + 1, synced: sample.synced ?? false }].slice(-500);
  writeStore('stemm.samples', samples);
}

export async function getUnsyncedSensorSamples(limit = 200) {
  return samples.filter((sample) => !sample.synced).slice(0, limit);
}

export async function getRecentSensorSamples(activityId: string, limit = 100) {
  return samples.filter((sample) => sample.activityId === activityId).slice(-limit).reverse();
}

export async function markSensorSamplesSynced(ids: number[]) {
  const idSet = new Set(ids);
  samples = samples.map((sample) => (sample.id && idSet.has(sample.id) ? { ...sample, synced: true } : sample));
  writeStore('stemm.samples', samples);
}

export async function insertActivityReflection(reflection: ActivityReflection) {
  reflections = [...reflections, { ...reflection, id: reflections.length + 1, synced: reflection.synced ?? false }];
  writeStore('stemm.reflections', reflections);
}

export async function getUnsyncedActivityReflections(limit = 100) {
  return reflections.filter((reflection) => !reflection.synced).slice(0, limit);
}

export async function markActivityReflectionsSynced(ids: number[]) {
  const idSet = new Set(ids);
  reflections = reflections.map((reflection) => (reflection.id && idSet.has(reflection.id) ? { ...reflection, synced: true } : reflection));
  writeStore('stemm.reflections', reflections);
}

export async function insertActivityLog(log: ActivityLog) {
  logs = [...logs, { ...log, id: logs.length + 1, synced: log.synced ?? false }];
  writeStore('stemm.logs', logs);
}

export async function getUnsyncedActivityLogs(limit = 100) {
  return logs
    .filter((log) => !log.synced)
    .slice(0, limit)
    .map((log) => ({
      id: log.id ?? 0,
      activity_id: log.activityId,
      team_id: log.teamId,
      payload_json: JSON.stringify(log.payload),
      timestamp: log.timestamp,
    }));
}

export async function markActivityLogsSynced(ids: number[]) {
  const idSet = new Set(ids);
  logs = logs.map((log) => (log.id && idSet.has(log.id) ? { ...log, synced: true } : log));
  writeStore('stemm.logs', logs);
}
