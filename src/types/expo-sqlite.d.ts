declare module 'expo-sqlite' {
  export type SQLiteDatabase = {
    getAllAsync<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
    getFirstAsync<T = unknown>(sql: string, params?: unknown[]): Promise<T | null>;
  };
  export function openDatabaseAsync(name: string): Promise<SQLiteDatabase>;
}
