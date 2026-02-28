import { Response } from 'express';
import { AuthRequest } from '../../types';
import { AnalyticsService } from './analytics.service';
import { sendSuccess } from '../../utils/response';

export const AnalyticsController = {
    async summary(_req: AuthRequest, res: Response) {
        const data = await AnalyticsService.getSummary();
        return sendSuccess(res, data);
    },

    async timeSeries(req: AuthRequest, res: Response) {
        const { period, days } = req.query as { period?: 'daily' | 'weekly' | 'monthly'; days?: string };
        const data = await AnalyticsService.getTimeSeries(period ?? 'daily', parseInt(days ?? '30', 10));
        return sendSuccess(res, data);
    },
};
