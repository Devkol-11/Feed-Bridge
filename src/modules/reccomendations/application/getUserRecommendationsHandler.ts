import { RecommendationResultRepository } from '../repository/recommendationResultRepo.js';

export class GetUserRecommendations {
        private repo = new RecommendationResultRepository();

        async execute(userId: string) {
                const recommendations = await this.repo.findByUserId(userId);

                return recommendations.map((rec) => ({
                        jobId: rec.jobId,
                        score: rec.totalScore,
                        explanation: rec.explanationText,
                        matchBreakdown: {
                                role: rec.roleScore,
                                location: rec.locationScore
                        }
                }));
        }
}
