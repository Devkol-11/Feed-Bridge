import axios from 'axios';
import {
        JobFetcherPort,
        RawJobData
} from '@src/modules/jobIngesttion & catalog/application/ports/jobFetcherPort.js';

interface RemotiveJobItem {
        id: number;
        url: string;
        title: string;
        company_name: string;
        company_logo?: string;
        category?: string;
        job_type?: string;
        publication_date: string; // ISO format: 2020-02-15T10:23:26
        candidate_required_location: string;
        salary?: string;
        description: string; // HTML format
}

interface RemotiveResponse {
        '0-legal-notice': string;
        'job-count': number;
        jobs: RemotiveJobItem[];
}

export class RemotiveJsonAdapter implements JobFetcherPort {
        private readonly API_URL = 'https://remotive.com/api/remote-jobs';

        async fetchJobs(customUrl?: string): Promise<RawJobData[]> {
                try {
                        // We use the official URL unless a specific one (with filters) is provided
                        const targetUrl = customUrl || this.API_URL;

                        const { data } = await axios.get<RemotiveResponse>(targetUrl, {
                                headers: {
                                        'User-Agent': 'JobBridge-App (contact: your-email@example.com)'
                                }
                        });

                        return data.jobs.map((job) => ({
                                externalId: job.id.toString(),
                                title: job.title,
                                company: job.company_name,
                                category: job.category ?? 'uncategorized',
                                salary: job.salary ?? 'unspecified',
                                url: job.url,
                                location: job.candidate_required_location || 'Remote',
                                publishedAt: new Date(job.publication_date)
                        }));
                } catch (error) {
                        console.error(
                                'Remotive Fetch Error:',
                                error instanceof Error ? error.message : error
                        );
                        // Return empty array so the use case doesn't crash, just logs the failure
                        return [];
                }
        }
}
