import { z } from 'zod';

export const createComplaintSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(2000),
    category_id: z.string().uuid(),
    location: z.string().max(200).optional().nullable(),
});

export const updateStatusSchema = z.object({
    status: z.enum(['in_progress', 'resolved', 'closed', 'reopened']),
    note: z.string().max(500).optional(),
});

export const addRemarkSchema = z.object({
    content: z.string().min(1).max(2000),
});

export const complaintFilterSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(['open', 'in_progress', 'resolved', 'closed', 'reopened']).optional(),
    category_id: z.string().uuid().optional(),
    department_id: z.string().uuid().optional(),
    search: z.string().max(200).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    sort: z.enum(['created_at', 'updated_at', 'status']).default('created_at'),
    order: z.enum(['ASC', 'DESC']).default('DESC'),
});
