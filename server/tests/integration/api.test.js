import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createTestDb } from '../helpers/testDb.js';
import categoryRoutes from '../../src/routes/category.routes.js';
import accountRoutes from '../../src/routes/account.routes.js';
import movementRoutes from '../../src/routes/movement.routes.js';
import { sendResponse } from '../../src/utils/response.js';
import categoryRepository from '../../src/repositories/category.repository.js';
import accountRepository from '../../src/repositories/account.repository.js';
import movementRepository from '../../src/repositories/movement.repository.js';
import { v4 as uuidv4 } from 'uuid';

const createApp = (db) => {
  const app = express();
  app.use(express.json());

  categoryRepository.db = db;
  accountRepository.db = db;
  movementRepository.db = db;

  app.get('/api/v1/health', (req, res) => sendResponse(res, { ok: true }));
  app.use('/api/v1/categories', categoryRoutes);
  app.use('/api/v1/accounts', accountRoutes);
  app.use('/api/v1/movements', movementRoutes);

  app.use((err, req, res, next) => {
    sendResponse(res, {
      ok: false,
      error: { code: err.code || 'INTERNAL_SERVER_ERROR', message: err.message || 'Internal server error', details: err.details },
    }, err.statusCode || 500);
  });

  return app;
};

describe('Integration: Categories API', () => {
  let db, app, catId;

  beforeEach(() => {
    db = createTestDb();
    app = createApp(db);
    catId = db.prepare('INSERT INTO categories (id, name, kind, color, icon) VALUES (?, ?, ?, ?, ?)')
      .run(uuidv4(), 'Food', 'gasto', '#ff0000', '🍔').lastInsertRowid;
  });

  afterEach(() => db.close());

  it('GET /categories returns all', async () => {
    const res = await request(app).get('/api/v1/categories').expect(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Food');
  });

  it('GET /categories/:id returns one', async () => {
    const res = await request(app).get(`/api/v1/categories/${catId}`).expect(200);
    expect(res.body.data.name).toBe('Food');
  });

  it('POST /categories creates new', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .send({ name: 'Transport', kind: 'gasto', color: '#00ff00', icon: '🚌' })
      .expect(201);
    expect(res.body.data.name).toBe('Transport');
    expect(res.body.data.id).toBeDefined();
  });

  it('POST /categories rejects duplicate name+kind', async () => {
    await request(app)
      .post('/api/v1/categories')
      .send({ name: 'Food', kind: 'gasto' })
      .expect(409);
  });

  it('PUT /categories/:id updates', async () => {
    const res = await request(app)
      .put(`/api/v1/categories/${catId}`)
      .send({ name: 'Food & Drinks', kind: 'gasto' })
      .expect(200);
    expect(res.body.data.name).toBe('Food & Drinks');
  });

  it('DELETE /categories/:id deletes when no movements', async () => {
    await request(app).delete(`/api/v1/categories/${catId}`).expect(200);
    const count = db.prepare('SELECT COUNT(*) as c FROM categories').get().c;
    expect(count).toBe(0);
  });

  it('DELETE /categories/:id rejects when has movements', async () => {
    const accId = db.prepare('INSERT INTO accounts (id, name, type, initial_balance) VALUES (?, ?, ?, ?)')
      .run(uuidv4(), 'Cash', 'efectivo', 1000).lastInsertRowid;
    db.prepare('INSERT INTO movements (id, kind, amount, date, category_id, account_id) VALUES (?, ?, ?, ?, ?, ?)')
      .run(uuidv4(), 'gasto', 50, '2024-01-01', catId, accId);

    await request(app).delete(`/api/v1/categories/${catId}`).expect(409);
  });

  it('DELETE /categories/:id?reassignTo= reassigns movements', async () => {
    const accId = db.prepare('INSERT INTO accounts (id, name, type, initial_balance) VALUES (?, ?, ?, ?)')
      .run(uuidv4(), 'Cash', 'efectivo', 1000).lastInsertRowid;
    const newCatId = db.prepare('INSERT INTO categories (id, name, kind) VALUES (?, ?, ?)')
      .run(uuidv4(), 'Other', 'gasto').lastInsertRowid;
    db.prepare('INSERT INTO movements (id, kind, amount, date, category_id, account_id) VALUES (?, ?, ?, ?, ?, ?)')
      .run(uuidv4(), 'gasto', 50, '2024-01-01', catId, accId);

    await request(app).delete(`/api/v1/categories/${catId}?reassignTo=${newCatId}`).expect(200);
    const mov = db.prepare('SELECT category_id FROM movements WHERE category_id = ?').get(newCatId);
    expect(mov).toBeDefined();
  });
});

