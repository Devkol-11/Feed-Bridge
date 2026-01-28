import { ResetToken } from '../../domain/model/aggregates/resetToken.js';
import type { Prisma } from 'generated/prisma/client.js';

export interface ResetTokenRepositoryPort {
        findActiveByUserId(userId: string): Promise<ResetToken | null>;
        save(token: ResetToken, trx?: Prisma.TransactionClient): Promise<void>;
        findByValue(tokenValue: string): Promise<ResetToken | null>;
        delete(tokenId: string, trx?: Prisma.TransactionClient): Promise<void>;
}
