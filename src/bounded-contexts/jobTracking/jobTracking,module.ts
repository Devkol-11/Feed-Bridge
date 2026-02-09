import { TrackApplication } from './application/commands/trackApplication/trackApplicationHandler.js';
import { UpdateApplicationStatus } from './application/commands/updateApplicationStatus/updateApplicationStatusHandler.js';
import { AddApplicationNote } from './application/commands/addApplicationNote/addApplicationNoteHandler.js';
import { PrismaJobTrackingRepo } from './infrastructure/persistence/prismaJobTrackingRepo.js';
import { GetApplicationDetails } from './application/queries/getApplicationDetails/getApplicationDetailsHandler.js';
import { GetApplications } from './application/queries/getApplications/getApplicationsHandler.js';

const trackApplication = new TrackApplication(new PrismaJobTrackingRepo());
const updateApplicationStatus = new UpdateApplicationStatus(new PrismaJobTrackingRepo());
const addApplicationNote = new AddApplicationNote(new PrismaJobTrackingRepo());
const getApplicationDetails = new GetApplicationDetails(new PrismaJobTrackingRepo());
const getApplications = new GetApplications(new PrismaJobTrackingRepo());

export const usecaseHttp = {
        trackApplication,
        updateApplicationStatus,
        addApplicationNote,
        getApplicationDetails,
        getApplications
};
