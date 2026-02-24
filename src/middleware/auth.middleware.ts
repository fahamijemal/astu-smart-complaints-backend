import { Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service';
import { sendError } from '../utils/response';
import { AuthRequest } from '../types';

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return sendError(res, 401, 'UNAUTHORIZED', 'Missing or invalid authorization header');
        }

        const token = authHeader.slice(7);
        const payload = TokenService.verifyAccessToken(token);
        req.user = payload;
        return next();
    } catch {
        return sendError(res, 401, 'TOKEN_INVALID', 'Invalid or expired access token');
    }
}
