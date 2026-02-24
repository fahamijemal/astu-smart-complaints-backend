import { db } from '../../config/database';
import { AppError } from '../../utils/AppError';

export const NotificationService = {
    async create(data: {
        userId: string;
        title: string;
        message: string;
        type: string;
        referenceId?: string;
    }) {
        await db.query(
            `INSERT INTO notifications (user_id, title, message, type, reference_id) VALUES ($1, $2, $3, $4, $5)`,
            [data.userId, data.title, data.message, data.type, data.referenceId ?? null],
        );
    },

    async getUserNotifications(userId: string) {
        const result = await db.query(
            `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
            [userId],
        );
        return result.rows;
    },

    async markRead(notificationId: string, userId: string) {
        const result = await db.query(
            `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING id`,
            [notificationId, userId],
        );
        if (!result.rows[0]) {
            throw AppError.notFound('Notification not found');
        }
    },

    async markAllRead(userId: string) {
        await db.query(`UPDATE notifications SET is_read = true WHERE user_id = $1`, [userId]);
    },

    async getUnreadCount(userId: string) {
        const result = await db.query<{ count: string }>(
            `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
            [userId],
        );
        return parseInt(result.rows[0].count, 10);
    },
};
