import { GetAllJobsRepoPort } from '@src/modules/jobIngesttion & catalog/application/queries/getAllJobs/getAllJobsRepo.js';
import { dbClient } from '@src/config/prisma/prisma.js';

export class PrismaGetAllJobsRepo implements GetAllJobsRepoPort {
        async findAll(params: { skip: number; take: number; category?: string; location?: string }) {
                const data = await dbClient.jobListing.findMany({
                        where: {
                                category: params.category,
                                location: { contains: params.location, mode: 'insensitive' }
                        },
                        skip: params.skip,
                        take: params.take,
                        orderBy: { postedAt: 'desc' },
                        include: { jobSource: true }
                });

                return data.map((job) => ({
                        id: job.id,
                        title: job.title,
                        company: job.company,
                        category: job.category ?? 'General',
                        location: job.location,
                        salary: job.salary ?? 'Competitive',
                        type: job.type ?? 'Full-time',
                        jobUrl: job.jobUrl,
                        postedAt: job.postedAt,
                        sourceName: job.jobSource.name
                }));
        }
}
