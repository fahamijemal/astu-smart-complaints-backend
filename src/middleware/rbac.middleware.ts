import { Response, NextFunction } from 'express';
import { UserRole, AuthRequest } from '../types';
import { sendError } from '../utils/response';

export function authorize(...roles: UserRole[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
        }
        if (!roles.includes(req.user.role)) {
            return sendError(res, 403, 'FORBIDDEN', 'Insufficient permissions for this action');
        }
        return next();
    };
}
