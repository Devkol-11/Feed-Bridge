import { dbClient } from '@src/config/prisma/prisma.js';
import { AIResumeSuggestion } from '../../domain/entities/aiResumeSuggestion.js';
import { AIResultRepository } from '../../domain/repository/aiResultRepo.js';
import { AIResumeSuggestion as PrismaSuggestionModel } from 'generated/prisma/client.js';

export class PrismaAIResultRepo implements AIResultRepository {
        async save(suggestion: AIResumeSuggestion): Promise<void> {
                const props = suggestion.getProps();

                await dbClient.aIResumeSuggestion.create({
                        data: {
                                id: props.id,
                                userId: props.userId,
                                resumeId: props.resumeId,
                                jobId: props.jobId ?? null,
                                suggestionType: props.suggestionType,
                                originalContent: props.originalContent,
                                suggestedContent: props.suggestedContent,
                                createdAt: props.createdAt
                        }
                });
        }

        async findLatestByUserId(userId: string, limit: number): Promise<PrismaSuggestionModel[]> {
                return await dbClient.aIResumeSuggestion.findMany({
                        where: { userId },
                        orderBy: { createdAt: 'desc' },
                        take: limit
                });
        }

        async findById(id: string): Promise<PrismaSuggestionModel | null> {
                return await dbClient.aIResumeSuggestion.findUnique({
                        where: { id }
                });
        }
}
