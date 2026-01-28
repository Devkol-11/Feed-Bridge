import { JobSource } from '../../domain/model/aggregates/jobSource.js';

export interface RawJobData {
        externalId: string;
        title: string;
        company: string;
        url: string;
        location: string;
        publishedAt: Date;
}

export interface JobFetcherPort {
        fetchJobs(url: string): Promise<RawJobData[]>;
}
