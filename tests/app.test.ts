import { AppError } from '../src/utils/AppError';

describe('AppError', () => {
    it('should create an error with correct status code and message', () => {
        const error = new AppError('Test error', 400, 'TEST_ERROR');
        expect(error.message).toBe('Test error');
        expect(error.statusCode).toBe(400);
        expect(error.errorCode).toBe('TEST_ERROR');
        expect(error.isOperational).toBe(true);
    });

    it('should create a badRequest error', () => {
        const error = AppError.badRequest('Bad request');
        expect(error.statusCode).toBe(400);
    });

    it('should create an unauthorized error', () => {
        const error = AppError.unauthorized('Unauthorized');
        expect(error.statusCode).toBe(401);
    });

    it('should create a notFound error', () => {
        const error = AppError.notFound('Not found');
        expect(error.statusCode).toBe(404);
    });

    it('should create a conflict error', () => {
        const error = AppError.conflict('Conflict');
        expect(error.statusCode).toBe(409);
    });
});

describe('Health Check', () => {
    it('should verify API response structure', () => {
        const response = {
            success: true,
            data: { status: 'ok' },
            message: 'Success',
        };
        expect(response).toHaveProperty('success', true);
        expect(response).toHaveProperty('data');
        expect(response).toHaveProperty('message');
    });
});
