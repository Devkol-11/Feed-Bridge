import { GetAllJobsQuery } from './getAllJobsQuery.js';
import { GetAllJobsRepoPort } from './getAllJobsRepo.js';

export class GetAllJobs {
        constructor(private readonly repo: GetAllJobsRepoPort) {}

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
