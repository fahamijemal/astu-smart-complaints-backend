import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const devFormat = combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    printf(({ level, message, timestamp, stack, ...meta }) => {
        const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
        return `[${timestamp}] ${level}: ${stack ?? message}${metaStr}`;
    }),
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

export const logger = winston.createLogger({
    level: env.isDev ? 'debug' : 'info',
    format: env.isDev ? devFormat : prodFormat,
    transports: [
        new winston.transports.Console(),
        ...(env.isProd
            ? [
                new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
                new winston.transports.File({ filename: 'logs/combined.log' }),
            ]
            : []),
    ],
});
