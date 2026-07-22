import { describe, it, expect, vi, beforeEach } from 'vitest';
import accountService from '../services/account.service.js';

describe('AccountService', () => {
  const mockRepo = {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    hasName: vi.fn(),
    hasMovements: vi.fn(),
    exists: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    accountService.repository = mockRepo;
  });

  describe('getAll', () => {
    it('returns all accounts with balance', () => {
      const accounts = [{ id: '1', name: 'Cash', type: 'efectivo', balance: 500 }];
      mockRepo.getAll.mockReturnValue(accounts);
      expect(accountService.getAll()).toEqual(accounts);
    });
  });

  describe('getById', () => {
    it('returns account with balance when found', () => {
      const account = { id: '1', name: 'Cash', type: 'efectivo', balance: 500 };
      mockRepo.getById.mockReturnValue(account);
      expect(accountService.getById('1')).toEqual(account);
    });

    it('throws 404 when not found', () => {
      mockRepo.getById.mockReturnValue(null);
      expect(() => accountService.getById('1')).toThrow('Cuenta no encontrada');
    });
  });

  describe('create', () => {
    it('creates account when name unique', () => {
      mockRepo.hasName.mockReturnValue(false);
      mockRepo.create.mockReturnValue({ id: '1', name: 'Cash', type: 'efectivo', initial_balance: 0 });
      const result = accountService.create({ name: 'Cash', type: 'efectivo' });
      expect(result).toHaveProperty('id');
    });

    it('throws 409 when name exists', () => {
      mockRepo.hasName.mockReturnValue(true);
      expect(() => accountService.create({ name: 'Cash', type: 'efectivo' }))
        .toThrow('Ya existe una cuenta con ese nombre');
    });
  });

  describe('update', () => {
    it('updates account', () => {
      mockRepo.getById.mockReturnValue({ id: '1', name: 'Cash', type: 'efectivo' });
      mockRepo.hasName.mockReturnValue(false);
      mockRepo.update.mockReturnValue({ id: '1', name: 'Bank', type: 'debito' });
      expect(accountService.update('1', { name: 'Bank' })).toEqual({ id: '1', name: 'Bank', type: 'debito' });
    });

    it('throws 409 when name conflicts', () => {
      mockRepo.getById.mockReturnValue({ id: '1', name: 'Cash', type: 'efectivo' });
      mockRepo.hasName.mockReturnValue(true);
      expect(() => accountService.update('1', { name: 'Bank' }))
        .toThrow('Ya existe una cuenta con ese nombre');
    });
  });

  describe('delete', () => {
    it('deletes account with no movements', () => {
      mockRepo.getById.mockReturnValue({ id: '1', name: 'Cash' });
      mockRepo.hasMovements.mockReturnValue(false);
      accountService.delete('1');
      expect(mockRepo.delete).toHaveBeenCalledWith('1');
    });

    it('throws 409 when has movements', () => {
      mockRepo.getById.mockReturnValue({ id: '1', name: 'Cash' });
      mockRepo.hasMovements.mockReturnValue(true);
      expect(() => accountService.delete('1')).toThrow('No se puede eliminar la cuenta porque tiene movimientos');
    });
  });
});