import { dbClient } from '@src/config/prisma/prisma.js';
import { randomUUID } from 'node:crypto';
import { GENERAL_JOB_ITEM } from '../../dtos/types/types.js';

export async function processJobBatch(jobs: GENERAL_JOB_ITEM[]) {
        let count = 0;
        for (const job of jobs) {
                try {
                        await dbClient.jobListing.upsert({
                                where: { jobUrl: job.url },
                                update: {
                                        title: job.title,
                                        category: job.category,
                                        location: job.location
                                },
                                create: {
                                        id: randomUUID(),
                                        sourceName: job.sourceName,
                                        externalJobId: job.externalId,
                                        title: job.title,
                                        company: job.company,
                                        category: job.category,
                                        salary: job.salary,
                                        location: job.location,
                                        jobUrl: job.url,
                                        postedAt: job.postedAt
                                }
                        });
                        count++;
                } catch (err) {
                        console.error(`Error processing job ${job.externalId} from ${job.sourceName}`);
                }
        }
        console.log(`Successfully synced ${count} jobs.`);
}
