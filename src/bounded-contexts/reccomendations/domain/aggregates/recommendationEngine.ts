import { AggregateRoot } from '@src/shared/ddd/agggragateRoot.Base.js';
import { RecommendationResult } from '../entities/recommendationResult.js';
import { randomUUID } from 'node:crypto';

export interface ScoringWeights {
        role: number;
        location: number;
        keywords: number;
}

export interface RecommendationEngineProps {
        userId: string;
        searchProfile: {
                categories: string[];
                locations: string[];
        };
        candidateJobs: Array<{
                id: string;
                title: string;
                location: string;
                category: string;
        }>;
        scoringWeights: ScoringWeights;
}

export class RecommendationEngine extends AggregateRoot<RecommendationEngineProps> {
        private constructor(props: RecommendationEngineProps, id: string) {
                super(props, id);
                this.validateWeights();
        }

        public static create(props: RecommendationEngineProps): RecommendationEngine {
                const id = randomUUID();
                return new RecommendationEngine(props, id);
        }

        /**
         * Invariant: Scoring weights must be balanced.
         * We don't allow an engine to exist if the math is broken.
         */
        private validateWeights(): void {
                const total =
                        this.props.scoringWeights.role +
                        this.props.scoringWeights.location +
                        this.props.scoringWeights.keywords;

                // Using a small epsilon for floating point comparison
                if (Math.abs(total - 1.0) > 0.0001) {
                        throw new Error('Scoring weights must sum exactly to 1.0');
                }
        }

        /**
         * The Core Domain Logic
         * Transforms the candidateJobs into ranked RecommendationResults
         */
        public compute(): RecommendationResult[] {
                return this.props.candidateJobs.map((job) => {
                        // 1. SIGNAL CALCULATION (0.0 to 1.0)
                        const roleScore = this.props.searchProfile.categories.includes(job.category)
                                ? 1.0
                                : 0.0;

                        const locationScore = this.props.searchProfile.locations.includes(job.location)
                                ? 1.0
                                : 0.0;

                        // Placeholder signals for now (can be expanded with string matching logic)
                        const seniorityScore = 0.0;
                        const keywordScore = 0.0;

                        // 2. WEIGHTED TOTAL (Must use the scoringWeights props)
                        // Formula: Sum of (Signal * Weight)
                        const totalScore =
                                roleScore * this.props.scoringWeights.role +
                                locationScore * this.props.scoringWeights.location +
                                seniorityScore * 0.0 + // Weights for these can be added to props later
                                keywordScore * 0.0;

                        // 3. ENTITY CREATION (Mapping to the Entity/Schema requirements)
                        return RecommendationResult.create({
                                userId: this.props.userId,
                                jobId: job.id,
                                totalScore: parseFloat(totalScore.toFixed(4)), // Ensure clean float
                                roleScore,
                                locationScore,
                                seniorityScore,
                                keywordScore,
                                explanationText: this.generateExplanation(roleScore, locationScore, job)
                        });
                });
        }

        private generateExplanation(roleMatch: number, locMatch: number, job: any): string {
                if (roleMatch > 0 && locMatch > 0) return `Perfect match for your role in ${job.location}.`;
                if (roleMatch > 0) return `Strong match for your career as a ${job.category}.`;
                return `Relevant job in ${job.location}.`;
        }
}
