import { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  User,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../../firebase-config';

export async function createTeamAuthAccount(email: string, password: string, teamName: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (credential.user.displayName !== teamName) {
    await updateProfile(credential.user, { displayName: teamName });
  }
  return credential.user;
}

export async function signInTeamAuthAccount(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signOutTeamAuthAccount() {
  await firebaseSignOut(auth);
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
      return 'The email or password is incorrect.';
    case 'auth/operation-not-allowed':
      return 'Firebase Email/Password sign-in is not enabled in the Firebase Console.';
    case 'auth/network-request-failed':
      return 'Firebase could not be reached. Check your internet connection and Firebase project settings.';
    default:
      return error instanceof Error ? error.message : 'Firebase authentication failed.';
  }
}

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    user,
    loading,
    signIn: (email: string, password: string) => signInWithEmailAndPassword(auth, email, password),
    signUp: (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password),
    signOut: () => firebaseSignOut(auth),
  };
}
