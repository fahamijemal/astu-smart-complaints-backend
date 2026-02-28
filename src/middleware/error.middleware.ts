import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { sendError } from '../utils/response';
import { AppError } from '../utils/AppError';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
    logger.error('Unhandled error', {
        message: err.message,
        stack: err.stack,
        method: req.method,
        path: req.path,
        ip: req.ip,
    });

    // AppError — known operational errors with status codes
    if (err instanceof AppError) {
        return sendError(res, err.statusCode, err.code, err.message);
    }

    // Multer errors
    if (err.message?.includes('File type not allowed') || err.message?.includes('Only jpeg')) {
        return sendError(res, 400, 'FILE_TYPE_NOT_ALLOWED', err.message);
    }

    if (err.message?.includes('File too large')) {
        return sendError(res, 400, 'FILE_TOO_LARGE', 'File exceeds the 5MB size limit');
    }

    // PostgreSQL constraint errors
    if ((err as NodeJS.ErrnoException).code === '23505') {
        return sendError(res, 409, 'CONFLICT', 'A resource with that identifier already exists');
    }

    if ((err as NodeJS.ErrnoException).code === '23503') {
        return sendError(res, 400, 'FOREIGN_KEY_ERROR', 'Referenced resource does not exist');
    }

    return sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected server error occurred');
}

export function notFound(req: Request, res: Response) {
    return sendError(res, 404, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`);
}

