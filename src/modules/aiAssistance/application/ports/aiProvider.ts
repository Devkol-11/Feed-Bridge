// bounded-contexts/ai-assistance/application/ports/AIProvider.ts

export interface AIProvider {
        /**
         * Focus: Clarity and ATS impact.
         */
        improveContent(content: string, sectionType: string): Promise<string>;

        /**
         * Focus: Relevance and Keyword Alignment.
         */
        tailorContent(resumeSnapshot: any, jobRequirements: any): Promise<any>;

        /**
         * Focus: Signal Extraction.
         */
        analyzeJobRequirements(jobDescription: string): Promise<{
                hardSkills: string[];
                softSkills: string[];
                seniorityExpectation: string;
                implicitTools: string[];
        }>;

        /**
         * Focus: Delta Analysis.
         */
        calculateSkillGaps(resumeSkills: string[], jobSkills: string[]): Promise<string[]>;
}
