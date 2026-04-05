import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import * as searchController from './controllers/searchController.js';

const router = Router();

router.get('/', authenticate, searchController.searchAll);
router.get('/businesses', authenticate, searchController.searchBusinesses);
router.get('/products', authenticate, searchController.searchProducts);
router.get('/users', authenticate, searchController.searchUsers);

export default router;