describe('Integration: Accounts API', () => {
  let db, app, accId;

  beforeEach(() => {
    db = createTestDb();
    app = createApp(db);
    accId = db.prepare('INSERT INTO accounts (id, name, type, initial_balance) VALUES (?, ?, ?, ?)')
      .run(uuidv4(), 'Cash', 'efectivo', 1000).lastInsertRowid;
  });

  afterEach(() => db.close());

  it('GET /accounts returns all with balance', async () => {
    const res = await request(app).get('/api/v1/accounts').expect(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].balance).toBe(1000);
  });

  it('GET /accounts/:id returns one with balance', async () => {
    const res = await request(app).get(`/api/v1/accounts/${accId}`).expect(200);
    expect(res.body.data.balance).toBe(1000);
  });

  it('POST /accounts creates with balance 0', async () => {
    const res = await request(app)
      .post('/api/v1/accounts')
      .send({ name: 'Bank', type: 'debito', initial_balance: 500 })
      .expect(201);
    expect(res.body.data.balance).toBe(500);
  });

  it('POST /accounts rejects duplicate name', async () => {
    await request(app)
      .post('/api/v1/accounts')
      .send({ name: 'Cash', type: 'efectivo' })
      .expect(409);
  });

  it('PUT /accounts/:id updates', async () => {
    const res = await request(app)
      .put(`/api/v1/accounts/${accId}`)
      .send({ name: 'Wallet', type: 'billetera' })
      .expect(200);
    expect(res.body.data.name).toBe('Wallet');
  });

  it('DELETE /accounts/:id deletes when no movements', async () => {
    await request(app).delete(`/api/v1/accounts/${accId}`).expect(200);
    const count = db.prepare('SELECT COUNT(*) as c FROM accounts').get().c;
    expect(count).toBe(0);
  });

  it('DELETE /accounts/:id rejects when has movements', async () => {
    const catId = db.prepare('INSERT INTO categories (id, name, kind) VALUES (?, ?, ?)')
      .run(uuidv4(), 'Food', 'gasto').lastInsertRowid;
    db.prepare('INSERT INTO movements (id, kind, amount, date, category_id, account_id) VALUES (?, ?, ?, ?, ?, ?)')
      .run(uuidv4(), 'gasto', 50, '2024-01-01', catId, accId);

    await request(app).delete(`/api/v1/accounts/${accId}`).expect(409);
  });
});

