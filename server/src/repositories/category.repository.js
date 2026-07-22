import { db } from '../db/database.js';

class CategoryRepository {
  getAll() {
    return db.prepare('SELECT * FROM categories ORDER BY name').all();
  }

  getById(id) {
    return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  }

  create(data) {
    const { id, name, kind, color, icon } = data;
    return db.prepare(
      'INSERT INTO categories (id, name, kind, color, icon) VALUES (?, ?, ?, ?, ?)'
    ).run(id, name, kind, color, icon);
  }

  update(id, data) {
    const { name, kind, color, icon } = data;
    return db.prepare(
      'UPDATE categories SET name = ?, kind = ?, color = ?, icon = ? WHERE id = ?'
    ).run(name, kind, color, icon, id);
  }

  delete(id) {
    return db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  }

  exists(id) {
    return !!db.prepare('SELECT 1 FROM categories WHERE id = ?').get(id);
  }

  hasName(name, kind, excludeId = null) {
    const query = excludeId
      ? 'SELECT 1 FROM categories WHERE name = ? AND kind = ? AND id != ?'
      : 'SELECT 1 FROM categories WHERE name = ? AND kind = ?';
    const params = excludeId ? [name, kind, excludeId] : [name, kind];
    return !!db.prepare(query).get(...params);
  }

  hasMovements(categoryId) {
    return !!db.prepare('SELECT 1 FROM movements WHERE category_id = ?').get(categoryId);
  }

  reassignMovements(oldCategoryId, newCategoryId) {
    return db.prepare(
      'UPDATE movements SET category_id = ? WHERE category_id = ?'
    ).run(newCategoryId, oldCategoryId);
  }
}

export default new CategoryRepository();
