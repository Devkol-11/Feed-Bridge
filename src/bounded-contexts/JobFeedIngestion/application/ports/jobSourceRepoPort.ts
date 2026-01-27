import { JobSource } from '../../domain/model/aggregates/jobSource.js';
import type { Prisma } from 'generated/prisma/client.js';

export interface JobSourceRepositoryPort {
        findById(id: string): Promise<JobSource | null>;
        findAllEnabled(): Promise<JobSource[]>;
        save(source: JobSource, trx?: Prisma.TransactionClient): Promise<void>;
}
