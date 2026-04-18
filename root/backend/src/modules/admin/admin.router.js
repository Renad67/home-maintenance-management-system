import { Router } from 'express';
import * as adminController from './admin.controller.js';
import { requireAuth, requireRole } from '../../common/middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/requests', adminController.getRequests);

export default router;