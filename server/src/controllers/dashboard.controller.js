import { sendResponse } from '../utils/response.js';
import dashboardService from '../services/dashboard.service.js';

class DashboardController {
  getSummary(req, res, next) {
    try {
      const data = dashboardService.getSummary();
      sendResponse(res, { ok: true, data });
    } catch (err) {
      next(err);
    }
  }
}

export default new DashboardController();
