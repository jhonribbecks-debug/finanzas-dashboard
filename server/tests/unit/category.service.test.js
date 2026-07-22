import { describe, it, expect, vi, beforeEach } from 'vitest';
import categoryService from '../services/category.service.js';

describe('CategoryService', () => {
  const mockRepo = {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    hasName: vi.fn(),
    hasMovements: vi.fn(),
    reassignMovements: vi.fn(),
    exists: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    categoryService.repository = mockRepo;
  });

  describe('getAll', () => {
    it('returns all categories', () => {
      const categories = [{ id: '1', name: 'Food', kind: 'gasto' }];
      mockRepo.getAll.mockReturnValue(categories);
      expect(categoryService.getAll()).toEqual(categories);
    });
  });

  describe('getById', () => {
    it('returns category when found', () => {
      const category = { id: '1', name: 'Food', kind: 'gasto' };
      mockRepo.getById.mockReturnValue(category);
      expect(categoryService.getById('1')).toEqual(category);
    });

    it('throws 404 when not found', () => {
      mockRepo.getById.mockReturnValue(null);
      expect(() => categoryService.getById('1')).toThrow('Categoría no encontrada');
    });
  });

  describe('create', () => {
    it('creates category when name/kind unique', () => {
      mockRepo.hasName.mockReturnValue(false);
      mockRepo.create.mockReturnValue({ id: '1', name: 'Food', kind: 'gasto' });
      const result = categoryService.create({ name: 'Food', kind: 'gasto' });
      expect(result).toHaveProperty('id');
      expect(mockRepo.create).toHaveBeenCalled();
    });

    it('throws 409 when name/kind exists', () => {
      mockRepo.hasName.mockReturnValue(true);
      expect(() => categoryService.create({ name: 'Food', kind: 'gasto' }))
        .toThrow('Ya existe una categoría con ese nombre y tipo');
    });
  });

  describe('update', () => {
    it('updates category', () => {
      mockRepo.getById.mockReturnValue({ id: '1', name: 'Food', kind: 'gasto' });
      mockRepo.hasName.mockReturnValue(false);
      mockRepo.update.mockReturnValue({ id: '1', name: 'Drinks', kind: 'gasto' });
      expect(categoryService.update('1', { name: 'Drinks' })).toEqual({ id: '1', name: 'Drinks', kind: 'gasto' });
    });

    it('throws 409 when name/kind conflicts with another', () => {
      mockRepo.getById.mockReturnValue({ id: '1', name: 'Food', kind: 'gasto' });
      mockRepo.hasName.mockReturnValue(true);
      expect(() => categoryService.update('1', { name: 'Drinks' }))
        .toThrow('Ya existe una categoría con ese nombre y tipo');
    });
  });

  describe('delete', () => {
    it('deletes category with no movements', () => {
      mockRepo.getById.mockReturnValue({ id: '1', name: 'Food', kind: 'gasto' });
      mockRepo.hasMovements.mockReturnValue(false);
      categoryService.delete('1');
      expect(mockRepo.delete).toHaveBeenCalledWith('1');
    });

    it('reassigns movements when reassignTo provided', () => {
      mockRepo.getById.mockReturnValue({ id: '1', name: 'Food', kind: 'gasto' });
      categoryService.delete('1', '2');
      expect(mockRepo.reassignMovements).toHaveBeenCalledWith('1', '2');
    });

    it('throws 409 when has movements and no reassignTo', () => {
      mockRepo.getById.mockReturnValue({ id: '1', name: 'Food', kind: 'gasto' });
      mockRepo.hasMovements.mockReturnValue(true);
      expect(() => categoryService.delete('1')).toThrow('No se puede eliminar la categoría porque tiene movimientos');
    });

    it('throws 404 when reassignTo not found', () => {
      mockRepo.getById.mockReturnValueOnce({ id: '1', name: 'Food', kind: 'gasto' });
      mockRepo.getById.mockReturnValueOnce(null);
      expect(() => categoryService.delete('1', '2')).toThrow('Categoría no encontrada');
    });
  });
});