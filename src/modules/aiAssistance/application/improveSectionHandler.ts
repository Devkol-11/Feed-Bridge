import { AIResultRepository } from '../repository/aiResultRepository.js';
import { HuggingFaceAIProvider } from '../external-apis/huggingFaceAi.js';
import type { AIResumeSuggestion } from 'generated/prisma/client.js';
import { ImproveSectionCommand } from '../dto/aiAssistanceDto/aiAssistanceDto.js';
import { randomUUID } from 'node:crypto';

export class ImproveSection {
        private aiProvider: HuggingFaceAIProvider = new HuggingFaceAIProvider(
                process.env.HUGGING_FACE_API_KEY || ''
        );
        private repo = new AIResultRepository();

        async execute(command: ImproveSectionCommand): Promise<string> {
                const improvedText = await this.aiProvider.improveContent(
                        command.content,
                        command.sectionType
                );

                const suggestion: AIResumeSuggestion = {
                        id: randomUUID(),
                        userId: command.userId,
                        resumeId: command.resumeId,
                        suggestionType: 'REWRITE',
                        originalContent: { [command.sectionType]: command.content },
                        suggestedContent: { [command.sectionType]: improvedText },
                        createdAt: new Date(),
                        jobId: null
                };
                await this.repo.save(suggestion);

                return improvedText;
        }
}
