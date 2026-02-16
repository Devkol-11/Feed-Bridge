import { RecommendationResultRepository } from '../repository/recommendationResultRepo.js';
import { ApplicationError } from '@src/shared/base/errorBase.js';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';

export class GetRecommendationReason {
        private repo = new RecommendationResultRepository();

        async execute(userId: string, jobId: string) {
                const result = await this.repo.findSpecificMatch(userId, jobId);

                if (!result) {
                        throw new ApplicationError(
                                'No recommendation found for this job.',
                                HttpStatusCode.NOT_FOUND
                        );
                }

                return {
                        explanationText: result.explanationText,
                        totalScore: result.totalScore,
                        roleScore: result.roleScore,
                        locationScore: result.locationScore
                };
        }
}
