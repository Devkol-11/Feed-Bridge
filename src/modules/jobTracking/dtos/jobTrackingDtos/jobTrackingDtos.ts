import { $Enums } from 'generated/prisma/client.js';

export type TrackApplicationCommand = {
        userId: string;
        jobId: string;
};

export type UpdateApplicationStatusCommand = {
        applicationId: string;
        userId: string;
        status: any;
};

export type AddApplicationNoteCommand = {
        userId: string;
        applicationId: string;
        content: string;
};
