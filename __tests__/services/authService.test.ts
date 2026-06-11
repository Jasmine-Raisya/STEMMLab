import { getFirebaseAuthMessage } from '../../src/services/authService';

describe('authService', () => {
  it.each([
    ['auth/email-already-in-use', 'This email is already registered. Switch to Sign in or choose another email.'],
    ['auth/invalid-email', 'The representative email is not valid.'],
    ['auth/weak-password', 'The password is too weak. Use at least 6 characters.'],
    ['auth/wrong-password', 'This email already exists, but the password is incorrect.'],
    ['auth/invalid-credential', 'This email already exists, but the password is incorrect.'],
    ['auth/operation-not-allowed', 'Firebase Email/Password sign-in is not enabled in the Firebase Console.'],
    ['auth/network-request-failed', 'Firebase could not be reached. Check your internet connection and Firebase project settings.'],
  ])('maps %s to a user-facing message', (code, message) => {
    expect(getFirebaseAuthMessage({ code })).toBe(message);
  });

  it('falls back to the original error message', () => {
    expect(getFirebaseAuthMessage(new Error('Custom failure'))).toBe('Custom failure');
  });
});
