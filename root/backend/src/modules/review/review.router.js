import { Router } from 'express';
import * as reviewController from './review.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';

const router = Router();

router.get('/', requireAuth, reviewController.getAllReviews);
router.post('/submit', requireAuth, reviewController.submitReview);
router.get('/user/:userId', requireAuth, reviewController.getMyReviews);
router.get('/technician/:techId', requireAuth, reviewController.getTechReviews);

export default router;