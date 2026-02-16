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

export class EmailNotificationDispatcher {
        private queue: Queue = Application_Queue.create('EMAIL_NOTIFICATION');

        async dispatch(name: string, data: object) {
                try {
                        await this.queue.add(name, data, {
                                attempts: 3,
                                backoff: { type: 'exponential', delay: 1000 }
                        });
                } catch (error) {
                        console.error(`Failed to push job ${name} to queue:`, error);
                        throw error;
                }
        }
}
