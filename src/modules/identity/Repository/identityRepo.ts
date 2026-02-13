import { Prisma } from 'generated/prisma/client.js';
import { IdentityUser } from 'generated/prisma/client.js';
import { dbClient } from '@src/config/prisma/prisma.js';
import { TransactionClient } from 'generated/prisma/internal/prismaNamespace.js';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';
import { IdentityCache } from '../helpers/cache/identityCache.js';
import { ApplicationError } from '@src/shared/base/errorBase.js';

export class IdentityRepository {
        private handleError(err: any, context: string): never {
                const networkErrorCodes = ['ECONNREFUSED', 'ETIMEDOUT', 'ECONNRESET', 'ECONNTIMEOUT'];
                if (networkErrorCodes.includes(err?.code)) {
                        throw new ApplicationError(
                                ' connection timeout , please try again later',
                                HttpStatusCode.INTERNAL_SERVER_ERROR
                        );
                }
                if (err instanceof Prisma.PrismaClientKnownRequestError) {
                        if (err.code === 'P2002') {
                                throw new ApplicationError(
                                        'Unique constraint violation.',
                                        HttpStatusCode.INTERNAL_SERVER_ERROR
                                );
                        }
                }
                console.error(`[IdentityRepository.${context}]`, err);
                throw new ApplicationError(
                        'Operation failed , please try again later.',
                        HttpStatusCode.INTERNAL_SERVER_ERROR
                );
        }

        async create(data: IdentityUser, trx?: TransactionClient): Promise<void> {
                const client = trx ? trx : dbClient;

                try {
                        await client.identityUser.create({
                                data: data
                        });
                } catch (err) {
                        this.handleError(err, 'create');
                }
        }

        async save(data: IdentityUser, trx?: TransactionClient): Promise<IdentityUser> {
                const client = trx ? trx : dbClient;

                try {
                        await client.identityUser.upsert({
                                where: { id: data.id },
                                update: data,
                                create: data
                        });

                        await IdentityCache.invalidate(data.id);

                        return data;
                } catch (err) {
                        this.handleError(err, 'save');
                }
        }

        async findByEmail(email: string): Promise<IdentityUser | null> {
                const user = await dbClient.identityUser.findUnique({
                        where: { email }
                });

                if (!user) return null;
                return user;
        }

        async findById(id: string): Promise<IdentityUser | null> {
                const cachedData = await IdentityCache.getUser(id);
                if (cachedData) {
                        return cachedData;
                }
                const user = await dbClient.identityUser.findUnique({
                        where: { id },
                        include: { refreshTokens: true, resetTokens: true }
                });

                if (!user) return null;
                return user;
        }

        async existsByEmail(email: string): Promise<boolean> {
                const user = await dbClient.identityUser.findUnique({ where: { email } });
                return user ? true : false;
        }
}
