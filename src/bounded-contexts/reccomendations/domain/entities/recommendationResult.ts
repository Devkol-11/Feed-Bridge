import { Entity } from '@src/shared/ddd/entity.Base.js';
import { randomUUID } from 'node:crypto';

export interface RecommendationResultProps {
        userId: string;
        jobId: string;
        totalScore: number;
        roleScore: number;
        locationScore: number;
        seniorityScore: number;
        keywordScore: number;
        explanationText: string;
        computedAt: Date;
}

export class RecommendationResult extends Entity<RecommendationResultProps> {
        private constructor(props: RecommendationResultProps, id: string) {
                super(props, id);
                this.validate();
        }

        /**
         * Factory method for creating new recommendations from the Engine
         */
        public static create(props: Omit<RecommendationResultProps, 'computedAt'>): RecommendationResult {
                const id = randomUUID();
                return new RecommendationResult(
                        {
                                ...props,
                                computedAt: new Date()
                        },
                        id
                );
        }

        /**
         * Rehydration method for the Repository (loading from DB)
         */
        public static rehydrate(props: RecommendationResultProps, id: string): RecommendationResult {
                return new RecommendationResult(props, id);
        }

        /**
         * Invariants:
         * 1. Scores must be normalized between 0 and 1.
         * 2. totalScore cannot be negative.
         */
        private validate(): void {
                const { totalScore, roleScore, locationScore } = this.props;

                if (totalScore < 0 || totalScore > 1) {
                        throw new Error(`Total score ${totalScore} must be between 0 and 1`);
                }

                // Ensuring the explanation isn't empty
                if (!this.props.explanationText || this.props.explanationText.trim().length === 0) {
                        throw new Error('Recommendation must have an explanation for transparency.');
                }
        }
}
