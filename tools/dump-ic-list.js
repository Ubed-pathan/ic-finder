/* eslint-disable */
/*
  Dump a list of IC-like values from the SQLite DB.
  Usage: node tools/dump-ic-list.js "./mobile_ic_database_expanded.db" 10
*/

const fs = require('fs');
const path = require('path');

function isLikelyIcColumn(name) {
  const n = String(name || '').toLowerCase();
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

(async () => {
  const dbPath = process.argv[2] || path.resolve(__dirname, '..', 'mobile_ic_database_expanded.db');
  const limit = Math.max(1, parseInt(process.argv[3] || '10', 10));
  if (!fs.existsSync(dbPath)) {
    console.error('DB not found at', dbPath);
    process.exit(2);
  }

  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs({});
  const fileBuffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(fileBuffer);

  function all(sql) {
    const stmt = db.prepare(sql);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }

  const tables = all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").map(r => r.name);
  const found = new Set();

  // Pass 1: likely columns
  for (const table of tables) {
    const cols = all(`PRAGMA table_info(${table})`).map(r => r.name);
    const likely = cols.filter(isLikelyIcColumn);
    for (const col of likely) {
      const q = `SELECT DISTINCT ${col} AS v FROM ${table} WHERE ${col} IS NOT NULL AND TRIM(${col}) <> '' LIMIT 50`;
      const res = all(q);
      for (const row of res) {
        if (row.v && String(row.v).trim()) {
          found.add(String(row.v).trim());
          if (found.size >= limit) break;
        }
      }
      if (found.size >= limit) break;
    }
    if (found.size >= limit) break;
  }

  // Pass 2: any text-ish columns
  if (found.size < limit) {
    for (const table of tables) {
      const cols = all(`PRAGMA table_info(${table})`).map(r => ({ name: r.name, type: (r.type || '').toUpperCase() }));
      const textish = cols.filter(c => c.type.includes('CHAR') || c.type.includes('TEXT') || !c.type).map(c => c.name);
      for (const col of textish) {
        const q = `SELECT DISTINCT ${col} AS v FROM ${table} WHERE ${col} IS NOT NULL AND TRIM(${col}) <> '' LIMIT 50`;
        const res = all(q);
        for (const row of res) {
          if (row.v && String(row.v).trim()) {
            found.add(String(row.v).trim());
            if (found.size >= limit) break;
          }
        }
        if (found.size >= limit) break;
      }
      if (found.size >= limit) break;
    }
  }

  Array.from(found).slice(0, limit).forEach(v => console.log(v));
  process.exit(0);
})();
