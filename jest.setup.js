require('@testing-library/jest-native/extend-expect');

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en' }]),
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

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockMap = (props) => React.createElement(View, props, props.children);
  MockMap.Marker = (props) => React.createElement(View, props, props.children);
  return { __esModule: true, default: MockMap, Marker: MockMap.Marker };
});
