import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import { authorize } from '../../shared/middleware/authorize.js';
import * as businessController from './controllers/businessController.js';
import { methodNotAllowed } from '../../shared/middleware/methodNotAllowed.js';

const router = Router();

router.use(authenticate);

router
  .route('/profile')
  .get(authorize('BUSINESS_OWNER'), businessController.getMyProfile)
  .patch(authorize('BUSINESS_OWNER'), businessController.updateMyProfile)
  .all(methodNotAllowed(['GET', 'PATCH']));

router.route('/:id').get(businessController.getById).all(methodNotAllowed(['GET']));

router
  .route('/:id/follow')
  .post(businessController.follow)
  .delete(businessController.unfollow)
  .all(methodNotAllowed(['POST', 'DELETE']));

export default router;
