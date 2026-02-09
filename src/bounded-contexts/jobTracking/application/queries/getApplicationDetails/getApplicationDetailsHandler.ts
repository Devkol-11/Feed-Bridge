import { JobTrackingRepository } from '@src/bounded-contexts/jobTracking/domain/repository/jobTrackingRepo.js';
import { JobTrackingException } from '@src/bounded-contexts/jobTracking/domain/exceptions/domainExceptions.js';

export class GetApplicationDetails {
        constructor(private readonly repo: JobTrackingRepository) {}

        async execute(applicationId: string, userId: string) {
                const application = await this.repo.findById(applicationId);

                if (!application) {
                        throw new JobTrackingException.ApplicationNotFound('Application not found');
                }

                const props = application.getProps();

                // Ownership Guard
                if (props.userId !== userId) {
                        throw new JobTrackingException.UnauthorizedAccess();
                }

                return {
                        id: application.getProps().id,
                        jobId: props.jobId,
                        status: props.status,
                        appliedAt: props.appliedAt,
                        lastUpdatedAt: props.lastUpdatedAt,
                        notes: props.notes.map((note: any) => ({
                                id: note.id,
                                content: note.props.content,
                                createdAt: note.props.createdAt
                        }))
                };
        }
}
