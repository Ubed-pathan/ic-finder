// Ensure .env is loaded in Node before Expo reads the config
// eslint-disable-next-line @typescript-eslint/no-var-requires -- dotenv needs CJS require before exports
require('dotenv').config();

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    geminiApiKey: process.env.GEMINI_API_KEY ?? config.extra?.geminiApiKey ?? '',
    geminiModel: process.env.GEMINI_MODEL ?? config.extra?.geminiModel ?? 'gemini-2.5-flash',
    // Support multiple keys, first one is the default
    geminiApiKeys: [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_1,
      process.env.GEMINI_API_KEY_2
    ].filter(Boolean),
    eas: config.extra?.eas,
  },
});
