import { AIResultRepository } from '@src/modules/aiAssistance/domain/repository/aiResultRepo.js';
import { AIProvider } from '../../ports/aiProvider.js';
import { AIResumeSuggestion } from '../../../domain/entities/aiResumeSuggestion.js';
import { TailorResumeCommand } from './tailorResumeCommand.js';

export class TailorResume {
        constructor(private readonly aiProvider: AIProvider, private readonly repo: AIResultRepository) {}

        async execute(command: TailorResumeCommand): Promise<any> {
                const tailoredContent = await this.aiProvider.tailorContent(
                        command.resumeSnapshot,
                        command.jobDescription
                );

                const suggestion = AIResumeSuggestion.create({
                        userId: command.userId,
                        resumeId: command.resumeId,
                        jobId: command.jobId,
                        suggestionType: 'TAILORING',
                        originalContent: command.resumeSnapshot,
                        suggestedContent: tailoredContent
                });

                await this.repo.save(suggestion);

                return tailoredContent;
        }
}
