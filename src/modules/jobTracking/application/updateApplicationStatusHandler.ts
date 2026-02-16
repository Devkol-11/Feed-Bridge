import { JobTrackingRepository } from '../repository/JobTrackingRepo.js';
import { UpdateApplicationStatusCommand } from '../dtos/jobTrackingDtos/jobTrackingDtos.js';
import { ApplicationError } from '@src/shared/base/errorBase.js';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';
import { APPLICATION_STATUS } from 'generated/prisma/client.js';

export class UpdateApplicationStatus {
        private repo = new JobTrackingRepository();

        async execute(command: UpdateApplicationStatusCommand): Promise<void> {
                const application = await this.repo.findById(command.applicationId);

                if (!application) {
                        throw new ApplicationError('Application not found', HttpStatusCode.NOT_FOUND);
                }

                if (application.userId !== command.userId) {
                        throw new ApplicationError(
                                'You are not authorized to update this application',
                                HttpStatusCode.FORBIDDEN
                        );
                }

                let appliedAt = application.appliedAt;
                if (command.status === APPLICATION_STATUS.APPLIED && !appliedAt) {
                        appliedAt = new Date();
                }

                await this.repo.saveApplication({
                        ...application,
                        status: command.status,
                        appliedAt: appliedAt,
                        lastUpdatedAt: new Date()
                });
        }
}
