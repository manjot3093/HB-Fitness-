const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
// Firebase JS SDK compatibility with Metro
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;
module.exports = config;
