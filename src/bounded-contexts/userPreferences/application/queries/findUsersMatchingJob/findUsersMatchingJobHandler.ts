import { JobCatalogService } from '../../ports/jobCatalogService.js';
import { FindUsersMatchingJobQuery } from './findUsersMatchingJobQuery.js';

export class FindUsersMatchingJobHandler {
        constructor(private readonly jobCatalogService: JobCatalogService) {}

        async execute(query: FindUsersMatchingJobQuery): Promise<string[]> {
                if (!query.category || !query.location) return [];

                return await this.jobCatalogService.findUsersMatchingJob(query.category, query.location);
        }
}
