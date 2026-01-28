import { PrismaClient } from 'generated/prisma/client.js';
import { dbClient } from '@src/config/prisma/prisma.js';
import { TransactionScriptPort, TransactionWork } from '../../application/ports/transactionManagerPort.js';

export class PrismaTransactionManager implements TransactionScriptPort {
        private readonly client: PrismaClient;

        constructor() {
                this.client = dbClient;
        }

        async run<T>(work: TransactionWork<T>): Promise<T> {
                return await this.client.$transaction(
                        async (tx) => {
                                return await work(tx);
                        },
                        {
                                //  Explicit timeouts to prevent long-running
                                // transactions from locking DB tables.
                                maxWait: 5000, // default is 2000
                                timeout: 10000 // default is 5000
                        }
                );
        }
}
