import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import * as userController from './controllers/userController.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);
router.patch('/me/interests', userController.updateMyInterests);
router.get('/me/followers', userController.getMyFollowers);
router.get('/me/following', userController.getMyFollowing);
router.get('/me/friends', userController.getFriends);
router.get('/:id', userController.getUser);
router.post('/:id/follow', userController.follow);
router.delete('/:id/follow', userController.unfollow);

export default router;
