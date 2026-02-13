import { AIResultRepository } from '@src/modules/aiAssistance/domain/repository/aiResultRepo.js';
import { AIProvider } from '../../ports/aiProvider.js';
import { AIResumeSuggestion } from '../../../domain/entities/aiResumeSuggestion.js';
import { ImproveSectionCommand } from './iimproveSectionCommand.js';

export class ImproveSection {
        constructor(private readonly aiProvider: AIProvider, private readonly repo: AIResultRepository) {}

        async execute(command: ImproveSectionCommand): Promise<string> {
                const improvedText = await this.aiProvider.improveContent(
                        command.content,
                        command.sectionType
                );

                const suggestion = AIResumeSuggestion.create({
                        userId: command.userId,
                        resumeId: command.resumeId,
                        suggestionType: 'REWRITE',
                        originalContent: { [command.sectionType]: command.content },
                        suggestedContent: { [command.sectionType]: improvedText }
                });

                await this.repo.save(suggestion);

                return improvedText;
        }
}
