import { Response } from 'express';

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: { code: string; message: string; details?: unknown[] };
    pagination?: { page: number; limit: number; total: number; totalPages: number };
}

export const sendSuccess = <T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200,
    pagination?: ApiResponse<T>['pagination'],
): Response => {
    const body: ApiResponse<T> = { success: true, data, message };
    if (pagination) body.pagination = pagination;
    return res.status(statusCode).json(body);
};

export const sendCreated = <T>(
    res: Response,
    data: T,
    message = 'Created successfully',
): Response => res.status(201).json({ success: true, data, message });

export const sendPaginated = <T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message = 'Success',
): Response => {
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
        success: true,
        data,
        message,
        pagination: { page, limit, total, totalPages },
    });
};

export const sendError = (
    res: Response,
    statusCode: number,
    code: string,
    message: string,
    details?: unknown[],
): Response =>
    res.status(statusCode).json({
        success: false,
        error: { code, message, ...(details?.length ? { details } : {}) },
    });
