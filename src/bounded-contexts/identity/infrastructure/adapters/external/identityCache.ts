import { IdentityUser } from '../../domain/model/aggregates/identityUser.js';
import { IdentityCachePort } from '../../application/ports/identityCachePort.js';
import { ICache } from '@src/config/redis/cache/cache.js';
export class RedisIdentityCache implements IdentityCachePort {
        private readonly prefix = 'identity:user:';

        constructor(private readonly redis: ICache) {}

        async getUser(id: string): Promise<IdentityUser | null> {
                return this.redis.get(`${this.prefix}${id}`);
        }

        async saveUser(user: any) {
                await this.redis.set(`${this.prefix}${user.id}`, user, 3600);
        }

        async invalidate(id: string) {
                await this.redis.delete(`${this.prefix}${id}`);
        }
}
