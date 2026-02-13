import { dbClient } from '@src/config/prisma/prisma.js';
import type { Prisma } from 'generated/prisma/client.js';
import { JobListingRepositoryPort } from '@src/modules/jobIngesttion & catalog/domain/repositories/jobListingRepoPort.js';
import { JobListing } from '@src/modules/jobIngesttion & catalog/domain/model/entities/jobListing.js';
import { JobTitle } from '@src/modules/jobIngesttion & catalog/domain/model/valueObjects/jobTitle.js';
import { CompanyName } from '@src/modules/jobIngesttion & catalog/domain/model/valueObjects/companyName.js';
import { JobLocation } from '@src/modules/jobIngesttion & catalog/domain/model/valueObjects/jobLocation.js';
import { JobUrl } from '@src/modules/jobIngesttion & catalog/domain/model/valueObjects/jobUrl.js';
import { JobListingEnumType } from '../../../../../domain/enums/domainEnums.js';

export class PrismaJobListingRepository implements JobListingRepositoryPort {
        async exists(jobSourceId: string, externalJobId: string): Promise<boolean> {
                const count = await dbClient.jobListing.count({
                        where: { jobSourceId, externalJobId }
                });
                return count > 0;
        }

        async save(listing: JobListing, trx?: Prisma.TransactionClient): Promise<void> {
                const client = trx ? trx : dbClient;
                const p = listing.getProps();

                await client.jobListing.upsert({
                        where: { id: p.id },
                        update: {
                                title: p.title.props.value,
                                company: p.company.props.value,
                                location: p.location.props.value,
                                category: p.category,
                                salary: p.salary,
                                jobUrl: p.jobUrl.props.value,
                                type: p.type as any,
                                postedAt: p.postedAt,
                                ingestedAt: p.ingestedAt
                        },
                        create: {
                                id: p.id,
                                jobSourceId: p.jobSourceId,
                                externalJobId: p.externalJobId,
                                title: p.title.props.value,
                                company: p.company.props.value,
                                category: p.category,
                                salary: p.salary,
                                location: p.location.props.value,
                                jobUrl: p.jobUrl.props.value,
                                type: p.type as any,
                                postedAt: p.postedAt,
                                ingestedAt: p.ingestedAt
                        }
                });
        }

        async findAll(params: { skip: number; take: number; sourceId?: string }): Promise<JobListing[]> {
                const records = await dbClient.jobListing.findMany({
                        where: {
                                jobSourceId: params.sourceId
                        },
                        skip: params.skip,
                        take: params.take,
                        orderBy: {
                                postedAt: 'desc'
                        }
                });

                return records.map((record) => {
                        return JobListing.rehydrate({
                                id: record.id,
                                jobSourceId: record.jobSourceId,
                                externalJobId: record.externalJobId,
                                title: new JobTitle({ value: record.title }),
                                company: new CompanyName({ value: record.company }),
                                location: new JobLocation({ value: record.location }),
                                category: record.category || 'uncategorized',
                                salary: record.salary || 'unspecified',
                                jobUrl: new JobUrl({ value: record.jobUrl }),
                                type: record.type as JobListingEnumType,
                                postedAt: record.postedAt,
                                ingestedAt: record.ingestedAt
                        });
                });
        }
}
