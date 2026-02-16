import { dbClient } from '@src/config/prisma/prisma.js';
import type { Prisma } from 'generated/prisma/client.js';
import { JobSource } from 'generated/prisma/client.js';

export class JobSourceRepository {
        async findById(id: string): Promise<JobSource | null> {
                const data = await dbClient.jobSource.findUnique({ where: { id } });
                return data ?? null;
        }

        async save(source: JobSource, trx?: Prisma.TransactionClient): Promise<void> {
                const client = trx ? trx : dbClient;
                await client.jobSource.upsert({
                        where: { id: source.id },
                        update: { ...source },
                        create: { ...source }
                });
        }

        async findAllEnabled(): Promise<JobSource[]> {
                const sources = await dbClient.jobSource.findMany({ where: { isEnabled: true } });
                return sources;
        }

        async findByUrl(url: string): Promise<JobSource | null> {
                const jobSource = await dbClient.jobSource.findFirst({ where: { baseUrl: url } });
                return jobSource ?? null;
        }

        async findAllActive(): Promise<JobSource[] | null> {
                const activeSources = await dbClient.jobSource.findMany({ where: { isEnabled: true } });
                return activeSources ?? null;
        }
}
