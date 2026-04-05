import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import { upload } from '../../shared/storage/upload.js';
import { messagingController } from './controllers/messagingController.js';

const router = Router();

router.post('/conversations', authenticate, messagingController.createConversation);
router.get('/conversations', authenticate, messagingController.getConversations);
router.get('/conversations/:id', authenticate, messagingController.getConversation);
router.get('/conversations/:id/messages', authenticate, messagingController.getMessages);
router.patch('/conversations/:id/read', authenticate, messagingController.markAsRead);
router.post('/conversations/:id/participants', authenticate, messagingController.addParticipant);
router.delete(
  '/conversations/:id/participants/:userId',
  authenticate,
  messagingController.removeParticipant
);
router.post(
  '/conversations/:id/messages',
  authenticate,
  upload.single('media'),
  messagingController.sendMessage
);

export default router;
