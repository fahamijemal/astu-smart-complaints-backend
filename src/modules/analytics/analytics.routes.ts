import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { AnalyticsController } from './analytics.controller';

const router: Router = Router();
router.use(authenticate, authorize('admin', 'staff'));
router.get('/summary', AnalyticsController.summary);
router.get('/timeseries', authorize('admin'), AnalyticsController.timeSeries);
export default router;
