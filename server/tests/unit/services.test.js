import { describe, it, expect, beforeEach, vi } from 'vitest';
import categoryService from '../../services/category.service.js';
import accountService from '../../services/account.service.js';
import movementService from '../../services/movement.service.js';
import { v4 as uuidv4 } from 'uuid';

const createMockRepo = () => ({
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  exists: vi.fn(),
  hasName: vi.fn(),
  hasMovements: vi.fn(),
  reassignMovements: vi.fn(),
});

describe('CategoryService', () => {
  let mockRepo;

  beforeEach(() => {
    mockRepo = createMockRepo();
    categoryService.categoryRepository = mockRepo;
  });

  it('getAll returns all categories', () => {
    const cats = [{ id: '1', name: 'Food', kind: 'gasto' }];
    mockRepo.getAll.mockReturnValue(cats);
    expect(categoryService.getAll()).toEqual(cats);
  });

  it('getById throws 404 when not found', () => {
    mockRepo.getById.mockReturnValue(null);
    expect(() => categoryService.getById('1')).toThrow();
    try { categoryService.getById('1'); } catch (e) { expect(e.statusCode).toBe(404); }
  });

  it('create throws 409 when name/kind exists', () => {
    mockRepo.hasName.mockReturnValue(true);
    expect(() => categoryService.create({ name: 'Food', kind: 'gasto' })).toThrow();
    try { categoryService.create({ name: 'Food', kind: 'gasto' }); } catch (e) { expect(e.statusCode).toBe(409); }
  });

  it('create generates uuid and calls repo', () => {
    mockRepo.hasName.mockReturnValue(false);
    mockRepo.create.mockImplementation((d) => ({ ...d, id: 'new-id' }));
    const res = categoryService.create({ name: 'Food', kind: 'gasto' });
    expect(res.id).toBeDefined();
    expect(mockRepo.create).toHaveBeenCalled();
  });

  it('update throws 409 when name/kind exists on other', () => {
    mockRepo.getById.mockReturnValue({ id: '1' });
    mockRepo.hasName.mockReturnValue(true);
    expect(() => categoryService.update('1', { name: 'Food', kind: 'gasto' })).toThrow();
    try { categoryService.update('1', { name: 'Food', kind: 'gasto' }); } catch (e) { expect(e.statusCode).toBe(409); }
  });

  it('delete reassigns when reassignToId provided', () => {
    mockRepo.getById.mockReturnValue({ id: '1' });
    mockRepo.hasMovements.mockReturnValue(true);
    categoryService.delete('1', '2');
    expect(mockRepo.reassignMovements).toHaveBeenCalledWith('1', '2');
  });

  it('delete throws 409 when has movements and no reassign', () => {
    mockRepo.getById.mockReturnValue({ id: '1' });
    mockRepo.hasMovements.mockReturnValue(true);
    expect(() => categoryService.delete('1')).toThrow();
    try { categoryService.delete('1'); } catch (e) { expect(e.statusCode).toBe(409); }
  });

  it('delete succeeds when no movements', () => {
    mockRepo.getById.mockReturnValue({ id: '1' });
    mockRepo.hasMovements.mockReturnValue(false);
    categoryService.delete('1');
    expect(mockRepo.delete).toHaveBeenCalledWith('1');
  });
});

