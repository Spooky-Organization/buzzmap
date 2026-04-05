import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import * as feedController from './controllers/feedController.js';

const router = Router();

router.get('/', authenticate, feedController.getPersonalizedFeed);
router.get('/trending', authenticate, feedController.getTrending);

export default router;
