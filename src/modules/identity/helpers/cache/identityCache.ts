import { IdentityUser } from 'generated/prisma/client.js';
import { redisCache } from '@src/config/redis/cache/cache.js';

export class IdentityCache {
        private static readonly prefix = 'identity:user:';

        static async getUser(id: string): Promise<IdentityUser | null> {
                return redisCache.get(`${this.prefix}${id}`);
        }

        static async saveUser(user: IdentityUser) {
                await redisCache.set(`${this.prefix}${user.id}`, user, 3600);
        }

        static async invalidate(id: string) {
                await redisCache.delete(`${this.prefix}${id}`);
        }
}
