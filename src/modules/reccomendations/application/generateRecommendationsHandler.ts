import { DispatchNotification } from '@src/modules/notifications/usecases/dispatchNotificationHandler.js';
import { RecommendationResultRepository } from '../repository/recommendationResultRepo.js';
import { randomUUID } from 'node:crypto';
import { RecommendationResult } from 'generated/prisma/client.js';

export class GenerateRecommendations {
        private repo = new RecommendationResultRepository();
        private notifier = new DispatchNotification();

        async execute(command: { userId: string }): Promise<void> {
                //  Direct Data Fetching (Replacing the Bridge/Port)
                const [profile, jobs] = await Promise.all([
                        this.repo.getSearchProfile(command.userId),
                        this.repo.getCandidateJobs(100)
                ]);

                // Weight Validation (The Engine Invariant)
                const weights = { role: 0.5, location: 0.5, keywords: 0.0 };
                const totalWeight = weights.role + weights.location + weights.keywords;
                if (Math.abs(totalWeight - 1.0) > 0.0001) {
                        throw new Error('Scoring weights must sum exactly to 1.0');
                }

                // Logic Execution (The Engine 'Compute' logic)
                const recommendations: RecommendationResult[] = jobs.map((job) => {
                        // Signal Calculation
                        const roleScore = profile.categories.includes(job.category) ? 1.0 : 0.0;
                        const locationScore = profile.locations.includes(job.location) ? 1.0 : 0.0;
                        const seniorityScore = 0.0;
                        const keywordScore = 0.0;

                        // Weighted Total
                        const totalScore = roleScore * weights.role + locationScore * weights.location;
                        const finalScore = parseFloat(totalScore.toFixed(4));

                        // Generate Explanation
                        let explanation = `Relevant job in ${job.location}.`;
                        if (roleScore > 0 && locationScore > 0) {
                                explanation = `Perfect match for your role in ${job.location}.`;
                        } else if (roleScore > 0) {
                                explanation = `Strong match for your career as a ${job.category}.`;
                        }

                        // Return plain object matching Prisma schema
                        return {
                                id: randomUUID(),
                                userId: command.userId,
                                jobId: job.id,
                                totalScore: finalScore,
                                roleScore,
                                locationScore,
                                seniorityScore,
                                keywordScore,
                                explanationText: explanation,
                                computedAt: new Date()
                        };
                });

                //  Persistence (Direct concrete repo call)
                await this.repo.saveBatch(command.userId, recommendations);

                //  Notification Logic (Direct property access)
                const highMatchThreshold = 0.7;
                const topMatches = recommendations.filter((rec) => rec.totalScore >= highMatchThreshold);

                if (topMatches.length > 0) {
                        await this.notifier.execute({
                                userId: command.userId,
                                type: 'RECOMMENDATION_READY',
                                payload: {
                                        matchCount: topMatches.length,
                                        topMatch: {
                                                jobId: topMatches[0].jobId,
                                                score: topMatches[0].totalScore,
                                                explanation: topMatches[0].explanationText
                                        },
                                        viewAllLink: `${process.env.APP_URL}/recommendations`
                                }
                        });
                        console.log(
                                `[Recommendation] Notified User ${command.userId} of ${topMatches.length} matches.`
                        );
                }
        }
}
