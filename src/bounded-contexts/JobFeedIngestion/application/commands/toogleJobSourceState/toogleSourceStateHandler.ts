import { JobSourceRepositoryPort } from '../../../domain/repositories/jobSourceRepoPort.js';
import { ToggleJobSourceStateCommand } from './toogleJobSourceStateCommand.js';

export class ToogleSourceState {
        constructor(private readonly jobSourceRepository: JobSourceRepositoryPort) {}

        async execute(dto: ToggleJobSourceStateCommand): Promise<void> {
                const jobSource = await this.jobSourceRepository.findById(dto.sourceId);

                if (!jobSource) {
                        throw new Error(`Source not found: ${dto.sourceId}`);
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
