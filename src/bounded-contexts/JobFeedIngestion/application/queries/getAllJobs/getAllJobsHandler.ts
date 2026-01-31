import { JobListingRepositoryPort } from '../../../domain/repositories/jobListingRepoPort.js';
import { GetAllJobsQuery } from './getAllJobsQuery.js';

export class GetAllJobs {
        constructor(private readonly jobListingRepository: JobListingRepositoryPort) {}

        async execute(dto: GetAllJobsQuery) {
                const page = dto.page || 1;
                const pageSize = dto.pageSize || 20;

                const jobListings = await this.jobListingRepository.findAll({
                        skip: (page - 1) * pageSize,
                        take: pageSize,
                        sourceId: dto.sourceId
                });

                return jobListings.map((listing) => listing.getProps());
        }
}
