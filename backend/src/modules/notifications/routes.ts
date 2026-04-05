import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import { notificationController } from './controllers/notificationController.js';

const router = Router();

router.get('/', authenticate, notificationController.getNotifications);
router.get('/unread-count', authenticate, notificationController.getUnreadCount);
router.patch('/:id/read', authenticate, notificationController.markAsRead);
router.patch('/read-all', authenticate, notificationController.markAllAsRead);

export default router;
