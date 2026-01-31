import { SourceFeedEnumType } from '@src/bounded-contexts/JobFeedIngestion/domain/enums/domainEnums.js';

export type RegisterJobSourceCommand = {
        name: string;
        type: SourceFeedEnumType;
        provider: string;
        baseUrl: string;
        adminId: string; // Used for authorization check
};
