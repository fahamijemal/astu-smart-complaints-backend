import { Pool, PoolClient, QueryResultRow } from 'pg';
import { env } from './env';
import { logger } from '../utils/logger';

const pool = new Pool({
    host: env.db.host,
    port: env.db.port,
    database: env.db.name,
    user: env.db.user,
    password: env.db.password,
    min: env.db.poolMin,
    max: env.db.poolMax,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: env.db.ssl ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
    logger.error('Unexpected DB pool error', { error: err.message });
});

export const db = {
    query: <T extends QueryResultRow = Record<string, unknown>>(text: string, params?: unknown[]) =>
        pool.query<T>(text, params),

    getClient: (): Promise<PoolClient> => pool.connect(),

    transaction: async <T>(fn: (client: PoolClient) => Promise<T>): Promise<T> => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await fn(client);
            await client.query('COMMIT');
            return result;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },

    healthCheck: async (): Promise<boolean> => {
        try {
            await pool.query('SELECT 1');
            return true;
        } catch (err: any) {
            logger.error('DB healthcheck failed with error:', { error: err.message, stack: err.stack });
            return false;
        }
    },

    end: () => pool.end(),
};
