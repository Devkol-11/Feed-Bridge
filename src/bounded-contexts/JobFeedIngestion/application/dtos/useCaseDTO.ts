import { SourceFeedEnumType } from '../../domain/enums/domainEnums.js';
export interface RegisterJobSourceDTO {
        name: string;
        type: SourceFeedEnumType;
        provider: string;
        baseUrl: string;
        adminId: string; // Used for authorization check
}

export interface ToggleSourceStateRequest {
        sourceId: string;
        isEnabled: boolean;
}

export interface GetJobsDTO {
        page?: number;
        pageSize?: number;
        sourceId?: string; // Optional: filter by source
}
