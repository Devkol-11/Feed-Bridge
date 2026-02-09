import { dbClient } from '@src/config/prisma/prisma.js';
import { RecommendationResult } from '@src/bounded-contexts/reccomendations/domain/entities/recommendationResult.js';
import { RecommendationResultRepositoryPort } from '@src/bounded-contexts/reccomendations/domain/repository/recommendationResultRepo.js';

export class PrismaRecommendationResultRepo implements RecommendationResultRepositoryPort {
        async saveBatch(userId: string, results: RecommendationResult[]): Promise<void> {
                // We use a transaction to ensure the user never has a "partial" or "old" feed
                await dbClient.$transaction([
                        // 1. Clear existing recommendations for this user
                        dbClient.recommendationResult.deleteMany({
                                where: { userId }
                        }),

                        // 2. Insert the new ranked batch
                        dbClient.recommendationResult.createMany({
                                data: results.map((res) => {
                                        const props = res.getProps();
                                        return {
                                                id: props.id,
                                                userId: props.userId,
                                                jobId: props.jobId,
                                                totalScore: props.totalScore,
                                                roleScore: props.roleScore,
                                                locationScore: props.locationScore,
                                                seniorityScore: props.seniorityScore,
                                                keywordScore: props.keywordScore,
                                                explanationText: props.explanationText,
                                                computedAt: props.computedAt
                                        };
                                })
                        })
                ]);
        }

        async findByUserId(userId: string): Promise<RecommendationResult[]> {
                const records = await dbClient.recommendationResult.findMany({
                        where: { userId },
                        orderBy: { totalScore: 'desc' } // Ensure feed is ranked by relevance
                });

                return records.map((record) => RecommendationResult.rehydrate(record, record.id));
        }

        async findSpecificMatch(userId: string, jobId: string): Promise<RecommendationResult | null> {
                const record = await dbClient.recommendationResult.findUnique({
                        where: {
                                userId_jobId: { userId, jobId }
                        }
                });

                if (!record) return null;

                return RecommendationResult.rehydrate(record, record.id);
        }
}
