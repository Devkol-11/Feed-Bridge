import { dbClient } from '@src/config/prisma/prisma.js';
import { UserPreference } from 'generated/prisma/client.js';

export class UserPreferenceRepository {
        async save(data: UserPreference): Promise<void> {
                await dbClient.userPreference.upsert({
                        where: { userId: data.userId },
                        update: {
                                categories: data.categories,
                                locations: data.locations,
                                minimumSalary: data.minimumSalary,
                                isAlertsEnabled: data.isAlertsEnabled
                        },
                        create: {
                                id: data.id,
                                userId: data.userId,
                                categories: data.categories,
                                locations: data.locations,
                                minimumSalary: data.minimumSalary,
                                isAlertsEnabled: data.isAlertsEnabled
                        }
                });
        }

        async findByUserId(userId: string): Promise<UserPreference | null> {
                const record = await dbClient.userPreference.findUnique({
                        where: { userId }
                });

                if (!record) return null;
                return record;
        }

        async fetchPreferenceById(userId: string) {
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
                return record;
        }

        async countJobsByCriteria(criteria: { categories: string[]; locations: string[] }): Promise<number> {
                return await dbClient.jobListing.count({
                        where: {
                                category: { in: criteria.categories },
                                location: { in: criteria.locations }
                        }
                });
        }

        async findUsersMatchingJob(category: string, location: string): Promise<string[]> {
                const matchingUsers = await dbClient.userPreference.findMany({
                        where: {
                                isAlertsEnabled: true,
                                categories: { has: category },
                                locations: { has: location }
                        },
                        select: { userId: true }
                });

                return matchingUsers.map((u) => u.userId);
        }
}
