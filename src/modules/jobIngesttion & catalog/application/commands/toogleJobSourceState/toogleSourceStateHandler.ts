import { DomainExceptions } from '@src/modules/jobIngesttion & catalog/domain/exceptions/domainExceptions.js';
import { JobSourceRepositoryPort } from '../../../domain/repositories/jobSourceRepoPort.js';
import { ToggleJobSourceStateCommand } from './toogleJobSourceStateCommand.js';

export class ToogleSourceState {
        constructor(private readonly jobSourceRepository: JobSourceRepositoryPort) {}

        async execute(dto: ToggleJobSourceStateCommand): Promise<void> {
                const jobSource = await this.jobSourceRepository.findById(dto.sourceId);

                if (!jobSource) {
                        throw new DomainExceptions.JobSourceNotFoundException();
                }

                if (dto.isEnabled) {
                        jobSource.enable();
                } else {
                        jobSource.disable();
                }

                await this.jobSourceRepository.save(jobSource);

                console.log(
                        `Source ${jobSource.getProps().name} is now ${
                                dto.isEnabled ? 'enabled' : 'disabled'
                        }.`
                );
        }
}
