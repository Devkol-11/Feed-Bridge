import { dbClient } from '@src/config/prisma/prisma.js';
import type { Prisma } from 'generated/prisma/client.js';
import { JobListingRepositoryPort } from '@src/bounded-contexts/JobFeedIngestion/application/ports/jobListingRepoPort.js';
import { JobListing } from '@src/bounded-contexts/JobFeedIngestion/domain/model/entities/jobListing.js';

export class PrismaJobListingRepository implements JobListingRepositoryPort {
        async exists(jobSourceId: string, externalJobId: string): Promise<boolean> {
                const count = await dbClient.jobListing.count({
                        where: { jobSourceId, externalJobId }
                });
                return count > 0;
        }

        async save(listing: JobListing, trx?: Prisma.TransactionClient): Promise<void> {
                const client = trx ? trx : dbClient;

                const p = listing.getProps();

                await client.jobListing.create({
                        data: {
                                id: p.id,
                                jobSourceId: p.jobSourceId,
                                externalJobId: p.externalJobId,
                                title: p.title.props.value, // Flattening the Value Object for DB
                                type: p.type,
                                company: p.company.props.value,
                                location: p.location.props.value,
                                jobUrl: p.jobUrl.props.value,
                                postedAt: new Date(p.postedAt),
                                ingestedAt: new Date(p.ingestedAt)
                        }
                });
        }
}
