import { db } from '../../firebase-config';
import { doc, setDoc } from 'firebase/firestore';
import { getPendingSyncsLocal, dequeueSyncLocal } from './localDb';

export async function registerBackgroundSync(): Promise<void> {
  console.log('Registering Real-Time / Background Sync Engine...');
  
  void triggerSync();
  
  setInterval(() => {
    void triggerSync();
  }, 10000);
}

export async function triggerSync(): Promise<void> {
  try {
    const pendingItems = getPendingSyncsLocal();
    if (pendingItems.length === 0) return;
    
    console.log(`[Sync Engine] Found ${pendingItems.length} pending items to sync to Firestore...`);
    
    for (const item of pendingItems) {
      const payload = JSON.parse(item.payload);
      const collectionName = item.collectionName;
      
      console.log(`[Sync Engine] Syncing record to collection "${collectionName}" with ID: ${item.id}...`);
      
      const docRef = doc(db, collectionName, item.id);
      await setDoc(docRef, payload, { merge: true });
      
      dequeueSyncLocal(item.id);
      console.log(`[Sync Engine] Successfully synced and dequeued ID: ${item.id}`);
    }
  } catch (error) {
    console.log('[Sync Engine] Sync deferred (offline or network error). Will retry in 10s.', error);
  }
}
