import bcrypt from 'bcryptjs';
import { db } from '../../config/database';
import { EmailService } from '../../services/email.service';
import { AppError } from '../../utils/AppError';
import { UserRole } from '../../types';

export const AdminService = {
    async listUsers(page = 1, limit = 20, search?: string) {
        const offset = (page - 1) * limit;
        const params: unknown[] = [`%${search ?? ''}%`];

        const countResult = await db.query<{ count: string }>(
            `SELECT COUNT(*) FROM users WHERE (full_name ILIKE $1 OR email ILIKE $1)`,
            params,
        );

        params.push(limit, offset);
        const result = await db.query(`
      SELECT u.id, u.full_name, u.university_id, u.email, u.role, u.is_active,
             u.last_login, u.created_at, d.name as department_name
      FROM users u LEFT JOIN departments d ON d.id = u.department_id
      WHERE (u.full_name ILIKE $1 OR u.email ILIKE $1)
      ORDER BY u.created_at DESC LIMIT $2 OFFSET $3
    `, params);

        const total = parseInt(countResult.rows[0].count, 10);
        return { data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    },

    async createStaff(data: {
        full_name: string;
        university_id: string;
        email: string;
        department_id: string;
    }) {
        const tempPassword = `ASTU@${Math.random().toString(36).slice(2, 10)}`;
        const hash = await bcrypt.hash(tempPassword, 12);

        const result = await db.query(`
      INSERT INTO users (full_name, university_id, email, password_hash, role, department_id, email_verified)
      VALUES ($1, $2, $3, $4, 'staff', $5, true)
      RETURNING id, full_name, email, role, department_id
    `, [data.full_name, data.university_id, data.email, hash, data.department_id]);

        EmailService.sendWelcome(data.email, data.full_name, tempPassword).catch(() => { });
        return result.rows[0];
    },

    async updateRole(userId: string, role: UserRole) {
        const result = await db.query(
            `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role`,
            [role, userId],
        );
        if (!result.rows[0]) throw AppError.notFound('User not found');
        return result.rows[0];
    },

    async deactivateUser(userId: string) {
        const result = await db.query(
            `UPDATE users SET is_active = false WHERE id = $1 RETURNING id`,
            [userId],
        );
        if (!result.rows[0]) throw AppError.notFound('User not found');
    },

    async activateUser(userId: string) {
        const result = await db.query(
            `UPDATE users SET is_active = true WHERE id = $1 RETURNING id`,
            [userId],
        );
        if (!result.rows[0]) throw AppError.notFound('User not found');
    },

    async listCategories() {
        const result = await db.query(`
      SELECT c.*, d.name as department_name
      FROM categories c LEFT JOIN departments d ON d.id = c.department_id
      WHERE c.is_active = true ORDER BY c.name
    `);
        return result.rows;
    },

    async createCategory(name: string, description: string, department_id: string) {
        const result = await db.query(`
      INSERT INTO categories (name, description, department_id)
      VALUES ($1, $2, $3) RETURNING *
    `, [name, description, department_id]);
        return result.rows[0];
    },

    async updateCategory(id: string, data: Partial<{ name: string; description: string; is_active: boolean }>) {
        const ALLOWED_KEYS = new Set(['name', 'description', 'is_active']);
        const safeEntries = Object.entries(data).filter(([k]) => ALLOWED_KEYS.has(k));
        if (safeEntries.length === 0) throw AppError.badRequest('No valid fields to update');

        const sets = safeEntries.map(([k], i) => `${k} = $${i + 2}`).join(', ');
        const result = await db.query(
            `UPDATE categories SET ${sets}, updated_at = NOW() WHERE id = $1 RETURNING *`,
            [id, ...safeEntries.map(([, v]) => v)],
        );
        if (!result.rows[0]) throw AppError.notFound('Category not found');
        return result.rows[0];
    },

    async listDepartments() {
        const result = await db.query(`SELECT * FROM departments ORDER BY name`);
        return result.rows;
    },
};
