// src/config/RedisClient.ts
import Redis from 'ioredis';

class RedisClient {
    private static instance: Redis;

    private constructor() { }

    public static getInstance() {
        if (!RedisClient.instance) {
            RedisClient.instance = new Redis({
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379', 10),
            });

            RedisClient.instance.on('error', (err) => {
                console.error('Redis connection error:', err);
            });

            RedisClient.instance.on('connect', () => {
                console.log('Redis connected!');
            });
        }
        return RedisClient.instance;
    }
}

export default RedisClient;
