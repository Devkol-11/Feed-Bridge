import { dbClient } from '@src/config/prisma/prisma.js';
import type { Prisma } from 'generated/prisma/client.js';
import { JobSourceRepositoryPort } from '@src/bounded-contexts/JobFeedIngestion/application/ports/jobSourceRepoPort.js';
import { JobSource } from '@src/bounded-contexts/JobFeedIngestion/domain/model/aggregates/jobSource.js';

export class PrismaJobSourceRepository implements JobSourceRepositoryPort {
        async findById(id: string): Promise<JobSource | null> {
                const data = await dbClient.jobSource.findUnique({ where: { id } });
                if (!data) return null;

                // Reconstitute the Aggregate from DB data
                return JobSource.create({
                        name: data.name,
                        type: data.type as any,
                        baseUrl: data.baseUrl,
                        lastIngestedAt: data.lastIngestedAt || new Date()
                });
        }

        async save(source: JobSource, trx?: Prisma.TransactionClient): Promise<void> {
                const client = trx ? trx : dbClient;
                const data = source.getProps(); // Accessing props from your Base Entity
                await client.jobSource.upsert({
                        where: { id: data.id }, // accessing protectaed id
                        update: { ...data },
                        create: { ...data }
                });
        }

        async findAllEnabled(): Promise<JobSource[]> {
                const sources = await dbClient.jobSource.findMany({ where: { isEnabled: true } });
                // Map all to JobSource entities...
                return sources.map((s) => JobSource.create(s));
        }
}
