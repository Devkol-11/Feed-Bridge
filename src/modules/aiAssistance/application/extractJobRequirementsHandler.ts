import { HuggingFaceAIProvider } from '../external-apis/huggingFaceAi.js';
import { ExtractJobRequirementsCommand } from '../dto/aiAssistanceDto/aiAssistanceDto.js';

export class ExtractJobRequirements {
        private aiProvider: HuggingFaceAIProvider = new HuggingFaceAIProvider(
                process.env.HUGGING_FACE_API_KEY || ''
        );
        async execute(command: ExtractJobRequirementsCommand) {
                return await this.aiProvider.analyzeJobRequirements(command.jobDescription);
        }
}
