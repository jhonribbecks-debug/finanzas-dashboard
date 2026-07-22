class MovementRepository {
  constructor() {
    this.db = null;
  }

  getAll(filters = {}, pagination = {}) {
    const { from, to, categoryId, accountId, kind, q } = filters;
    const { page = 1, limit = 10 } = pagination;

    const conditions = [];
    const params = [];

    if (from) { conditions.push('date >= ?'); params.push(from); }
    if (to) { conditions.push('date <= ?'); params.push(to); }
    if (categoryId) { conditions.push('category_id = ?'); params.push(categoryId); }
    if (accountId) { conditions.push('account_id = ?'); params.push(accountId); }
    if (kind) { conditions.push('kind = ?'); params.push(kind); }
    if (q) { conditions.push('description LIKE ?'); params.push(`%${q}%`); }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const query = `
      SELECT m.*, c.name as category_name, c.color as category_color, c.icon as category_icon,
             a.name as account_name
      FROM movements m
      JOIN categories c ON m.category_id = c.id
      JOIN accounts a ON m.account_id = a.id
      ${whereClause}
      ORDER BY date DESC, created_at DESC
      LIMIT ? OFFSET ?
    `;

    return this.db.prepare(query).all(...params, limit, offset);
  }

  count(filters = {}) {
    const { from, to, categoryId, accountId, kind, q } = filters;

    const conditions = [];
    const params = [];

    if (from) { conditions.push('date >= ?'); params.push(from); }
    if (to) { conditions.push('date <= ?'); params.push(to); }
    if (categoryId) { conditions.push('category_id = ?'); params.push(categoryId); }
    if (accountId) { conditions.push('account_id = ?'); params.push(accountId); }
    if (kind) { conditions.push('kind = ?'); params.push(kind); }
    if (q) { conditions.push('description LIKE ?'); params.push(`%${q}%`); }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    return this.db.prepare(`SELECT COUNT(*) as total FROM movements ${whereClause}`).get(...params).total;
  }

  getById(id) {
    return this.db.prepare(`
      SELECT m.*, c.name as category_name, c.color as category_color, c.icon as category_icon,
             a.name as account_name
      FROM movements m
      JOIN categories c ON m.category_id = c.id
      JOIN accounts a ON m.account_id = a.id
      WHERE m.id = ?
    `).get(id);
  }

  create(data) {
    const { id, kind, amount, date, description, category_id, account_id } = data;
    return this.db.prepare(
      'INSERT INTO movements (id, kind, amount, date, description, category_id, account_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, kind, amount, date, description, category_id, account_id);
  }

  update(id, data) {
    const { kind, amount, date, description, category_id, account_id } = data;
    return this.db.prepare(
      'UPDATE movements SET kind = ?, amount = ?, date = ?, description = ?, category_id = ?, account_id = ? WHERE id = ?'
    ).run(kind, amount, date, description, category_id, account_id, id);
  }

  delete(id) {
    return this.db.prepare('DELETE FROM movements WHERE id = ?').run(id);
  }

  exists(id) {
    return !!this.db.prepare('SELECT 1 FROM movements WHERE id = ?').get(id);
  }
}

export default new MovementRepository();
