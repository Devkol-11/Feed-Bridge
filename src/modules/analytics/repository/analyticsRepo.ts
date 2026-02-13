// @src/bounded-contexts/analytics/repository/AnalyticsRepo.ts
import { dbClient } from '@src/config/prisma/prisma.js';

export class AnalyticsRepo {
        static async getApplicationConversionRates(userId: string) {
                const stats = await dbClient.jobApplication.groupBy({
                        by: ['status'],
                        where: { userId },
                        _count: { _all: true }
                });

                // Mapping raw DB counts to a readable object
                const counts = stats.reduce((acc, curr) => {
                        acc[curr.status] = curr._count._all;
                        return acc;
                }, {} as Record<string, number>);

                const total = Object.values(counts).reduce((a, b) => a + b, 0);

                return {
                        totalApplications: total,
                        interviewRate: total > 0 ? (counts['INTERVIEW'] || 0) / total : 0,
                        offerRate: total > 0 ? (counts['OFFER'] || 0) / total : 0,
                        counts
                };
        }

        static async getAIUsageSummary(userId: string) {
                return await dbClient.aIUsageMetric.groupBy({
                        by: ['featureName'],
                        where: { userId },
                        _count: { _all: true }
                });
        }

        static async getRecentActivity(userId: string) {
                return await dbClient.userActivityMetric.findMany({
                        where: { userId },
                        orderBy: { createdAt: 'desc' },
                        take: 10
                });
        }

        static async recordActivity(userId: string, action: string) {
                await dbClient.userActivityMetric.create({
                        data: { id: crypto.randomUUID(), userId, action }
                });
        }
}
