import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import * as recommendationController from './controllers/recommendationController.js';

const router = Router();

router.get('/business/stats', authenticate, recommendationController.getMyBusinessStats);
router.get('/business/:id/stats', authenticate, recommendationController.getBusinessStats);
router.get('/top', authenticate, recommendationController.getTopBusinesses);

export default router;
