# IC Finder (Expo React Native)

Professional mobile app to identify smartphone models and details from IC / chip numbers. Supports manual entry and camera-based OCR via Gemini multimodal API.

## Features
- Enter IC number manually and query Gemini
- Capture chip photo, extract IC text using Gemini image understanding
- Light / Dark adaptive theming with manual override potential
- Search history (recent 25 entries)
- Modular architecture (API, theme, store, navigation)

## Tech Stack
- Expo SDK 52
- React Native 0.76
- TypeScript
- Zustand for lightweight state
- Google Gemini API (1.5 Flash) for text + image

## Setup
1. Install deps:
```bash
npm install
```
2. Create a `.env` file (already supported via `app.config.js`):
```
GEMINI_API_KEY=your_real_key_here
GEMINI_MODEL=gemini-2.5-flash
```
The dynamic config reads these and injects them into `expo.extra` at build/start.
3. Start:
```bash
npm start
```

## Environment Variables
| Name | Purpose |
|------|---------|
| `GEMINI_API_KEY` | Auth for Gemini REST calls (in .env) |
| `GEMINI_MODEL` | Gemini model to use (in .env, overrides default) |

## Code Structure
```
src/
  api/          # gemini + ocr modules
  screens/      # UI screens
  components/   # shared UI atoms/molecules (future)
  navigation/   # stack navigator
  store/        # zustand app state
  theme/        # theming system
```

## Gemini Prompting
Prompts are optimized to retrieve device lineage (old & latest), manufacturer, release timeframe, and ambiguous cases.

## Future Improvements
- Dedicated IC pattern validation (regex library)
- Offline cache & persistence (AsyncStorage)
- Pull out OCR to local ML (expo-camera + tesseract worker)
- Better error classification & retry logic
- Theme toggle UI
- Advanced result parsing into structured fields

## License
Internal / Proprietary (adjust as needed).
