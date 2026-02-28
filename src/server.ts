import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { db } from './config/database';
import { swaggerSpec } from './config/swagger';
import { logger } from './utils/logger';
import { generalRateLimit } from './middleware/rateLimit.middleware';
import { errorHandler, notFound } from './middleware/error.middleware';
// Routes
import authRoutes from './modules/auth/auth.routes';
import complaintRoutes from './modules/complaints/complaint.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import chatbotRoutes from './modules/chatbot/chatbot.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import adminRoutes from './modules/admin/admin.routes';
import { AdminController } from './modules/admin/admin.controller';
import { authenticate } from './middleware/auth.middleware';
import { authorize } from './middleware/rbac.middleware';

const app: express.Express = express();

// ─── Security middleware ───────────────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
        },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

app.use(cors({
    origin: env.isProd ? [env.frontendUrl] : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// ─── General middleware ────────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan(env.isDev ? 'dev' : 'combined', {
    stream: { write: (message) => logger.http(message.trim()) },
}));

// Trust proxy for accurate IP rate limiting behind nginx/load balancer
if (env.isProd) app.set('trust proxy', 1);

// ─── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api/', generalRateLimit);

// ─── Swagger docs ──────────────────────────────────────────────────────────────
app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});
app.use(
    '/api/docs',
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                imgSrc: ["'self'", 'data:'],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
            },
        },
    }),
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec),
);

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/api/v1/health', async (_req, res) => {
    const dbOk = await db.healthCheck();
    const status = dbOk ? 200 : 503;
    return res.status(status).json({
        success: dbOk,
        data: {
            status: dbOk ? 'healthy' : 'degraded',
            db: dbOk ? 'connected' : 'disconnected',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            version: '1.0.0',
        },
    });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/chatbot', chatbotRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/admin', adminRoutes);

// Category & department routes (accessible to all authenticated, admin manages)
app.get('/api/v1/categories', authenticate, AdminController.listCategories);
app.post('/api/v1/categories', authenticate, authorize('admin'), AdminController.createCategory);
app.patch('/api/v1/categories/:id', authenticate, authorize('admin'), AdminController.updateCategory);
app.get('/api/v1/departments', authenticate, authorize('admin'), AdminController.listDepartments);

// ─── 404 & Error handlers ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start server ──────────────────────────────────────────────────────────────
async function bootstrap() {
    try {
        const dbOk = await db.healthCheck();
        if (!dbOk) {
            logger.error('Database connection failed. Exiting.');
            process.exit(1);
        }
        logger.info('Database connected ✓');

        const server = app.listen(env.PORT, () => {
            logger.info(`🚀 ASTU Backend running on port ${env.PORT} [${env.NODE_ENV}]`);
            logger.info(`📖 API Docs: http://localhost:${env.PORT}/api/docs`);
            logger.info(`💓 Health: http://localhost:${env.PORT}/api/v1/health`);
        });

        // Graceful shutdown
        const shutdown = async (signal: string) => {
            logger.info(`${signal} received — shutting down gracefully`);
            server.close(async () => {
                await db.end();
                logger.info('Server closed');
                process.exit(0);
            });
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('unhandledRejection', (reason) => logger.error('Unhandled rejection', { reason }));
        process.on('uncaughtException', (err) => { logger.error('Uncaught exception', { error: err }); process.exit(1); });

    } catch (err) {
        logger.error('Failed to start server', { error: err });
        process.exit(1);
    }
}

bootstrap();

export default app;
