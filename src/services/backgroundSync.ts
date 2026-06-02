import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';

import { initializeDatabase } from './localDb';
import { syncPendingLocalData } from './syncService';

export const BACKGROUND_SYNC_TASK = 'stemm-background-sync';

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    await initializeDatabase();
    await syncPendingLocalData();
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerBackgroundSync() {
  const status = await BackgroundTask.getStatusAsync();
  if (status !== BackgroundTask.BackgroundTaskStatus.Available) return false;

  const registered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
  if (!registered) {
    await BackgroundTask.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 15,
    });
  }
  return true;
}
