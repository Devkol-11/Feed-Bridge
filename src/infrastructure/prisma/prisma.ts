import { PrismaClient } from '../../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { getEnv } from '../env/env.js';

const envConfig = getEnv();
export class PrismaSingleton {
        private static instance: PrismaSingleton;
        private readonly adapter: PrismaPg;
        private readonly client: PrismaClient;
        private isConnected: boolean = false;

        private constructor() {
                this.adapter = new PrismaPg({ connectionString: envConfig.DATABASE_URL });
                this.client = new PrismaClient({ adapter: this.adapter });
        }

        static getInstance(): PrismaSingleton {
                if (!PrismaSingleton.instance) {
                        PrismaSingleton.instance = new PrismaSingleton();
                        return PrismaSingleton.instance;
                }
                return PrismaSingleton.instance;
        }

        public getClient(): PrismaClient {
                return this.client;
        }

        public async connectDb(): Promise<void> {
                if (this.isConnected) return;
                const client = this.getClient();
                console.log('....ATTEMPTING TO CONNECT TO THE DATABASE');
                await client.$connect();
                console.log('....DATABASE CONNECTED SUCCESSFULLY');
                this.isConnected = true;
        }

        public async disConnectDb(): Promise<void> {
                if (!this.isConnected) return;
                const client = this.getClient();
                console.log('....ATTEMPTING TO DISCONNECT FROM THE DATABASE');
                await client.$disconnect();
                console.log('....DATABASE DISCONNECTED SUCCESSFULLY');
                this.isConnected = false;
        }

        public getConnectionStatus(): boolean {
                if (this.isConnected == true) return true;
                else {
                        return false;
                }
        }
}

export const dbSetup = PrismaSingleton.getInstance();
export const dbClient = dbSetup.getClient();