describe('AccountService', () => {
  let mockRepo;

  beforeEach(() => {
    mockRepo = createMockRepo();
    accountService.accountRepository = mockRepo;
  });

  it('getAll returns all accounts', () => {
    const accs = [{ id: '1', name: 'Cash', balance: 100 }];
    mockRepo.getAll.mockReturnValue(accs);
    expect(accountService.getAll()).toEqual(accs);
  });

  it('getById throws 404 when not found', () => {
    mockRepo.getById.mockReturnValue(null);
    expect(() => accountService.getById('1')).toThrow();
    try { accountService.getById('1'); } catch (e) { expect(e.statusCode).toBe(404); }
  });

  it('create throws 409 when name exists', () => {
    mockRepo.hasName.mockReturnValue(true);
    expect(() => accountService.create({ name: 'Cash', type: 'efectivo' })).toThrow();
    try { accountService.create({ name: 'Cash', type: 'efectivo' }); } catch (e) { expect(e.statusCode).toBe(409); }
  });

  it('update throws 409 when name exists on other', () => {
    mockRepo.getById.mockReturnValue({ id: '1' });
    mockRepo.hasName.mockReturnValue(true);
    expect(() => accountService.update('1', { name: 'Cash' })).toThrow();
    try { accountService.update('1', { name: 'Cash' }); } catch (e) { expect(e.statusCode).toBe(409); }
  });

  it('delete throws 409 when has movements', () => {
    mockRepo.getById.mockReturnValue({ id: '1' });
    mockRepo.hasMovements.mockReturnValue(true);
    expect(() => accountService.delete('1')).toThrow();
    try { accountService.delete('1'); } catch (e) { expect(e.statusCode).toBe(409); }
  });

  it('delete succeeds when no movements', () => {
    mockRepo.getById.mockReturnValue({ id: '1' });
    mockRepo.hasMovements.mockReturnValue(false);
    accountService.delete('1');
    expect(mockRepo.delete).toHaveBeenCalledWith('1');
  });
});

describe('MovementService', () => {
  let mockRepo, mockCatRepo, mockAccRepo;

  beforeEach(() => {
    mockRepo = createMockRepo();
    mockCatRepo = { exists: vi.fn(), getById: vi.fn() };
    mockAccRepo = { exists: vi.fn(), getById: vi.fn() };
    movementService.movementRepository = mockRepo;
    movementService.categoryRepository = mockCatRepo;
    movementService.accountRepository = mockAccRepo;
  });

  it('getAll returns paginated result', () => {
    mockRepo.getAll.mockReturnValue([{ id: '1' }]);
    mockRepo.count.mockReturnValue(1);
    const res = movementService.getAll({}, { page: 1, limit: 10 });
    expect(res.items).toHaveLength(1);
    expect(res.pagination).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
  });

  it('getById throws 404 when not found', () => {
    mockRepo.getById.mockReturnValue(null);
    expect(() => movementService.getById('1')).toThrow();
    try { movementService.getById('1'); } catch (e) { expect(e.statusCode).toBe(404); }
  });

  it('create validates FKs and creates', () => {
    mockCatRepo.exists.mockReturnValue(true);
    mockAccRepo.exists.mockReturnValue(true);
    mockRepo.create.mockImplementation((d) => ({ ...d, id: 'new-id' }));
    const res = movementService.create({ kind: 'gasto', amount: 100, date: '2024-01-01', category_id: 'c1', account_id: 'a1' });
    expect(res.id).toBe('new-id');
  });

  it('create throws 400 when category not exists', () => {
    mockCatRepo.exists.mockReturnValue(false);
    expect(() => movementService.create({ category_id: 'c1', account_id: 'a1' })).toThrow();
    try { movementService.create({ category_id: 'c1', account_id: 'a1' }); } catch (e) { expect(e.statusCode).toBe(400); }
  });

  it('create throws 400 when account not exists', () => {
    mockCatRepo.exists.mockReturnValue(true);
    mockAccRepo.exists.mockReturnValue(false);
    expect(() => movementService.create({ category_id: 'c1', account_id: 'a1' })).toThrow();
    try { movementService.create({ category_id: 'c1', account_id: 'a1' }); } catch (e) { expect(e.statusCode).toBe(400); }
  });

  it('update validates FKs and updates', () => {
    mockRepo.getById.mockReturnValue({ id: '1' });
    mockCatRepo.exists.mockReturnValue(true);
    mockAccRepo.exists.mockReturnValue(true);
    mockRepo.update.mockReturnValue({ id: '1', amount: 200 });
    const res = movementService.update('1', { amount: 200, category_id: 'c1', account_id: 'a1' });
    expect(res.amount).toBe(200);
  });

  it('delete calls repo delete', () => {
    mockRepo.getById.mockReturnValue({ id: '1' });
    movementService.delete('1');
    expect(mockRepo.delete).toHaveBeenCalledWith('1');
  });
});