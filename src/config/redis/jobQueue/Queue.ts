import { Queue } from 'bullmq';
import { redisClient } from '../client/redis.js';
import { type Redis } from 'ioredis';

export class Application_Queue {
        private static client: Redis;

        private constructor() {
                Application_Queue.client = redisClient;
        }

        public static create(queueName: string): Queue {
                return new Queue(queueName, { connection: Application_Queue.client });
        }
}
