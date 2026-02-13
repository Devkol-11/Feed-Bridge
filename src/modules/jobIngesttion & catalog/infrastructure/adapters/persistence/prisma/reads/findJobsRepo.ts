// infrastructure/persistence/prisma/PrismaFindJobsRepo.ts
import { dbClient } from '@src/config/prisma/prisma.js';
import {
        FindJobsRepoPort,
        FindJobsReadModel
} from '@src/modules/jobIngesttion & catalog/application/queries/findJobs/findJobsRepoPort.js';

export class PrismaFindJobsRepo implements FindJobsRepoPort {
        async find(params: {
                category?: string;
                location?: string;
                salary?: string;
                skip: number;
                take: number;
        }): Promise<FindJobsReadModel[]> {
                // --- 1. EXPLICIT FILTERS ---
                // We define the 'where' object explicitly.
                // Prisma ignores keys that are 'undefined', so this is safe and clean.
                const searchCriteria = {
                        category: params.category, // Exact match
                        location: params.location
                                ? { contains: params.location, mode: 'insensitive' as const }
                                : undefined,
                        salary: params.salary
                                ? { contains: params.salary, mode: 'insensitive' as const }
                                : undefined
                };

                // --- 2. EXECUTE QUERY ---
                const listings = await dbClient.jobListing.findMany({
                        where: searchCriteria,
                        skip: params.skip,
                        take: params.take,
                        orderBy: { postedAt: 'desc' },
                        // --- 3. EXPLICIT PROJECTION ---
                        // Only select the fields defined in our Read Model
                        select: {
                                id: true,
                                title: true,
                                company: true,
                                category: true,
                                location: true,
                                salary: true,
                                type: true,
                                jobUrl: true,
                                postedAt: true,
                                jobSource: {
                                        select: { name: true }
                                }
                        }
                });

                // --- 4. EXPLICIT MAPPING ---
                // Transform the database result into our Read Model shape
                return listings.map((job) => {
                        const readModel: FindJobsReadModel = {
                                id: job.id,
                                title: job.title,
                                company: job.company,
                                category: job.category ?? 'General',
                                location: job.location,
                                salary: job.salary ?? 'Competitive',
                                type: job.type ?? 'Full-time',
                                jobUrl: job.jobUrl,
                                postedAt: job.postedAt,
                                sourceName: job.jobSource.name // Flattening the join
                        };
                        return readModel;
                });
        }
}
