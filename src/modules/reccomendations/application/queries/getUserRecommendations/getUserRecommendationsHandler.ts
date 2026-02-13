import { RecommendationResultRepositoryPort } from '@src/modules/reccomendations/domain/repository/recommendationResultRepo.js';

export class GetUserRecommendations {
        constructor(private readonly repo: RecommendationResultRepositoryPort) {}

        async execute(userId: string) {
                const recommendations = await this.repo.findByUserId(userId);

                return recommendations.map((rec) => {
                        const props = rec.getProps();
                        return {
                                jobId: props.jobId,
                                score: props.totalScore,
                                explanation: props.explanationText,
                                matchBreakdown: {
                                        role: props.roleScore,
                                        location: props.locationScore
                                }
                        };
                });
        }
}
