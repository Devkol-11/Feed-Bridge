import { dbClient } from '@src/config/prisma/prisma.js';
import type { Prisma } from 'generated/prisma/client.js';
import { JobSourceRepositoryPort } from '@src/bounded-contexts/JobFeedIngestion/domain/repositories/jobSourceRepoPort.js';
import { JobSource } from '@src/bounded-contexts/JobFeedIngestion/domain/model/aggregates/jobSource.js';

export class PrismaJobSourceRepository implements JobSourceRepositoryPort {
        async findById(id: string): Promise<JobSource | null> {
                const data = await dbClient.jobSource.findUnique({ where: { id } });
                if (!data) return null;

                // Reconstitute the Aggregate from DB data
                return JobSource.rehydrate(data);
        }

        async save(source: JobSource, trx?: Prisma.TransactionClient): Promise<void> {
                const client = trx ? trx : dbClient;
                const data = source.getProps(); // Accessing props from the Base Entity
                await client.jobSource.upsert({
                        where: { id: data.id }, // accessing protectaed id
                        update: { ...data },
                        create: { ...data }
                });
        }

        async findAllEnabled(): Promise<JobSource[]> {
                const sources = await dbClient.jobSource.findMany({ where: { isEnabled: true } });
                // Map all to JobSource entities...
                return sources.map((s) => JobSource.rehydrate(s));
        }

        async findByUrl(url: string): Promise<JobSource | null> {
                const jobSource = await dbClient.jobSource.findFirst({ where: { baseUrl: url } });
                if (!jobSource) return null;
                return JobSource.rehydrate(jobSource);
        }

        async findAllActive(): Promise<JobSource[] | null> {
                const activeSources = await dbClient.jobSource.findMany({ where: { isEnabled: true } });
                if (!activeSources) return null;
                return activeSources.map((source) => JobSource.rehydrate(source));
        }
}
