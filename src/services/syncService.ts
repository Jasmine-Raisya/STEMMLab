import AsyncStorage from '@react-native-async-storage/async-storage';

import { isFirebaseConfigured } from './firebaseConfig';
import { syncExperimentRecords } from './firestoreService';
import {
  deletePendingExperimentRecords,
  getPendingExperimentRecords,
  getRecentSensorSamples,
  insertActivityReflection,
  markActivityReflectionsSynced,
  queueExperimentRecord,
} from './localDb';
import { ActivityId, ExperimentRecord, SensorSample, TeamProfile } from '../types/models';

const TEAM_PROFILE_BACKUP_KEY = 'stemm.activeTeamProfile';
const FALLBACK_TEAM_ID = 'unknown-team';

type FinalExperimentInput = {
  activityId: ActivityId;
  teamId: string;
  rating: number;
  answers: Record<string, string>;
  results?: Record<string, unknown>;
  timestamp?: number;
};

function sanitizeIdPart(value: string | number | undefined) {
  return String(value ?? 'unknown').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '') || 'unknown';
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

function summarizeSensorSamples(samples: SensorSample[]) {
  if (samples.length === 0) {
    return { count: 0, metrics: [] };
  }

  const metrics = Array.from(new Set(samples.map((sample) => sample.metric))).map((metric) => {
    const metricSamples = samples.filter((sample) => sample.metric === metric);
    const values = metricSamples.map((sample) => sample.value);
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    return {
      metric,
      count: metricSamples.length,
      average: Number(average.toFixed(3)),
      max: Number(Math.max(...values).toFixed(3)),
      min: Number(Math.min(...values).toFixed(3)),
    };
  });

  return { count: samples.length, metrics };
}

function getScore(rating: number, results?: Record<string, unknown>) {
  const candidates = [
    results?.score,
    results?.bestScore,
    results?.bestTime,
    results?.average,
    rating,
  ];
  const score = candidates.find((candidate) => typeof candidate === 'number' && Number.isFinite(candidate));
  return typeof score === 'number' ? score : rating;
}

function buildFinalExperimentRecord(
  input: Required<Pick<FinalExperimentInput, 'activityId' | 'teamId' | 'rating' | 'answers'>> & {
    localRowId: number;
    results?: Record<string, unknown>;
    sensorSamples: SensorSample[];
    team: TeamProfile | null;
    timestamp: number;
  },
): ExperimentRecord {
  const owner = buildOwnerFields(input.team, input.teamId);
  const id = [
    sanitizeIdPart(owner.teamId),
    'experiment',
    sanitizeIdPart(input.activityId),
    sanitizeIdPart(input.localRowId),
  ].join('_');

  return {
    ...owner,
    id,
    activityId: input.activityId,
    score: getScore(input.rating, input.results),
    timestamp: input.timestamp,
    details: {
      type: 'experiment_record',
      localRowId: input.localRowId,
      results: input.results ?? {},
      reflection: {
        rating: input.rating,
        answers: input.answers,
      },
      sensorSummary: summarizeSensorSamples(input.sensorSamples),
      sensorData: input.sensorSamples.slice(-25),
    },
  };
}

export async function submitFinalExperimentRecord(input: FinalExperimentInput) {
  const timestamp = input.timestamp ?? Date.now();
  const localRowId = await insertActivityReflection({
    activityId: input.activityId,
    teamId: input.teamId,
    rating: input.rating,
    answers: input.answers,
    timestamp,
  });
  const [team, sensorSamples] = await Promise.all([
    getActiveTeamProfile(),
    getRecentSensorSamples(input.activityId, 100),
  ]);
  const record = buildFinalExperimentRecord({
    ...input,
    localRowId,
    sensorSamples,
    team,
    timestamp,
  });

  await queueExperimentRecord(record);

  if (!isFirebaseConfigured) return { skipped: true, record };

  try {
    await syncExperimentRecords([record]);
    await deletePendingExperimentRecords([record.id]);
    await markActivityReflectionsSynced([localRowId]);
    return { skipped: false, record };
  } catch (error) {
    console.warn('Experiment saved locally, but Firestore sync failed.', error);
    return { skipped: true, record };
  }
}

export async function syncPendingLocalData() {
  if (!isFirebaseConfigured) return { skipped: true, samples: 0, logs: 0, reflections: 0, records: 0 };

  const records = await getPendingExperimentRecords();
  if (records.length > 0) {
    await syncExperimentRecords(records);
    await deletePendingExperimentRecords(records.map((record) => record.id));
  }

  return { skipped: false, samples: 0, logs: 0, reflections: 0, records: records.length };
}
