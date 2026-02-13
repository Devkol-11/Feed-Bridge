import { AIProvider } from '../../ports/aiProvider.js';

export interface PreviewTailoredResumeRequest {
        resumeSnapshot: any;
        jobDescription: string;
}

export class PreviewTailoredResume {
        constructor(private readonly aiProvider: AIProvider) {}

        async execute(query: PreviewTailoredResumeRequest) {
                const previewContent = await this.aiProvider.tailorContent(
                        query.resumeSnapshot,
                        query.jobDescription
                );

                return {
                        suggestedContent: previewContent,
                        isDraft: true,
                        generatedAt: new Date()
                };
        }
}
