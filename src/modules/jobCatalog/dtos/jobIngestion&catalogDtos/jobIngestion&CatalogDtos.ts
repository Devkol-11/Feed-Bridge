import { SourceFeedEnumType } from '@src/modules/jobIngesttion & catalog/domain/enums/domainEnums.js';

export type IngestJobsCommand = {
        sourceId: string;
};

export type RegisterJobSourceCommand = {
        name: string;
        type: SourceFeedEnumType;
        provider: string;
        baseUrl: string;
        adminId: string; // Used for authorization check
};

export type ToggleJobSourceStateCommand = {
        sourceId: string;
        isEnabled: boolean;
};

export type FindJobsQuery = {
        category?: string;
        location?: string;
        salary?: string;
        page?: number;
};

export interface GetAllJobsQuery {
        page?: number;
        category?: string;
        location?: string;
}
