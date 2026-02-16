import axios from 'axios';
import { GENERAL_JOB_ITEM } from '../dtos/types/types.js';
import { processJobBatch } from './helpers/processor.js';

export async function Arbeitnow_Ingestion_Cron() {
        try {
                console.log('--- 🟦 Starting arbeitnow Ingestion ---');
                const API_URL = '';
                const { data } = await axios.get<{ jobs: any[] }>(API_URL);

                const normalizedJobs: GENERAL_JOB_ITEM[] = data.jobs.map((job) => ({
                        externalId: String(job.id),
                        url: job.url,
                        title: job.title,
                        company: job.company_name,
                        category: job.category || 'Unspecified',
                        location: job.candidate_required_location || 'Unspecified',
                        salary: job.salary || 'Unspecified',
                        postedAt: new Date(job.publication_date),
                        sourceName: 'REMOTIVE'
                }));

                await processJobBatch(normalizedJobs);
        } catch (error: any) {
                console.error('Remotive Ingestion Failed:', error.message);
        }
}
