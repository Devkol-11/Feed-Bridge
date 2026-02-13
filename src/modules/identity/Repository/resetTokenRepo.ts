import { ResetToken } from 'generated/prisma/client.js';
import { dbClient } from '@src/config/prisma/prisma.js';
import type { Prisma } from 'generated/prisma/client.js';

export class ResetTokenRepository {
        async save(token: ResetToken, trx?: Prisma.TransactionClient): Promise<void> {

                const client = trx ? trx : dbClient;

                await client.resetToken.upsert({
                        where: { id: token.id },
                        update: {
                                id: token.id,
                                identityUserId: token.identityUserId,
                                value: token.value,
                                expiresAt: token.expiresAt,
                                isExpired: token.isExpired,
                                isValid: token.isValid,
                                createdAt: token.createdAt,
                                updatedAt: token.updatedAt
                        },
                        create: {
                                id: token.id,
                                identityUserId: token.identityUserId,
                                value: token.value,
                                expiresAt: token.expiresAt,
                                isExpired: token.isExpired,
                                isValid: token.isValid,
                                createdAt: token.createdAt,
                                updatedAt: token.updatedAt
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
                return token;
        }

        async findByValue(tokenValue: string): Promise<ResetToken | null> {
                const token = await dbClient.resetToken.findUnique({ where: { value: tokenValue } });

                if (!token) return null;

                return token;
        }

        async delete(tokenId: string, trx?: Prisma.TransactionClient): Promise<void> {
                const client = trx ? trx : dbClient;

                await client.resetToken.delete({ where: { id: tokenId } });
        }
}
