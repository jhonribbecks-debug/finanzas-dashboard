import { v4 as uuidv4 } from 'uuid';
import movementRepository from '../repositories/movement.repository.js';
import categoryRepository from '../repositories/category.repository.js';
import accountRepository from '../repositories/account.repository.js';

class MovementService {
  getAll(filters = {}, pagination = {}) {
    const items = movementRepository.getAll(filters, pagination);
    const total = movementRepository.count(filters);
    const { page = 1, limit = 10 } = pagination;

    return {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  getById(id) {
    const movement = movementRepository.getById(id);
    if (!movement) {
      const err = new Error('Movimiento no encontrado');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return movement;
  }

  create(data) {
    this.validateForeignKeys(data.category_id, data.account_id);
    return movementRepository.create({ id: uuidv4(), ...data });
  }

  update(id, data) {
    this.getById(id);
    this.validateForeignKeys(data.category_id, data.account_id);
    return movementRepository.update(id, data);
  }

  delete(id) {
    this.getById(id);
    return movementRepository.delete(id);
  }

  validateForeignKeys(categoryId, accountId) {
    if (categoryId !== undefined && !categoryRepository.exists(categoryId)) {
      const err = new Error('La categoría especificada no existe');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    if (accountId !== undefined && !accountRepository.exists(accountId)) {
      const err = new Error('La cuenta especificada no existe');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
  }
}

export default new MovementService();
