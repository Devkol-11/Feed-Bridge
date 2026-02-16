import { RecommendationResultRepository } from '../repository/recommendationResultRepo.js';
import { randomUUID } from 'node:crypto';
import { RecommendationResult } from 'generated/prisma/client.js';

/**
 * Functional Cron Task: Recomputes the recommendation feed for all active users.
 */
export async function recomputeAllRecommendations(): Promise<{ processedUsers: number }> {
        const repo = new RecommendationResultRepository();

        // 1. Optimization: Fetch the candidate jobs ONCE for the whole batch
        const candidateJobs = await repo.getCandidateJobs(100);
        if (candidateJobs.length === 0) {
                console.log('[Cron:Recompute] No candidate jobs found. Skipping.');
                return { processedUsers: 0 };
        }

        // 2. Fetch all target user IDs
        const userIds = await repo.getActiveUserIds();
        const weights = { role: 0.5, location: 0.5, keywords: 0.0 };

        console.log(`[Cron:Recompute] Starting batch for ${userIds.length} users...`);

        for (const userId of userIds) {
                try {
                        const profile = await repo.getSearchProfile(userId);

                        // 3. Apply Engine Logic (Inlined from the old aggregate)
                        const results: RecommendationResult[] = candidateJobs.map((job) => {
                                const roleScore = profile.categories.includes(job.category) ? 1.0 : 0.0;
                                const locationScore = profile.locations.includes(job.location) ? 1.0 : 0.0;

                                const totalScore =
                                        roleScore * weights.role + locationScore * weights.location;

                                let explanation = `Relevant job in ${job.location}.`;
                                if (roleScore > 0 && locationScore > 0) {
                                        explanation = `Perfect match for your role in ${job.location}.`;
                                } else if (roleScore > 0) {
                                        explanation = `Strong match for your career as a ${job.category}.`;
                                }

                                return {
                                        id: randomUUID(),
                                        userId,
                                        jobId: job.id,
                                        totalScore: parseFloat(totalScore.toFixed(4)),
                                        roleScore,
                                        locationScore,
                                        seniorityScore: 0.0,
                                        keywordScore: 0.0,
                                        explanationText: explanation,
                                        computedAt: new Date()
                                };
                        });

                        // 4. Persistence (Direct Batch Save)
                        await repo.saveBatch(userId, results);
                } catch (error) {
                        console.error(`[Cron:Recompute] Failed for user ${userId}:`, error);
                }
        }

        console.log(`[Cron:Recompute] Finished processing ${userIds.length} users.`);
        return { processedUsers: userIds.length };
}
