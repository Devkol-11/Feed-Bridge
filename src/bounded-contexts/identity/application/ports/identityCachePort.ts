import { IdentityUser } from '../../domain/model/aggregates/identityUser.js';

export interface IdentityCachePort {
        getUser(id: string): Promise<IdentityUser | null>;
        saveUser(user: IdentityUser): Promise<void>;
        invalidate(id: string): Promise<void>;
}
