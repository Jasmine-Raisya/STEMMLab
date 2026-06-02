import { useEffect, useState } from 'react';
import { signInAnonymously, onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../../firebase-config';

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = () => firebaseSignOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log('User signed in with UID:', currentUser.uid);
        setUser(currentUser);
        setLoading(false);
      } else {
        console.log('No user signed in. Attempting anonymous authentication...');
        try {
          const credential = await signInAnonymously(auth);
          console.log('Anonymous sign-in successful. UID:', credential.user.uid);
          setUser(credential.user);
        } catch (error) {
          console.error('Error with anonymous sign-in:', error);
        } finally {
          setLoading(false);
        }
      }
    });

    return unsubscribe;
  }, []);

  return { user, loading, signOut };
}
