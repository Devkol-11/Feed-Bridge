import { JobSourceRepositoryPort } from '../../../domain/repositories/jobSourceRepoPort.js';
import { RegisterJobSourceCommand } from './registerJobSourceCommand.js';
import { JobSource } from '../../../domain/model/aggregates/jobSource.js';
import { DomainExceptions } from '@src/modules/jobIngesttion & catalog/domain/exceptions/domainExceptions.js';

export class RegisterJobSources {
        constructor(private readonly jobSourceRepository: JobSourceRepositoryPort) {}

        async execute(dto: RegisterJobSourceCommand): Promise<{ id: string }> {
                if (!dto.adminId) {
                        throw new DomainExceptions.JobSourceNotFoundException();
                }

                const existingSource = await this.jobSourceRepository.findByUrl(dto.baseUrl);

                if (existingSource) {
                        throw new DomainExceptions.DuplicateJobSourceException();
                }

                const jobsource = JobSource.create({
                        name: dto.name,
                        type: dto.type,
                        provider: dto.provider,
                        baseUrl: dto.baseUrl,
                        lastIngestedAt: null
                });

                await this.jobSourceRepository.save(jobsource);

                return {
                        id: jobsource.getProps().id
                };
        }
}
