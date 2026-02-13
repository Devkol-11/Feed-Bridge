export interface RawJobData {
        externalId: string;
        title: string;
        company: string;
        category?: string;
        salary?: string;
        url: string;
        location: string;
        publishedAt: Date;
}

export interface JobFetcherPort {
        fetchJobs(url: string): Promise<RawJobData[]>;
}
