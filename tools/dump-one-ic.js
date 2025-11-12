/* eslint-disable */
/*
  Tiny helper to read the bundled SQLite DB and print one IC-like value
  Usage: node tools/dump-one-ic.js "./mobile_ic_database_expanded.db"
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
  const exists = fs.existsSync(dbPath);
  if (!exists) {
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
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  }

  const tables = all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .map(r => r.name);

  // 1) try exact columns that look like IC identifiers
  for (const table of tables) {
    const cols = all(`PRAGMA table_info(${table})`).map(r => r.name);
    const likely = cols.filter(isLikelyIcColumn);
    for (const col of likely) {
      const q = `SELECT ${col} AS v FROM ${table} WHERE ${col} IS NOT NULL AND TRIM(${col}) <> '' LIMIT 1`;
      const res = all(q);
      if (res[0]?.v) {
        console.log(String(res[0].v));
        process.exit(0);
      }
    }
  }

  // 2) fallback: first text-ish value from first table
  for (const table of tables) {
    const cols = all(`PRAGMA table_info(${table})`).map(r => ({ name: r.name, type: (r.type || '').toUpperCase() }));
    const textish = cols.filter(c => c.type.includes('CHAR') || c.type.includes('TEXT') || !c.type).map(c => c.name);
    for (const col of textish) {
      const q = `SELECT ${col} AS v FROM ${table} WHERE ${col} IS NOT NULL AND TRIM(${col}) <> '' LIMIT 1`;
      const res = all(q);
      if (res[0]?.v) {
        console.log(String(res[0].v));
        process.exit(0);
      }
    }
  }

  console.log("Can't find details");
  process.exit(0);
})();
