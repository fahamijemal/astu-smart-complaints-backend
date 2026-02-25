import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { AnalyticsController } from './analytics.controller';

const router: Router = Router();

router.use(authenticate);

// Everyone gets their dashboard stats
router.get('/dashboard', AnalyticsController.getDashboardStats);

// Only admins can pull the global system report
router.get('/report', authorize('admin'), AnalyticsController.getReport);

export default router;
