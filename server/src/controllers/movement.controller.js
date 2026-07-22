import { sendResponse } from '../utils/response.js';
import movementService from '../services/movement.service.js';

class MovementController {
  getAll(req, res, next) {
    try {
      const { from, to, categoryId, accountId, kind, q, page, limit } = req.query;
      const filters = { from, to, categoryId, accountId, kind, q };
      const pagination = { page, limit };
      const data = movementService.getAll(filters, pagination);
      sendResponse(res, { ok: true, data });
    } catch (err) {
      next(err);
    }
  }

  getById(req, res, next) {
    try {
      const data = movementService.getById(req.params.id);
      sendResponse(res, { ok: true, data });
    } catch (err) {
      next(err);
    }
  }

  create(req, res, next) {
    try {
      const data = movementService.create(req.body);
      sendResponse(res, { ok: true, data }, 201);
    } catch (err) {
      next(err);
    }
  }

  update(req, res, next) {
    try {
      const data = movementService.update(req.params.id, req.body);
      sendResponse(res, { ok: true, data });
    } catch (err) {
      next(err);
    }
  }

  delete(req, res, next) {
    try {
      movementService.delete(req.params.id);
      sendResponse(res, { ok: true, data: { message: 'Movimiento eliminado' } });
    } catch (err) {
      next(err);
    }
  }
}

export default new MovementController();
