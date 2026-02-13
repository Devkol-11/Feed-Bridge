import { ApplicationStatus } from '@src/modules/jobTracking/domain/aggregates/jobApplication.js';

export interface UpdateApplicationStatusCommand {
        applicationId: string;
        userId: string;
        status: ApplicationStatus;
}
