import { dbClient } from '@src/config/prisma/prisma.js';
import { AIResumeSuggestion } from 'generated/prisma/client.js';

export class AIResultRepository {
        async save(props: AIResumeSuggestion): Promise<void> {
                await dbClient.aIResumeSuggestion.create({
                        data: {
                                ...props,
                                originalContent: props.originalContent as any,
                                suggestedContent: props.suggestedContent as any,
                                jobId: props.jobId ?? null
                        }
                });
        }

        async findLatestByUserId(userId: string, limit: number): Promise<AIResumeSuggestion[]> {
                return await dbClient.aIResumeSuggestion.findMany({
                        where: { userId },
                        orderBy: { createdAt: 'desc' },
                        take: limit
                });
        }

        async findById(id: string): Promise<AIResumeSuggestion | null> {
                return await dbClient.aIResumeSuggestion.findUnique({
                        where: { id }
                });
        }
}
