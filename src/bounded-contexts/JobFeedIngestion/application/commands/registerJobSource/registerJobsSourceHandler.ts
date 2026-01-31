import { JobSourceRepositoryPort } from '../../../domain/repositories/jobSourceRepoPort.js';
import { RegisterJobSourceCommand } from './registerJobSourceCommand.js';
import { JobSource } from '../../../domain/model/aggregates/jobSource.js';

export class RegisterJobSources {
        constructor(private readonly jobSourceRepository: JobSourceRepositoryPort) {}

        async execute(dto: RegisterJobSourceCommand): Promise<{ id: string }> {
                if (!dto.adminId) {
                        throw new Error('Unauthorized: Admin ID is required to register a source.');
                }

                const existingSource = await this.jobSourceRepository.findByUrl(dto.baseUrl);

                if (existingSource) {
                        throw new Error(`Job Source with URL ${dto.baseUrl} already exists.`);
                }

                const jobsource = JobSource.create({
                        name: dto.name,
                        type: dto.type,
                        provider: dto.provider,
                        baseUrl: dto.baseUrl,
                        lastIngestedAt: null
                });

                await this.jobSourceRepository.save(jobsource);

                jobsource.getProps();

                return {
                        id: jobsource.getProps().id
                };
        }
}
