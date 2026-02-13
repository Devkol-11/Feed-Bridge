import { dbClient } from '@src/config/prisma/prisma.js';
import { RecommendationBridge } from '@src/modules/reccomendations/application/ports/recommendationBridge.js';
export class PrismaRecommendationBridge implements RecommendationBridge {
        /**
         * Reads from the UserPreference table (User Preference Context)
         */
        async getSearchProfile(userId: string): Promise<{
                categories: string[];
                locations: string[];
        }> {
                const preference = await dbClient.userPreference.findUnique({
                        where: { userId },
                        select: {
                                categories: true,
                                locations: true
                        }
                });

                // Fallback to empty filters if the user hasn't set preferences yet
                return {
                        categories: preference?.categories || [],
                        locations: preference?.locations || []
                };
        }

        /**
         * Reads from the JobListing table (Job Catalog Context)
         */
        async getCandidateJobs(limit: number): Promise<
                Array<{
                        id: string;
                        title: string;
                        category: string;
                        location: string;
                }>
        > {
                const jobs = await dbClient.jobListing.findMany({
                        where: { category: { not: null } },
                        take: limit,
                        orderBy: { ingestedAt: 'desc' }, // We score the most recent jobs first
                        select: {
                                id: true,
                                title: true,
                                category: true,
                                location: true
                        }
                });

                return jobs.map((job) => ({
                        id: job.id,
                        title: job.title,
                        category: job.category ?? 'uncategorized',
                        location: job.location
                }));
        }

        async getActiveUserIds(): Promise<string[]> {
                const users = await dbClient.userPreference.findMany({
                        where: { isAlertsEnabled: true },
                        select: { userId: true }
                });
                return users.map((u) => u.userId);
        }
}
