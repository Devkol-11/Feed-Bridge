import { RefreshToken } from '@src/bounded-contexts/identity/domain/model/aggregates/refreshToken.js';
import { RefreshTokenRepositoryPort } from '../../../application/ports/refreshRepositoryTokenPort.js';
import { dbClient } from '@src/config/prisma/prisma.js';
import { type Prisma } from 'generated/prisma/client.js';

export class RefreshTokenRepository implements RefreshTokenRepositoryPort {
        async findByValue(value: string): Promise<RefreshToken | null> {
                const token = await dbClient.refreshToken.findUnique({ where: { value } });
                if (!token) return null;
                const toDomain = RefreshToken.rehydrate({ token });
                return toDomain;
        }

        async save(token: RefreshToken, trx?: Prisma.TransactionClient): Promise<void> {
                const toPersistence = token.getProps();

                const client = trx ? trx : dbClient;

                await client.refreshToken.upsert({
                        where: {
                                id: toPersistence.id
                        },
                        update: {
                                id: toPersistence.id,
                                identityUserId: toPersistence.identityUserId,
                                value: toPersistence.value,
                                isRevoked: toPersistence.isRevoked,
                                expiresAt: toPersistence.expiresAt,
                                createdAt: toPersistence.createdAt,
                                updatedAt: toPersistence.updatedAt
                        },
                        create: {
                                id: toPersistence.id,
                                identityUserId: toPersistence.identityUserId,
                                value: toPersistence.value,
                                isRevoked: toPersistence.isRevoked,
                                expiresAt: toPersistence.expiresAt,
                                createdAt: toPersistence.createdAt,
                                updatedAt: toPersistence.updatedAt
                        }
                });
        }
}
