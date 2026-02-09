import { RecommendationResult } from '../entities/recommendationResult.js';

export interface RecommendationResultRepositoryPort {
        saveBatch(userId: string, results: RecommendationResult[]): Promise<void>;
        findByUserId(userId: string): Promise<RecommendationResult[]>;
        findSpecificMatch(userId: string, jobId: string): Promise<RecommendationResult | null>;
}
