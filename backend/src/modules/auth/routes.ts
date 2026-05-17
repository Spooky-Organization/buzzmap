import { Router } from 'express';
import { authController } from './controllers/authController.js';
import { createRateLimiter } from '../../shared/middleware/rateLimiter.js';
import { methodNotAllowed } from '../../shared/middleware/methodNotAllowed.js';

const router = Router();
const authLimiter = createRateLimiter(15 * 60 * 1000, 10);
const registrationLimiter = createRateLimiter(60 * 60 * 1000, 20);

router
  .route('/register/customer')
  .post(registrationLimiter, authController.registerCustomer)
  .all(methodNotAllowed(['POST']));

router
  .route('/register/business')
  .post(registrationLimiter, authController.registerBusiness)
  .all(methodNotAllowed(['POST']));

router
  .route('/login')
  .post(authLimiter, authController.login)
  .all(methodNotAllowed(['POST']));

router
  .route('/refresh')
  .post(authLimiter, authController.refresh)
  .all(methodNotAllowed(['POST']));

export default router;
