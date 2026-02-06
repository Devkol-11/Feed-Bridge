import { dbClient } from '@src/config/prisma/prisma.js';
import { GetUserPreferenceRepoPort } from '@src/bounded-contexts/userPreferences/application/queries/getUserPreferences/getUserPreferenceRepoPort.js';
import { UserPreferenceReadModel } from '@src/bounded-contexts/userPreferences/application/queries/getUserPreferences/getUserPreferenceRepoPort.js';

export class PrismaGetUserPreferenceRepo implements GetUserPreferenceRepoPort {
        async fetchByUserId(userId: string): Promise<UserPreferenceReadModel | null> {
                const record = await dbClient.userPreference.findUnique({
                        where: { userId },
                        select: {
                                userId: true,
                                categories: true,
                                locations: true,
                                minimumSalary: true,
                                isAlertsEnabled: true
                        }
                });

                if (!record) return null;

                return {
                        userId: record.userId,
                        categories: record.categories,
                        locations: record.locations,
                        minimumSalary: record.minimumSalary,
                        isAlertsEnabled: record.isAlertsEnabled
                };
        }
}
