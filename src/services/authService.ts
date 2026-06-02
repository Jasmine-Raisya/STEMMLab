import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile, User } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { firebaseAuth, isFirebaseConfigured } from './firebaseConfig';

const AUTH_UID_KEY = 'stemm.firebase.uid';

export async function createTeamAuthAccount(email: string, password: string, teamName: string) {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  if (credential.user.displayName !== teamName) {
    await updateProfile(credential.user, { displayName: teamName });
  }
  await AsyncStorage.setItem(AUTH_UID_KEY, credential.user.uid);
  return credential.user;
}

export async function signInTeamAuthAccount(email: string, password: string) {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  await AsyncStorage.setItem(AUTH_UID_KEY, credential.user.uid);
  return credential.user;
}

export async function signOutTeamAuthAccount() {
  if (isFirebaseConfigured) await signOut(firebaseAuth);
  await AsyncStorage.removeItem(AUTH_UID_KEY);
}

export function getFirebaseAuthMessage(error: unknown) {
  const code = (error as { code?: string }).code;
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Switch to Sign in or choose another email.';
    case 'auth/invalid-email':
      return 'The representative email is not valid.';
    case 'auth/weak-password':
      return 'The password is too weak. Use at least 6 characters.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'This email already exists, but the password is incorrect.';
    case 'auth/operation-not-allowed':
      return 'Firebase Email/Password sign-in is not enabled in the Firebase Console.';
    case 'auth/network-request-failed':
      return 'Firebase could not be reached. Check your internet connection and Firebase project settings.';
    default:
      return error instanceof Error ? error.message : 'Firebase registration failed.';
  }
}

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setReady(true);
      return;
    }

    const unsub = onAuthStateChanged(firebaseAuth, async (nextUser) => {
      if (nextUser) {
        await AsyncStorage.setItem(AUTH_UID_KEY, nextUser.uid);
        setUser(nextUser);
        setReady(true);
        return;
      }
      setUser(null);
      setReady(true);
    });

    return unsub;
  }, []);

  return { user, ready, firebaseEnabled: isFirebaseConfigured };
}
