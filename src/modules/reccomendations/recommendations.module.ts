import { GenerateRecommendations } from './application/generateRecommendationsHandler.js';
import { GetRecommendationReason } from './application/getRecommendationReasonHandler.js';
import { GetUserRecommendations } from './application/getUserRecommendationsHandler.js';

export const recommendations_usecase_http = {
        generateRecommendationResult: new GenerateRecommendations(),
        getRecommendationReason: new GetRecommendationReason(),
        getUserRecommendations: new GetUserRecommendations()
};
