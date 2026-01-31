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
        category?: string;
        salary?: string;
        location: JobLocation;
        jobUrl: JobUrl;
        postedAt: Date;
        ingestedAt: Date;
}

export class JobListing extends Entity<JobListingProps> {
        private constructor(props: Omit<JobListingProps, 'id'>, id: string) {
                super(props, id);
        }

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
                                category: props.category,
                                salary: props.salary,
                                location: props.location,
                                jobUrl: props.jobUrl,
                                postedAt: props.postedAt,
                                ingestedAt: props.ingestedAt
                        },
                        props.id
                );
        }
}
