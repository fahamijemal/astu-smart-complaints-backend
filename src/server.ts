import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';

const app: express.Express = express();

// ─── Security middleware ───────────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
    origin: env.isProd ? [env.frontendUrl] : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// ─── General middleware ────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan(env.isDev ? 'dev' : 'combined'));

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
    return res.status(200).json({
        success: true,
        data: {
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            version: '1.0.0',
        },
    });
});

// ─── API Documentation ────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Start server ──────────────────────────────────────────────────────────────
async function bootstrap() {
    try {
        const server = app.listen(env.PORT, () => {
            console.log(`🚀 ASTU Backend running on port ${env.PORT} [${env.NODE_ENV}]`);
            console.log(`💓 Health: http://localhost:${env.PORT}/api/v1/health`);
        });

        // Graceful shutdown
        const shutdown = async (signal: string) => {
            console.log(`${signal} received — shutting down gracefully`);
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('unhandledRejection', (reason) => console.error('Unhandled rejection', { reason }));
        process.on('uncaughtException', (err) => { console.error('Uncaught exception', { error: err }); process.exit(1); });

    } catch (err) {
        console.error('Failed to start server', { error: err });
        process.exit(1);
    }
}

bootstrap();

export default app;
