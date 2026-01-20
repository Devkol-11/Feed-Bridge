import { createServer, type Server } from 'node:http';
import { initializeApplication } from './app.js';
import { loadEnv, getEnv } from './infrastructure/env/env.js';
import { dbSetup } from './infrastructure/prisma/prisma.js';
import { redisClient, redisSetup } from './infrastructure/redis/redis.js';
import { timeStamp } from 'node:console';

const application = initializeApplication();
const applicationServer: Server = createServer(application);

async function initializeServer(applicationServer: Server): Promise<void> {
        loadEnv();

        console.log('.....ENVIRONMENT VARIABLES LOADED SUCESSFULLY');
        const envConfig = getEnv();

        const PORT = envConfig.PORT;
        console.log('port : ', PORT);

        await redisSetup.connect();

        await dbSetup.connectDb();

        applicationServer.listen(PORT, () => {
                console.log(`....SERVER RUNNING ON PORT : ${PORT}`);
        });
}

process.on('SIGINT', async () => {
        await dbSetup.disConnectDb();
        await redisSetup.disConnect();
        applicationServer.close((err) => {
                console.error(err);
                process.exit(0);
        });
});

process.on('SIGTERM', () => {
        applicationServer.close((err) => {
                console.error(err);
                process.exit(0);
        });
});

process.on('uncaughtException', (err) => {
        console.error(
                JSON.stringify({
                        message: 'SYNC ERROR UNHANDLED',
                        errorMessage: err.message,
                        location: err.stack,
                        timeStamp: new Date()
                })
        );

        process.exit(1);
});

process.on('unhandledRejection', (reason, Promise) => {
        const errMessage = reason instanceof Error ? reason.message : reason;
        console.error(
                JSON.stringify({
                        message: 'ASYNC ERROR UNHANDLED',
                        errorMessage: errMessage,
                        promiseState: 'REJECTED',
                        timeStamp: new Date()
                })
        );
});

redisClient.on('error', (err) => {
        console.error(
                JSON.stringify({
                        timeStamp: new Date(),
                        service: 'REDIS',
                        message: '....CONNECTION TO REDIS DISTRUPTED',
                        errorMessage: err.message
                })
        );
});

await initializeServer(applicationServer).catch((err) => {
        console.error(err);
        process.exit(1);
});
