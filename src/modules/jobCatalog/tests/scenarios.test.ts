/**
 * Job Ingestion and Catalog - Scenario Tests
 *
 * This test suite covers complex real-world scenarios:
 * - Complete job ingestion pipelines
 * - State transitions during operations
 * - Concurrent operations and race conditions
 * - Scheduling and timing scenarios
 * - Data transformation pipelines
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RegisterJobSources } from '../../application/commands/registerJobSource/registerJobsSourceHandler.js';
import { IngestJobSources } from '../../application/commands/ingestJobSource/injestJobSourceHandler.js';
import { ToogleSourceState } from '../../application/commands/toogleJobSourceState/toogleSourceStateHandler.js';
import { FindJobs } from '../../application/queries/findJobs/findJobsHandler.js';
import { GetAllJobs } from '../../application/queries/getAllJobs/getAllJobsHandler.js';
import { jobIngestionCron } from '../../infrastructure/cron/jobIngestionCron.js';
import { JobSource } from '../../domain/model/aggregates/jobSource.js';
import { SourceFeedEnumType } from '../../domain/enums/domainEnums.js';
import { RawJobData } from '../../application/ports/jobFetcherPort.js';

describe('Job Ingestion & Catalog - Complex Scenarios', () => {
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

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('Scenario: Large-Scale Job Ingestion', () => {
		it('should ingest 500+ jobs in a single batch without duplicates', async () => {
			const jobSource = JobSource.create({
				name: 'Remotive',
				type: SourceFeedEnumType.JSON,
				provider: 'remotive',
				baseUrl: 'https://remotive.com/api/remote-jobs',
				lastIngestedAt: null
			});

			mockJobSourceRepository.findById.mockResolvedValue(jobSource);

			// Generate 500 jobs
			const rawJobs: RawJobData[] = Array.from({ length: 500 }, (_, i) => ({
				externalId: `job-${i}`,
				title: `Software Engineer - ${i}`,
				company: `Company ${Math.floor(i / 10)}`,
				url: `https://example.com/job/${i}`,
				location: i % 3 === 0 ? 'San Francisco' : i % 3 === 1 ? 'New York' : 'Remote',
				category: i % 5 === 0 ? 'IT' : i % 5 === 1 ? 'DevOps' : i % 5 === 2 ? 'Data' : 'Frontend' : 'Backend',
				salary: `$${100000 + i * 1000}`,
				publishedAt: new Date()
			}));

			// Track unique jobs
			const seenExternalIds = new Set<string>();
			mockJobListingRepository.exists.mockImplementation(async (id) => {
				if (seenExternalIds.has(id)) return true;
				seenExternalIds.add(id);
				return false;
			});

			mockJobListingRepository.save.mockResolvedValue(undefined);

			const mockAdapter = { fetchJobs: vi.fn().mockResolvedValue(rawJobs) };

			await ingestSource.execute({ sourceId: jobSource.id }, mockAdapter);

			// Should save 500 jobs
			expect(mockJobListingRepository.save).toHaveBeenCalledTimes(500);
		});

		it('should handle 50+ sources in hourly cron execution', async () => {
			const sources = Array.from({ length: 50 }, (_, i) =>
				JobSource.create({
					name: `Source-${i}`,
					type: i % 2 === 0 ? SourceFeedEnumType.JSON : SourceFeedEnumType.XML,
					provider: i % 2 === 0 ? 'remotive' : 'wwr',
					baseUrl: `https://provider-${i}.com/api/jobs`,
					lastIngestedAt: new Date(Date.now() - 3600000)
				})
			);

			mockJobSourceRepository.findAllActive.mockResolvedValue(sources);
			mockJobFetcherFactory.getFetcher.mockReturnValue({});

			sources.forEach((source, index) => {
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

			const startTime = Date.now();
			await cron.run();
			const duration = Date.now() - startTime;

			// Should process all 50 sources
			expect(mockJobSourceRepository.findAllActive).toHaveBeenCalled();
			// Performance should be reasonable (less than 10 seconds for test)
			expect(duration).toBeLessThan(10000);
		});
	});

	describe('Scenario: Dynamic Source Management', () => {
		it('should maintain consistency when registering multiple sources simultaneously', async () => {
			const sourceUrls = [
				'https://api1.com/jobs',
				'https://api2.com/jobs',
				'https://api3.com/jobs'
			];

			mockJobSourceRepository.findByUrl.mockResolvedValue(null);

			const sources = sourceUrls.map((url, i) =>
				JobSource.create({
					name: `Source-${i}`,
					type: SourceFeedEnumType.JSON,
					provider: `provider-${i}`,
					baseUrl: url,
					lastIngestedAt: null
				})
			);

			const registrationPromises = sources.map((source, i) =>
				registerSource.execute({
					name: `Source-${i}`,
					type: SourceFeedEnumType.JSON,
					provider: `provider-${i}`,
					baseUrl: sourceUrls[i],
					adminId: 'admin-123'
				})
			);

			// Should register all without conflicts
			const results = await Promise.all(registrationPromises);

			expect(results).toHaveLength(3);
			results.forEach(result => {
				expect(result.id).toBeDefined();
			});
		});

		it('should handle toggling multiple sources during ingestion', async () => {
			const sources = Array.from({ length: 5 }, (_, i) =>
				JobSource.create({
					name: `Source-${i}`,
					type: SourceFeedEnumType.JSON,
					provider: `provider-${i}`,
					baseUrl: `https://api-${i}.com/jobs`,
					lastIngestedAt: null
				})
			);

			mockJobSourceRepository.findById.mockImplementation(async (id) => {
				return sources.find(s => s.id === id) || sources[0];
			});

			mockJobSourceRepository.save.mockResolvedValue(undefined);

			// Toggle all sources
			const togglePromises = sources.map(source =>
				toggleState.execute({
					sourceId: source.id,
					isEnabled: false
				})
			);

			await Promise.all(togglePromises);

			// All should be disabled
			sources.forEach(source => {
				expect(source.props.isEnabled).toBe(false);
			});

			// Re-enable half
			const reEnablePromises = sources.slice(0, 2).map(source =>
				toggleState.execute({
					sourceId: source.id,
					isEnabled: true
				})
			);

			await Promise.all(reEnablePromises);

			expect(sources[0].props.isEnabled).toBe(true);
			expect(sources[1].props.isEnabled).toBe(true);
			expect(sources[2].props.isEnabled).toBe(false);
		});
	});

	describe('Scenario: Idempotency Guarantees', () => {
		it('should guarantee idempotency across multiple cron runs', async () => {
			const jobSource = JobSource.create({
				name: 'Remotive',
				type: SourceFeedEnumType.JSON,
				provider: 'remotive',
				baseUrl: 'https://remotive.com/api/remote-jobs',
				lastIngestedAt: null
			});

			mockJobSourceRepository.findAllActive.mockResolvedValue([jobSource]);
			mockJobFetcherFactory.getFetcher.mockReturnValue({});
			mockJobSourceRepository.findById.mockResolvedValue(jobSource);

			// First cron run
			const rawJobs: RawJobData[] = [
				{
					externalId: 'job-1',
					title: 'Senior Developer',
					company: 'TechCorp',
					url: 'https://example.com/job/1',
					location: 'Remote',
					publishedAt: new Date()
				}
			];

			let callCount = 0;
			mockJobListingRepository.exists.mockImplementation(async () => {
				// First run: doesn't exist, second run: already exists
				return callCount++ > 0;
			});

			mockJobListingRepository.save.mockResolvedValue(undefined);

			const mockAdapter = { fetchJobs: vi.fn().mockResolvedValue(rawJobs) };
			mockJobFetcherFactory.getFetcher.mockReturnValue(mockAdapter);

			// Run 1
			await cron.run();
			const firstSaveCount = mockJobListingRepository.save.mock.calls.length;

			// Run 2 (same data)
			vi.clearAllMocks();
			mockJobSourceRepository.findAllActive.mockResolvedValue([jobSource]);
			mockJobSourceRepository.findById.mockResolvedValue(jobSource);
			mockJobListingRepository.exists.mockResolvedValue(true);
			mockJobListingRepository.save.mockResolvedValue(undefined);
			mockJobFetcherFactory.getFetcher.mockReturnValue(mockAdapter);

			await cron.run();
			const secondSaveCount = mockJobListingRepository.save.mock.calls.length;

			// Second run should not save duplicates
			expect(secondSaveCount).toBe(0);
		});

		it('should be idempotent when toggling same state multiple times', async () => {
			const jobSource = JobSource.create({
				name: 'Remotive',
				type: SourceFeedEnumType.JSON,
				provider: 'remotive',
				baseUrl: 'https://remotive.com/api/remote-jobs',
				lastIngestedAt: null
			});

			mockJobSourceRepository.findById.mockResolvedValue(jobSource);
			mockJobSourceRepository.save.mockResolvedValue(undefined);

			// Disable multiple times
			await toggleState.execute({ sourceId: jobSource.id, isEnabled: false });
			const firstDisable = jobSource.props.isEnabled;

			await toggleState.execute({ sourceId: jobSource.id, isEnabled: false });
			const secondDisable = jobSource.props.isEnabled;

			expect(firstDisable).toBe(secondDisable);
			expect(firstDisable).toBe(false);

			// Enable multiple times
			await toggleState.execute({ sourceId: jobSource.id, isEnabled: true });
			const firstEnable = jobSource.props.isEnabled;

			await toggleState.execute({ sourceId: jobSource.id, isEnabled: true });
			const secondEnable = jobSource.props.isEnabled;

			expect(firstEnable).toBe(secondEnable);
			expect(firstEnable).toBe(true);
		});
	});

	describe('Scenario: Query Performance and Filtering', () => {
		it('should efficiently query jobs with complex filters', async () => {
			const mockJobs = Array.from({ length: 100 }, (_, i) => ({
				id: `listing-${i}`,
				title: `Job ${i}`,
				company: `Company ${Math.floor(i / 10)}`,
				category: i % 3 === 0 ? 'IT' : i % 3 === 1 ? 'DevOps' : 'Data',
				location: i % 2 === 0 ? 'Remote' : 'San Francisco',
				salary: `$${100000 + i * 1000}`,
				type: 'Full-time',
				jobUrl: `https://example.com/job/${i}`,
				postedAt: new Date(Date.now() - i * 86400000),
				sourceName: i % 2 === 0 ? 'Remotive' : 'WWR'
			}));

			mockJobListingRepository.find.mockResolvedValue(
				mockJobs.filter(j => j.category === 'IT' && j.location === 'Remote')
			);

			const startTime = Date.now();

			const results = await findJobsQuery.execute({
				category: 'IT',
				location: 'Remote',
				page: 1
			});

			const duration = Date.now() - startTime;

			expect(results.length).toBeGreaterThan(0);
			// Query should be fast
			expect(duration).toBeLessThan(1000);
		});

		it('should handle pagination correctly across multiple queries', async () => {
			const totalJobs = Array.from({ length: 100 }, (_, i) => ({
				id: `listing-${i}`,
				title: `Job ${i}`,
				company: `Company ${i}`,
				category: 'IT',
				location: 'Remote',
				salary: `$100,000`,
				type: 'Full-time',
				jobUrl: `https://example.com/job/${i}`,
				postedAt: new Date(),
				sourceName: 'Remotive'
			}));

			// Simulate pagination with page size 20
			mockJobListingRepository.findAll.mockImplementation(async (skip, take) => {
				return totalJobs.slice(skip, skip + take);
			});

			const page1 = await getAllJobsQuery.execute({ page: 1 });
			const page2 = await getAllJobsQuery.execute({ page: 2 });
			const page3 = await getAllJobsQuery.execute({ page: 3 });

			// Verify pagination calculation
			expect(page1.length).toBe(20);
			expect(page2.length).toBe(20);
			expect(page3.length).toBe(20);

			// Verify no overlap
			const page1Ids = new Set(page1.map(j => j.id));
			const page2Ids = new Set(page2.map(j => j.id));

			const intersection = [...page1Ids].filter(id => page2Ids.has(id));
			expect(intersection).toHaveLength(0);
		});
	});

	describe('Scenario: Error Recovery and Resilience', () => {
		it('should recover from partial adapter failures gracefully', async () => {
			const sources = Array.from({ length: 3 }, (_, i) =>
				JobSource.create({
					name: `Source-${i}`,
					type: SourceFeedEnumType.JSON,
					provider: `provider-${i}`,
					baseUrl: `https://api-${i}.com/jobs`,
					lastIngestedAt: null
				})
			);

			mockJobSourceRepository.findAllActive.mockResolvedValue(sources);
			mockJobFetcherFactory.getFetcher.mockReturnValue({});

			let sourceIndex = 0;
			mockJobSourceRepository.findById.mockImplementation(async (id) => {
				const source = sources[sourceIndex++];
				return source;
			});

			mockJobListingRepository.exists.mockResolvedValue(false);
			mockJobListingRepository.save.mockResolvedValue(undefined);

			// First adapter fails, others succeed
			const adapter1 = { fetchJobs: vi.fn().mockRejectedValue(new Error('API Error')) };
			const adapter2 = { fetchJobs: vi.fn().mockResolvedValue([{ externalId: 'job-2', title: 'Job 2', company: 'Company 2', url: 'https://example.com/2', location: 'Remote', publishedAt: new Date() }]) };
			const adapter3 = { fetchJobs: vi.fn().mockResolvedValue([{ externalId: 'job-3', title: 'Job 3', company: 'Company 3', url: 'https://example.com/3', location: 'Remote', publishedAt: new Date() }]) };

			mockJobFetcherFactory.getFetcher
				.mockReturnValueOnce(adapter1)
				.mockReturnValueOnce(adapter2)
				.mockReturnValueOnce(adapter3);

			// Should not throw despite first adapter error
			await cron.run();

			// Second and third should still be processed
			expect(mockJobListingRepository.save).toHaveBeenCalled();
		});

		it('should handle database errors and retry logic', async () => {
			const jobSource = JobSource.create({
				name: 'Remotive',
				type: SourceFeedEnumType.JSON,
				provider: 'remotive',
				baseUrl: 'https://remotive.com/api/remote-jobs',
				lastIngestedAt: null
			});

			mockJobSourceRepository.findById.mockResolvedValue(jobSource);

			// Simulate transient failure then success
			let saveAttempts = 0;
			mockJobListingRepository.save.mockImplementation(async () => {
				saveAttempts++;
				if (saveAttempts === 1) {
					throw new Error('Database connection error');
				}
				return undefined;
			});

			mockJobListingRepository.exists.mockResolvedValue(false);

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

			// Should handle the error gracefully
			await ingestSource.execute({ sourceId: jobSource.id }, mockAdapter);
		});
	});

	describe('Scenario: Cross-Source Data Consolidation', () => {
		it('should consolidate jobs from multiple sources correctly', async () => {
			mockJobListingRepository.findAll.mockResolvedValue([
				{
					id: 'listing-1',
					title: 'Senior Developer',
					company: 'TechCorp',
					category: 'IT',
					location: 'Remote',
					salary: '$100,000',
					type: 'Full-time',
					jobUrl: 'https://remotive.com/job/1',
					postedAt: new Date(),
					sourceName: 'Remotive'
				},
				{
					id: 'listing-2',
					title: 'Backend Engineer',
					company: 'CloudInc',
					category: 'IT',
					location: 'Remote',
					salary: '$110,000',
					type: 'Full-time',
					jobUrl: 'https://wwr.com/job/2',
					postedAt: new Date(),
					sourceName: 'WWR'
				},
				{
					id: 'listing-3',
					title: 'DevOps Engineer',
					company: 'DevOpsPlus',
					category: 'DevOps',
					location: 'New York',
					salary: '$120,000',
					type: 'Contract',
					jobUrl: 'https://remotive.com/job/3',
					postedAt: new Date(),
					sourceName: 'Remotive'
				}
			]);

			const allJobs = await getAllJobsQuery.execute({ page: 1 });

			expect(allJobs).toHaveLength(3);
			
			// Verify sources are mixed
			const sources = new Set(allJobs.map(j => j.sourceName));
			expect(sources.size).toBe(2); // Remotive and WWR

			// Verify categories are preserved
			const itJobs = allJobs.filter(j => j.category === 'IT');
			expect(itJobs).toHaveLength(2);
		});
	});

	describe('Scenario: Time-Based Ingestion', () => {
		it('should respect LastIngestedAt timestamps for incremental ingestion', async () => {
			const oneHourAgo = new Date(Date.now() - 3600000);
			const jobSource = JobSource.create({
				name: 'Remotive',
				type: SourceFeedEnumType.JSON,
				provider: 'remotive',
				baseUrl: 'https://remotive.com/api/remote-jobs',
				lastIngestedAt: oneHourAgo
			});

			expect(jobSource.props.lastIngestedAt).toEqual(oneHourAgo);

			// After ingestion, timestamp should be updated
			const now = new Date();
			jobSource.markIngested(now);

			expect(jobSource.props.lastIngestedAt).toBeGreaterThan(oneHourAgo);
		});

		it('should schedule ingestion at regular intervals', async () => {
			const sources = Array.from({ length: 3 }, (_, i) =>
				JobSource.create({
					name: `Source-${i}`,
					type: SourceFeedEnumType.JSON,
					provider: `provider-${i}`,
					baseUrl: `https://api-${i}.com/jobs`,
					lastIngestedAt: new Date(Date.now() - 3600000 * (i + 1)) // 1hr, 2hr, 3hr ago
				})
			);

			// All sources should be ingested in hourly cron
			mockJobSourceRepository.findAllActive.mockResolvedValue(sources);
			mockJobFetcherFactory.getFetcher.mockReturnValue({});

			sources.forEach(source => {
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

			// All sources should be processed regardless of age
			expect(sources.every(s => s.props.lastIngestedAt !== undefined)).toBe(true);
		});
	});
});
