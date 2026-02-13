import { JobSourceRepositoryPort } from '../../domain/repositories/jobSourceRepoPort.js';
import { IngestJobSources } from '../../application/commands/ingestJobSource/injestJobSourceHandler.js';
import { JobFetcherFactory } from '../factories/jobFetcherFactory.js';

export class jobIngestionCron {
        constructor(
                private readonly jobSourceRepository: JobSourceRepositoryPort,
                private readonly ingestionUseCase: IngestJobSources,
                private readonly jobFetcherFactory: JobFetcherFactory
        ) {}

        async run() {
                const activeSources = await this.jobSourceRepository.findAllActive();

                if (!activeSources) throw new Error('No Active Job Sources At the moment');

                // get the tool from the factory based on the name
                for (const source of activeSources) {
                        try {
                                const sourceProvider = source.getProps().provider;

                                const sourceId = source.getProps().id;

                                const adapter = this.jobFetcherFactory.getFetcher(sourceProvider);

                                await this.ingestionUseCase.execute({ sourceId }, adapter);
                        } catch (error) {
                                console.error(`Failed to ingest ${source.id}:`, error);
                        }
                }
        }
}
