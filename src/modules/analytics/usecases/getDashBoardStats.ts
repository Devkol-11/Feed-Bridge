import { AnalyticsRepo } from '../repository/analyticsRepo.js';

export class GetUserDashboardStats {
        async execute(userId: string) {
                const [appStats, aiStats, activity] = await Promise.all([
                        AnalyticsRepo.getApplicationConversionRates(userId),
                        AnalyticsRepo.getAIUsageSummary(userId),
                        AnalyticsRepo.getRecentActivity(userId)
                ]);

                return {
                        funnel: appStats,
                        aiEngagement: aiStats,
                        recentTimeline: activity,
                        generatedAt: new Date()
                };
        }
}
