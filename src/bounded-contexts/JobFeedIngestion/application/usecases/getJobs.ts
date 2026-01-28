import { JobListingRepositoryPort } from '../ports/jobListingRepoPort.js';
import { JobListing } from '../../domain/model/entities/jobListing.js';
import { GetJobsDTO } from '../dtos/useCaseDTO.js';

export class GetJobs {
        constructor(private readonly jobListingRepository: JobListingRepositoryPort) {}

        async execute(dto: GetJobsDTO): Promise<JobListing[]> {
                const page = dto.page || 1;
                const pageSize = dto.pageSize || 20;

                const listings = await this.jobListingRepository.findAll({
                        skip: (page - 1) * pageSize,
                        take: pageSize,
                        sourceId: dto.sourceId
                });

                return listings;
        }
}
