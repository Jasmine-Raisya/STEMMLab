const originalEnv = process.env;

describe('firebaseConfig', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses fallback config when Firebase env variables are missing', () => {
    delete process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
    delete process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
    delete process.env.EXPO_PUBLIC_FIREBASE_APP_ID;

    const firebaseApp = require('firebase/app');
    const config = require('../../src/services/firebaseConfig');

    expect(config.isFirebaseConfigured).toBe(false);
    expect(firebaseApp.initializeApp).toHaveBeenCalledWith(expect.objectContaining({
      apiKey: 'local-demo-key',
      projectId: 'local-demo',
    }));
  });

  it('uses Expo public Firebase env variables when available', () => {
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY = 'real-key';
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN = 'real.firebaseapp.com';
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID = 'real-project';
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET = 'real.appspot.com';
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123';
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID = '1:123:android:abc';

    const firebaseApp = require('firebase/app');
    const config = require('../../src/services/firebaseConfig');

    expect(config.isFirebaseConfigured).toBe(true);
    expect(firebaseApp.initializeApp).toHaveBeenCalledWith(expect.objectContaining({
      apiKey: 'real-key',
      projectId: 'real-project',
      appId: '1:123:android:abc',
    }));
  });
});
