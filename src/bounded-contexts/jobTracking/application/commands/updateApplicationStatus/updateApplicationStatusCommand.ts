import { ApplicationStatus } from '@src/bounded-contexts/jobTracking/domain/aggregates/jobApplication.js';

export interface UpdateApplicationStatusCommand {
        applicationId: string;
        userId: string;
        status: ApplicationStatus;
}
