import { db as defaultDb } from '../db/database.js';

class BudgetRepository {
  constructor(db = defaultDb) {
    this.db = db;
  }

  getAll(month) {
    return this.db.prepare(`
      SELECT b.id, b.month, b.category_id, b.amount,
             c.name as category_name, c.color as category_color,
             COALESCE((
               SELECT SUM(m.amount)
               FROM movements m
               WHERE m.category_id = b.category_id
                 AND m.kind = 'gasto'
                 AND strftime('%Y-%m', m.date) = b.month
             ), 0) as spent
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.month = ?
      ORDER BY c.name
    `).all(month);
  }

  getById(id) {
    return this.db.prepare(`
      SELECT b.id, b.month, b.category_id, b.amount,
             c.name as category_name, c.color as category_color,
             COALESCE((
               SELECT SUM(m.amount)
               FROM movements m
               WHERE m.category_id = b.category_id
                 AND m.kind = 'gasto'
                 AND strftime('%Y-%m', m.date) = b.month
             ), 0) as spent
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
    `).get(id);
  }

  create(data) {
    const { id, month, category_id, amount } = data;
    this.db.prepare(
      'INSERT INTO budgets (id, month, category_id, amount) VALUES (?, ?, ?, ?)'
    ).run(id, month, category_id, amount);
    return { id, month, category_id, amount };
  }

  update(id, data) {
    const existing = this.db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
    const { month = existing.month, category_id = existing.category_id, amount = existing.amount } = data;
    this.db.prepare(
      'UPDATE budgets SET month = ?, category_id = ?, amount = ? WHERE id = ?'
    ).run(month, category_id, amount, id);
    return { id, month, category_id, amount };
  }

  delete(id) {
    return this.db.prepare('DELETE FROM budgets WHERE id = ?').run(id);
  }

  exists(id) {
    return !!this.db.prepare('SELECT 1 FROM budgets WHERE id = ?').get(id);
  }

  hasDuplicate(month, categoryId, excludeId = null) {
    const query = excludeId
      ? 'SELECT 1 FROM budgets WHERE month = ? AND category_id = ? AND id != ?'
      : 'SELECT 1 FROM budgets WHERE month = ? AND category_id = ?';
    const params = excludeId ? [month, categoryId, excludeId] : [month, categoryId];
    return !!this.db.prepare(query).get(...params);
  }
}

export default new BudgetRepository();
