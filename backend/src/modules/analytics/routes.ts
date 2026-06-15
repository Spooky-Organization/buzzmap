import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import * as analyticsController from './controllers/analyticsController.js';

const router = Router();

router.post('/events', authenticate, analyticsController.createEvent);

export default router;
