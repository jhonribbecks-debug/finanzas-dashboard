import { v4 as uuidv4 } from 'uuid';
import budgetRepository from '../repositories/budget.repository.js';
import categoryRepository from '../repositories/category.repository.js';

class BudgetService {
  getAll(month) {
    return budgetRepository.getAll(month);
  }

  getById(id) {
    const budget = budgetRepository.getById(id);
    if (!budget) {
      const err = new Error('Presupuesto no encontrado');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return budget;
  }

  create(data) {
    this.validateCategory(data.category_id);
    if (budgetRepository.hasDuplicate(data.month, data.category_id)) {
      const err = new Error('Ya existe un presupuesto para esa categoría y mes');
      err.statusCode = 409;
      err.code = 'CONFLICT';
      throw err;
    }
    return budgetRepository.create({ id: uuidv4(), ...data });
  }

  update(id, data) {
    const existing = this.getById(id);
    if (data.category_id !== undefined) {
      this.validateCategory(data.category_id);
    }
    const month = data.month || existing.month;
    const categoryId = data.category_id || existing.category_id;
    if (budgetRepository.hasDuplicate(month, categoryId, id)) {
      const err = new Error('Ya existe un presupuesto para esa categoría y mes');
      err.statusCode = 409;
      err.code = 'CONFLICT';
      throw err;
    }
    return budgetRepository.update(id, data);
  }

  delete(id) {
    this.getById(id);
    return budgetRepository.delete(id);
  }

  validateCategory(categoryId) {
    if (!categoryRepository.exists(categoryId)) {
      const err = new Error('La categoría especificada no existe');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
  }
}

export default new BudgetService();
