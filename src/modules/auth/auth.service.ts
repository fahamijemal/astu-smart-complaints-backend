import bcrypt from 'bcryptjs';
import { db } from '../../config/database';
import { TokenService } from '../../services/token.service';
import { EmailService } from '../../services/email.service';
import { AppError } from '../../utils/AppError';
import { User } from '../../types';

const BCRYPT_ROUNDS = 12;
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MINUTES = 15;

export const AuthService = {
    async register(data: {
        full_name: string;
        university_id: string;
        email: string;
        password: string;
        department_id?: string | null;
    }) {
        const existing = await db.query<User>(`SELECT id FROM users WHERE email = $1 OR university_id = $2`, [
            data.email,
            data.university_id,
        ]);
        if (existing.rows.length > 0) {
            throw AppError.conflict('Email or university ID already registered', 'DUPLICATE_USER');
        }

        const password_hash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

        const result = await db.query<User>(`
      INSERT INTO users (full_name, university_id, email, password_hash, role, department_id)
      VALUES ($1, $2, $3, $4, 'student', $5)
      RETURNING id, full_name, university_id, email, role, department_id, is_active, created_at
    `, [data.full_name, data.university_id, data.email, password_hash, data.department_id ?? null]);

        const user = result.rows[0];

        // Send welcome email async
        EmailService.sendComplaintReceived(user.email, user.full_name, 'Welcome', 'Account Created').catch(() => { });

        return user;
    },

    async login(email: string, password: string) {
        const result = await db.query<User>(`
      SELECT id, full_name, email, password_hash, role, department_id, is_active, failed_logins, locked_until
      FROM users WHERE email = $1
    `, [email]);

        // Generic error to prevent user enumeration
        const invalidMsg = 'Invalid email or password';

        if (result.rows.length === 0) {
            throw AppError.unauthorized(invalidMsg, 'INVALID_CREDENTIALS');
        }

        const user = result.rows[0];

        if (!user.is_active) {
            throw AppError.forbidden('Account has been deactivated', 'ACCOUNT_DISABLED');
        }

        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            const minutesLeft = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000);
            throw new AppError(`Account locked. Try again in ${minutesLeft} minute(s)`, 423, 'ACCOUNT_LOCKED');
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            const newFailed = user.failed_logins + 1;
            const lockUntil = newFailed >= MAX_FAILED_LOGINS
                ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
                : null;

            await db.query(
                `UPDATE users SET failed_logins = $1, locked_until = $2 WHERE id = $3`,
                [newFailed, lockUntil, user.id],
            );

            throw AppError.unauthorized(invalidMsg, 'INVALID_CREDENTIALS');
        }

        // Reset failed logins
        await db.query(`UPDATE users SET failed_logins = 0, locked_until = NULL, last_login = NOW() WHERE id = $1`, [user.id]);

        const payload = { userId: user.id, role: user.role, email: user.email };
        const accessToken = TokenService.generateAccessToken(payload);
        const refreshToken = TokenService.generateRefreshToken(payload);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                department_id: user.department_id,
            },
        };
    },

    async refreshToken(token: string) {
        const isDenylisted = await TokenService.isTokenDenylisted(token);
        if (isDenylisted) {
            throw AppError.unauthorized('Token has been revoked', 'TOKEN_REVOKED');
        }

        const payload = TokenService.verifyRefreshToken(token);

        // Rotate: denylist old token, issue new pair
        const exp = (payload as unknown as { exp?: number }).exp
            ? new Date((payload as unknown as { exp?: number }).exp! * 1000)
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await TokenService.denylistToken(token, exp);

        const newAccessToken = TokenService.generateAccessToken(payload);
        const newRefreshToken = TokenService.generateRefreshToken(payload);

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    },

    async logout(refreshToken: string) {
        try {
            const decoded = TokenService.verifyRefreshToken(refreshToken) as { exp?: number };
            const exp = decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await TokenService.denylistToken(refreshToken, exp);
        } catch {
            // Already expired or invalid — logout anyway
        }
    },

    async getProfile(userId: string) {
        const result = await db.query(`
      SELECT u.id, u.full_name, u.university_id, u.email, u.role,
             u.department_id, d.name as department_name, u.created_at, u.last_login
      FROM users u
      LEFT JOIN departments d ON d.id = u.department_id
      WHERE u.id = $1 AND u.is_active = true
    `, [userId]);

        if (!result.rows[0]) {
            throw AppError.notFound('User not found');
        }
        return result.rows[0];
    },

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const result = await db.query<User>(`SELECT password_hash FROM users WHERE id = $1`, [userId]);
        const user = result.rows[0];
        if (!user) throw AppError.notFound('User not found');

        const match = await bcrypt.compare(currentPassword, user.password_hash);
        if (!match) {
            throw AppError.badRequest('Current password is incorrect', 'WRONG_PASSWORD');
        }

        const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
        await db.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [newHash, userId]);
    },
};
