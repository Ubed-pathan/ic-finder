import { useAppStore } from '../store';
import { ParsedIcSpec } from '../types';
import { searchIcInDb } from './db';

export interface IcDetailsResult {
  raw: null;
  text: string;
  parsed: ParsedIcSpec;
}

export async function getIcDetails(icNumber: string): Promise<IcDetailsResult> {
  const text = await searchIcInDb(icNumber);
  return { raw: null, text, parsed: {} };
}

export async function searchAndStore(icNumber: string): Promise<IcDetailsResult> {
  const store = useAppStore.getState();
  store.setLoading(true);
  store.setError(undefined);
  try {
    const result = await getIcDetails(icNumber);
    return result;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Search failed';
    store.setError(msg);
    throw e;
  } finally {
    store.setLoading(false);
  }
}

export async function pingGemini(): Promise<{ ok: boolean; error?: string }> {
  return { ok: false, error: 'Gemini disabled: using local SQLite database' };
}
