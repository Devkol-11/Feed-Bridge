import { JobTrackingRepository } from '@src/bounded-contexts/jobTracking/domain/repository/jobTrackingRepo.js';
import { UpdateApplicationStatusCommand } from './updateApplicationStatusCommand.js';
import { JobTrackingException } from '@src/bounded-contexts/jobTracking/domain/exceptions/domainExceptions.js';

export class UpdateApplicationStatus {
        constructor(private readonly repo: JobTrackingRepository) {}

        async execute(command: UpdateApplicationStatusCommand): Promise<void> {
                const application = await this.repo.findById(command.applicationId);

                if (!application) throw new JobTrackingException.ApplicationNotFound('Application not found');

                // Ownership Guard
                if ((application as any).props.userId !== command.userId) {
                        throw new JobTrackingException.UnauthorizedAccess();
                }

                // Invariant logic (state transitions) is handled inside the Aggregate
                application.updateStatus(command.status);

                await this.repo.save(application);
        }
}
