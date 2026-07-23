import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DB_PATH || join(__dirname, '../../data/finanzas.db');

if (!fs.existsSync(join(__dirname, '../../data'))) {
  fs.mkdirSync(join(__dirname, '../../data'), { recursive: true });
}

const db = new Database(DB_PATH);

db.pragma('foreign_keys = ON');

const schema = `
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  type TEXT NOT NULL CHECK(type IN ('efectivo','debito','credito','billetera')),
  initial_balance REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL COLLATE NOCASE,
  kind TEXT NOT NULL CHECK(kind IN ('ingreso','gasto')),
  color TEXT, icon TEXT,
  UNIQUE(name, kind)
);

CREATE TABLE IF NOT EXISTS movements (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK(kind IN ('ingreso','gasto')),
  amount REAL NOT NULL CHECK(amount > 0),
  date TEXT NOT NULL,
  description TEXT,
  category_id TEXT NOT NULL REFERENCES categories(id),
  account_id TEXT NOT NULL REFERENCES accounts(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_mov_date ON movements(date);
CREATE INDEX IF NOT EXISTS idx_mov_cat ON movements(category_id);

CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  month TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id),
  amount REAL NOT NULL CHECK(amount > 0),
  UNIQUE(month, category_id)
);
`;

db.exec(schema);

export { db, DB_PATH };
