import { Request } from 'express';

export type UserRole = 'student' | 'staff' | 'admin';
export type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'reopened';

export interface JwtPayload {
    userId: string;
    role: UserRole;
    email: string;
}

export interface AuthRequest extends Request {
    user?: JwtPayload;
}

export interface PaginationQuery {
    page?: number;
    limit?: number;
}

export interface ComplaintFilters extends PaginationQuery {
    status?: ComplaintStatus;
    category_id?: string;
    department_id?: string;
    from?: string;
    to?: string;
    sort?: 'created_at' | 'updated_at' | 'status';
    order?: 'ASC' | 'DESC';
}
