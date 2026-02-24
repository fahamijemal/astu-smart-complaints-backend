import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../config/database';
import { env } from '../config/env';
import { JwtPayload } from '../types';

export const TokenService = {
    generateAccessToken(payload: JwtPayload): string {
        return jwt.sign(payload, env.jwt.accessSecret, {
            expiresIn: env.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
            issuer: 'astu-backend',
            audience: 'astu-client',
        });
    },

    generateRefreshToken(payload: JwtPayload): string {
        return jwt.sign(payload, env.jwt.refreshSecret, {
            expiresIn: env.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
            issuer: 'astu-backend',
            audience: 'astu-client',
        });
    },

    verifyAccessToken(token: string): JwtPayload {
        return jwt.verify(token, env.jwt.accessSecret, {
            issuer: 'astu-backend',
            audience: 'astu-client',
        }) as JwtPayload;
    },

    verifyRefreshToken(token: string): JwtPayload {
        return jwt.verify(token, env.jwt.refreshSecret, {
            issuer: 'astu-backend',
            audience: 'astu-client',
        }) as JwtPayload;
    },

    hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    },

    async denylistToken(token: string, expiresAt: Date): Promise<void> {
        const hash = this.hashToken(token);
        await db.query(
            `INSERT INTO token_denylist (token_hash, expires_at) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [hash, expiresAt],
        );
    },

    async isTokenDenylisted(token: string): Promise<boolean> {
        const hash = this.hashToken(token);
        const result = await db.query<{ id: string }>(
            `SELECT id FROM token_denylist WHERE token_hash = $1 AND expires_at > NOW()`,
            [hash],
        );
        return result.rows.length > 0;
    },

    async cleanupExpiredTokens(): Promise<void> {
        await db.query(`DELETE FROM token_denylist WHERE expires_at <= NOW()`);
    },
};
