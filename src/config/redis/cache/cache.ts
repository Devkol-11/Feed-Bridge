export interface ICache {
        get<T>(key: string): Promise<T | null>;
        set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
        delete(key: string): Promise<void>;
}

import { redisClient } from '../client/redis.js';
import { type Redis } from 'ioredis';

export class RedisCache implements ICache {
        private static instance: RedisCache | null = null;
        private readonly client: Redis;

        private constructor() {
                this.client = redisClient;
        }

        public static getInstance(): RedisCache {
                if (!RedisCache.instance) {
                        RedisCache.instance = new RedisCache();
                }
                return RedisCache.instance;
        }

        /**
         * T is a Generic. When you call get<User>('key'),
         * TypeScript will know the return is a User object.
         */
        public async get<T>(key: string): Promise<T | null> {
                try {
                        const value = await this.client.get(key);
                        if (!value) return null;

                        return JSON.parse(value) as T;
                } catch (error) {
                        console.error(`[Cache Error] Failed to get key ${key}:`, error);
                        return null; // Fail gracefully: treat cache error as a miss
                }
        }

        public async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
                try {
                        const serialized = JSON.stringify(value);
                        // 'EX' sets the expiry in seconds.
                        // This is critical for memory management.
                        await this.client.set(key, serialized, 'EX', ttlSeconds);
                } catch (error) {
                        console.error(`[Cache Error] Failed to set key ${key}:`, error);
                }
        }

        public async delete(key: string): Promise<void> {
                await this.client.del(key);
        }
}

export const redisCache = RedisCache.getInstance();
