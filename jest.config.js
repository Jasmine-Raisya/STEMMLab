module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo|expo-modules-core|expo(nent)?|@expo(nent)?/.*|react-native-svg|react-native-maps|@react-native-async-storage)/)',
  ],
};
