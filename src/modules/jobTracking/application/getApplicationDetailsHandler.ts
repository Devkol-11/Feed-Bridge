import { JobTrackingRepository } from '../repository/JobTrackingRepo.js';
import { ApplicationError } from '@src/shared/base/errorBase.js';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';

export class GetApplicationDetails {
        private repo = new JobTrackingRepository();

        async execute(applicationId: string, userId: string) {
                const application = await this.repo.findById(applicationId);

                if (!application) {
                        throw new ApplicationError('Application not found', HttpStatusCode.NOT_FOUND);
                }

                if (application.userId !== userId) {
                        throw new ApplicationError(
                                'You do not have permission to view this application',
                                HttpStatusCode.FORBIDDEN
                        );
                }

                return {
                        id: application.id,
                        jobId: application.jobId,
                        status: application.status,
                        appliedAt: application.appliedAt,
                        lastUpdatedAt: application.lastUpdatedAt,
                        notes: application.notes.map((note) => ({
                                id: note.id,
                                content: note.content,
                                createdAt: note.createdAt
                        }))
                };
        }
}
