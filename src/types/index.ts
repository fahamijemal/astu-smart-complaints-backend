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

export interface User {
    id: string;
    full_name: string;
    university_id: string;
    email: string;
    password_hash: string;
    role: UserRole;
    department_id: string | null;
    is_active: boolean;
    failed_logins: number;
    locked_until: Date | null;
    last_login: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface Department {
    id: string;
    name: string;
    description: string | null;
    head_email: string | null;
    created_at: Date;
}

export interface Category {
    id: string;
    name: string;
    description: string | null;
    department_id: string;
    is_active: boolean;
    created_at: Date;
}

export interface Complaint {
    id: string;
    ticket_number: string;
    title: string;
    description: string;
    status: ComplaintStatus;
    category_id: string;
    submitted_by: string;
    assigned_to: string | null;
    department_id: string;
    location: string | null;
    resolved_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface Remark {
    id: string;
    complaint_id: string;
    author_id: string;
    content: string;
    created_at: Date;
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    reference_id: string | null;
    is_read: boolean;
    created_at: Date;
}

export interface PaginationQuery {
    page?: number;
    limit?: number;
}

export interface ComplaintFilters extends PaginationQuery {
    status?: ComplaintStatus;
    category_id?: string;
    department_id?: string;
    search?: string;
    from?: string;
    to?: string;
    sort?: 'created_at' | 'updated_at' | 'status';
    order?: 'ASC' | 'DESC';
}
