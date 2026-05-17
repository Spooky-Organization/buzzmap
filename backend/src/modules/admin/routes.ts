import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import { authorize } from '../../shared/middleware/authorize.js';
import { methodNotAllowed } from '../../shared/middleware/methodNotAllowed.js';
import * as adminController from './controllers/adminController.js';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.route('/overview').get(adminController.getOverview).all(methodNotAllowed(['GET']));
router.route('/users').get(adminController.getUsers).all(methodNotAllowed(['GET']));
router.route('/businesses').get(adminController.getBusinesses).all(methodNotAllowed(['GET']));
router.route('/catalog').get(adminController.getCatalog).all(methodNotAllowed(['GET']));
router.route('/orders').get(adminController.getOrders).all(methodNotAllowed(['GET']));
router.route('/moderation').get(adminController.getModeration).all(methodNotAllowed(['GET']));
router.route('/messages').get(adminController.getMessages).all(methodNotAllowed(['GET']));
router.route('/announcements').get(adminController.getAnnouncements).all(methodNotAllowed(['GET']));
router.route('/security').get(adminController.getSecurity).all(methodNotAllowed(['GET']));
router.route('/system').get(adminController.getSystem).all(methodNotAllowed(['GET']));
router.route('/settings').get(adminController.getSettings).all(methodNotAllowed(['GET']));
router.route('/audit-log').get(adminController.getAuditLog).all(methodNotAllowed(['GET']));

export default router;
