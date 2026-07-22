import { sendResponse } from '../utils/response.js';
import categoryService from '../services/category.service.js';

class CategoryController {
  getAll(req, res, next) {
    try {
      const data = categoryService.getAll();
      sendResponse(res, { ok: true, data });
    } catch (err) {
      next(err);
    }
  }

  getById(req, res, next) {
    try {
      const data = categoryService.getById(req.params.id);
      sendResponse(res, { ok: true, data });
    } catch (err) {
      next(err);
    }
  }

  create(req, res, next) {
    try {
      const data = categoryService.create(req.body);
      sendResponse(res, { ok: true, data }, 201);
    } catch (err) {
      next(err);
    }
  }

  update(req, res, next) {
    try {
      const data = categoryService.update(req.params.id, req.body);
      sendResponse(res, { ok: true, data });
    } catch (err) {
      next(err);
    }
  }

  delete(req, res, next) {
    try {
      const { reassignTo } = req.query;
      categoryService.delete(req.params.id, reassignTo || null);
      sendResponse(res, { ok: true, data: { message: 'Categoría eliminada' } });
    } catch (err) {
      next(err);
    }
  }
}

export default new CategoryController();
