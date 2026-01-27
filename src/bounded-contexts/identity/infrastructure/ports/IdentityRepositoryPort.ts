import { type Prisma } from 'generated/prisma/client.js';
import { IdentityUser } from '../../domain/aggregates/identityUser.js';

export interface IdentityRepositoryPort {
        create(entity: IdentityUser, trx?: Prisma.TransactionClient): Promise<void>;
        save(entity: IdentityUser, trx?: Prisma.TransactionClient): Promise<IdentityUser>;
        findById(id: string): Promise<IdentityUser | null>;
        findByEmail(email: string): Promise<IdentityUser | null>;
        existsByEmail(email: string): Promise<boolean>;
}
