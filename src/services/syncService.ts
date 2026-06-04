import { syncSensorSamples, syncActivityLog } from './firestoreService';
import { getUnsyncedActivityLogs, getUnsyncedSensorSamples, markActivityLogsSynced, markSensorSamplesSynced } from './localDb';

export async function syncPendingLocalData() {
  if (!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) return { skipped: true, samples: 0, logs: 0 };

  const samples = await getUnsyncedSensorSamples();
  const sampleIds = samples.map((sample) => sample.id).filter((id): id is number => typeof id === 'number');
  if (samples.length > 0) {
    await syncSensorSamples(samples);
    await markSensorSamplesSynced(sampleIds);
  }

  const logs = await getUnsyncedActivityLogs();
  if (logs.length > 0) {
    await Promise.all(logs.map((log) => syncActivityLog({
      id: log.id,
      activityId: log.activity_id as never,
      teamId: log.team_id,
      payload: JSON.parse(log.payload_json) as Record<string, unknown>,
      timestamp: log.timestamp,
    })));
    await markActivityLogsSynced(logs.map((log) => log.id));
  }

  return { skipped: false, samples: samples.length, logs: logs.length };
}
