import { RecommendationEngine } from '@src/bounded-contexts/reccomendations/domain/aggregates/recommendationEngine.js';
import { RecommendationBridge } from '../../ports/recommendationBridge.js';
import { RecommendationResultRepositoryPort } from '@src/bounded-contexts/reccomendations/domain/repository/recommendationResultRepo.js';

export class GenerateRecommendations {
        constructor(
                private readonly bridge: RecommendationBridge,
                private readonly repo: RecommendationResultRepositoryPort
        ) {}

        async execute(command: { userId: string }): Promise<void> {
                // 1. Fetch data through the bridge
                const [profile, jobs] = await Promise.all([
                        this.bridge.getSearchProfile(command.userId),
                        this.bridge.getCandidateJobs(100)
                ]);

                // 2. Initialize Engine - Error resolved as 'jobs' now contains 'title'
                const engine = RecommendationEngine.create({
                        userId: command.userId,
                        searchProfile: profile,
                        candidateJobs: jobs,
                        scoringWeights: { role: 0.5, location: 0.5, keywords: 0.0 }
                });

                // 3. Logic Execution
                const recommendations = engine.compute();

                // 4. Persistence via local Repository
                await this.repo.saveBatch(command.userId, recommendations);
        }
}
