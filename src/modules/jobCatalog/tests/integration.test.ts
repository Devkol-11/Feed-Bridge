/**
 * Job Ingestion and Catalog Integration Tests
 *
 * This test suite covers end-to-end workflows:
 * - Register a source -> Ingest jobs -> Query jobs
 * - Toggle source state during ingestion
 * - Cron-based periodic ingestion
 * - Error recovery and resilience
 * - Data consistency across operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RegisterJobSources } from '../../application/commands/registerJobSource/registerJobsSourceHandler.js';
import { IngestJobSources } from '../../application/commands/ingestJobSource/injestJobSourceHandler.js';
import { ToogleSourceState } from '../../application/commands/toogleJobSourceState/toogleSourceStateHandler.js';
import { FindJobs } from '../../application/queries/findJobs/findJobsHandler.js';
import { GetAllJobs } from '../../application/queries/getAllJobs/getAllJobsHandler.js';
import { jobIngestionCron } from '../../infrastructure/cron/jobIngestionCron.js';
import { JobSource } from '../../domain/model/aggregates/jobSource.js';
import { SourceFeedEnumType } from '../../domain/enums/domainEnums.js';
import { RawJobData } from '../../application/ports/jobFetcherPort.js';

describe('Job Ingestion & Catalog Context - Integration Tests', () => {
        const mockJobSourceRepository: any = {
                findById: vi.fn(),
                findByUrl: vi.fn(),
                save: vi.fn(),
                findAllActive: vi.fn()
        };

        const mockJobListingRepository: any = {
                save: vi.fn(),
                exists: vi.fn(),
                find: vi.fn(),
                findAll: vi.fn()
        };

        const mockJobFetcherFactory: any = {
                getFetcher: vi.fn()
        };

        let registerSource: RegisterJobSources;
        let ingestSource: IngestJobSources;
        let toggleState: ToogleSourceState;
        let findJobsQuery: FindJobs;
        let getAllJobsQuery: GetAllJobs;
        let cron: jobIngestionCron;

        beforeEach(() => {
                registerSource = new RegisterJobSources(mockJobSourceRepository);
                ingestSource = new IngestJobSources(mockJobSourceRepository, mockJobListingRepository);
                toggleState = new ToogleSourceState(mockJobSourceRepository);
                findJobsQuery = new FindJobs(mockJobListingRepository);
                getAllJobsQuery = new GetAllJobs(mockJobListingRepository);
                cron = new jobIngestionCron(mockJobSourceRepository, ingestSource, mockJobFetcherFactory);

                vi.clearAllMocks();
        });

        describe('Complete Job Ingestion Workflow', () => {
                it('should register source, ingest jobs, and query them', async () => {
                        // Step 1: Register a new job source
                        mockJobSourceRepository.findByUrl.mockResolvedValue(null);

                        const registrationResult = await registerSource.execute({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                adminId: 'admin-123'
                        });

                        const sourceId = registrationResult.id;
                        expect(sourceId).toBeDefined();

                        // Step 2: Retrieve the registered source
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

                        // Step 3: Ingest jobs
                        const rawJobs: RawJobData[] = [
                                {
                                        externalId: 'job-1',
                                        title: 'Senior Developer',
                                        company: 'TechCorp',
                                        url: 'https://example.com/job/1',
                                        location: 'Remote',
                                        category: 'IT',
                                        salary: '$100,000',
                                        publishedAt: new Date()
                                },
                                {
                                        externalId: 'job-2',
                                        title: 'DevOps Engineer',
                                        company: 'CloudInc',
                                        url: 'https://example.com/job/2',
                                        location: 'Remote',
                                        category: 'IT',
                                        salary: '$120,000',
                                        publishedAt: new Date()
                                }
                        ];

                        const mockAdapter = { fetchJobs: vi.fn().mockResolvedValue(rawJobs) };

                        await ingestSource.execute({ sourceId: jobSource.id }, mockAdapter);

                        expect(mockJobListingRepository.save).toHaveBeenCalledTimes(2);
                        expect(mockJobSourceRepository.save).toHaveBeenCalled();

                        // Step 4: Query ingested jobs
                        mockJobListingRepository.find.mockResolvedValue([
                                {
                                        id: 'listing-1',
                                        title: 'Senior Developer',
                                        company: 'TechCorp',
                                        category: 'IT',
                                        location: 'Remote',
                                        salary: '$100,000',
                                        type: 'Full-time',
                                        jobUrl: 'https://example.com/job/1',
                                        postedAt: new Date(),
                                        sourceName: 'Remotive'
                                }
                        ]);

                        const foundJobs = await findJobsQuery.execute({ category: 'IT' });

                        expect(foundJobs).toHaveLength(1);
                        expect(foundJobs[0].title).toBe('Senior Developer');
                });

                it('should prevent duplicate jobs during ingestion', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);

                        // First ingestion: job doesn't exist
                        mockJobListingRepository.exists.mockResolvedValueOnce(false);
                        mockJobListingRepository.save.mockResolvedValue(undefined);

                        const rawJobs: RawJobData[] = [
                                {
                                        externalId: 'job-1',
                                        title: 'Developer',
                                        company: 'Company',
                                        url: 'https://example.com/job',
                                        location: 'Remote',
                                        publishedAt: new Date()
                                }
                        ];

                        const mockAdapter = { fetchJobs: vi.fn().mockResolvedValue(rawJobs) };

                        await ingestSource.execute({ sourceId: jobSource.id }, mockAdapter);

                        expect(mockJobListingRepository.save).toHaveBeenCalledTimes(1);

                        // Second ingestion: same job already exists
                        vi.clearAllMocks();
                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobListingRepository.exists.mockResolvedValue(true); // Now it exists
                        mockJobListingRepository.save.mockResolvedValue(undefined);

                        await ingestSource.execute({ sourceId: jobSource.id }, mockAdapter);

                        // Should not save duplicate
                        expect(mockJobListingRepository.save).not.toHaveBeenCalled();
                });
        });

        describe('Source State Management', () => {
                it('should disable source and prevent ingestion', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobSourceRepository.save.mockResolvedValue(undefined);

                        // Disable source
                        await toggleState.execute({
                                sourceId: jobSource.id,
                                isEnabled: false
                        });

                        expect(jobSource.props.isEnabled).toBe(false);

                        // Try to ingest from disabled source
                        const rawJobs: RawJobData[] = [
                                {
                                        externalId: 'job-1',
                                        title: 'Developer',
                                        company: 'Company',
                                        url: 'https://example.com/job',
                                        location: 'Remote',
                                        publishedAt: new Date()
                                }
                        ];

                        const mockAdapter = { fetchJobs: vi.fn().mockResolvedValue(rawJobs) };

                        // Should throw because source is disabled
                        await expect(
                                ingestSource.execute({ sourceId: jobSource.id }, mockAdapter)
                        ).rejects.toThrow();
                });

                it('should re-enable source and resume ingestion', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        jobSource.disable();

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobSourceRepository.save.mockResolvedValue(undefined);

                        // Re-enable
                        await toggleState.execute({
                                sourceId: jobSource.id,
                                isEnabled: true
                        });

                        expect(jobSource.props.isEnabled).toBe(true);

                        // Now ingestion should work
                        mockJobListingRepository.exists.mockResolvedValue(false);
                        mockJobListingRepository.save.mockResolvedValue(undefined);

                        const rawJobs: RawJobData[] = [
                                {
                                        externalId: 'job-1',
                                        title: 'Developer',
                                        company: 'Company',
                                        url: 'https://example.com/job',
                                        location: 'Remote',
                                        publishedAt: new Date()
                                }
                        ];

                        const mockAdapter = { fetchJobs: vi.fn().mockResolvedValue(rawJobs) };

                        await ingestSource.execute({ sourceId: jobSource.id }, mockAdapter);

                        expect(mockJobListingRepository.save).toHaveBeenCalled();
                });
        });

        describe('Cron-Based Ingestion Workflow', () => {
                it('should ingest jobs on scheduled cron execution', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findAllActive.mockResolvedValue([jobSource]);
                        mockJobFetcherFactory.getFetcher.mockReturnValue({});
                        mockJobListingRepository.exists.mockResolvedValue(false);
                        mockJobListingRepository.save.mockResolvedValue(undefined);
                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);

                        const rawJobs: RawJobData[] = [
                                {
                                        externalId: 'job-1',
                                        title: 'Developer',
                                        company: 'Company',
                                        url: 'https://example.com/job',
                                        location: 'Remote',
                                        publishedAt: new Date()
                                }
                        ];

                        const mockAdapter = { fetchJobs: vi.fn().mockResolvedValue(rawJobs) };
                        mockJobFetcherFactory.getFetcher.mockReturnValue(mockAdapter);

                        await cron.run();

                        expect(mockJobListingRepository.save).toHaveBeenCalled();
                        expect(jobSource.props.lastIngestedAt).toBeDefined();
                });

                it('should handle hourly cron schedules with multiple sources', async () => {
                        const sources = [
                                JobSource.create({
                                        name: 'Remotive',
                                        type: SourceFeedEnumType.JSON,
                                        provider: 'remotive',
                                        baseUrl: 'https://remotive.com/api/remote-jobs',
                                        lastIngestedAt: new Date(Date.now() - 3600000)
                                }),
                                JobSource.create({
                                        name: 'WWR',
                                        type: SourceFeedEnumType.XML,
                                        provider: 'wwr',
                                        baseUrl: 'https://wwr.com/feed.xml',
                                        lastIngestedAt: new Date(Date.now() - 3600000)
                                })
                        ];

                        mockJobSourceRepository.findAllActive.mockResolvedValue(sources);
                        mockJobFetcherFactory.getFetcher.mockReturnValue({});

                        sources.forEach((source) => {
                                mockJobSourceRepository.findById.mockResolvedValueOnce(source);
                        });

                        mockJobListingRepository.exists.mockResolvedValue(false);
                        mockJobListingRepository.save.mockResolvedValue(undefined);

                        const mockAdapter = {
                                fetchJobs: vi.fn().mockResolvedValue([
                                        {
                                                externalId: 'job-1',
                                                title: 'Developer',
                                                company: 'Company',
                                                url: 'https://example.com/job',
                                                location: 'Remote',
                                                publishedAt: new Date()
                                        }
                                ])
                        };

                        mockJobFetcherFactory.getFetcher.mockReturnValue(mockAdapter);

                        await cron.run();

                        // Both sources should be ingested
                        expect(mockJobListingRepository.save).toHaveBeenCalled();
                });
        });

        describe('Query Integration', () => {
                it('should find jobs by category and location', async () => {
                        mockJobListingRepository.find.mockResolvedValue([
                                {
                                        id: 'listing-1',
                                        title: 'Senior Developer',
                                        company: 'TechCorp',
                                        category: 'IT',
                                        location: 'Remote',
                                        salary: '$100,000',
                                        type: 'Full-time',
                                        jobUrl: 'https://example.com/job/1',
                                        postedAt: new Date(),
                                        sourceName: 'Remotive'
                                },
                                {
                                        id: 'listing-2',
                                        title: 'Backend Engineer',
                                        company: 'TechCorp',
                                        category: 'IT',
                                        location: 'Remote',
                                        salary: '$110,000',
                                        type: 'Full-time',
                                        jobUrl: 'https://example.com/job/2',
                                        postedAt: new Date(),
                                        sourceName: 'Remotive'
                                }
                        ]);

                        const jobs = await findJobsQuery.execute({
                                category: 'IT',
                                location: 'Remote',
                                page: 1
                        });

                        expect(jobs).toHaveLength(2);
                        jobs.forEach((job) => {
                                expect(job.category).toBe('IT');
                                expect(job.location).toBe('Remote');
                        });
                });

                it('should get all jobs with pagination', async () => {
                        const mockJobs = Array.from({ length: 20 }, (_, i) => ({
                                id: `listing-${i}`,
                                title: `Job ${i}`,
                                company: `Company ${i}`,
                                category: 'IT',
                                location: 'Remote',
                                salary: '$100,000',
                                type: 'Full-time',
                                jobUrl: `https://example.com/job/${i}`,
                                postedAt: new Date(),
                                sourceName: 'Remotive'
                        }));

                        mockJobListingRepository.findAll.mockResolvedValue(mockJobs);

                        const allJobs = await getAllJobsQuery.execute({ page: 1 });

                        expect(allJobs).toHaveLength(20);
                });
        });

        describe('Error Recovery', () => {
                it('should recover from adapter errors gracefully', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);

                        const mockAdapter = {
                                fetchJobs: vi.fn().mockRejectedValue(new Error('API Error'))
                        };

                        // Should handle the error
                        await ingestSource.execute({ sourceId: jobSource.id }, mockAdapter);

                        // Source should still be marked as attempting ingestion
                        expect(mockJobSourceRepository.save).toHaveBeenCalled();
                });

                it('should continue cron execution despite single source failure', async () => {
                        const sources = [
                                JobSource.create({
                                        name: 'Remotive',
                                        type: SourceFeedEnumType.JSON,
                                        provider: 'remotive',
                                        baseUrl: 'https://remotive.com/api/remote-jobs',
                                        lastIngestedAt: null
                                }),
                                JobSource.create({
                                        name: 'WWR',
                                        type: SourceFeedEnumType.XML,
                                        provider: 'wwr',
                                        baseUrl: 'https://wwr.com/feed.xml',
                                        lastIngestedAt: null
                                })
                        ];

                        mockJobSourceRepository.findAllActive.mockResolvedValue(sources);
                        mockJobFetcherFactory.getFetcher.mockReturnValue({});

                        let callCount = 0;
                        mockJobSourceRepository.findById.mockImplementation(async (id) => {
                                callCount++;
                                if (callCount === 1) {
                                        throw new Error('Database error');
                                }
                                return sources[1];
                        });

                        mockJobListingRepository.exists.mockResolvedValue(false);
                        mockJobListingRepository.save.mockResolvedValue(undefined);

                        const mockAdapter = {
                                fetchJobs: vi.fn().mockResolvedValue([])
                        };

                        mockJobFetcherFactory.getFetcher.mockReturnValue(mockAdapter);

                        // Should not throw despite first source error
                        await cron.run();
                });
        });

        describe('Data Consistency', () => {
                it('should maintain data consistency across register, ingest, and query', async () => {
                        const sourceBaseUrl = 'https://test.com/api/jobs';
                        const jobData: RawJobData = {
                                externalId: 'unique-123',
                                title: 'Senior Developer',
                                company: 'TestCorp',
                                url: 'https://test.com/job/123',
                                location: 'Remote',
                                category: 'Software Engineering',
                                salary: '$150,000',
                                publishedAt: new Date('2024-01-15')
                        };

                        // Step 1: Register
                        mockJobSourceRepository.findByUrl.mockResolvedValue(null);

                        const registeredSource = JobSource.create({
                                name: 'Test Source',
                                type: SourceFeedEnumType.JSON,
                                provider: 'test',
                                baseUrl: sourceBaseUrl,
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(registeredSource);

                        // Step 2: Ingest
                        mockJobListingRepository.exists.mockResolvedValue(false);
                        mockJobListingRepository.save.mockResolvedValue(undefined);

                        const mockAdapter = { fetchJobs: vi.fn().mockResolvedValue([jobData]) };

                        await ingestSource.execute({ sourceId: registeredSource.id }, mockAdapter);

                        // Step 3: Query
                        mockJobListingRepository.find.mockResolvedValue([
                                {
                                        id: 'listing-123',
                                        title: jobData.title,
                                        company: jobData.company,
                                        category: jobData.category,
                                        location: jobData.location,
                                        salary: jobData.salary,
                                        type: 'Full-time',
                                        jobUrl: jobData.url,
                                        postedAt: jobData.publishedAt,
                                        sourceName: 'Test Source'
                                }
                        ]);

                        const foundJobs = await findJobsQuery.execute({ category: 'Software Engineering' });

                        expect(foundJobs[0].title).toBe(jobData.title);
                        expect(foundJobs[0].company).toBe(jobData.company);
                        expect(foundJobs[0].salary).toBe(jobData.salary);
                });
        });

        describe('Multi-Source Scenarios', () => {
                it('should handle multiple job sources from different providers', async () => {
                        const remotiveSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        const wwrSource = JobSource.create({
                                name: 'WWR',
                                type: SourceFeedEnumType.XML,
                                provider: 'wwr',
                                baseUrl: 'https://wwr.com/feed.xml',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findAllActive.mockResolvedValue([remotiveSource, wwrSource]);
                        mockJobFetcherFactory.getFetcher.mockReturnValue({});

                        mockJobSourceRepository.findById
                                .mockResolvedValueOnce(remotiveSource)
                                .mockResolvedValueOnce(wwrSource);

                        mockJobListingRepository.exists.mockResolvedValue(false);
                        mockJobListingRepository.save.mockResolvedValue(undefined);

                        const mockRemotiveAdapter = {
                                fetchJobs: vi.fn().mockResolvedValue([
                                        {
                                                externalId: 'remotive-1',
                                                title: 'Remote Developer',
                                                company: 'TechCorp',
                                                url: 'https://remotive.com/job/1',
                                                location: 'Remote',
                                                publishedAt: new Date()
                                        }
                                ])
                        };

                        const mockWwrAdapter = {
                                fetchJobs: vi.fn().mockResolvedValue([
                                        {
                                                externalId: 'wwr-1',
                                                title: 'Backend Engineer',
                                                company: 'CloudInc',
                                                url: 'https://wwr.com/job/1',
                                                location: 'Remote',
                                                publishedAt: new Date()
                                        }
                                ])
                        };

                        mockJobFetcherFactory.getFetcher
                                .mockReturnValueOnce(mockRemotiveAdapter)
                                .mockReturnValueOnce(mockWwrAdapter);

                        await cron.run();

                        expect(mockJobListingRepository.save).toHaveBeenCalledTimes(2);
                });
        });
});
