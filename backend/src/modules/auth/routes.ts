import { Router } from 'express';
import { authController } from './controllers/authController.js';

const router = Router();

router.post('/register/customer', authController.registerCustomer);
router.post('/register/business', authController.registerBusiness);
router.post('/login', authController.login);

export default router;
