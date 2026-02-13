import { Entity } from '@src/shared/ddd/entity.Base.js';
import { randomUUID } from 'node:crypto';

export type SuggestionType = 'REWRITE' | 'TAILORING' | 'GAP_ANALYSIS';

export interface AIResumeSuggestionProps {
        userId: string;
        resumeId: string;
        jobId?: string;
        suggestionType: SuggestionType;
        originalContent: any;
        suggestedContent: any;
        createdAt: Date;
}

export class AIResumeSuggestion extends Entity<AIResumeSuggestionProps> {
        private constructor(props: AIResumeSuggestionProps, id: string) {
                super(props, id);
                this.validate();
        }

        public static create(props: Omit<AIResumeSuggestionProps, 'createdAt'>): AIResumeSuggestion {
                return new AIResumeSuggestion(
                        {
                                ...props,
                                createdAt: new Date()
                        },
                        randomUUID()
                );
        }

        public static rehydrate(props: AIResumeSuggestionProps, id: string): AIResumeSuggestion {
                return new AIResumeSuggestion(props, id);
        }

        private validate(): void {
                if (!this.props.suggestedContent) {
                        throw new Error('AI Suggestion must contain suggested content.');
                }
                // Invariant: AI output must be traceable to source input
                if (!this.props.originalContent) {
                        throw new Error(
                                'AI Suggestion must have a reference to the original source content.'
                        );
                }
        }
}
