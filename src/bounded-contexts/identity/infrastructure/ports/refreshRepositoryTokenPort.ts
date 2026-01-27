import { RefreshToken } from '../../domain/aggregates/refreshToken.js';
import type { Prisma } from 'generated/prisma/client.js';

export interface RefreshTokenRepositoryPort {
        findByValue(value: string): Promise<RefreshToken | null>;
        save(token: RefreshToken, trx?: Prisma.TransactionClient): Promise<void>;
}
