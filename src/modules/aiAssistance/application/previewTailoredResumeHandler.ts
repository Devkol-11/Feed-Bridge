import { HuggingFaceAIProvider } from '../external-apis/huggingFaceAi.js';

export interface PreviewTailoredResumeRequest {
        resumeSnapshot: any;
        jobDescription: string;
}

export class PreviewTailoredResume {
        private aiProvider = new HuggingFaceAIProvider(process.env.HUGGING_FACE_API_KEY || '');

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
