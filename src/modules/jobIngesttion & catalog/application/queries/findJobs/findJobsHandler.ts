import { FindJobsQuery } from './findJobsQuery.js';
import { FindJobsRepoPort, FindJobsReadModel } from './findJobsRepoPort.js';

export class FindJobs {
        constructor(private readonly repo: FindJobsRepoPort) {}

        async execute(query: FindJobsQuery): Promise<FindJobsReadModel[]> {
                const categoryFilter = query.category;
                const locationFilter = query.location;
                const salaryFilter = query.salary;

                const limitPerPage = 20;

                // Ensure the page is at least 1 (preventing negative skips)
                const requestedPage = query.page && query.page > 0 ? query.page : 1;

                const itemsToSkip = (requestedPage - 1) * limitPerPage;

                const results = await this.repo.find({
                        category: categoryFilter,
                        location: locationFilter,
                        salary: salaryFilter,
                        skip: itemsToSkip,
                        take: limitPerPage
                });

                // --- 5. RETURN ---
                return results;
        }
}
