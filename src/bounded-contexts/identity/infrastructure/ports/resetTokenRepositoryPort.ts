import { ResetToken } from '../../domain/aggregates/resetToken.js';
import type { Prisma } from 'generated/prisma/client.js';

export interface ResetTokenRepositoryPort {
        findActiveByUserId(userId: string): Promise<ResetToken | null>;
        save(token: ResetToken, trx?: Prisma.TransactionClient): Promise<void>;
        findByValue(tokenValue: string): Promise<ResetToken | null>;
}
