import { describe, it, expect, vi, beforeEach } from 'vitest';
import movementService from '../../src/services/movement.service.js';

const mockRepo = {
  getAll: vi.fn(),
  count: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  exists: vi.fn(),
};
const mockCatRepo = { exists: vi.fn() };
const mockAccRepo = { exists: vi.fn() };

vi.mock('../../src/repositories/movement.repository.js', () => ({
  default: mockRepo,
}));
vi.mock('../../src/repositories/category.repository.js', () => ({
  default: mockCatRepo,
}));
vi.mock('../../src/repositories/account.repository.js', () => ({
  default: mockAccRepo,
}));

describe('MovementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('returns paginated movements with filters', () => {
      mockRepo.getAll.mockReturnValue([{ id: '1', amount: 100 }]);
      mockRepo.count.mockReturnValue(1);
      const result = movementService.getAll({ kind: 'gasto' }, { page: 1, limit: 10 });
      expect(result.items).toHaveLength(1);
      expect(result.pagination).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
    });

    it('uses default pagination', () => {
      mockRepo.getAll.mockReturnValue([]);
      mockRepo.count.mockReturnValue(0);
      const result = movementService.getAll({}, {});
      expect(result.pagination).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
    });
  });

  describe('getById', () => {
    it('returns movement when found', () => {
      const movement = { id: '1', amount: 100 };
      mockRepo.getById.mockReturnValue(movement);
      expect(movementService.getById('1')).toEqual(movement);
    });

    it('throws 404 when not found', () => {
      mockRepo.getById.mockReturnValue(null);
      expect(() => movementService.getById('1')).toThrow('Movimiento no encontrado');
    });
  });

  describe('create', () => {
    it('creates movement with valid FKs', () => {
      mockCatRepo.exists.mockReturnValue(true);
      mockAccRepo.exists.mockReturnValue(true);
      mockRepo.create.mockReturnValue({ id: '1', amount: 100 });
      const result = movementService.create({ kind: 'gasto', amount: 100, date: '2024-01-01', category_id: 'c1', account_id: 'a1' });
      expect(result).toHaveProperty('id');
    });

    it('throws 400 when category not exists', () => {
      mockCatRepo.exists.mockReturnValue(false);
      mockAccRepo.exists.mockReturnValue(true);
      expect(() => movementService.create({ kind: 'gasto', amount: 100, date: '2024-01-01', category_id: 'c1', account_id: 'a1' }))
        .toThrow('La categoría especificada no existe');
    });

    it('throws 400 when account not exists', () => {
      mockCatRepo.exists.mockReturnValue(true);
      mockAccRepo.exists.mockReturnValue(false);
      expect(() => movementService.create({ kind: 'gasto', amount: 100, date: '2024-01-01', category_id: 'c1', account_id: 'a1' }))
        .toThrow('La cuenta especificada no existe');
    });
  });

  describe('update', () => {
    it('updates movement with valid FKs', () => {
      mockRepo.getById.mockReturnValue({ id: '1', amount: 100 });
      mockCatRepo.exists.mockReturnValue(true);
      mockAccRepo.exists.mockReturnValue(true);
      mockRepo.update.mockReturnValue({ id: '1', amount: 200 });
      expect(movementService.update('1', { amount: 200, category_id: 'c1', account_id: 'a1' })).toEqual({ id: '1', amount: 200 });
    });

    it('throws 404 when movement not found', () => {
      mockRepo.getById.mockReturnValue(null);
      expect(() => movementService.update('1', { amount: 200 })).toThrow('Movimiento no encontrado');
    });
  });

  describe('delete', () => {
    it('deletes movement', () => {
      mockRepo.getById.mockReturnValue({ id: '1', amount: 100 });
      movementService.delete('1');
      expect(mockRepo.delete).toHaveBeenCalledWith('1');
    });

    it('throws 404 when not found', () => {
      mockRepo.getById.mockReturnValue(null);
      expect(() => movementService.delete('1')).toThrow('Movimiento no encontrado');
    });
  });
});