describe('Integration: Movements API', () => {
  let db, app, catId, accId;

  beforeEach(() => {
    db = createTestDb();
    app = createApp(db);
    catId = db.prepare('INSERT INTO categories (id, name, kind) VALUES (?, ?, ?)')
      .run(uuidv4(), 'Food', 'gasto').lastInsertRowid;
    accId = db.prepare('INSERT INTO accounts (id, name, type, initial_balance) VALUES (?, ?, ?, ?)')
      .run(uuidv4(), 'Cash', 'efectivo', 1000).lastInsertRowid;
    db.prepare('INSERT INTO movements (id, kind, amount, date, description, category_id, account_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(uuidv4(), 'gasto', 50, '2024-01-15', 'Lunch', catId, accId);
  });

  afterEach(() => db.close());

  it('GET /movements returns paginated', async () => {
    const res = await request(app).get('/api/v1/movements').expect(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.pagination).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
  });

  it('GET /movements filters by from/to', async () => {
    await request(app)
      .get('/api/v1/movements?from=2024-01-10&to=2024-01-20')
      .expect(200);
    const res = await request(app)
      .get('/api/v1/movements?from=2024-02-01')
      .expect(200);
    expect(res.body.data.items).toHaveLength(0);
  });

  it('GET /movements filters by categoryId', async () => {
    const res = await request(app)
      .get(`/api/v1/movements?categoryId=${catId}`)
      .expect(200);
    expect(res.body.data.items).toHaveLength(1);
  });

  it('GET /movements filters by accountId', async () => {
    const res = await request(app)
      .get(`/api/v1/movements?accountId=${accId}`)
      .expect(200);
    expect(res.body.data.items).toHaveLength(1);
  });

  it('GET /movements filters by kind', async () => {
    const res = await request(app)
      .get('/api/v1/movements?kind=ingreso')
      .expect(200);
    expect(res.body.data.items).toHaveLength(0);
  });

  it('GET /movements filters by description (q)', async () => {
    const res = await request(app)
      .get('/api/v1/movements?q=Lunch')
      .expect(200);
    expect(res.body.data.items).toHaveLength(1);
  });

  it('GET /movements combines multiple filters', async () => {
    const res = await request(app)
      .get(`/api/v1/movements?kind=gasto&categoryId=${catId}&from=2024-01-01`)
      .expect(200);
    expect(res.body.data.items).toHaveLength(1);
  });

  it('GET /movements respects page and limit', async () => {
    for (let i = 0; i < 5; i++) {
      db.prepare('INSERT INTO movements (id, kind, amount, date, category_id, account_id) VALUES (?, ?, ?, ?, ?, ?)')
        .run(uuidv4(), 'gasto', 10 + i, '2024-01-16', catId, accId);
    }
    const res = await request(app)
      .get('/api/v1/movements?page=1&limit=3')
      .expect(200);
    expect(res.body.data.items).toHaveLength(3);
    expect(res.body.data.pagination.page).toBe(1);
    expect(res.body.data.pagination.limit).toBe(3);
    expect(res.body.data.pagination.total).toBe(6);
  });

  it('GET /movements/:id returns one with joins', async () => {
    const movId = db.prepare('SELECT id FROM movements LIMIT 1').get().id;
    const res = await request(app).get(`/api/v1/movements/${movId}`).expect(200);
    expect(res.body.data.category_name).toBe('Food');
    expect(res.body.data.account_name).toBe('Cash');
  });

  it('POST /movements creates with valid FKs', async () => {
    const res = await request(app)
      .post('/api/v1/movements')
      .send({ kind: 'ingreso', amount: 100, date: '2024-01-20', category_id: catId, account_id: accId })
      .expect(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.kind).toBe('ingreso');
  });

  it('POST /movements rejects invalid category', async () => {
    await request(app)
      .post('/api/v1/movements')
      .send({ kind: 'gasto', amount: 30, date: '2024-01-20', category_id: 'invalid', account_id: accId })
      .expect(400);
  });

  it('POST /movements rejects invalid account', async () => {
    await request(app)
      .post('/api/v1/movements')
      .send({ kind: 'gasto', amount: 30, date: '2024-01-20', category_id: catId, account_id: 'invalid' })
      .expect(400);
  });

  it('POST /movements rejects amount <= 0', async () => {
    await request(app)
      .post('/api/v1/movements')
      .send({ kind: 'gasto', amount: 0, date: '2024-01-20', category_id: catId, account_id: accId })
      .expect(400);
  });

  it('POST /movements rejects invalid date format', async () => {
    await request(app)
      .post('/api/v1/movements')
      .send({ kind: 'gasto', amount: 30, date: '20-01-2024', category_id: catId, account_id: accId })
      .expect(400);
  });

  it('PUT /movements/:id updates', async () => {
    const movId = db.prepare('SELECT id FROM movements LIMIT 1').get().id;
    const res = await request(app)
      .put(`/api/v1/movements/${movId}`)
      .send({ amount: 75, description: 'Dinner' })
      .expect(200);
    expect(res.body.data.amount).toBe(75);
    expect(res.body.data.description).toBe('Dinner');
  });

  it('PUT /movements/:id validates FKs on update', async () => {
    const movId = db.prepare('SELECT id FROM movements LIMIT 1').get().id;
    await request(app)
      .put(`/api/v1/movements/${movId}`)
      .send({ category_id: 'invalid' })
      .expect(400);
  });

  it('DELETE /movements/:id deletes', async () => {
    const movId = db.prepare('SELECT id FROM movements LIMIT 1').get().id;
    await request(app).delete(`/api/v1/movements/${movId}`).expect(200);
    const count = db.prepare('SELECT COUNT(*) as c FROM movements').get().c;
    expect(count).toBe(0);
  });
});