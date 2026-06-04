import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

import { createTeamAuthAccount, signInTeamAuthAccount } from '../../src/services/authService';

jest.mock('../../src/services/firebaseConfig', () => ({
  firebaseAuth: { type: 'mock-auth' },
  isFirebaseConfigured: true,
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a team auth account, updates the display name, and persists the uid', async () => {
    const user = { uid: 'uid-1', displayName: 'Old name' };
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({ user });
    (updateProfile as jest.Mock).mockResolvedValue(undefined);

    await expect(createTeamAuthAccount('team@example.com', 'secret123', 'STEMM Team')).resolves.toBe(user);

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith({ type: 'mock-auth' }, 'team@example.com', 'secret123');
    expect(updateProfile).toHaveBeenCalledWith(user, { displayName: 'STEMM Team' });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('stemm.firebase.uid', 'uid-1');
  });

  it('propagates Firebase registration failures', async () => {
    const error = new Error('weak password');
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

    await expect(createTeamAuthAccount('team@example.com', '123', 'STEMM Team')).rejects.toThrow('weak password');
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('signs in a team account and stores the uid locally', async () => {
    const user = { uid: 'uid-2' };
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user });

    await expect(signInTeamAuthAccount('team@example.com', 'secret123')).resolves.toBe(user);

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith({ type: 'mock-auth' }, 'team@example.com', 'secret123');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('stemm.firebase.uid', 'uid-2');
  });
});
