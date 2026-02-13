// infrastructure/persistence/PrismaJobTrackingRepo.ts
import { dbClient } from '@src/config/prisma/prisma.js';
import { JobApplication } from '../../domain/aggregates/jobApplication.js';
import { ApplicationNote } from '../../domain/entities/applicationNote.js';
import { JobTrackingRepository } from '../../domain/repository/jobTrackingRepo.js';

export class PrismaJobTrackingRepo implements JobTrackingRepository {
        async save(application: JobApplication): Promise<void> {
                const props = application.getProps();

                await dbClient.jobApplication.upsert({
                        where: { id: props.id },
                        update: {
                                status: props.status,
                                appliedAt: props.appliedAt,
                                lastUpdatedAt: props.lastUpdatedAt,
                                notes: {
                                        // Simple strategy: recreate notes that don't exist
                                        upsert: props.notes.map((note: any) => ({
                                                where: { id: note.id },
                                                update: { content: note.props.content },
                                                create: {
                                                        id: note.id,
                                                        content: note.props.content,
                                                        createdAt: note.props.createdAt
                                                }
                                        }))
                                }
                        },
                        create: {
                                id: props.id,
                                userId: props.userId,
                                jobId: props.jobId,
                                status: props.status,
                                appliedAt: props.appliedAt,
                                lastUpdatedAt: props.lastUpdatedAt
                        }
                });
        }

        async findByUserAndJob(userId: string, jobId: string): Promise<JobApplication | null> {
                const record = await dbClient.jobApplication.findUnique({
                        where: { userId_jobId: { userId, jobId } },
                        include: { notes: true }
                });

                if (!record) return null;
                return this.mapToDomain(record);
        }

        async findById(id: string): Promise<JobApplication | null> {
                const record = await dbClient.jobApplication.findUnique({
                        where: { id },
                        include: { notes: true }
                });

                if (!record) return null;
                return this.mapToDomain(record);
        }

        async findAllByUserId(userId: string): Promise<JobApplication[]> {
                const records = await dbClient.jobApplication.findMany({
                        where: { userId },
                        include: { notes: true },
                        orderBy: { lastUpdatedAt: 'desc' }
                });

                return records.map(this.mapToDomain);
        }

        private mapToDomain(record: any): JobApplication {
                const notes = record.notes.map((n: any) =>
                        ApplicationNote.rehydrate(
                                {
                                        applicationId: n.applicationId,
                                        content: n.content,
                                        createdAt: n.createdAt
                                },
                                n.id
                        )
                );

                return (JobApplication as any).rehydrate(
                        {
                                userId: record.userId,
                                jobId: record.jobId,
                                status: record.status as any,
                                appliedAt: record.appliedAt,
                                lastUpdatedAt: record.lastUpdatedAt,
                                notes
                        },
                        record.id
                );
        }
}
