import { collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore';

import { firestore, isFirebaseConfigured } from './firebaseConfig';
import { ExperimentRecord, LeaderboardEntry, TeamProfile } from '../types/models';

function ensureFirebase() {
  if (!isFirebaseConfigured) throw new Error('Firebase environment variables are not configured.');
}

export async function syncTeamProfile(profile: TeamProfile) {
  ensureFirebase();
  await setDoc(doc(firestore, 'users', profile.authUid ?? profile.id), { ...profile, role: 'team', updatedAt: serverTimestamp() }, { merge: true });
}

export async function fetchTeamProfile(teamId: string) {
  ensureFirebase();
  const snapshot = await getDoc(doc(firestore, 'users', teamId));
  if (!snapshot.exists()) return null;
  return snapshot.data() as TeamProfile;
}

export async function syncExperimentRecords(records: ExperimentRecord[]) {
  ensureFirebase();
  await Promise.all(records.map((record) => setDoc(doc(firestore, 'experiment_records', record.id), {
    ...record,
    syncedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true })));
}

export async function fetchExperimentRecordsForTeam(teamId: string, maxRecords = 20) {
  ensureFirebase();
  const recordsQuery = query(collection(firestore, 'experiment_records'), where('teamId', '==', teamId), limit(maxRecords));
  const snapshot = await getDocs(recordsQuery);
  return snapshot.docs
    .map((entry) => entry.data() as ExperimentRecord)
    .filter((record) => record.details?.type !== 'sensor_sample')
    .sort((left, right) => right.timestamp - left.timestamp);
}

export async function fetchLeaderboard(activityId: string) {
  ensureFirebase();
  const leaderboardQuery = query(collection(firestore, 'leaderboards', activityId, 'entries'), orderBy('score', 'desc'), limit(20));
  const snapshot = await getDocs(leaderboardQuery);
  return snapshot.docs.map((entry) => entry.data() as LeaderboardEntry);
}
