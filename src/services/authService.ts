import { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  User,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '../../firebase-config';

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
