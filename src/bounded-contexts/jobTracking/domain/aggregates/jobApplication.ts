import { AggregateRoot } from '@src/shared/ddd/agggragateRoot.Base.js';
import { ApplicationNote } from '../entities/applicationNote.js';
import { randomUUID } from 'node:crypto';

export type ApplicationStatus = 'SAVED' | 'APPLIED' | 'INTERVIEWING' | 'REJECTED' | 'OFFER';

export interface JobApplicationProps {
        userId: string;
        jobId: string;
        status: ApplicationStatus;
        notes: ApplicationNote[];
        appliedAt?: Date;
        lastUpdatedAt: Date;
}

export class JobApplication extends AggregateRoot<JobApplicationProps> {
        private constructor(props: JobApplicationProps, id: string) {
                super(props, id);
        }

        public static create(userId: string, jobId: string): JobApplication {
                const id = randomUUID();
                return new JobApplication(
                        {
                                userId,
                                jobId,
                                status: 'SAVED', // Default initial state
                                notes: [],
                                lastUpdatedAt: new Date()
                        },
                        id
                );
        }

        /**
         * INVARIANT: Controlled State Transitions
         * Prevents moving from 'Rejected' back to 'Applied', etc.
         */
        public updateStatus(newStatus: ApplicationStatus): void {
                const flow: Record<ApplicationStatus, ApplicationStatus[]> = {
                        SAVED: ['APPLIED', 'REJECTED'],
                        APPLIED: ['INTERVIEWING', 'REJECTED', 'OFFER'],
                        INTERVIEWING: ['REJECTED', 'OFFER'],
                        REJECTED: [], // Terminal state
                        OFFER: [] // Terminal state
                };

                if (!flow[this.props.status].includes(newStatus)) {
                        throw new Error(
                                `Invalid status transition from ${this.props.status} to ${newStatus}`
                        );
                }

                if (newStatus === 'APPLIED') {
                        this.props.appliedAt = new Date();
                }

                this.props.status = newStatus;
                this.props.lastUpdatedAt = new Date();
        }

        public addNote(content: string): void {
                const note = ApplicationNote.create(this.id, content);
                this.props.notes.push(note);
                this.props.lastUpdatedAt = new Date();
        }
}
