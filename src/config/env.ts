import dotenv from 'dotenv';
import path from 'path';

// Load .env.local first (local overrides), then .env as fallback
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) throw new Error(`Missing required environment variable: ${key}`);
    return value;
}

export const env = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PORT: parseInt(process.env.PORT ?? '5000', 10),
    isProd: process.env.NODE_ENV === 'production',
    isDev: process.env.NODE_ENV === 'development',

    db: {
        host: process.env.DB_HOST ?? 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        name: process.env.DB_NAME ?? 'astu_complaints',
        user: process.env.DB_USER ?? 'postgres',
        password: process.env.DB_PASSWORD ?? '',
        poolMin: parseInt(process.env.DB_POOL_MIN ?? '5', 10),
        poolMax: parseInt(process.env.DB_POOL_MAX ?? '20', 10),
        ssl: process.env.DB_SSL === 'true' || (process.env.DB_SSL !== 'false' && process.env.NODE_ENV === 'production'),
    },

    redis: {
        url: process.env.REDIS_URL ?? 'redis://localhost:6379',
    },

    jwt: {
        accessSecret: requireEnv('JWT_ACCESS_SECRET'),
        refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    },

    upload: {
        dir: process.env.UPLOAD_DIR ?? './uploads',
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE ?? '5242880', 10),
        allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES ?? 'image/jpeg,image/png,application/pdf').split(','),
    },

    email: {
        host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT ?? '587', 10),
        user: process.env.SMTP_USER ?? '',
        pass: process.env.SMTP_PASS ?? '',
        from: process.env.EMAIL_FROM ?? 'ASTU Complaints <noreply@astu.edu.et>',
    },

    openai: {
        apiKey: process.env.OPENAI_API_KEY ?? '',
        model: process.env.AI_MODEL ?? 'gpt-4o-mini',
    },

    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
};
