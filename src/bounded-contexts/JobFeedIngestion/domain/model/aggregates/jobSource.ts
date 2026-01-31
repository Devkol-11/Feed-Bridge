import { AggregateRoot } from '@src/shared/ddd/agggragateRoot.Base.js';
import { randomUUID } from 'crypto';
import { JobListing } from '../entities/jobListing.js';
import { JobUrl } from '../valueObjects/jobUrl.js';
import { CompanyName } from '../valueObjects/companyName.js';
import { JobLocation } from '../valueObjects/jobLocation.js';
import { JobTitle } from '../valueObjects/jobTitle.js';
import { SourceFeedEnumType, JobListingEnum } from '../../enums/domainEnums.js';
import { RawJobData } from '@src/bounded-contexts/JobFeedIngestion/application/ports/jobFetcherPort.js';

export interface JobSourceProps {
        id: string;
        name: string;
        provider: string;
        type: SourceFeedEnumType;
        baseUrl: string;
        isEnabled: boolean;
        lastIngestedAt: Date | null;
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
                                provider: props.provider.toUpperCase(),
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
                                provider: props.provider.toUpperCase(),
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
                        category: rawData.category ?? 'uncategorized',
                        salary: rawData.salary ?? 'unspecified',
                        type: JobListingEnum.REMOTE,
                        postedAt: rawData.publishedAt,
                        ingestedAt: new Date()
                });
        }

        public markIngested(): void {
                this.props.lastIngestedAt = new Date();
        }

        public disable(): void {
                this.props.isEnabled = false;
        }

        public enable(): void {
                this.props.isEnabled = true;
        }
}
