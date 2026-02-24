import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response';

function makeRateLimiter(max: number, windowMs: number, message: string) {
    return rateLimit({
        max,
        windowMs,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            sendError(res, 429, 'RATE_LIMIT_EXCEEDED', message);
        },
    });
}

export const authRateLimit = makeRateLimiter(10, 60 * 1000, 'Too many auth attempts. Try again in 1 minute.');
export const complaintRateLimit = makeRateLimiter(5, 60 * 1000, 'Too many complaint submissions. Try again in 1 minute.');
export const fileUploadRateLimit = makeRateLimiter(10, 60 * 60 * 1000, 'File upload limit reached. Try again in 1 hour.');
export const chatbotRateLimit = makeRateLimiter(30, 60 * 60 * 1000, 'Chatbot request limit reached. Try again in 1 hour.');
export const generalRateLimit = makeRateLimiter(200, 15 * 60 * 1000, 'Too many requests. Try again in 15 minutes.');
