import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { NotificationController } from './notification.controller';

const router: Router = Router();
router.use(authenticate);
router.get('/', NotificationController.list);
router.patch('/read-all', NotificationController.markAllRead);
router.patch('/:id/read', NotificationController.markRead);
export default router;
