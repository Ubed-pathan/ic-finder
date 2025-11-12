// Using the async API from expo-sqlite for promise-based queries
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { Platform } from 'react-native';

const DB_NAME = 'mobile_ic_database_expanded.db';
const SQLITE_DIR = `${FileSystem.documentDirectory}SQLite`;
const DB_PATH = `${SQLITE_DIR}/${DB_NAME}`;

async function copyBundledDbIfNeeded(): Promise<void> {
  if (Platform.OS === 'web') return; // SQLite unavailable on web
  const info = await FileSystem.getInfoAsync(DB_PATH);
  if (info.exists) return;
  // Ensure directory exists
  try {
    await FileSystem.makeDirectoryAsync(SQLITE_DIR, { intermediates: true });
  } catch (e) {
    // directory may already exist
  }
  // Use Metro-bundled asset. The .db is at project root; require path is relative to this file
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const asset = Asset.fromModule(require('../../mobile_ic_database_expanded.db'));
  await asset.downloadAsync();
  if (!asset.localUri) throw new Error('Failed to load bundled database asset');
  await FileSystem.copyAsync({ from: asset.localUri, to: DB_PATH });
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      await copyBundledDbIfNeeded();
      return SQLite.openDatabaseAsync(DB_NAME);
    })();
  }
  return dbPromise;
}

function isLikelyIcColumn(colName: string): boolean {
  const n = colName.toLowerCase();
  return (
    n.includes('ic') ||
    n.includes('part') ||
    n.includes('model') ||
    n.includes('chip') ||
    n === 'pn' ||
    n.includes('part_number') ||
    n.includes('partnumber') ||
    n.endsWith('_pn') ||
    n.includes('number') ||
    n.includes('code') ||
    n === 'sku'
  );
}

async function getTables(db: SQLite.SQLiteDatabase): Promise<string[]> {
  const rows = await db.getAllAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  );
  return rows.map((r: { name: string }) => r.name);
}

async function getColumns(db: SQLite.SQLiteDatabase, table: string): Promise<{ name: string; type: string }[]> {
  const rows = await db.getAllAsync<{ name: string; type?: string }>(`PRAGMA table_info(${table})`);
  return rows.map((r: { name: string; type?: string }) => ({ name: r.name, type: r.type || '' }));
}

function buildWhereEq(cols: string[]): string {
  return cols.map(c => `UPPER(${c}) = UPPER(?)`).join(' OR ');
}

function buildWhereLike(cols: string[]): string {
  return cols.map(c => `UPPER(${c}) LIKE UPPER(?)`).join(' OR ');
}

function formatRow(table: string, row: Record<string, unknown>): string {
  const lines: string[] = [];
  lines.push(`Table: ${table}`);
  Object.entries(row).forEach(([k, v]) => {
    if (v === null || v === undefined || `${v}`.trim() === '') return;
    lines.push(`${k}: ${v}`);
  });
  return lines.join('\n');
}

export async function searchIcInDb(icNumber: string): Promise<string> {
  const db = await getDb();
  const term = icNumber.trim();
  if (!term) return "Can't find details";

  const tables = await getTables(db);
  // First pass: equality on likely columns
  for (const table of tables) {
    const cols = await getColumns(db, table);
    const likely = cols.filter(c => isLikelyIcColumn(c.name)).map(c => c.name);
    if (likely.length === 0) continue;
    const where = buildWhereEq(likely);
    try {
      const row = await db.getFirstAsync<Record<string, unknown>>(`SELECT * FROM ${table} WHERE ${where} LIMIT 1`, Array(likely.length).fill(term));
      if (row) return formatRow(table, row);
    } catch (e) {
      // ignore table errors and continue
    }
  }

  // Second pass: LIKE on likely columns
  for (const table of tables) {
    const cols = await getColumns(db, table);
    const likely = cols.filter(c => isLikelyIcColumn(c.name)).map(c => c.name);
    if (likely.length === 0) continue;
    const where = buildWhereLike(likely);
    try {
      const row = await db.getFirstAsync<Record<string, unknown>>(`SELECT * FROM ${table} WHERE ${where} LIMIT 1`, Array(likely.length).fill(`%${term}%`));
      if (row) return formatRow(table, row);
    } catch (e) {
      // ignore and continue
    }
  }

  // Third pass: LIKE on any TEXT-ish columns
  for (const table of tables) {
    const cols = await getColumns(db, table);
    const textish = cols.filter(c => (c.type || '').toUpperCase().includes('CHAR') || (c.type || '').toUpperCase().includes('TEXT') || !c.type).map(c => c.name);
    if (textish.length === 0) continue;
    const where = buildWhereLike(textish);
    try {
      const row = await db.getFirstAsync<Record<string, unknown>>(`SELECT * FROM ${table} WHERE ${where} LIMIT 1`, Array(textish.length).fill(`%${term}%`));
      if (row) return formatRow(table, row);
    } catch (e) {
      // ignore and continue
    }
  }

  return "Can't find details";
}
