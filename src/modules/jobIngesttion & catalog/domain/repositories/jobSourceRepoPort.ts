import { JobSource } from '../model/aggregates/jobSource.js';
import type { Prisma } from 'generated/prisma/client.js';

export interface JobSourceRepositoryPort {
        findById(id: string): Promise<JobSource | null>;
        findAllEnabled(): Promise<JobSource[]>;
        findByUrl(url: string): Promise<JobSource | null>;
        findAllActive(): Promise<JobSource[] | null>;
        save(source: JobSource, trx?: Prisma.TransactionClient): Promise<void>;
}
