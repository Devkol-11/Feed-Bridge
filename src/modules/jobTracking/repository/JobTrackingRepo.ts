import { dbClient } from '@src/config/prisma/prisma.js';
import { JobApplication, ApplicationNote, APPLICATION_STATUS } from 'generated/prisma/client.js';

export class JobTrackingRepository {
        async saveApplication(data: JobApplication): Promise<JobApplication> {
                return await dbClient.jobApplication.upsert({
                        where: { id: data.id },
                        update: {
                                status: data.status,
                                appliedAt: data.appliedAt,
                                lastUpdatedAt: new Date()
                        },
                        create: {
                                id: data.id,
                                userId: data.userId,
                                jobId: data.jobId,
                                status: data.status,
                                appliedAt: data.appliedAt
                        }
                });
        }

        async findById(id: string) {
                return await dbClient.jobApplication.findUnique({
                        where: { id },
                        include: { notes: true }
                });
        }

        async findByUserAndJob(userId: string, jobId: string) {
                return await dbClient.jobApplication.findUnique({
                        where: { userId_jobId: { userId, jobId } },
                        include: { notes: true }
                });
        }

        async addNote(applicationId: string, content: string): Promise<ApplicationNote> {
                return await dbClient.applicationNote.create({
                        data: {
                                id: crypto.randomUUID(),
                                applicationId: applicationId,
                                content: content
                        }
                });
        }

        async updateNote(noteId: string, content: string): Promise<ApplicationNote> {
                return await dbClient.applicationNote.update({
                        where: { id: noteId },
                        data: { content }
                });
        }

        async deleteNote(noteId: string): Promise<void> {
                await dbClient.applicationNote.delete({
                        where: { id: noteId }
                });
        }

        async findAllByUserId(userId: string) {
                return await dbClient.jobApplication.findMany({
                        where: { userId },
                        include: { notes: true }
                });
        }
}
