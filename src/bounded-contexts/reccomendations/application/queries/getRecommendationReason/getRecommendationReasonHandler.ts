import { RecommendationResultRepositoryPort } from '@src/bounded-contexts/reccomendations/domain/repository/recommendationResultRepo.js';
export class GetRecommendationReason {
        constructor(private readonly repo: RecommendationResultRepositoryPort) {}

        async execute(userId: string, jobId: string) {
                const result = await this.repo.findSpecificMatch(userId, jobId);

                if (!result) {
                        throw new Error('No recommendation found for this job.');
                }

                const props = result.getProps();

                return {
                        explanationText: props.explanationText,
                        totalScore: props.totalScore,
                        roleScore: props.roleScore,
                        locationScore: props.locationScore
                };
        }
}
