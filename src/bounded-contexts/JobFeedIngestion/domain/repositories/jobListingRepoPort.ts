import { JobListing } from '../model/entities/jobListing.js';
import type { Prisma } from 'generated/prisma/client.js';

export interface JobListingRepositoryPort {
        exists(sourceId: string, externalId: string): Promise<boolean>;
        save(listing: JobListing, trx?: Prisma.TransactionClient): Promise<void>;
        findAll(params: { skip: number; take: number; sourceId?: string }): Promise<JobListing[]>;
}
