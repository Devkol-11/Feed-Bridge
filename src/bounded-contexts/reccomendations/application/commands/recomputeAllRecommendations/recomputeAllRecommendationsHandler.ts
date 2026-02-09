import { RecommendationEngine } from '@src/bounded-contexts/reccomendations/domain/aggregates/recommendationEngine.js';
import { RecommendationResultRepositoryPort } from '@src/bounded-contexts/reccomendations/domain/repository/recommendationResultRepo.js';
import { RecommendationBridge } from '../../ports/recommendationBridge.js';

export class RecomputeAllRecommendations {
        constructor(
                private readonly bridge: RecommendationBridge,
                private readonly repo: RecommendationResultRepositoryPort
        ) {}

        async execute(): Promise<{ processedUsers: number }> {
                // Optimization: Fetch the candidate jobs ONCE for the whole batch
                const candidateJobs = await this.bridge.getCandidateJobs(100);

                if (candidateJobs.length === 0) return { processedUsers: 0 };

                //  Fetch all target users
                const userIds = await this.bridge.getActiveUserIds();

                // Process each user
                // Note: For massive scale, you'd use a worker queue here.
                // For our monolith, we iterate.
                for (const userId of userIds) {
                        try {
                                const profile = await this.bridge.getSearchProfile(userId);

                                const engine = RecommendationEngine.create({
                                        userId: userId,
                                        searchProfile: profile,
                                        candidateJobs: candidateJobs,
                                        scoringWeights: { role: 0.5, location: 0.5, keywords: 0.0 }
                                });

                                const results = engine.compute();

                                // saveBatch handles the "Delete existing / Insert new" logic
                                await this.repo.saveBatch(userId, results);
                        } catch (error) {
                                console.error(`Failed to recompute for user ${userId}:`, error);
                        }
                }

                return { processedUsers: userIds.length };
        }
}
