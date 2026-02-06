import { JobCatalogService } from '../../ports/jobCatalogService.js';
import { GetUserPreferenceRepoPort } from './getMatchingJobsRepo.js';

export class GetMatchingJobsCount {
        constructor(
                private readonly prefRepo: GetUserPreferenceRepoPort,
                private readonly jobService: JobCatalogService
        ) {}

        async execute(query: { userId: string }): Promise<number> {
                const prefs = await this.prefRepo.fetchByUserId(query.userId);
                if (!prefs) return 0;

                return await this.jobService.countJobsByCriteria({
                        categories: prefs.categories,
                        locations: prefs.locations
                });
        }
}
