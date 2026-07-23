import { sendResponse } from '../utils/response.js';
import budgetService from '../services/budget.service.js';

class BudgetController {
  getAll(req, res, next) {
    try {
      const { month } = req.query;
      const data = budgetService.getAll(month);
      sendResponse(res, { ok: true, data });
    } catch (err) {
      next(err);
    }
  }

  getById(req, res, next) {
    try {
      const data = budgetService.getById(req.params.id);
      sendResponse(res, { ok: true, data });
    } catch (err) {
      next(err);
    }
  }

  create(req, res, next) {
    try {
      const data = budgetService.create(req.body);
      sendResponse(res, { ok: true, data }, 201);
    } catch (err) {
      next(err);
    }
  }

  update(req, res, next) {
    try {
      const data = budgetService.update(req.params.id, req.body);
      sendResponse(res, { ok: true, data });
    } catch (err) {
      next(err);
    }
  }

  delete(req, res, next) {
    try {
      budgetService.delete(req.params.id);
      sendResponse(res, { ok: true, data: { message: 'Presupuesto eliminado' } });
    } catch (err) {
      next(err);
    }
  }
}

export default new BudgetController();
