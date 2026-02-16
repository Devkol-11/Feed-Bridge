/**
 * IngestJobSource Command Tests
 *
 * This test suite covers:
 * - Successful job ingestion from API
 * - Duplicate job handling (idempotency)
 * - Error handling during validation
 * - Partial failure handling
 * - Job source existence validation
 * - Marking source as ingested
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IngestJobSources } from './ingestJobSource/injestJobSourceHandler.js';
import { JobSource } from '../../domain/model/aggregates/jobSource.js';
import { JobListing } from '../../domain/model/entities/jobListing.js';
import { SourceFeedEnumType } from '../../domain/enums/domainEnums.js';
import { DomainExceptions } from '../../domain/exceptions/domainExceptions.js';
import { RawJobData } from '../ports/jobFetcherPort.js';

describe('IngestJobSource Command', () => {
        const mockJobSourceRepository: any = {
                findById: vi.fn(),
                save: vi.fn(),
                findAllActive: vi.fn()
        };

        const mockJobListingRepository: any = {
                save: vi.fn(),
                exists: vi.fn(),
                findAll: vi.fn()
        };

        const mockJobFetcher: any = {
                fetchJobs: vi.fn()
        };

        let ingestJobSource: IngestJobSources;

        beforeEach(() => {
                ingestJobSource = new IngestJobSources(mockJobSourceRepository, mockJobListingRepository);
                vi.clearAllMocks();
        });

        describe('Successful Ingestion', () => {
                it('should ingest jobs from a valid source', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobListingRepository.exists.mockResolvedValue(false);
                        mockJobListingRepository.save.mockResolvedValue(undefined);

                        const rawJobs: RawJobData[] = [
                                {
                                        externalId: '1',
                                        title: 'Developer',
                                        company: 'Company1',
                                        url: 'https://example.com/1',
                                        location: 'Remote',
                                        publishedAt: new Date()
                                }
                        ];

                        mockJobFetcher.fetchJobs.mockResolvedValue(rawJobs);

                        await ingestJobSource.execute({ sourceId: jobSource.id }, mockJobFetcher);

                        expect(mockJobListingRepository.save).toHaveBeenCalled();
                        expect(mockJobSourceRepository.save).toHaveBeenCalled();
                });

                it('should mark job source as ingested after successful ingestion', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobListingRepository.exists.mockResolvedValue(false);
                        mockJobListingRepository.save.mockResolvedValue(undefined);

                        const rawJobs: RawJobData[] = [
                                {
                                        externalId: '1',
                                        title: 'Developer',
                                        company: 'Company1',
                                        url: 'https://example.com/1',
                                        location: 'Remote',
                                        publishedAt: new Date()
                                }
                        ];

                        mockJobFetcher.fetchJobs.mockResolvedValue(rawJobs);

                        await ingestJobSource.execute({ sourceId: jobSource.id }, mockJobFetcher);

                        expect(jobSource.props.lastIngestedAt).toBeDefined();
                });

                it('should ingest multiple jobs successfully', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobListingRepository.exists.mockResolvedValue(false);
                        mockJobListingRepository.save.mockResolvedValue(undefined);

                        const rawJobs: RawJobData[] = Array.from({ length: 5 }, (_, i) => ({
                                externalId: `job-${i}`,
                                title: `Job ${i}`,
                                company: `Company ${i}`,
                                url: `https://example.com/${i}`,
                                location: 'Remote',
                                publishedAt: new Date()
                        }));

                        mockJobFetcher.fetchJobs.mockResolvedValue(rawJobs);

                        await ingestJobSource.execute({ sourceId: jobSource.id }, mockJobFetcher);

                        expect(mockJobListingRepository.save).toHaveBeenCalledTimes(5);
                });
        });

        describe('Idempotency - Duplicate Handling', () => {
                it('should skip jobs that already exist', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobListingRepository.exists
                                .mockResolvedValueOnce(true) // First job exists
                                .mockResolvedValueOnce(false); // Second job doesn't exist

                        mockJobListingRepository.save.mockResolvedValue(undefined);

                        const rawJobs: RawJobData[] = [
                                {
                                        externalId: 'existing-1',
                                        title: 'Existing Job',
                                        company: 'Company1',
                                        url: 'https://example.com/existing',
                                        location: 'Remote',
                                        publishedAt: new Date()
                                },
                                {
                                        externalId: 'new-1',
                                        title: 'New Job',
                                        company: 'Company2',
                                        url: 'https://example.com/new',
                                        location: 'Remote',
                                        publishedAt: new Date()
                                }
                        ];

                        mockJobFetcher.fetchJobs.mockResolvedValue(rawJobs);

                        await ingestJobSource.execute({ sourceId: jobSource.id }, mockJobFetcher);

                        // Should only save the new job, not the existing one
                        expect(mockJobListingRepository.save).toHaveBeenCalledTimes(1);
                });

                it('should check for existence using source ID and external ID', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobListingRepository.exists.mockResolvedValue(false);
                        mockJobListingRepository.save.mockResolvedValue(undefined);

                        const rawJobs: RawJobData[] = [
                                {
                                        externalId: 'ext-123',
                                        title: 'Job',
                                        company: 'Company',
                                        url: 'https://example.com/1',
                                        location: 'Remote',
                                        publishedAt: new Date()
                                }
                        ];

                        mockJobFetcher.fetchJobs.mockResolvedValue(rawJobs);

                        await ingestJobSource.execute({ sourceId: jobSource.id }, mockJobFetcher);

                        expect(mockJobListingRepository.exists).toHaveBeenCalledWith(jobSource.id, 'ext-123');
                });
        });

        describe('Error Handling', () => {
                it('should throw error when job source does not exist', async () => {
                        mockJobSourceRepository.findById.mockResolvedValue(null);

                        await expect(
                                ingestJobSource.execute({ sourceId: 'non-existent-id' }, mockJobFetcher)
                        ).rejects.toThrow(DomainExceptions.JobSourceNotFoundException);
                });

                it('should throw error if job validation fails', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobListingRepository.exists.mockResolvedValue(false);

                        // Simulate validation error
                        mockJobListingRepository.save.mockRejectedValue(new Error('Validation error'));

                        const rawJobs: RawJobData[] = [
                                {
                                        externalId: 'invalid-job',
                                        title: '', // Invalid empty title
                                        company: 'Company',
                                        url: 'https://example.com/1',
                                        location: 'Remote',
                                        publishedAt: new Date()
                                }
                        ];

                        mockJobFetcher.fetchJobs.mockResolvedValue(rawJobs);

                        await expect(
                                ingestJobSource.execute({ sourceId: jobSource.id }, mockJobFetcher)
                        ).rejects.toThrow();
                });

                it('should handle partial failures gracefully', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobListingRepository.exists.mockResolvedValue(false);

                        // First call succeeds, second fails
                        mockJobListingRepository.save
                                .mockResolvedValueOnce(undefined)
                                .mockRejectedValueOnce(new Error('Database error'));

                        const rawJobs: RawJobData[] = [
                                {
                                        externalId: '1',
                                        title: 'Job 1',
                                        company: 'Company1',
                                        url: 'https://example.com/1',
                                        location: 'Remote',
                                        publishedAt: new Date()
                                },
                                {
                                        externalId: '2',
                                        title: 'Job 2',
                                        company: 'Company2',
                                        url: 'https://example.com/2',
                                        location: 'Remote',
                                        publishedAt: new Date()
                                }
                        ];

                        mockJobFetcher.fetchJobs.mockResolvedValue(rawJobs);

                        await expect(
                                ingestJobSource.execute({ sourceId: jobSource.id }, mockJobFetcher)
                        ).rejects.toThrow();
                });
        });

        describe('Job Source State', () => {
                it('should fetch jobs using source baseUrl', async () => {
                        const baseUrl = 'https://custom-remotive.com/api/jobs';
                        const jobSource = JobSource.rehydrate({
                                id: 'source-123',
                                name: 'Custom Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: baseUrl,
                                isEnabled: true,
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobListingRepository.exists.mockResolvedValue(false);
                        mockJobListingRepository.save.mockResolvedValue(undefined);

                        const rawJobs: RawJobData[] = [];
                        mockJobFetcher.fetchJobs.mockResolvedValue(rawJobs);

                        await ingestJobSource.execute({ sourceId: 'source-123' }, mockJobFetcher);

                        expect(mockJobFetcher.fetchJobs).toHaveBeenCalledWith(baseUrl);
                });

                it('should work with disabled source initially', async () => {
                        const jobSource = JobSource.rehydrate({
                                id: 'source-123',
                                name: 'Disabled Source',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                isEnabled: false,
                                lastIngestedAt: null
                        });

                        // Re-enable for ingestion
                        jobSource.enable();

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobListingRepository.exists.mockResolvedValue(false);
                        mockJobListingRepository.save.mockResolvedValue(undefined);

                        const rawJobs: RawJobData[] = [
                                {
                                        externalId: '1',
                                        title: 'Job',
                                        company: 'Company',
                                        url: 'https://example.com/1',
                                        location: 'Remote',
                                        publishedAt: new Date()
                                }
                        ];

                        mockJobFetcher.fetchJobs.mockResolvedValue(rawJobs);

                        await ingestJobSource.execute({ sourceId: 'source-123' }, mockJobFetcher);

                        expect(mockJobListingRepository.save).toHaveBeenCalled();
                });
        });

        describe('Empty Results', () => {
                it('should handle empty job list from fetcher', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobFetcher.fetchJobs.mockResolvedValue([]);

                        await ingestJobSource.execute({ sourceId: jobSource.id }, mockJobFetcher);

                        expect(mockJobListingRepository.save).not.toHaveBeenCalled();
                        expect(mockJobSourceRepository.save).toHaveBeenCalled(); // Still mark as ingested
                });

                it('should handle all jobs already existing', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobListingRepository.exists.mockResolvedValue(true); // All exist
                        mockJobListingRepository.save.mockResolvedValue(undefined);

                        const rawJobs: RawJobData[] = Array.from({ length: 3 }, (_, i) => ({
                                externalId: `job-${i}`,
                                title: `Job ${i}`,
                                company: `Company ${i}`,
                                url: `https://example.com/${i}`,
                                location: 'Remote',
                                publishedAt: new Date()
                        }));

                        mockJobFetcher.fetchJobs.mockResolvedValue(rawJobs);

                        await ingestJobSource.execute({ sourceId: jobSource.id }, mockJobFetcher);

                        expect(mockJobListingRepository.save).not.toHaveBeenCalled();
                        expect(mockJobSourceRepository.save).toHaveBeenCalled();
                });
        });

        describe('Console Logging', () => {
                it('should log ingestion summary', async () => {
                        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobListingRepository.exists.mockResolvedValue(false);
                        mockJobListingRepository.save.mockResolvedValue(undefined);

                        const rawJobs: RawJobData[] = [
                                {
                                        externalId: '1',
                                        title: 'Job',
                                        company: 'Company',
                                        url: 'https://example.com/1',
                                        location: 'Remote',
                                        publishedAt: new Date()
                                }
                        ];

                        mockJobFetcher.fetchJobs.mockResolvedValue(rawJobs);

                        await ingestJobSource.execute({ sourceId: jobSource.id }, mockJobFetcher);

                        expect(consoleLogSpy).toHaveBeenCalled();
                });
        });
});
