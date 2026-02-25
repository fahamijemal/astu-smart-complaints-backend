import { Router } from 'express';
import authRoutes from './auth/auth.routes';
import complaintRoutes from './complaints/complaint.routes';
import notificationRoutes from './notifications/notification.routes';
import analyticsRoutes from './analytics/analytics.routes';
import chatbotRoutes from './chatbot/chatbot.routes';
import adminRoutes from './admin/admin.routes';
import { AdminController } from './admin/admin.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Feature routes
router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/admin', adminRoutes);

// Public-facing endpoints wired through admin service
router.get('/categories', authenticate, AdminController.listCategories);
router.get('/departments', authenticate, AdminController.listDepartments);

export default router;
