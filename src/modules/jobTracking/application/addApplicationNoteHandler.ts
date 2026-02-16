import { JobTrackingRepository } from '../repository/JobTrackingRepo.js';
import { AddApplicationNoteCommand } from '../dtos/jobTrackingDtos/jobTrackingDtos.js';
import { ApplicationError } from '@src/shared/base/errorBase.js';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';

export class AddApplicationNote {
        private repo = new JobTrackingRepository();

        async execute(command: AddApplicationNoteCommand): Promise<void> {
                const application = await this.repo.findById(command.applicationId);

                if (!application) {
                        throw new ApplicationError('Application not Found', HttpStatusCode.BAD_REQUEST);
                }

                if (application.userId !== command.userId) {
                        throw new ApplicationError(
                                'Not allowed to add notes to this application',
                                HttpStatusCode.FORBIDDEN
                        );
                }

                await this.repo.addNote(command.applicationId, command.content);
        }
}
