import AsyncStorage from '@react-native-async-storage/async-storage';

import { isFirebaseConfigured } from './firebaseConfig';
import { syncExperimentRecords } from './firestoreService';
import {
  getUnsyncedActivityLogs,
  getUnsyncedActivityReflections,
  getUnsyncedSensorSamples,
  markActivityLogsSynced,
  markActivityReflectionsSynced,
  markSensorSamplesSynced,
} from './localDb';
import { ActivityId, ActivityLog, ActivityReflection, ExperimentRecord, SensorSample, TeamProfile } from '../types/models';

const TEAM_PROFILE_BACKUP_KEY = 'stemm.activeTeamProfile';
const FALLBACK_TEAM_ID = 'unknown-team';

type ActivityLogRow = {
  id: number;
  activity_id: string;
  team_id: string;
  payload_json: string;
  timestamp: number;
};

type ExperimentRecordKind = 'sensor_sample' | 'activity_result' | 'reflection';

function sanitizeIdPart(value: string | number | undefined) {
  return String(value ?? 'unknown').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '') || 'unknown';
}

function createExperimentRecordId(teamId: string, kind: ExperimentRecordKind, activityId: ActivityId, localRowId: number | undefined, timestamp: number) {
  return [sanitizeIdPart(teamId), kind, sanitizeIdPart(activityId), sanitizeIdPart(localRowId ?? timestamp)].join('_');
}

async function getActiveTeamProfile() {
  const stored = await AsyncStorage.getItem(TEAM_PROFILE_BACKUP_KEY);
  return stored ? (JSON.parse(stored) as TeamProfile) : null;
}

function buildOwnerFields(team: TeamProfile | null, explicitTeamId?: string) {
  const teamId = explicitTeamId || team?.id || FALLBACK_TEAM_ID;
  return {
    teamId,
    authUid: team?.authUid,
    representativeEmail: team?.representativeEmail,
    teamName: team?.teamName,
  };
}

function sensorSampleToExperimentRecord(sample: SensorSample, team: TeamProfile | null): ExperimentRecord {
  const owner = buildOwnerFields(team);
  return {
    ...owner,
    id: createExperimentRecordId(owner.teamId, 'sensor_sample', sample.activityId, sample.id, sample.timestamp),
    activityId: sample.activityId,
    score: sample.value,
    timestamp: sample.timestamp,
    details: {
      type: 'sensor_sample',
      localRowId: sample.id,
      sensorData: [sample],
    },
  };
}

function activityLogToExperimentRecord(row: ActivityLogRow, team: TeamProfile | null): ExperimentRecord {
  const activityId = row.activity_id as ActivityId;
  const owner = buildOwnerFields(team, row.team_id);
  const log: ActivityLog = {
    id: row.id,
    activityId,
    teamId: row.team_id,
    payload: JSON.parse(row.payload_json) as Record<string, unknown>,
    timestamp: row.timestamp,
  };

  return {
    ...owner,
    id: createExperimentRecordId(owner.teamId, 'activity_result', activityId, row.id, row.timestamp),
    activityId,
    score: getNumericScore(log.payload),
    timestamp: row.timestamp,
    details: {
      type: 'activity_result',
      localRowId: row.id,
      results: log.payload,
    },
  };
}

function reflectionToExperimentRecord(reflection: ActivityReflection, team: TeamProfile | null): ExperimentRecord {
  const owner = buildOwnerFields(team, reflection.teamId);
  return {
    ...owner,
    id: createExperimentRecordId(owner.teamId, 'reflection', reflection.activityId, reflection.id, reflection.timestamp),
    activityId: reflection.activityId,
    score: reflection.rating,
    timestamp: reflection.timestamp,
    details: {
      type: 'reflection',
      localRowId: reflection.id,
      reflection: {
        rating: reflection.rating,
        answers: reflection.answers,
      },
    },
  };
}

function getNumericScore(payload: Record<string, unknown>) {
  const score = payload.score ?? payload.bestTime ?? payload.value ?? payload.rating;
  return typeof score === 'number' && Number.isFinite(score) ? score : 0;
}

export async function syncPendingLocalData() {
  if (!isFirebaseConfigured) return { skipped: true, samples: 0, logs: 0, reflections: 0 };

  const team = await getActiveTeamProfile();

  const samples = await getUnsyncedSensorSamples();
  const sampleIds = samples.map((sample) => sample.id).filter((id): id is number => typeof id === 'number');
  if (samples.length > 0) {
    await syncExperimentRecords(samples.map((sample) => sensorSampleToExperimentRecord(sample, team)));
    await markSensorSamplesSynced(sampleIds);
  }

  const logs = await getUnsyncedActivityLogs();
  if (logs.length > 0) {
    await syncExperimentRecords(logs.map((log) => activityLogToExperimentRecord(log, team)));
    await markActivityLogsSynced(logs.map((log) => log.id));
  }

  const reflections = await getUnsyncedActivityReflections();
  const reflectionIds = reflections.map((reflection) => reflection.id).filter((id): id is number => typeof id === 'number');
  if (reflections.length > 0) {
    await syncExperimentRecords(reflections.map((reflection) => reflectionToExperimentRecord(reflection, team)));
    await markActivityReflectionsSynced(reflectionIds);
  }

  return { skipped: false, samples: samples.length, logs: logs.length, reflections: reflections.length };
}
