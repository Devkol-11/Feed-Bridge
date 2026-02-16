import { JobTrackingRepository } from '../repository/JobTrackingRepo.js';

export class GetApplications {
        private repo = new JobTrackingRepository();

        async execute(userId: string) {
                const applications = await this.repo.findAllByUserId(userId);

                return applications.map((app) => ({
                        id: app.id,
                        jobId: app.jobId,
                        status: app.status,
                        appliedAt: app.appliedAt,
                        lastUpdatedAt: app.lastUpdatedAt,
                        noteCount: app.notes.length
                }));
        }
}
