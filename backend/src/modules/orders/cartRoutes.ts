import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import * as orderController from './controllers/orderController.js';

const router = Router();

router.get('/', authenticate, orderController.getCart);
router.post('/', authenticate, orderController.addToCart);
router.patch('/items/:id', authenticate, orderController.updateCartQuantity);
router.delete('/items/:id', authenticate, orderController.removeFromCart);

export default router;
