import { Response } from 'express';
import { AuthRequest } from '../../types';
import { NotificationService } from './notification.service';
import { sendSuccess } from '../../utils/response';

export const NotificationController = {
    async list(req: AuthRequest, res: Response) {
        const notifications = await NotificationService.getUserNotifications(req.user!.userId);
        const unreadCount = await NotificationService.getUnreadCount(req.user!.userId);
        return sendSuccess(res, { notifications, unreadCount });
    },

    async markRead(req: AuthRequest, res: Response) {
        await NotificationService.markRead(req.params.id as string, req.user!.userId);
        return sendSuccess(res, null, 'Notification marked as read');
    },

    async markAllRead(req: AuthRequest, res: Response) {
        await NotificationService.markAllRead(req.user!.userId);
        return sendSuccess(res, null, 'All notifications marked as read');
    },
};
