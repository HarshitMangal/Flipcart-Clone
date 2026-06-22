import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient = null;
let isRedisConnected = false;

export const initRedis = async () => {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
        console.log("Redis Configuration: REDIS_URL not found in environment variables. Falling back to direct MongoDB reads.");
        return;
    }

    try {
        redisClient = createClient({
            url: redisUrl
        });

        redisClient.on('error', (err) => {
            console.error('Redis Connection Error:', err.message);
            isRedisConnected = false;
        });

        redisClient.on('connect', () => {
            console.log('Redis Connection Status: Connecting...');
        });

        redisClient.on('ready', () => {
            console.log('Redis Connection Status: Connected and Ready!');
            isRedisConnected = true;
        });

        await redisClient.connect();
    } catch (error) {
        console.error('Failed to initialize Redis client:', error.message);
        redisClient = null;
        isRedisConnected = false;
    }
};

export const getCache = async (key) => {
    if (!isRedisConnected || !redisClient) return null;
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Error reading cache key [${key}]:`, error.message);
        return null;
    }
};

export const setCache = async (key, value, ttlSeconds = 3600) => {
    if (!isRedisConnected || !redisClient) return false;
    try {
        const serializedValue = JSON.stringify(value);
        await redisClient.set(key, serializedValue, {
            EX: ttlSeconds
        });
        return true;
    } catch (error) {
        console.error(`Error setting cache key [${key}]:`, error.message);
        return false;
    }
};

export const invalidateCache = async (keyPatternOrExact) => {
    if (!isRedisConnected || !redisClient) return false;
    try {
        if (keyPatternOrExact.includes('*')) {
            let cursor = 0;
            do {
                const reply = await redisClient.scan(cursor, {
                    MATCH: keyPatternOrExact,
                    COUNT: 100
                });
                cursor = reply.cursor;
                const keys = reply.keys;
                if (keys.length > 0) {
                    await redisClient.del(keys);
                }
            } while (cursor !== 0);
        } else {
            await redisClient.del(keyPatternOrExact);
        }
        return true;
    } catch (error) {
        console.error(`Error invalidating cache [${keyPatternOrExact}]:`, error.message);
        return false;
    }
};

export const clearProductCache = async (id = null) => {
    try {
        await invalidateCache('products:query:*');
        if (id) {
            await invalidateCache(`product:${id}`);
        }
        console.log(`Redis Cache invalidated successfully${id ? ' for product: ' + id : ''}`);
    } catch (error) {
        console.error('Error clearing product caches:', error.message);
    }
};
