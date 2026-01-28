import {
        JobFetcherPort,
        RawJobData
} from '@src/bounded-contexts/JobFeedIngestion/application/ports/jobFetcherPort.js';
import axios from 'axios';

interface RemotiveResponse {
        'job-count': number;
        jobs: Array<{
                id: number;
                url: string;
                title: string;
                company_name: string;
                location: string;
                publication_date: string; // "2026-01-26T07:45:51"
        }>;
}

export class RemotiveJsonAdapter implements JobFetcherPort {
        async fetchJobs(url: string): Promise<RawJobData[]> {
                // Type-safe fetching
                const { data } = await axios.get<RemotiveResponse>(url);

                // Map to our Domain DTO (RawJobData)
                return data.jobs.map((job) => {
                        return {
                                externalId: job.id.toString(),
                                title: job.title,
                                company: job.company_name,
                                url: job.url,
                                location: job.location || 'Remote',
                                publishedAt: new Date(job.publication_date)
                        };
                });
        }
}
