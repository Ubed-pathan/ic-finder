import axios from 'axios';
import Constants from 'expo-constants';
import { useAppStore } from '../store';

const model = (Constants.expoConfig?.extra as { geminiModel?: string } | undefined)?.geminiModel || 'gemini-2.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

export async function extractIcFromImage(base64Jpeg: string): Promise<string | null> {
  const extra = Constants.expoConfig?.extra as { geminiApiKey?: string; geminiApiKeys?: string[] } | undefined;
  const manifestExtra = Constants.manifest?.extra as { geminiApiKey?: string } | undefined;
  const idx = useAppStore.getState().selectedApiKeyIdx;
  const candidateKeys = (extra?.geminiApiKeys || []).filter(Boolean) as string[];
  const apiKey = candidateKeys[idx] || extra?.geminiApiKey || manifestExtra?.geminiApiKey;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');

  const prompt = `Read the attached image and extract ONLY the IC or part number printed on the chip. Return just the code, no extra words. If multiple, return the most prominent one. Examples: 'PM660', 'SM5703', 'U2 IC 338S00105'.`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: 'image/jpeg', data: base64Jpeg } }
        ]
      }
    ]
  };

  const res = await axios.post(`${GEMINI_ENDPOINT}?key=${apiKey}`, body, {
    timeout: 25000,
    headers: { 'Content-Type': 'application/json' }
  }).catch((err: unknown) => {
    const maybeAxios = err as { response?: { data?: { error?: { message?: string } } } };
    const msg = maybeAxios?.response?.data?.error?.message || (err instanceof Error ? err.message : 'Request failed');
    throw new Error(`Gemini OCR error: ${msg}`);
  });
  const text: string = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const extracted = (text || '').trim().split(/\s|\n/)[0]?.replace(/[^A-Za-z0-9\-_.]/g, '') || null;
  return extracted || null;
}
