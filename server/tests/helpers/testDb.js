import Database from 'better-sqlite3';

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

export const createTestDb = () => {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  db.exec(schema);
  return db;
};

export const seedTestData = (db) => {
  const categoryId = db.prepare('INSERT INTO categories (id, name, kind, color, icon) VALUES (?, ?, ?, ?, ?)').run('cat-1', 'Comida', 'gasto', '#ff0000', '🍔').lastInsertRowid;
  const accountId = db.prepare('INSERT INTO accounts (id, name, type, initial_balance) VALUES (?, ?, ?, ?)').run('acc-1', 'Efectivo', 'efectivo', 1000).lastInsertRowid;

  db.prepare('INSERT INTO movements (id, kind, amount, date, description, category_id, account_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run('mov-1', 'gasto', 50.00, '2025-01-15', 'Almuerzo', 'cat-1', 'acc-1');

  return { categoryId: 'cat-1', accountId: 'acc-1', movementId: 'mov-1' };
};