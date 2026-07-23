import { db as defaultDb } from '../db/database.js';

class DashboardRepository {
  constructor(db = defaultDb) {
    this.db = db;
  }

  getMonthlyTotals(from, to) {
    return this.db.prepare(`
      SELECT 
        COALESCE(SUM(CASE WHEN kind = 'ingreso' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN kind = 'gasto' THEN amount ELSE 0 END), 0) as expenses
      FROM movements
      WHERE date >= ? AND date <= ?
    `).get(from, to);
  }

  getExpensesByCategory(from, to) {
    return this.db.prepare(`
      SELECT c.id, c.name, c.color, c.icon, COALESCE(SUM(m.amount), 0) as total
      FROM categories c
      JOIN movements m ON m.category_id = c.id
      WHERE m.kind = 'gasto' AND m.date >= ? AND m.date <= ?
      GROUP BY c.id, c.name, c.color, c.icon
      ORDER BY total DESC
    `).all(from, to);
  }

  getMonthlyEvolution(from) {
    return this.db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as month,
        COALESCE(SUM(CASE WHEN kind = 'ingreso' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN kind = 'gasto' THEN amount ELSE 0 END), 0) as expenses
      FROM movements
      WHERE date >= ?
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month
    `).all(from);
  }

  getConsolidatedBalance() {
    return this.db.prepare(`
      SELECT COALESCE(SUM(balance), 0) as total
      FROM (
        SELECT a.initial_balance + COALESCE(SUM(CASE WHEN m.kind = 'ingreso' THEN m.amount ELSE -m.amount END), 0) as balance
        FROM accounts a
        LEFT JOIN movements m ON m.account_id = a.id
        GROUP BY a.id
      )
    `).get().total;
  }
}

export default new DashboardRepository();
