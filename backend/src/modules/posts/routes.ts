import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import { upload } from '../../shared/storage/upload.js';
import * as postController from './controllers/postController.js';

const router = Router();

router.post('/', authenticate, upload.array('media', 10), postController.create);
router.delete('/:id', authenticate, postController.deleteOne);
router.get('/user/:userId', authenticate, postController.getByUser);
router.get('/business/:businessId', authenticate, postController.getByBusiness);

export default router;
