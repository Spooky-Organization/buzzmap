import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import { authorize } from '../../shared/middleware/authorize.js';
import * as orderController from './controllers/orderController.js';

const router = Router();

// Cart routes
router.post('/cart', authenticate, orderController.addToCart);
router.get('/cart', authenticate, orderController.getCart);
router.patch('/cart/:id', authenticate, orderController.updateCartQuantity);
router.delete('/cart/:id', authenticate, orderController.removeFromCart);

// Order routes
router.post('/', authenticate, orderController.createOrder);
router.get('/', authenticate, orderController.getMyOrders);
router.get('/my', authenticate, orderController.getMyOrders);
router.post('/checkout', authenticate, orderController.createOrder);
router.get('/business', authenticate, authorize('BUSINESS_OWNER'), orderController.getBusinessOrders);
router.get('/:id', authenticate, orderController.getOrder);
router.patch('/:id/status', authenticate, authorize('BUSINESS_OWNER'), orderController.updateStatus);

export default router;
