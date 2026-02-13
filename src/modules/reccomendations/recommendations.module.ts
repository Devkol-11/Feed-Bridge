import { GenerateRecommendations } from './application/commands/generateRecommendations/generateRecommendationsHandler.js';
import { RecomputeAllRecommendations } from './application/commands/recomputeAllRecommendations/recomputeAllRecommendationsHandler.js';
import { GetRecommendationReason } from './application/queries/getRecommendationReason/getRecommendationReasonHandler.js';
import { GetUserRecommendations } from './application/queries/getUserRecommendations/getUserRecommendationsHandler.js';
import { PrismaRecommendationBridge } from './infrastructure/adapters/cross-context/recommendationBridge.js';
import { PrismaRecommendationResultRepo } from './infrastructure/adapters/persistence/writes/recommendationResultRepo.js';

const generateRecommendationResult = new GenerateRecommendations(
        new PrismaRecommendationBridge(),
        new PrismaRecommendationResultRepo()
);
const recomputeAllRecommendations = new RecomputeAllRecommendations(
        new PrismaRecommendationBridge(),
        new PrismaRecommendationResultRepo()
);
const getRecommendationReason = new GetRecommendationReason(new PrismaRecommendationResultRepo());
const getUserRecommendations = new GetUserRecommendations(new PrismaRecommendationResultRepo());

export const usecaseHttp = {
        generateRecommendationResult,
        recomputeAllRecommendations,
        getRecommendationReason,
        getUserRecommendations
};
