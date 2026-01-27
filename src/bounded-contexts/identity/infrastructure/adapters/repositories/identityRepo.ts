import { Prisma } from 'generated/prisma/client.js';
import { dbClient } from '@src/config/prisma/prisma.js';
import { TransactionClient } from 'generated/prisma/internal/prismaNamespace.js';
import { IdentityUser } from '../../../domain/aggregates/identityUser.js';
import { RefreshToken } from '../../../domain/aggregates/refreshToken.js';
import { ResetToken } from '../../../domain/aggregates/resetToken.js';
import { IdentityRepositoryPort } from '../../ports/identityRepositoryPort.js';
import { DomainErrors } from '../../../domain/errors/domainErrors.js';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';
import { IdentityCachePort } from '../../ports/identityCachePort.js';

export class IdentityRepository implements IdentityRepositoryPort {
        constructor(private readonly cache: IdentityCachePort) {}

        private mapToDomain(raw: any): IdentityUser {
                const refreshTokens = raw.refreshTokens.map((t: any) =>
                        (RefreshToken as any).rehydrate(t, t.id)
                );

                const resetTokens = raw.resetTokens.map((t: any) => (ResetToken as any).rehydrate(t, t.id));

                return (IdentityUser as any).rehydrate({
                        ...raw,
                        refreshTokens,
                        resetTokens
                });
        }

        private handleError(err: any, context: string): never {
                const networkErrorCodes = ['ECONNREFUSED', 'ETIMEDOUT', 'ECONNRESET', 'ECONNTIMEOUT'];
                if (networkErrorCodes.includes(err?.code)) {
                        throw new DomainErrors.UserRegistrationError(
                                ' connection timeout , please try again later',
                                HttpStatusCode.INTERNAL_SERVER_ERROR
                        );
                }
                if (err instanceof Prisma.PrismaClientKnownRequestError) {
                        if (err.code === 'P2002') {
                                throw new DomainErrors.UserRegistrationError('Unique constraint violation.');
                        }
                }
                console.error(`[IdentityRepository.${context}]`, err);
                throw new DomainErrors.UserRegistrationError('Operation failed , please try again later.');
        }

        async create(entity: IdentityUser, trx?: TransactionClient): Promise<void> {
                const client = trx ? trx : dbClient;
                const userData = entity.getProps();

                try {
                        await client.identityUser.create({
                                data: userData
                        });
                } catch (err) {
                        this.handleError(err, 'create');
                }
        }

        async save(entity: IdentityUser, trx?: TransactionClient): Promise<IdentityUser> {
                const client = trx ? trx : dbClient;
                const userData = entity.getProps();

                try {
                        await client.identityUser.upsert({
                                where: { id: userData.id },
                                update: userData,
                                create: userData
                        });

                        await this.cache.invalidate(userData.id);

                        return entity;
                } catch (err) {
                        this.handleError(err, 'save');
                }
        }

        async findByEmail(email: string): Promise<IdentityUser | null> {
                const user = await dbClient.identityUser.findUnique({
                        where: { email },
                });

                if (!user) return null;
                return this.mapToDomain(user);
        }

        

        async findById(id: string): Promise<IdentityUser | null> {
                const cachedData = await this.cache.getUser(id);
                if (cachedData) {
                        return this.mapToDomain(cachedData);
                }
                const user = await dbClient.identityUser.findUnique({
                        where: { id },
                        include: { refreshTokens: true, resetTokens: true } // MUST INCLUDE BOTH
                });

                if (!user) return null;
                return this.mapToDomain(user);
        }

        async existsByEmail(email: string): Promise<boolean> {
                const user = await dbClient.identityUser.findUnique({ where: { email } });
                return user ? true : false;
        }
}
