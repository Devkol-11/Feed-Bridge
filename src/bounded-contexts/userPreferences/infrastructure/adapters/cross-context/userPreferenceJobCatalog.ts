// bounded-contexts/shared/infrastructure/PrismaJobCatalogBridge.ts
import { dbClient } from '@src/config/prisma/prisma.js';
import { JobCatalogService } from '@src/bounded-contexts/userPreferences/application/ports/jobCatalogService.js';

export class PrismaJobCatalogBridge implements JobCatalogService {
        // 1. Requirement: Count jobs for the UI
        async countJobsByCriteria(criteria: { categories: string[]; locations: string[] }): Promise<number> {
                return await dbClient.jobListing.count({
                        where: {
                                category: { in: criteria.categories },
                                location: { in: criteria.locations }
                        }
                });
        }

        // 2. Requirement: Find users for incoming jobs (The Inverse)
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
