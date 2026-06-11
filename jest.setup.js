require('@testing-library/jest-native/extend-expect');

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en' }]),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
  removeItem: jest.fn(async () => undefined),
  multiRemove: jest.fn(async () => undefined),
}));

jest.mock('firebase/app', () => ({
  getApps: jest.fn(() => []),
  initializeApp: jest.fn(() => ({ type: 'mock-app' })),
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  getAuth: jest.fn(() => ({ type: 'mock-auth' })),
  initializeAuth: jest.fn(() => ({ type: 'mock-auth' })),
  onAuthStateChanged: jest.fn(() => jest.fn()),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({ type: 'mock-collection' })),
  doc: jest.fn(() => ({ type: 'mock-doc' })),
  getDoc: jest.fn(async () => ({ exists: () => false })),
  getDocs: jest.fn(async () => ({ docs: [] })),
  getFirestore: jest.fn(() => ({ type: 'mock-firestore' })),
  limit: jest.fn((value) => ({ type: 'mock-limit', value })),
  orderBy: jest.fn((field, direction) => ({ type: 'mock-order-by', field, direction })),
  query: jest.fn(() => ({ type: 'mock-query' })),
  serverTimestamp: jest.fn(() => ({ type: 'mock-server-timestamp' })),
  setDoc: jest.fn(async () => undefined),
  where: jest.fn((field, operator, value) => ({ type: 'mock-where', field, operator, value })),
}));

require('./src/services/i18n');

jest.mock('expo-sensors', () => ({
  Accelerometer: {
    isAvailableAsync: jest.fn(async () => true),
    setUpdateInterval: jest.fn(),
    addListener: jest.fn((listener) => {
      listener({ x: 0.1, y: 0.2, z: 1, timestamp: Date.now() });
      return { remove: jest.fn() };
    }),
  },
  Gyroscope: {
    setUpdateInterval: jest.fn(),
    addListener: jest.fn((listener) => {
      listener({ x: 0.01, y: 0.02, z: 0.03, timestamp: Date.now() });
      return { remove: jest.fn() };
    }),
  },
}));

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  getForegroundPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestForegroundPermissionsAsync: jest.fn(async () => ({ granted: true })),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: { latitude: -6.2, longitude: 106.8 },
  })),
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(async () => ({
    execAsync: jest.fn(),
    runAsync: jest.fn(),
    getFirstAsync: jest.fn(async () => null),
    getAllAsync: jest.fn(async () => []),
    withTransactionAsync: jest.fn(async (task) => task()),
  })),
}));

jest.mock('expo-battery', () => ({
  getPowerStateAsync: jest.fn(async () => ({ batteryLevel: 1, lowPowerMode: false })),
  addBatteryLevelListener: jest.fn(() => ({ remove: jest.fn() })),
  addLowPowerModeListener: jest.fn(() => ({ remove: jest.fn() })),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
  scheduleNotificationAsync: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: [] })),
}));

jest.mock('expo-camera', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    CameraView: React.forwardRef((props, ref) => {
      React.useImperativeHandle(ref, () => ({ takePictureAsync: jest.fn(async () => ({ uri: 'mock-camera-photo.jpg' })) }));
      return React.createElement(View, props, props.children);
    }),
    useCameraPermissions: jest.fn(() => [{ granted: true }, jest.fn(async () => ({ granted: true }))]),
  };
});

jest.mock('expo-video', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    VideoView: (props) => React.createElement(View, props, props.children),
    useVideoPlayer: jest.fn(() => ({
      addListener: jest.fn(() => ({ remove: jest.fn() })),
      replace: jest.fn(),
      replaceAsync: jest.fn(async () => undefined),
      timeUpdateEventInterval: 0,
      currentTime: 0,
    })),
  };
});

jest.mock('expo-audio', () => {
  const recorder = {
    isRecording: false,
    prepareToRecordAsync: jest.fn(async () => undefined),
    record: jest.fn(),
    stop: jest.fn(async () => undefined),
  };
  return {
    RecordingPresets: { HIGH_QUALITY: {} },
    requestRecordingPermissionsAsync: jest.fn(async () => ({ granted: true })),
    setAudioModeAsync: jest.fn(async () => undefined),
    useAudioRecorder: jest.fn(() => recorder),
    useAudioRecorderState: jest.fn(() => ({ isRecording: false, metering: -35 })),
  };
});

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockMap = (props) => React.createElement(View, props, props.children);
  MockMap.Marker = (props) => React.createElement(View, props, props.children);
  return { __esModule: true, default: MockMap, Marker: MockMap.Marker };
});

jest.mock('react-native-google-mobile-ads', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BannerAd: (props) => React.createElement(View, props),
    BannerAdSize: { LARGE_ANCHORED_ADAPTIVE_BANNER: 'LARGE_ANCHORED_ADAPTIVE_BANNER' },
    TestIds: { ADAPTIVE_BANNER: 'test-adaptive-banner' },
    __esModule: true,
    default: jest.fn(() => ({ initialize: jest.fn(async () => undefined) })),
  };
});
