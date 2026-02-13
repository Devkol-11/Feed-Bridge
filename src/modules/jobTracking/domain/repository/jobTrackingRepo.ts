import { JobApplication } from '../aggregates/jobApplication.js';

export interface JobTrackingRepository {
        // Write
        save(application: JobApplication): Promise<void>;

        // Read
        findById(id: string): Promise<JobApplication | null>;
        findByUserAndJob(userId: string, jobId: string): Promise<JobApplication | null>;
        findAllByUserId(userId: string): Promise<JobApplication[]>;
}
