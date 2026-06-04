module.exports = function (api) {
  api.cache(true);
  return {
    presets: [require.resolve('expo/node_modules/babel-preset-expo')],
    // Ensure Jest can transform Firebase ES modules
    // The transformIgnorePatterns in jest.config.js already allows it
  };
};
