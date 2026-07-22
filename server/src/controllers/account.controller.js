import { sendResponse } from '../utils/response.js';
import accountService from '../services/account.service.js';

class AccountController {
  getAll(req, res, next) {
    try {
      const data = accountService.getAll();
      sendResponse(res, { ok: true, data });
    } catch (err) {
      next(err);
    }
  }

  getById(req, res, next) {
    try {
      const data = accountService.getById(req.params.id);
      sendResponse(res, { ok: true, data });
    } catch (err) {
      next(err);
    }
  }

  create(req, res, next) {
    try {
      const data = accountService.create(req.body);
      sendResponse(res, { ok: true, data }, 201);
    } catch (err) {
      next(err);
    }
  }

  update(req, res, next) {
    try {
      const data = accountService.update(req.params.id, req.body);
      sendResponse(res, { ok: true, data });
    } catch (err) {
      next(err);
    }
  }

  delete(req, res, next) {
    try {
      accountService.delete(req.params.id);
      sendResponse(res, { ok: true, data: { message: 'Cuenta eliminada' } });
    } catch (err) {
      next(err);
    }
  }
}

export default new AccountController();
