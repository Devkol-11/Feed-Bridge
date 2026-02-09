import { JobApplication } from '@src/bounded-contexts/jobTracking/domain/aggregates/jobApplication.js';
import { JobTrackingRepository } from '@src/bounded-contexts/jobTracking/domain/repository/jobTrackingRepo.js';
import { TrackApplicationCommand } from './trackApplicationCommand.js';

export class TrackApplication {
        constructor(private readonly repo: JobTrackingRepository) {}

        async execute(command: TrackApplicationCommand): Promise<string> {
                const existing = await this.repo.findByUserAndJob(command.userId, command.jobId);

                if (existing) {
                        return existing.getProps().id;
                }

                const application = JobApplication.create(command.userId, command.jobId);
                await this.repo.save(application);

                return application.getProps().id;
        }
}
