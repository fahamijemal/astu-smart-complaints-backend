import { Response } from 'express';
import { AuthRequest } from '../../types';
import { AnalyticsService } from './analytics.service';
import { sendSuccess } from '../../utils/response';

export const AnalyticsController = {
    async getDashboardStats(req: AuthRequest, res: Response) {
        const stats = await AnalyticsService.getDashboardStats(req.user!);
        return sendSuccess(res, stats);
    },

    async getReport(req: AuthRequest, res: Response) {
        const report = await AnalyticsService.getSystemReport();
        return sendSuccess(res, report);
    }
};
