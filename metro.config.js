// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add CSV files to asset extensions
defaultConfig.resolver.assetExts.push('csv');

module.exports = defaultConfig;