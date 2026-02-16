/**
 * JobListing Entity Tests
 *
 * This test suite covers:
 * - JobListing creation from factory method
 * - JobListing rehydration from persistence
 * - ID generation
 * - Data integrity
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JobListing } from '../model/entities/jobListing.js';
import { JobTitle } from '../model/valueObjects/jobTitle.js';
import { JobUrl } from '../model/valueObjects/jobUrl.js';
import { JobLocation } from '../model/valueObjects/jobLocation.js';
import { CompanyName } from '../model/valueObjects/companyName.js';
import { JobListingEnum } from '../enums/domainEnums.js';

describe('JobListing Entity', () => {
        let jobTitle: JobTitle;
        let jobUrl: JobUrl;
        let jobLocation: JobLocation;
        let companyName: CompanyName;

        beforeEach(() => {
                jobTitle = new JobTitle({ value: 'Senior Developer' });
                jobUrl = new JobUrl({ value: 'https://example.com/job/123' });
                jobLocation = new JobLocation({ value: 'Remote' });
                companyName = new CompanyName({ value: 'TechCorp' });
        });

        describe('create() factory method', () => {
                it('should create a new job listing with provided data', () => {
                        const now = new Date();
                        const listing = JobListing.create({
                                jobSourceId: 'source-1',
                                externalJobId: 'external-123',
                                title: jobTitle,
                                type: JobListingEnum.REMOTE,
                                company: companyName,
                                category: 'IT',
                                salary: '$100,000 - $150,000',
                                location: jobLocation,
                                jobUrl: jobUrl,
                                postedAt: now,
                                ingestedAt: now
                        });

                        expect(listing.id).toBeDefined();
                        expect(listing.props.jobSourceId).toBe('source-1');
                        expect(listing.props.externalJobId).toBe('external-123');
                        expect(listing.props.title).toEqual(jobTitle);
                        expect(listing.props.type).toBe(JobListingEnum.REMOTE);
                        expect(listing.props.company).toEqual(companyName);
                        expect(listing.props.category).toBe('IT');
                        expect(listing.props.salary).toBe('$100,000 - $150,000');
                        expect(listing.props.location).toEqual(jobLocation);
                        expect(listing.props.jobUrl).toEqual(jobUrl);
                        expect(listing.props.postedAt).toEqual(now);
                        expect(listing.props.ingestedAt).toEqual(now);
                });

                it('should generate unique UUIDs for different listings', () => {
                        const listing1 = JobListing.create({
                                jobSourceId: 'source-1',
                                externalJobId: 'external-1',
                                title: jobTitle,
                                type: JobListingEnum.REMOTE,
                                company: companyName,
                                location: jobLocation,
                                jobUrl: jobUrl,
                                postedAt: new Date(),
                                ingestedAt: new Date()
                        });

                        const listing2 = JobListing.create({
                                jobSourceId: 'source-1',
                                externalJobId: 'external-2',
                                title: jobTitle,
                                type: JobListingEnum.REMOTE,
                                company: companyName,
                                location: jobLocation,
                                jobUrl: jobUrl,
                                postedAt: new Date(),
                                ingestedAt: new Date()
                        });

                        expect(listing1.id).not.toBe(listing2.id);
                        expect(listing1.id).toMatch(
                                /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                        );
                        expect(listing2.id).toMatch(
                                /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                        );
                });

                it('should allow optional category and salary', () => {
                        const listing = JobListing.create({
                                jobSourceId: 'source-1',
                                externalJobId: 'external-123',
                                title: jobTitle,
                                type: JobListingEnum.REMOTE,
                                company: companyName,
                                location: jobLocation,
                                jobUrl: jobUrl,
                                postedAt: new Date(),
                                ingestedAt: new Date()
                        });

                        expect(listing.props.category).toBeUndefined();
                        expect(listing.props.salary).toBeUndefined();
                });
        });

        describe('rehydrate() factory method', () => {
                it('should rehydrate a job listing from persistence', () => {
                        const props = {
                                id: 'listing-1',
                                jobSourceId: 'source-1',
                                externalJobId: 'external-123',
                                title: jobTitle,
                                type: JobListingEnum.REMOTE,
                                company: companyName,
                                category: 'IT',
                                salary: '$100,000',
                                location: jobLocation,
                                jobUrl: jobUrl,
                                postedAt: new Date('2024-01-01'),
                                ingestedAt: new Date('2024-01-15')
                        };

                        const listing = JobListing.rehydrate(props);

                        expect(listing.id).toBe('listing-1');
                        expect(listing.props.jobSourceId).toBe('source-1');
                        expect(listing.props.externalJobId).toBe('external-123');
                        expect(listing.props.category).toBe('IT');
                });

                it('should preserve all properties during rehydration', () => {
                        const originalDate = new Date('2024-01-01');
                        const ingestDate = new Date('2024-01-15');

                        const props = {
                                id: 'listing-preserved',
                                jobSourceId: 'source-preserved',
                                externalJobId: 'external-preserved',
                                title: jobTitle,
                                type: JobListingEnum.REMOTE,
                                company: companyName,
                                category: 'Engineering',
                                salary: '$200,000',
                                location: jobLocation,
                                jobUrl: jobUrl,
                                postedAt: originalDate,
                                ingestedAt: ingestDate
                        };

                        const listing = JobListing.rehydrate(props);

                        expect(listing.props.postedAt.getTime()).toBe(originalDate.getTime());
                        expect(listing.props.ingestedAt.getTime()).toBe(ingestDate.getTime());
                });
        });

        describe('Job Types', () => {
                it('should support REMOTE job type', () => {
                        const listing = JobListing.create({
                                jobSourceId: 'source-1',
                                externalJobId: 'external-123',
                                title: jobTitle,
                                type: JobListingEnum.REMOTE,
                                company: companyName,
                                location: jobLocation,
                                jobUrl: jobUrl,
                                postedAt: new Date(),
                                ingestedAt: new Date()
                        });

                        expect(listing.props.type).toBe(JobListingEnum.REMOTE);
                });

                it('should support HYBRID job type', () => {
                        const listing = JobListing.create({
                                jobSourceId: 'source-1',
                                externalJobId: 'external-123',
                                title: jobTitle,
                                type: JobListingEnum.HYBRID,
                                company: companyName,
                                location: jobLocation,
                                jobUrl: jobUrl,
                                postedAt: new Date(),
                                ingestedAt: new Date()
                        });

                        expect(listing.props.type).toBe(JobListingEnum.HYBRID);
                });

                it('should support ON_SITE job type', () => {
                        const listing = JobListing.create({
                                jobSourceId: 'source-1',
                                externalJobId: 'external-123',
                                title: jobTitle,
                                type: JobListingEnum.ON_SITE,
                                company: companyName,
                                location: jobLocation,
                                jobUrl: jobUrl,
                                postedAt: new Date(),
                                ingestedAt: new Date()
                        });

                        expect(listing.props.type).toBe(JobListingEnum.ON_SITE);
                });
        });
});
