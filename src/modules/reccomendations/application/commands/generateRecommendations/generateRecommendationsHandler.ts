import { RecommendationEngine } from '@src/modules/reccomendations/domain/aggregates/recommendationEngine.js';
import { RecommendationBridge } from '../../ports/recommendationBridge.js';
import { RecommendationResultRepositoryPort } from '@src/modules/reccomendations/domain/repository/recommendationResultRepo.js';
import { DispatchNotification } from '@src/modules/notifications/usecases/dispatchNotificationHandler.js';

export class GenerateRecommendations {
        constructor(
                private readonly bridge: RecommendationBridge,
                private readonly repo: RecommendationResultRepositoryPort,
                private readonly notifier: DispatchNotification
        ) {}

        async execute(command: { userId: string }): Promise<void> {
                //  Fetch data through the bridge
                const [profile, jobs] = await Promise.all([
                        this.bridge.getSearchProfile(command.userId),
                        this.bridge.getCandidateJobs(100)
                ]);

                //  Initialize Engine
                const engine = RecommendationEngine.create({
                        userId: command.userId,
                        searchProfile: profile,
                        candidateJobs: jobs,
                        scoringWeights: { role: 0.5, location: 0.5, keywords: 0.0 }
                });

                //  Logic Execution
                const recommendations = engine.compute();

                //  Persistence via local Repository
                await this.repo.saveBatch(command.userId, recommendations);

                // --- NEW: LINK TO NOTIFICATIONS ---

                //  Filter for "High Quality" matches to avoid spamming
                const highMatchThreshold = 0.7;
                const topMatches = recommendations
                        .filter((rec) => rec.getProps().totalScore >= highMatchThreshold)
                        .map((rec) => ({
                                jobId: rec.getProps().jobId,
                                score: rec.getProps().totalScore,
                                explanation: rec.getProps().explanationText
                        }));

                //  If we have solid matches, tell the "Hands" to send an email
                if (topMatches.length > 0) {
                        await this.notifier.execute({
                                userId: command.userId,
                                type: 'RECOMMENDATION_READY',
                                payload: {
                                        matchCount: topMatches.length,
                                        topMatch: topMatches[0], // Send the best one for the subject line
                                        viewAllLink: `${process.env.APP_URL}/recommendations`
                                }
                        });
                        console.log(
                                `[Recommendation] Triggered notification for User ${command.userId} with ${topMatches.length} matches.`
                        );
                }
        }
}
