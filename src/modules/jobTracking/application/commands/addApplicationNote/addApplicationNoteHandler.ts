import { JobTrackingRepository } from '@src/modules/jobTracking/domain/repository/jobTrackingRepo.js';
import { AddApplicationNoteCommand } from './addApplicationNoteCommand.js';
import { JobTrackingException } from '@src/modules/jobTracking/domain/exceptions/domainExceptions.js';

export class AddApplicationNote {
        constructor(private readonly repo: JobTrackingRepository) {}

        async execute(command: AddApplicationNoteCommand): Promise<void> {
                const application = await this.repo.findById(command.applicationId);

                if (!application)
                        throw new JobTrackingException.ApplicationNotFound('Job Application not found');

                // Ownership Guard
                if (application.props.userId !== command.userId) {
                        throw new JobTrackingException.UnauthorizedAccess();
                }

                // Add note via Aggregate Root
                application.addNote(command.content);

                await this.repo.save(application);
        }
}
