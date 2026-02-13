import { dbClient } from '@src/config/prisma/prisma.js';

export class NotificationRepo {
        static async findAlertsEnabledUser(userId: string) {
                const user = await dbClient.identityUser.findUnique({
                        where: { id: userId },
                        select: {
                                id: true,
                                email: true,
                                firstName: true,
                                userPreference: {
                                        select: {
                                                isAlertsEnabled: true
                                        }
                                }
                        }
                });

                // 1. Check if user exists
                if (!user) return null;

                // 2. Check if they actually want alerts
                if (!user.userPreference?.isAlertsEnabled) return null;

                return user;
        }
}
