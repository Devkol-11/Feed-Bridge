import { AIResultRepository } from '../repository/aiResultRepository.js';

export class GetLastAISuggestions {
        private repo = new AIResultRepository();

        async execute(userId: string, limit: number = 10) {
                const records = await this.repo.findLatestByUserId(userId, limit);

                return records.map((record) => ({
                        id: record.id,
                        type: record.suggestionType,
                        jobId: record.jobId,
                        suggestedContent: record.suggestedContent,
                        createdAt: record.createdAt
                }));
        }
}
