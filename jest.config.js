module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transform: { '^.+\\.[tj]sx?$': 'babel-jest' },
  transformIgnorePatterns: ['node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo|expo-.+|expo-modules-core|expo(nent)?|@expo(nent)?/.*|react-native-svg|react-native-maps|@react-native-async-storage|firebase|@firebase)/)'],
};
