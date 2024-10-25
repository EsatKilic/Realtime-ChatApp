const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// CSS desteğini etkinleştir
config.isCSSEnabled = true;

// Resolver ayarları
config.resolver.sourceExts = [...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx', 'mjs', 'cjs'];
config.resolver.assetExts = [...config.resolver.assetExts, 'lottie', 'png', 'jpg', 'jpeg', 'gif', 'svg'];

// Cache ayarları
config.cacheStores = [];

module.exports = withNativeWind(config, { 
  input: "./global.css",
  inlineStyles: true 
});