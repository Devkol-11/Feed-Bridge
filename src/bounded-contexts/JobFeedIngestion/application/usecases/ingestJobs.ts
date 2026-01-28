import { JobSource } from '../../domain/model/aggregates/jobSource.js';
import { JobSourceRepositoryPort } from '../ports/jobSourceRepoPort.js';
import { JobListingRepositoryPort } from '../ports/jobListingRepoPort.js';
import { JobFetcherPort } from '../ports/jobFetcherPort.js';

export interface IngestJobsRequest {
        sourceId: string;
}

export class IngestJobs {
        constructor(
                private readonly jobSourceRepository: JobSourceRepositoryPort,
                private readonly jobListingRepository: JobListingRepositoryPort
        ) {}

        async execute(request: IngestJobsRequest, jobFetcher: JobFetcherPort): Promise<void> {
                const jobSource = await this.jobSourceRepository.findById(request.sourceId);

                if (!jobSource) {
                        throw new Error(`Ingestion failed: JobSource with ID ${request.sourceId} not found.`);
                }

                const baseUrl = jobSource.getProps().baseUrl;

                const rawJobs = await jobFetcher.fetchJobs(baseUrl);

                let successCount = 0;
                let skipCount = 0;

                for (const raw of rawJobs) {
                        try {
                                // Idempotency Check: Don't save duplicates
                                const exists = await this.jobListingRepository.exists(
                                        jobSource.id,
                                        raw.externalId
                                );

                                if (exists) {
                                        skipCount++;
                                        continue;
                                }

                                //  Domain Logic: Ask the Aggregate to create the Entity
                                // This triggers all Value Object validations (JobTitle, JobUrl, etc.)
                                const listing = jobSource.createListing(raw);

                                // Persist the new listing
                                await this.jobListingRepository.save(listing);
                                successCount++;
                        } catch (error) {
                                //  Partial Failure Handling
                                // If one job fails validation, we log it and move to the next
                                console.error(
                                        `Skipping job [${raw.title}] due to validation error:`,
                                        error instanceof Error ? error.message : error
                                );
                                skipCount++;
                        }
                }

                jobSource.markIngested();

                await this.jobSourceRepository.save(jobSource);

                console.log(
                        `Ingestion Summary for ${
                                jobSource.getProps().name
                        }: ${successCount} saved, ${skipCount} skipped.`
                );
        }
}
