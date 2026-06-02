// metro.config.js
/**
 * Metro configuration for Expo projects that need to bundle .wasm assets.
 * This fixes the "Unable to resolve './wa-sqlite/wa-sqlite.wasm'" error with expo-sqlite on web.
 */
const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    // Add 'wasm' to the list of asset extensions so Metro treats it as a binary asset.
    assetExts: [...defaultConfig.resolver.assetExts, 'wasm'],
    // Ensure 'wasm' is also recognized as a source extension (optional but safe).
    sourceExts: [...defaultConfig.resolver.sourceExts, 'wasm'],
  },
};
