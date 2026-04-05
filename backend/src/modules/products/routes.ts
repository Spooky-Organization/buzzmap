import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import { authorize } from '../../shared/middleware/authorize.js';
import { upload } from '../../shared/storage/upload.js';
import * as productController from './controllers/productController.js';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('BUSINESS_OWNER'),
  upload.array('images', 10),
  productController.create
);
router.patch(
  '/:id',
  authenticate,
  authorize('BUSINESS_OWNER'),
  productController.update
);
router.delete(
  '/:id',
  authenticate,
  authorize('BUSINESS_OWNER'),
  productController.deleteProduct
);
router.get('/business', authenticate, authorize('BUSINESS_OWNER'), productController.getMyProducts);
router.get('/business/:businessId', authenticate, productController.getByBusiness);
router.get('/category/:category', authenticate, productController.getByCategory);
router.patch(
  '/:id/stock',
  authenticate,
  authorize('BUSINESS_OWNER'),
  productController.updateStock
);
router.patch(
  '/:id/availability',
  authenticate,
  authorize('BUSINESS_OWNER'),
  productController.toggleAvailability
);

export default router;
