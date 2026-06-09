import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import { authorize } from '../../shared/middleware/authorize.js';
import { upload } from '../../shared/storage/upload.js';
import * as povController from './controllers/povController.js';

const router = Router();

router.post('/', authenticate, authorize('CUSTOMER'), upload.array('media', 10), povController.create);
router.get('/my', authenticate, povController.getMyPOVs);
router.delete('/:id', authenticate, povController.deletePOV);
router.get('/:id', authenticate, povController.getOne);
router.get('/business/:businessId', authenticate, povController.getByBusiness);
router.get('/user/:userId', authenticate, povController.getByUser);
router.post('/:id/like', authenticate, povController.like);
router.delete('/:id/like', authenticate, povController.unlike);
router.post('/:id/comments', authenticate, povController.addComment);
router.get('/:id/comments', authenticate, povController.getComments);

export default router;
