import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

interface AppEnvConfig {
        PORT: number;
        DATABASE_URL: string;
        REDIS_URL: string;
}

let envConfig: AppEnvConfig | undefined = undefined;

export function loadEnv() {
        const fileName = import.meta.url;
        const dirName = fileURLToPath(fileName);

        const envPath = path.resolve(dirName, '../../../', '.env');

        const result = dotenv.config({ path: envPath });

        if (result.error || !process.env.DATABASE_URL) {
                throw new Error('Failed to load environment variables');
        }

        envConfig = Object.freeze({
                PORT: process.env.PORT,
                NODE_ENV: process.env.NODE_ENV,
                DATABASE_URL: process.env.DATABASE_URL,
                REDIS_URL: process.env.REDIS_URL
        });
}

export function getEnv(): AppEnvConfig {
        if (envConfig == undefined) {
                throw new Error('Environment Variables not yet configured');
        }

        return envConfig;
}
