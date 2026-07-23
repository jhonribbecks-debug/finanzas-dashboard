import { Router } from 'express';
import dashboardController from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/summary', dashboardController.getSummary);

export default router;
