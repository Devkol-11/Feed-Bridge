import { Redis } from 'ioredis';
import { getEnv } from '../env/env.js';

const envConfig = getEnv();
const redisUrl = envConfig.REDIS_URL;

export class RedisSingleton {
        private static instance: RedisSingleton;
        private client: Redis;
        private isConnected: boolean = false;

        private constructor() {
                this.client = new Redis(redisUrl);
        }

        static getInstance() {
                if (RedisSingleton.instance == undefined) {
                        RedisSingleton.instance = new RedisSingleton();
                        return RedisSingleton.instance;
                }
                return RedisSingleton.instance;
        }

        public getClient(): Redis {
                return this.client;
        }

        public async connect(): Promise<void> {
                if (this.isConnected == true) return;
                const client = this.getClient();
                console.log('....ATTEMPTING CONNECTION TO REDIS');
                await client.connect();
                console.log('....REDIS CONNECTED SUCCESSFULLY');
                this.isConnected = true;
        }

        public async disConnect() {
                if (this.isConnected == false) return;
                const client = this.getClient();
                console.log('....DISCONNECTING FROM REDIS');
                client.disconnect();
                console.log('....REDIS DISCONNECTED SUCCESSFULLY');
                this.isConnected = false;
        }

        public getConnectionStatus(): boolean {
                if (this.isConnected == true) return true;
                else {
                        return false;
                }
        }
}

export const redisSetup = RedisSingleton.getInstance();
export const redisClient = redisSetup.getClient();
