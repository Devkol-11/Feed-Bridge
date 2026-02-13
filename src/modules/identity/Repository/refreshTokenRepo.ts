import { RefreshToken } from 'generated/prisma/client.js';
import { dbClient } from '@src/config/prisma/prisma.js';
import { type Prisma } from 'generated/prisma/client.js';

export class RefreshTokenRepository {
        async findByValue(value: string): Promise<RefreshToken | null> {
                const token = await dbClient.refreshToken.findUnique({ where: { value } });
                if (!token) return null;
                return token;
        }

        async save(token: RefreshToken, trx?: Prisma.TransactionClient): Promise<void> {
                const client = trx ? trx : dbClient;

                await client.refreshToken.upsert({
                        where: {
                                id: token.id
                        },
                        update: {
                                id: token.id,
                                identityUserId: token.identityUserId,
                                value: token.value,
                                isRevoked: token.isRevoked,
                                expiresAt: token.expiresAt,
                                createdAt: token.createdAt,
                                updatedAt: token.updatedAt
                        },
                        create: {
                                id: token.id,
                                identityUserId: token.identityUserId,
                                value: token.value,
                                isRevoked: token.isRevoked,
                                expiresAt: token.expiresAt,
                                createdAt: token.createdAt,
                                updatedAt: token.updatedAt
                        }
                });
        }

        async deleteAllForUser(userId: string, trx?: Prisma.TransactionClient): Promise<void> {
                const client = trx ? trx : dbClient;
                await client.refreshToken.deleteMany({ where: { identityUserId: userId } });
                return;
        }

        async delete(tokenId: string, trx?: Prisma.TransactionClient): Promise<void> {
                const client = trx ? trx : dbClient;
                await client.refreshToken.delete({ where: { id: tokenId } });
                return;
        }
}
