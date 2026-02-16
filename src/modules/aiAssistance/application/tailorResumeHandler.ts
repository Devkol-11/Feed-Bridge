import { AIResultRepository } from '../repository/aiResultRepository.js';
import { HuggingFaceAIProvider } from '../external-apis/huggingFaceAi.js';
import { AIResumeSuggestion } from 'generated/prisma/client.js';
import { TailorResumeCommand } from '../dto/aiAssistanceDto/aiAssistanceDto.js';

export class TailorResume {
        private aiProvider = new HuggingFaceAIProvider(process.env.HUGGING_FACE_API_KEY || '');
        private repo = new AIResultRepository();

        async execute(command: TailorResumeCommand): Promise<any> {
                const tailoredContent = await this.aiProvider.tailorContent(
                        command.resumeSnapshot,
                        command.jobDescription
                );

                const suggestion: AIResumeSuggestion = {
                        id: crypto.randomUUID(),
                        userId: command.userId,
                        resumeId: command.resumeId,
                        suggestionType: 'TAILOR',
                        originalContent: command.resumeSnapshot,
                        suggestedContent: tailoredContent,
                        createdAt: new Date(),
                        jobId: command.jobId
                };

                await this.repo.save(suggestion);

                return tailoredContent;
        }
}
