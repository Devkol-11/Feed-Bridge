import { dbClient } from '@src/config/prisma/prisma.js';
import { RecommendationResult } from 'generated/prisma/client.js';

export class RecommendationResultRepository {
        /**
         * Replaces all recommendations for a user in a single transaction.
         * Takes raw data objects instead of domain entities.
         */
        async saveBatch(userId: string, results: RecommendationResult[]): Promise<void> {
                await dbClient.$transaction([
                        // 1. Clear existing recommendations
                        dbClient.recommendationResult.deleteMany({
                                where: { userId }
                        }),

                        // 2. Insert new ranked batch directly
                        dbClient.recommendationResult.createMany({
                                data: results.map((res) => ({
                                        id: res.id,
                                        userId: res.userId,
                                        jobId: res.jobId,
                                        totalScore: res.totalScore,
                                        roleScore: res.roleScore,
                                        locationScore: res.locationScore,
                                        seniorityScore: res.seniorityScore,
                                        keywordScore: res.keywordScore,
                                        explanationText: res.explanationText,
                                        computedAt: res.computedAt ?? new Date()
                                }))
                        })
                ]);
        }

        async findByUserId(userId: string): Promise<RecommendationResult[]> {
                return await dbClient.recommendationResult.findMany({
                        where: { userId },
                        orderBy: { totalScore: 'desc' }
                });
        }

        async findSpecificMatch(userId: string, jobId: string): Promise<RecommendationResult | null> {
                return await dbClient.recommendationResult.findUnique({
                        where: {
                                userId_jobId: { userId, jobId }
                        }
                });
        }

        /**
         * Reads directly from UserPreference table
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

                return {
                        categories: preference?.categories || [],
                        locations: preference?.locations || []
                };
        }

        async getActiveUserIds(): Promise<string[]> {
                const users = await dbClient.userPreference.findMany({
                        where: { isAlertsEnabled: true },
                        select: { userId: true }
                });
                return users.map((u) => u.userId);
        }

        /**
         * Reads directly from JobListing table
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
                        orderBy: { ingestedAt: 'desc' },
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
}
