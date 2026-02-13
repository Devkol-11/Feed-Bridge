import { AIProvider } from '../../ports/aiProvider.js';
import { ExtractJobRequirementsCommand } from './extractJobRequriementsCommand.js';

export class ExtractJobRequirements {
        constructor(private readonly aiProvider: AIProvider) {}

        async execute(command: ExtractJobRequirementsCommand) {
                return await this.aiProvider.analyzeJobRequirements(command.jobDescription);
        }
}
