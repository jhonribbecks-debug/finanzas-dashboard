import { db } from '../db/database.js';

class AccountRepository {
  getAll() {
    return db.prepare(`
      SELECT a.*,
        a.initial_balance + COALESCE(SUM(CASE WHEN m.kind = 'ingreso' THEN m.amount ELSE -m.amount END), 0) as balance
      FROM accounts a
      LEFT JOIN movements m ON m.account_id = a.id
      GROUP BY a.id
      ORDER BY a.name
    `).all();
  }

  getById(id) {
    return db.prepare(`
      SELECT a.*,
        a.initial_balance + COALESCE(SUM(CASE WHEN m.kind = 'ingreso' THEN m.amount ELSE -m.amount END), 0) as balance
      FROM accounts a
      LEFT JOIN movements m ON m.account_id = a.id
      WHERE a.id = ?
      GROUP BY a.id
    `).get(id);
  }

  create(data) {
    const { id, name, type, initial_balance } = data;
    return db.prepare(
      'INSERT INTO accounts (id, name, type, initial_balance) VALUES (?, ?, ?, ?)'
    ).run(id, name, type, initial_balance);
  }

  update(id, data) {
    const { name, type, initial_balance } = data;
    return db.prepare(
      'UPDATE accounts SET name = ?, type = ?, initial_balance = ? WHERE id = ?'
    ).run(name, type, initial_balance, id);
  }

  delete(id) {
    return db.prepare('DELETE FROM accounts WHERE id = ?').run(id);
  }

  exists(id) {
    return !!db.prepare('SELECT 1 FROM accounts WHERE id = ?').get(id);
  }

  hasName(name, excludeId = null) {
    const query = excludeId
      ? 'SELECT 1 FROM accounts WHERE name = ? AND id != ?'
      : 'SELECT 1 FROM accounts WHERE name = ?';
    const params = excludeId ? [name, excludeId] : [name];
    return !!db.prepare(query).get(...params);
  }

  hasMovements(id) {
    return !!db.prepare('SELECT 1 FROM movements WHERE account_id = ?').get(id);
  }
}

export default new AccountRepository();
