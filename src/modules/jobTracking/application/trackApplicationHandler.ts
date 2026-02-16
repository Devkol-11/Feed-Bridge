import { JobTrackingRepository } from '../repository/JobTrackingRepo.js';
import { TrackApplicationCommand } from '../dtos/jobTrackingDtos/jobTrackingDtos.js';
import { randomUUID } from 'node:crypto';
import { APPLICATION_STATUS } from 'generated/prisma/client.js';

export class TrackApplication {
        // Direct instantiation of the concrete repo
        private repo = new JobTrackingRepository();

        async execute(command: TrackApplicationCommand): Promise<string> {
                // 1. Check if the user is already tracking this job
                const existing = await this.repo.findByUserAndJob(command.userId, command.jobId);

                if (existing) {
                        return existing.id; // Direct property access
                }

                // 2. Create the new application object (Plain data)
                const applicationId = randomUUID();

                // 3. Save directly via the Repo
                await this.repo.saveApplication({
                        id: applicationId,
                        userId: command.userId,
                        jobId: command.jobId,
                        status: APPLICATION_STATUS.SAVED, // Default status
                        appliedAt: null,
                        lastUpdatedAt: new Date()
                });

                return applicationId;
        }
}
