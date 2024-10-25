const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// CSS desteğini etkinleştir
config.isCSSEnabled = true;

// Resolver ayarlarını ekleyelim
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];
config.resolver.assetExts = [...config.resolver.assetExts, 'lottie'];

module.exports = withNativeWind(config, { 
  input: "./global.css",
  // NativeWind 4.x için gerekli ayarlar
  inlineStyles: true 
});