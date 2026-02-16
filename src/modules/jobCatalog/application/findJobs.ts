import { FindJobsQuery } from '../dtos/jobIngestion&catalogDtos/jobIngestion&CatalogDtos.js';
import { JobListingRepository } from '../repository/jobListingRepo.js';

export class FindJobs {
        private repo = new JobListingRepository();

        async execute(query: FindJobsQuery) {
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

                return results;
        }
}
