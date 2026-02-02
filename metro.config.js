const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('db', 'mp3', 'ttf', 'obj', 'png', 'jpg', 'svg');

config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'cjs', 'json', 'mjs'];

// Fix for packages that use .mjs or don't have proper main fields
config.resolver.unstable_enablePackageExports = true;

// Web-specific configuration
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

// Fix import.meta issues for web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
