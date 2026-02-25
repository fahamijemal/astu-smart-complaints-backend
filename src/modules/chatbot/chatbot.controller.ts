import { Response } from 'express';
import { AuthRequest } from '../../types';
import { ChatbotService } from './chatbot.service';
import { sendSuccess, sendError } from '../../utils/response';

export const ChatbotController = {
    async message(req: AuthRequest, res: Response) {
        const { message, history } = req.body;
        if (!message?.trim()) {
            return sendError(res, 400, 'MISSING_MESSAGE', 'message field is required');
        }

        try {
            const result = await ChatbotService.sendMessage(message, history ?? []);
            return sendSuccess(res, result);
        } catch (err: unknown) {
            if (err instanceof Error && err.message === 'AI service timeout') {
                return sendError(res, 503, 'AI_TIMEOUT', 'AI service timed out. Please try again.');
            }
            throw err;
        }
    },
};
