import { dbClient } from '@src/config/prisma/prisma.js';
import type { Prisma } from 'generated/prisma/client.js';
import { JobListing } from 'generated/prisma/client.js';

export class JobListingRepository {
        async exists(jobSourceId: string, externalJobId: string): Promise<boolean> {
                const count = await dbClient.jobListing.count({
                        where: { jobSourceId, externalJobId }
                });
                return count > 0;
        }

        async save(listing: JobListing, trx?: Prisma.TransactionClient): Promise<void> {
                const client = trx ? trx : dbClient;

                await client.jobListing.upsert({
                        where: { id: listing.id },
                        update: {
                                title: listing.title,
                                company: listing.company,
                                location: listing.location,
                                category: listing.category,
                                salary: listing.salary,
                                jobUrl: listing.jobUrl,
                                type: listing.type,
                                postedAt: listing.postedAt,
                                ingestedAt: listing.ingestedAt
                        },
                        create: {
                                id: listing.id,
                                jobSourceId: listing.jobSourceId,
                                externalJobId: listing.externalJobId,
                                title: listing.title,
                                company: listing.company,
                                category: listing.category,
                                salary: listing.salary,
                                location: listing.location,
                                jobUrl: listing.jobUrl,
                                type: listing.type,
                                postedAt: listing.postedAt,
                                ingestedAt: listing.ingestedAt
                        }
                });
        }

        async findAllJobsForUser(params: {
                skip: number;
                take: number;
                sourceId?: string;
        }): Promise<JobListing[]> {
                const records = await dbClient.jobListing.findMany({
                        where: {
                                jobSourceId: params.sourceId
                        },
                        skip: params.skip,
                        take: params.take,
                        orderBy: {
                                postedAt: 'desc'
                        }
                });

                return records;
        }

        async find(params: {
                category?: string;
                location?: string;
                salary?: string;
                skip: number;
                take: number;
        }) {
                const searchCriteria = {
                        category: params.category, // Exact match
                        location: params.location
                                ? { contains: params.location, mode: 'insensitive' as const }
                                : undefined,
                        salary: params.salary
                                ? { contains: params.salary, mode: 'insensitive' as const }
                                : undefined
                };

                const listings = await dbClient.jobListing.findMany({
                        where: searchCriteria,
                        skip: params.skip,
                        take: params.take,
                        orderBy: { postedAt: 'desc' },
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

                return listings.map((job) => {
                        const readModel = {
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
