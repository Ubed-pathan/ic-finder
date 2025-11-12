// Ensure .env is loaded in Node before Expo reads the config
// eslint-disable-next-line @typescript-eslint/no-var-requires -- dotenv needs CJS require before exports
require('dotenv').config();

module.exports = ({ config }) => ({
  ...config,
  plugins: [...(config.plugins || []), 'expo-sqlite'],
  extra: {
    ...config.extra,
    // Gemini removed
    eas: config.extra?.eas,
  },
});
