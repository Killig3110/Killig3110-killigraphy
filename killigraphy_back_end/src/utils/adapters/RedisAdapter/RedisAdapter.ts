
import RedisClient from '../../../config/redis';
import { IRedisAdapter } from './IRedisAdapter';

export class RedisAdapter implements IRedisAdapter {
    private client = RedisClient.getInstance();

    async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }

    async set(key: string, value: string): Promise<'OK'> {
        return await this.client.set(key, value);
    }

    async setEx(key: string, seconds: number, value: string): Promise<'OK'> {
        return await this.client.setex(key, seconds, value);
    }

    async del(key: string): Promise<number> {
        return await this.client.del(key);
    }

    async zAdd(key: string, score: number, member: string): Promise<number> {
        return await this.client.zadd(key, score, member);
    }

    async zCard(key: string): Promise<number> {
        return await this.client.zcard(key);
    }

    async zRevRange(key: string, start: number, stop: number): Promise<string[]> {
        return await this.client.zrevrange(key, start, stop);
    }

    async expire(key: string, seconds: number): Promise<number> {
        return await this.client.expire(key, seconds);
    }
}
