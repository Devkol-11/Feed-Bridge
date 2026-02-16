/**
 * JobSource Aggregate Tests
 *
 * This test suite covers:
 * - JobSource creation and rehydration
 * - Job listing creation from raw data
 * - Enabling/disabling job sources
 * - Marking as ingested
 * - Business logic validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JobSource } from '../model/aggregates/jobSource.js';
import { SourceFeedEnumType } from '../enums/domainEnums.js';
import { RawJobData } from '../../application/ports/jobFetcherPort.js';

describe('JobSource Aggregate', () => {
        describe('create() factory method', () => {
                it('should create a new job source with provided data', () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        expect(jobSource.id).toBeDefined();
                        expect(jobSource.props.name).toBe('Remotive');
                        expect(jobSource.props.type).toBe(SourceFeedEnumType.JSON);
                        expect(jobSource.props.provider).toBe('REMOTIVE'); // Uppercase
                        expect(jobSource.props.baseUrl).toBe('https://remotive.com/api/remote-jobs');
                        expect(jobSource.props.isEnabled).toBe(true); // Default
                        expect(jobSource.props.lastIngestedAt).toBeNull();
                });

                it('should generate unique IDs for different sources', () => {
                        const source1 = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        const source2 = JobSource.create({
                                name: 'WWR',
                                type: SourceFeedEnumType.XML,
                                provider: 'wwr',
                                baseUrl: 'https://wwr.com/feed.xml',
                                lastIngestedAt: null
                        });

                        expect(source1.id).not.toBe(source2.id);
                });

                it('should convert provider to uppercase', () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        expect(jobSource.props.provider).toBe('REMOTIVE');
                });

                it('should set isEnabled to true by default', () => {
                        const jobSource = JobSource.create({
                                name: 'Test Source',
                                type: SourceFeedEnumType.JSON,
                                provider: 'test',
                                baseUrl: 'https://test.com/jobs',
                                lastIngestedAt: null
                        });

                        expect(jobSource.props.isEnabled).toBe(true);
                });
        });

        describe('rehydrate() factory method', () => {
                it('should rehydrate a job source from persistence', () => {
                        const now = new Date();
                        const jobSource = JobSource.rehydrate({
                                id: 'source-123',
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                isEnabled: true,
                                lastIngestedAt: now
                        });

                        expect(jobSource.id).toBe('source-123');
                        expect(jobSource.props.name).toBe('Remotive');
                        expect(jobSource.props.isEnabled).toBe(true);
                        expect(jobSource.props.lastIngestedAt).toEqual(now);
                });

                it('should preserve all properties during rehydration', () => {
                        const sourceId = 'source-preserved';
                        const lastIngestedDate = new Date('2024-01-15T10:00:00Z');

                        const jobSource = JobSource.rehydrate({
                                id: sourceId,
                                name: 'WWR',
                                type: SourceFeedEnumType.XML,
                                provider: 'wwr',
                                baseUrl: 'https://wwr.com/feed.xml',
                                isEnabled: false,
                                lastIngestedAt: lastIngestedDate
                        });

                        expect(jobSource.id).toBe(sourceId);
                        expect(jobSource.props.lastIngestedAt?.getTime()).toBe(lastIngestedDate.getTime());
                        expect(jobSource.props.isEnabled).toBe(false);
                });
        });

        describe('createListing() - Job Listing Creation', () => {
                let jobSource: JobSource;

                beforeEach(() => {
                        jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });
                });

                it('should create a job listing from raw data', () => {
                        const rawData: RawJobData = {
                                externalId: '123',
                                title: 'Senior Developer',
                                company: 'TechCorp',
                                url: 'https://example.com/job/123',
                                location: 'Remote',
                                category: 'IT',
                                salary: '$100,000',
                                publishedAt: new Date('2024-01-15')
                        };

                        const listing = jobSource.createListing(rawData);

                        expect(listing.id).toBeDefined();
                        expect(listing.props.jobSourceId).toBe(jobSource.id);
                        expect(listing.props.externalJobId).toBe('123');
                        expect(listing.props.title.props.value).toBe('Senior Developer');
                        expect(listing.props.company.props.value).toBe('TechCorp');
                        expect(listing.props.location.props.value).toBe('Remote');
                });

                it('should set ingestedAt to current time', () => {
                        const before = new Date();
                        const rawData: RawJobData = {
                                externalId: '124',
                                title: 'Developer',
                                company: 'Company',
                                url: 'https://example.com/job/124',
                                location: 'Remote',
                                publishedAt: new Date()
                        };

                        const listing = jobSource.createListing(rawData);
                        const after = new Date();

                        expect(listing.props.ingestedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
                        expect(listing.props.ingestedAt.getTime()).toBeLessThanOrEqual(after.getTime());
                });

                it('should throw error if job source is disabled', () => {
                        jobSource.disable();

                        const rawData: RawJobData = {
                                externalId: '125',
                                title: 'Developer',
                                company: 'Company',
                                url: 'https://example.com/job/125',
                                location: 'Remote',
                                publishedAt: new Date()
                        };

                        expect(() => jobSource.createListing(rawData)).toThrow(
                                'Cannot ingest from disabled source'
                        );
                });

                it('should handle raw data with optional fields', () => {
                        const rawData: RawJobData = {
                                externalId: '126',
                                title: 'Developer',
                                company: 'Company',
                                url: 'https://example.com/job/126',
                                location: 'Remote',
                                publishedAt: new Date()
                                // category and salary are omitted
                        };

                        const listing = jobSource.createListing(rawData);

                        expect(listing.props.category).toBeUndefined();
                        expect(listing.props.salary).toBeUndefined();
                });
        });

        describe('markIngested()', () => {
                it('should update lastIngestedAt to current time', () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        expect(jobSource.props.lastIngestedAt).toBeNull();

                        const before = new Date();
                        jobSource.markIngested();
                        const after = new Date();

                        expect(jobSource.props.lastIngestedAt).toBeDefined();
                        if (jobSource.props.lastIngestedAt) {
                                expect(jobSource.props.lastIngestedAt.getTime()).toBeGreaterThanOrEqual(
                                        before.getTime()
                                );
                                expect(jobSource.props.lastIngestedAt.getTime()).toBeLessThanOrEqual(
                                        after.getTime()
                                );
                        }
                });

                it('should update to new time on subsequent calls', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        jobSource.markIngested();
                        const firstTime = jobSource.props.lastIngestedAt;

                        // Wait a bit to ensure time difference
                        await new Promise((resolve) => setTimeout(resolve, 10));

                        jobSource.markIngested();
                        const secondTime = jobSource.props.lastIngestedAt;

                        expect(secondTime).toBeDefined();
                        expect(firstTime).toBeDefined();
                        if (firstTime && secondTime) {
                                expect(secondTime.getTime()).toBeGreaterThanOrEqual(firstTime.getTime());
                        }
                });
        });

        describe('disable() and enable()', () => {
                let jobSource: JobSource;

                beforeEach(() => {
                        jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });
                });

                it('should disable a job source', () => {
                        expect(jobSource.props.isEnabled).toBe(true);

                        jobSource.disable();

                        expect(jobSource.props.isEnabled).toBe(false);
                });

                it('should enable a previously disabled job source', () => {
                        jobSource.disable();
                        expect(jobSource.props.isEnabled).toBe(false);

                        jobSource.enable();

                        expect(jobSource.props.isEnabled).toBe(true);
                });

                it('should allow toggling between states', () => {
                        expect(jobSource.props.isEnabled).toBe(true);

                        jobSource.disable();
                        expect(jobSource.props.isEnabled).toBe(false);

                        jobSource.enable();
                        expect(jobSource.props.isEnabled).toBe(true);

                        jobSource.disable();
                        expect(jobSource.props.isEnabled).toBe(false);
                });

                it('should prevent ingestion when disabled', () => {
                        jobSource.disable();

                        const rawData: RawJobData = {
                                externalId: '127',
                                title: 'Developer',
                                company: 'Company',
                                url: 'https://example.com/job/127',
                                location: 'Remote',
                                publishedAt: new Date()
                        };

                        expect(() => jobSource.createListing(rawData)).toThrow();
                });

                it('should allow ingestion when enabled', () => {
                        jobSource.enable();

                        const rawData: RawJobData = {
                                externalId: '128',
                                title: 'Developer',
                                company: 'Company',
                                url: 'https://example.com/job/128',
                                location: 'Remote',
                                publishedAt: new Date()
                        };

                        const listing = jobSource.createListing(rawData);
                        expect(listing).toBeDefined();
                });
        });

        describe('State Consistency', () => {
                it('should maintain consistent state across operations', () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        // Initial state
                        expect(jobSource.props.isEnabled).toBe(true);
                        expect(jobSource.props.lastIngestedAt).toBeNull();

                        // Mark ingested
                        jobSource.markIngested();
                        expect(jobSource.props.lastIngestedAt).toBeDefined();

                        // Disable
                        jobSource.disable();
                        expect(jobSource.props.isEnabled).toBe(false);
                        expect(jobSource.props.lastIngestedAt).toBeDefined(); // Should still be there

                        // Re-enable
                        jobSource.enable();
                        expect(jobSource.props.isEnabled).toBe(true);
                        expect(jobSource.props.lastIngestedAt).toBeDefined(); // Should still be there
                });
        });
});
