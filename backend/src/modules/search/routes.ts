import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import * as searchController from './controllers/searchController.js';
import { methodNotAllowed } from '../../shared/middleware/methodNotAllowed.js';

const router = Router();

router.route('/').get(authenticate, searchController.searchAll).all(methodNotAllowed(['GET']));
router
  .route('/businesses')
  .get(authenticate, searchController.searchBusinesses)
  .all(methodNotAllowed(['GET']));
router
  .route('/products')
  .get(authenticate, searchController.searchProducts)
  .all(methodNotAllowed(['GET']));
router
  .route('/categories')
  .get(authenticate, searchController.getCategories)
  .all(methodNotAllowed(['GET']));
router.route('/users').get(authenticate, searchController.searchUsers).all(methodNotAllowed(['GET']));

export default router;
