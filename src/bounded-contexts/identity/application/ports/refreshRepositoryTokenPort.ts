import { RefreshToken } from '../../domain/model/aggregates/refreshToken.js';
import type { Prisma } from 'generated/prisma/client.js';

export interface RefreshTokenRepositoryPort {
        findByValue(value: string): Promise<RefreshToken | null>;
        save(token: RefreshToken, trx?: Prisma.TransactionClient): Promise<void>;
}
