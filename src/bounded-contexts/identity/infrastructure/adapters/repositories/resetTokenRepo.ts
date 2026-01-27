import { ResetTokenRepositoryPort } from '../../ports/resetTokenRepositoryPort.js';
import { ResetToken } from '@src/bounded-contexts/identity/domain/aggregates/resetToken.js';
import { dbClient } from '@src/config/prisma/prisma.js';
import type { Prisma } from 'generated/prisma/client.js';

export class ResetTokenRepository implements ResetTokenRepositoryPort {
        async save(token: ResetToken, trx?: Prisma.TransactionClient): Promise<void> {
                const toPersistence = token.getprops();

                const client = trx ? trx : dbClient;

                await client.resetToken.upsert({
                        where: { id: toPersistence.id },
                        update: {
                                id: toPersistence.id,
                                identityUserId: toPersistence.identityUserId,
                                value: toPersistence.value,
                                expiresAt: toPersistence.expiresAt,
                                isExpired: toPersistence.isExpired,
                                isValid: toPersistence.isValid,
                                createdAt: toPersistence.createdAt,
                                updatedAt: toPersistence.updatedAt
                        },
                        create: {
                                id: toPersistence.id,
                                identityUserId: toPersistence.identityUserId,
                                value: toPersistence.value,
                                expiresAt: toPersistence.expiresAt,
                                isExpired: toPersistence.isExpired,
                                isValid: toPersistence.isValid,
                                createdAt: toPersistence.createdAt,
                                updatedAt: toPersistence.updatedAt
                        }
                });
        }

        async findActiveByUserId(userId: string): Promise<ResetToken | null> {
                const currentDate = new Date();
                const token = await dbClient.resetToken.findFirst({
                        where: {
                                identityUserId: userId,
                                isValid: true,
                                isExpired: false,
                                expiresAt: {
                                        gt: currentDate
                                }
                        },
                        orderBy: {
                                createdAt: 'desc'
                        }
                });

                if (!token) return null;
                return ResetToken.rehydrate(token);
        }

        async findByValue(tokenValue: string): Promise<ResetToken | null> {
                const token = await dbClient.resetToken.findUnique({ where: { value: tokenValue } });

                if (!token) return null;

                return ResetToken.rehydrate(token);
        }

        async delete(tokenId: string, trx?: Prisma.TransactionClient): Promise<void> {
                const client = trx ? trx : dbClient;

                await client.resetToken.delete({ where: { id: tokenId } });
        }
}
