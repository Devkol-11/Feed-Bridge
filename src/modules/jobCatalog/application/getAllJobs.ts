import { GetAllJobsQuery } from '../dtos/jobIngestion&catalogDtos/jobIngestion&CatalogDtos.js';
import { JobListingRepository } from '../repository/jobListingRepo.js';

export class GetAllJobs {
        private repo = new JobListingRepository();

        async execute(query: GetAllJobsQuery) {
                const pageSize = 20;
                const page = query.page || 1;

                return await this.repo.findAll({
                        skip: (page - 1) * pageSize,
                        take: pageSize,
                        category: query.category,
                        location: query.location
                });
        }
}
