import { TrackApplication } from './application/trackApplicationHandler.js';
import { UpdateApplicationStatus } from './application/updateApplicationStatusHandler.js';
import { AddApplicationNote } from './application/addApplicationNoteHandler.js';
import { GetApplicationDetails } from './application/getApplicationDetailsHandler.js';
import { GetApplications } from './application/getApplicationsHandler.js';

export const jobTracking_usecase_http = {
        trackApplication: new TrackApplication(),
        updateApplicationStatus: new UpdateApplicationStatus(),
        addApplicationNote: new AddApplicationNote(),
        getApplicationDetails: new GetApplicationDetails(),
        getApplications: new GetApplications()
};
