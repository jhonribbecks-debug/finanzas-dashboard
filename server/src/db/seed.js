import { db } from './database.js';
import { v4 as uuidv4 } from 'uuid';

const seedCategories = [
  { name: 'Salario', kind: 'ingreso', color: '#22c55e', icon: 'briefcase' },
  { name: 'Freelance', kind: 'ingreso', color: '#3b82f6', icon: 'laptop' },
  { name: 'Inversión', kind: 'ingreso', color: '#a855f7', icon: 'trending-up' },
  { name: 'Alimentación', kind: 'gasto', color: '#ef4444', icon: 'shopping-cart' },
  { name: 'Transporte', kind: 'gasto', color: '#f59e0b', icon: 'car' },
  { name: 'Vivienda', kind: 'gasto', color: '#8b5cf6', icon: 'home' },
  { name: 'Servicios', kind: 'gasto', color: '#06b6d4', icon: 'zap' },
  { name: 'Entretenimiento', kind: 'gasto', color: '#ec4899', icon: 'film' },
  { name: 'Salud', kind: 'gasto', color: '#10b981', icon: 'heart' },
  { name: 'Otros', kind: 'gasto', color: '#6b7280', icon: 'more-horizontal' },
];

const seed = () => {
  const count = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  if (count > 0) return;

  const insert = db.prepare(
    'INSERT INTO categories (id, name, kind, color, icon) VALUES (?, ?, ?, ?, ?)'
  );
  const insertMany = db.transaction((categories) => {
    for (const cat of categories) {
      insert.run(uuidv4(), cat.name, cat.kind, cat.color, cat.icon);
    }
  });

  insertMany(seedCategories);
  console.log('Seed: categorías insertadas');
};

export { seed };
