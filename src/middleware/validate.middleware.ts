import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = schema.parse(req[source]);
            req[source] = parsed;
            return next();
        } catch (err) {
            if (err instanceof ZodError) {
                const details = err.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                return sendError(res, 422, 'VALIDATION_ERROR', 'Input validation failed', details);
            }
            return next(err);
        }
    };
}
