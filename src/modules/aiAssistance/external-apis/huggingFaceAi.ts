import { InferenceClient } from '@huggingface/inference';
import { InfrastructureError } from '@src/shared/base/errorBase.js';

export class HuggingFaceAIProvider {
        private client: InferenceClient;
        // Using Qwen 2.5 or Mistral Nemo - these are high-performance free-tier models
        private readonly model = 'Qwen/Qwen2.5-72B-Instruct';

        constructor(apiKey: string) {
                this.client = new InferenceClient(apiKey);
        }

        /**
         * Resilient Request Wrapper
         * Tracks limits and provides human-friendly feedback
         */
        private async request(messages: any[]): Promise<string> {
                try {
                        const response = await this.client.chatCompletion({
                                model: this.model,
                                messages: messages,
                                max_tokens: 1000,
                                temperature: 0.1 // Low temperature for consistent resume formatting
                        });

                        return response.choices[0].message.content || '';
                } catch (error: any) {
                        const status = error.response?.status;

                        if (status === 429) {
                                throw new InfrastructureError(
                                        'Hugging Face rate limit reached. The AI is cooling down; please try again in about 2 minutes.',
                                        429,
                                        true
                                );
                        }
                        if (status === 503) {
                                throw new InfrastructureError(
                                        "The AI model is currently 'cold' and waking up. Please give it 30 seconds and try again.",
                                        503,
                                        true
                                );
                        }

                        throw new InfrastructureError(
                                `AI Provider Error: ${error.message || 'Unknown error'}`,
                                500,
                                false
                        );
                }
        }

        async improveContent(content: string, sectionType: string): Promise<string> {
                return await this.request([
                        { role: 'system', content: 'You are an expert ATS resume optimizer.' },
                        {
                                role: 'user',
                                content: `Improve this ${sectionType} section for impact and clarity: ${content}`
                        }
                ]);
        }

        async tailorContent(resumeSnapshot: any, jobDescription: string): Promise<any> {
                const result = await this.request([
                        {
                                role: 'system',
                                content: 'You are a recruitment specialist. Tailor resume data to a job description. Return ONLY valid JSON.'
                        },
                        {
                                role: 'user',
                                content: `Resume: ${JSON.stringify(resumeSnapshot)}\nJob: ${jobDescription}`
                        }
                ]);

                try {
                        return JSON.parse(result);
                } catch {
                        return { error: 'Failed to parse AI response as JSON', raw: result };
                }
        }

        async analyzeJobRequirements(jobDescription: string) {
                const result = await this.request([
                        {
                                role: 'system',
                                content: "Extract job signals. Return JSON: {hardSkills:[], softSkills:[], seniorityExpectation:'', implicitTools:[]}"
                        },
                        { role: 'user', content: jobDescription }
                ]);
                return JSON.parse(result);
        }

        async calculateSkillGaps(resumeSkills: string[], jobSkills: string[]): Promise<string[]> {
                const result = await this.request([
                        {
                                role: 'user',
                                content: `Identify missing skills. User: ${resumeSkills.join(
                                        ', '
                                )}. Job: ${jobSkills.join(', ')}. Return comma-separated list.`
                        }
                ]);
                return result.split(',').map((s) => s.trim());
        }
}
