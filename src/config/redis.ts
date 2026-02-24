import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;

export function getRedis(): Redis | null {
    if (!redisClient) {
        try {
            redisClient = new Redis(env.redis.url, {
                maxRetriesPerRequest: 3,
                lazyConnect: true,
            });
            redisClient.on('error', (err) => {
                logger.warn('Redis error — falling back to in-memory rate limiting', { error: err.message });
                redisClient = null;
            });
        } catch {
            logger.warn('Redis unavailable — using in-memory stores');
        }
    }
    return redisClient;
}
