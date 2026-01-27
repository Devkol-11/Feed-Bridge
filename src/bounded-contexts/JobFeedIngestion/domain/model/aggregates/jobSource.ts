import { AggregateRoot } from '@src/shared/ddd/agggragateRoot.Base.js';
import { randomUUID } from 'crypto';
import { JobListing } from '../entities/jobListing.js';
import { JobUrl } from '../valueObjects/jobUrl.js';
import { CompanyName } from '../valueObjects/companyName.js';
import { JobLocation } from '../valueObjects/jobLocation.js';
import { JobTitle } from '../valueObjects/jobTitle.js';
import { SourceFeedEnumType } from '../../enums/domainEnums.js';
import { omit } from 'zod/mini';

export interface JobSourceProps {
        id: string;
        name: string;
        type: SourceFeedEnumType;
        baseUrl: string;
        isEnabled: boolean;
        lastIngestedAt: Date | null;
}

export interface RawJobData {
        externalId: string;
        title: string;
        company: string;
        url: string;
        location: string;
        publishedAt: Date;
}

export class JobSource extends AggregateRoot<JobSourceProps> {
        private constructor(readonly props: Omit<JobSourceProps, 'id'>, readonly id: string) {
                super(props, id);
        }

        static create(props: Omit<JobSourceProps, 'id' | 'isEnabled'>): JobSource {
                const id = randomUUID();
                return new JobSource(
                        {
                                name: props.name,
                                type: props.type,
                                baseUrl: props.baseUrl,
                                isEnabled: true,
                                lastIngestedAt: props.lastIngestedAt
                        },
                        id
                );
        }

        // referring to persisted state coming from the repository
        public static rehydrate(props: JobSourceProps): JobSource {
                return new JobSource(
                        {
                                name: props.name,
                                type: props.type,
                                baseUrl: props.baseUrl,
                                isEnabled: props.isEnabled,
                                lastIngestedAt: props.lastIngestedAt
                        },
                        props.id
                );
        }

        public createListing(rawData: RawJobData): JobListing {
                if (!this.props.isEnabled) {
                        throw new Error(`Cannot ingest from disabled source: ${this.props.name}`);
                }

                return JobListing.create({
                        jobSourceId: this.id,
                        externalJobId: rawData.externalId,
                        title: new JobTitle({ value: rawData.title }),
                        company: new CompanyName({ value: rawData.company }),
                        location: new JobLocation({ value: rawData.location }),
                        jobUrl: new JobUrl({ value: rawData.url }),
                        type: 'REMOTE',
                        postedAt: rawData.publishedAt.toISOString(),
                        ingestedAt: new Date().toISOString()
                });
        }
}
