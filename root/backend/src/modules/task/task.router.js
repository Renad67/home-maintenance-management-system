import { Router } from 'express';
import * as taskController from './task.controller.js';
import { requireAuth, requireRole } from '../../common/middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/pending/:technicianId', requireRole('technician', 'admin'), taskController.getPending);
router.put('/:requestId/claim', requireRole('technician'), taskController.claimTask);
router.put('/:requestId/status', requireRole('technician'), taskController.updateStatus);
router.get('/:technicianId', requireRole('technician', 'admin'), taskController.getTasks);
router.post('/:taskId/proposal', requireAuth, taskController.submitProposal);
router.post('/:taskId/proposal/respond', requireAuth, taskController.respondToProposal);
router.put('/:taskId/status', requireAuth, taskController.updateStatus);
router.put('/:taskId/complete', requireAuth, taskController.completeTask);
router.put('/:taskId/cancel', requireAuth, taskController.cancelTask);


export default router;