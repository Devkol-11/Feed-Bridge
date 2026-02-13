import { dbClient } from '@src/config/prisma/prisma.js';

export function dbTransaction<T>(callback: (trx: any) => Promise<T>): Promise<T> {
        return dbClient.$transaction(async (trx) => {
                return callback(trx);
        });
}
