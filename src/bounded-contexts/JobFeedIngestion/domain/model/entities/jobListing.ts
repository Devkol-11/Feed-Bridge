import { Entity } from '@src/shared/ddd/entity.Base.js';
import { randomUUID } from 'node:crypto';
import { JobLocation } from '../valueObjects/jobLocation.js';
import { JobTitle } from '../valueObjects/jobTitle.js';
import { JobUrl } from '../valueObjects/jobUrl.js';
import { CompanyName } from '../valueObjects/companyName.js';
import { JobListingEnumType } from '../../enums/domainEnums.js';

export interface JobListingProps {
        id: string;
        jobSourceId: string;
        externalJobId: string;
        title: JobTitle;
        type: JobListingEnumType;
        company: CompanyName;
        location: JobLocation;
        jobUrl: JobUrl;
        postedAt: string;
        ingestedAt: string;
}
export class JobListing extends Entity<JobListingProps> {
        private constructor(props: Omit<JobListingProps, 'id'>, id: string) {
                super(props, id);
        }

        // We accept raw data here and turn it into Value Objects
        static create(props: Omit<JobListingProps, 'id'>): JobListing {
                const id = randomUUID();
                return new JobListing(props, id);
        }

        public static rehydrate(props: JobListingProps): JobListing {
                return new JobListing(
                        {
                                jobSourceId: props.jobSourceId,
                                externalJobId: props.externalJobId,
                                title: props.title,
                                type: props.type,
                                company: props.company,
                                location: props.location,
                                jobUrl: props.jobUrl,
                                postedAt: props.postedAt,
                                ingestedAt: props.ingestedAt
                        },
                        props.id
                );
        }
}
