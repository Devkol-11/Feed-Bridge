import { JobTrackingRepository } from '@src/bounded-contexts/jobTracking/domain/repository/jobTrackingRepo.js';

export class GetApplications {
        constructor(private readonly repo: JobTrackingRepository) {}

        async execute(userId: string) {
                const applications = await this.repo.findAllByUserId(userId);

                return applications.map((app) => {
                        return {
                                id: app.getProps().id,
                                jobId: app.props.jobId,
                                status: app.props.status,
                                appliedAt: app.props.appliedAt,
                                lastUpdatedAt: app.props.lastUpdatedAt,
                                noteCount: app.props.notes.length
                        };
                });
        }
}
