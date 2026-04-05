import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import { authorize } from '../../shared/middleware/authorize.js';
import * as businessController from './controllers/businessController.js';

const router = Router();

router.get('/profile', authenticate, authorize('BUSINESS_OWNER'), businessController.getMyProfile);
router.patch('/profile', authenticate, authorize('BUSINESS_OWNER'), businessController.updateMyProfile);
router.get('/:id', authenticate, businessController.getById);
router.post('/:id/follow', authenticate, businessController.follow);
router.delete('/:id/follow', authenticate, businessController.unfollow);

export default router;
