import { initializeApp, getApps } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

const fallbackConfig = {
  apiKey: 'local-demo-key',
  authDomain: 'local-demo.firebaseapp.com',
  projectId: 'local-demo',
  appId: '1:000000000000:web:localdemo',
};

export const firebaseApp = getApps().length > 0 ? getApps()[0] : initializeApp(isFirebaseConfigured ? firebaseConfig : fallbackConfig);

function initializeFirebaseAuth() {
  if (Platform.OS === 'web') return getAuth(firebaseApp);

  const getReactNativePersistence = (FirebaseAuth as typeof FirebaseAuth & {
    getReactNativePersistence?: (storage: typeof ReactNativeAsyncStorage) => unknown;
  }).getReactNativePersistence;

  if (!getReactNativePersistence) return getAuth(firebaseApp);

  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage) as never,
    });
  } catch {
    return getAuth(firebaseApp);
  }
}

export const firebaseAuth = initializeFirebaseAuth();
export const firestore = getFirestore(firebaseApp);
