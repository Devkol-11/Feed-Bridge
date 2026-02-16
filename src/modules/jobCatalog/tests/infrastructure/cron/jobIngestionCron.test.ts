/**
 * Job Ingestion Cron Tests
 *
 * This test suite covers:
 * - Cron job execution
 * - Active job source retrieval
 * - Adapter fetching based on provider
 * - Error handling and partial failures
 * - Ingestion of jobs from all sources
 * - Timing and scheduling requirements
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { jobIngestionCron } from './jobIngestionCron.js';
import { JobSource } from '../../domain/model/aggregates/jobSource.js';
import { IngestJobSources } from '../../application/commands/ingestJobSource/injestJobSourceHandler.js';
import { SourceFeedEnumType } from '../../domain/enums/domainEnums.js';
import { JobFetcherFactory } from '../factories/jobFetcherFactory.js';

describe('Job Ingestion Cron', () => {
        const mockJobSourceRepository: any = {
                findAllActive: vi.fn()
        };

        const mockIngestionUseCase: any = {
                execute: vi.fn()
        };

        const mockJobFetcherFactory: any = {
                getFetcher: vi.fn()
        };

        let cron: jobIngestionCron;

        beforeEach(() => {
                cron = new jobIngestionCron(
                        mockJobSourceRepository,
                        mockIngestionUseCase,
                        mockJobFetcherFactory
                );
                vi.clearAllMocks();
        });

        describe('Cron Execution', () => {
                it('should retrieve active job sources on run', async () => {
                        mockJobSourceRepository.findAllActive.mockResolvedValue([]);

                        await cron.run();

                        expect(mockJobSourceRepository.findAllActive).toHaveBeenCalled();
                });

                it('should throw error when no active sources', async () => {
                        mockJobSourceRepository.findAllActive.mockResolvedValue(null);

                        await expect(cron.run()).rejects.toThrow('No Active Job Sources At the moment');
                });

                it('should ingesta single active source', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findAllActive.mockResolvedValue([jobSource]);
                        mockJobFetcherFactory.getFetcher.mockReturnValue({});
                        mockIngestionUseCase.execute.mockResolvedValue(undefined);

                        await cron.run();

                        expect(mockIngestionUseCase.execute).toHaveBeenCalledTimes(1);
                });

                it('should ingest multiple active sources', async () => {
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
                        mockIngestionUseCase.execute.mockResolvedValue(undefined);

                        await cron.run();

                        expect(mockIngestionUseCase.execute).toHaveBeenCalledTimes(2);
                });
        });

        describe('Adapter Factory', () => {
                it('should get adapter based on provider name', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findAllActive.mockResolvedValue([jobSource]);
                        mockJobFetcherFactory.getFetcher.mockReturnValue({});
                        mockIngestionUseCase.execute.mockResolvedValue(undefined);

                        await cron.run();

                        expect(mockJobFetcherFactory.getFetcher).toHaveBeenCalledWith('REMOTIVE');
                });

                it('should get different adapters for different providers', async () => {
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
                        mockIngestionUseCase.execute.mockResolvedValue(undefined);

                        await cron.run();

                        expect(mockJobFetcherFactory.getFetcher).toHaveBeenCalledWith('REMOTIVE');
                        expect(mockJobFetcherFactory.getFetcher).toHaveBeenCalledWith('WWR');
                });

                it('should use uppercase provider name', async () => {
                        const jobSource = JobSource.rehydrate({
                                id: 'source-1',
                                name: 'Custom Source',
                                type: SourceFeedEnumType.JSON,
                                provider: 'custom_provider',
                                baseUrl: 'https://custom.com/api',
                                isEnabled: true,
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findAllActive.mockResolvedValue([jobSource]);
                        mockJobFetcherFactory.getFetcher.mockReturnValue({});
                        mockIngestionUseCase.execute.mockResolvedValue(undefined);

                        await cron.run();

                        expect(mockJobFetcherFactory.getFetcher).toHaveBeenCalledWith('CUSTOM_PROVIDER');
                });
        });

        describe('Use Case Execution', () => {
                it('should pass source ID to ingestion use case', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findAllActive.mockResolvedValue([jobSource]);
                        mockJobFetcherFactory.getFetcher.mockReturnValue({});
                        mockIngestionUseCase.execute.mockResolvedValue(undefined);

                        await cron.run();

                        const callArg = mockIngestionUseCase.execute.mock.calls[0][0];
                        expect(callArg.sourceId).toBe(jobSource.id);
                });

                it('should pass adapter to ingestion use case', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        const mockAdapter = { fetchJobs: vi.fn() };

                        mockJobSourceRepository.findAllActive.mockResolvedValue([jobSource]);
                        mockJobFetcherFactory.getFetcher.mockReturnValue(mockAdapter);
                        mockIngestionUseCase.execute.mockResolvedValue(undefined);

                        await cron.run();

                        const secondArg = mockIngestionUseCase.execute.mock.calls[0][1];
                        expect(secondArg).toBe(mockAdapter);
                });

                it('should ingest all sources in sequence', async () => {
                        const sources = [
                                JobSource.create({
                                        name: 'Source 1',
                                        type: SourceFeedEnumType.JSON,
                                        provider: 'provider1',
                                        baseUrl: 'https://source1.com',
                                        lastIngestedAt: null
                                }),
                                JobSource.create({
                                        name: 'Source 2',
                                        type: SourceFeedEnumType.JSON,
                                        provider: 'provider2',
                                        baseUrl: 'https://source2.com',
                                        lastIngestedAt: null
                                }),
                                JobSource.create({
                                        name: 'Source 3',
                                        type: SourceFeedEnumType.JSON,
                                        provider: 'provider3',
                                        baseUrl: 'https://source3.com',
                                        lastIngestedAt: null
                                })
                        ];

                        mockJobSourceRepository.findAllActive.mockResolvedValue(sources);
                        mockJobFetcherFactory.getFetcher.mockReturnValue({});
                        mockIngestionUseCase.execute.mockResolvedValue(undefined);

                        await cron.run();

                        expect(mockIngestionUseCase.execute).toHaveBeenCalledTimes(3);
                });
        });

        describe('Error Handling', () => {
                it('should catch errors from individual source ingestion', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findAllActive.mockResolvedValue([jobSource]);
                        mockJobFetcherFactory.getFetcher.mockReturnValue({});
                        mockIngestionUseCase.execute.mockRejectedValue(new Error('Ingestion failed'));

                        // Should not throw, but catch internally
                        await expect(cron.run()).resolves.not.toThrow();
                });

                it('should log errors for individual sources', async () => {
                        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findAllActive.mockResolvedValue([jobSource]);
                        mockJobFetcherFactory.getFetcher.mockReturnValue({});
                        mockIngestionUseCase.execute.mockRejectedValue(new Error('Ingestion failed'));

                        await cron.run();

                        expect(consoleErrorSpy).toHaveBeenCalled();
                });

                it('should continue ingesting other sources after one fails', async () => {
                        const sources = [
                                JobSource.create({
                                        name: 'Source 1',
                                        type: SourceFeedEnumType.JSON,
                                        provider: 'provider1',
                                        baseUrl: 'https://source1.com',
                                        lastIngestedAt: null
                                }),
                                JobSource.create({
                                        name: 'Source 2',
                                        type: SourceFeedEnumType.JSON,
                                        provider: 'provider2',
                                        baseUrl: 'https://source2.com',
                                        lastIngestedAt: null
                                })
                        ];

                        mockJobSourceRepository.findAllActive.mockResolvedValue(sources);
                        mockJobFetcherFactory.getFetcher.mockReturnValue({});

                        // First fails, second succeeds
                        mockIngestionUseCase.execute
                                .mockRejectedValueOnce(new Error('First failed'))
                                .mockResolvedValueOnce(undefined);

                        await cron.run();

                        expect(mockIngestionUseCase.execute).toHaveBeenCalledTimes(2);
                });

                it('should handle missing job fetcher gracefully', async () => {
                        const jobSource = JobSource.create({
                                name: 'UnknownProvider',
                                type: SourceFeedEnumType.JSON,
                                provider: 'unknown',
                                baseUrl: 'https://unknown.com',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findAllActive.mockResolvedValue([jobSource]);
                        mockJobFetcherFactory.getFetcher.mockImplementation(() => {
                                throw new Error('Unknown provider');
                        });

                        await expect(cron.run()).resolves.not.toThrow();
                });
        });

        describe('Activity Logging', () => {
                it('should log when starting ingestion for source', async () => {
                        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findAllActive.mockResolvedValue([jobSource]);
                        mockJobFetcherFactory.getFetcher.mockReturnValue({});
                        mockIngestionUseCase.execute.mockRejectedValue(new Error('Test error'));

                        await cron.run();

                        expect(consoleErrorSpy).toHaveBeenCalled();
                });
        });

        describe('Cron Scheduling Scenario', () => {
                it('should handle hourly ingestion cycle', async () => {
                        const remotiveSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: new Date(Date.now() - 3600000) // 1 hour ago
                        });

                        mockJobSourceRepository.findAllActive.mockResolvedValue([remotiveSource]);
                        mockJobFetcherFactory.getFetcher.mockReturnValue({});
                        mockIngestionUseCase.execute.mockResolvedValue(undefined);

                        await cron.run();

                        expect(mockIngestionUseCase.execute).toHaveBeenCalled();
                });

                it('should handle multiple runs in succession', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findAllActive.mockResolvedValue([jobSource]);
                        mockJobFetcherFactory.getFetcher.mockReturnValue({});
                        mockIngestionUseCase.execute.mockResolvedValue(undefined);

                        // First run
                        await cron.run();
                        expect(mockIngestionUseCase.execute).toHaveBeenCalledTimes(1);

                        // Second run
                        await cron.run();
                        expect(mockIngestionUseCase.execute).toHaveBeenCalledTimes(2);

                        // Third run
                        await cron.run();
                        expect(mockIngestionUseCase.execute).toHaveBeenCalledTimes(3);
                });

                it('should maintain state across multiple runs', async () => {
                        const jobSource1 = JobSource.create({
                                name: 'Source 1',
                                type: SourceFeedEnumType.JSON,
                                provider: 'provider1',
                                baseUrl: 'https://provider1.com',
                                lastIngestedAt: null
                        });

                        const jobSource2 = JobSource.create({
                                name: 'Source 2',
                                type: SourceFeedEnumType.JSON,
                                provider: 'provider2',
                                baseUrl: 'https://provider2.com',
                                lastIngestedAt: null
                        });

                        // First run with one source
                        mockJobSourceRepository.findAllActive.mockResolvedValueOnce([jobSource1]);
                        mockJobFetcherFactory.getFetcher.mockReturnValue({});
                        mockIngestionUseCase.execute.mockResolvedValue(undefined);

                        await cron.run();
                        expect(mockIngestionUseCase.execute).toHaveBeenCalledTimes(1);

                        // Second run with two sources
                        mockJobSourceRepository.findAllActive.mockResolvedValueOnce([jobSource1, jobSource2]);
                        await cron.run();
                        expect(mockIngestionUseCase.execute).toHaveBeenCalledTimes(3); // 1 + 2
                });
        });

        describe('Performance Considerations', () => {
                it('should handle large number of active sources', async () => {
                        const sources = Array.from({ length: 50 }, (_, i) =>
                                JobSource.create({
                                        name: `Source ${i}`,
                                        type: SourceFeedEnumType.JSON,
                                        provider: `provider${i}`,
                                        baseUrl: `https://provider${i}.com`,
                                        lastIngestedAt: null
                                })
                        );

                        mockJobSourceRepository.findAllActive.mockResolvedValue(sources);
                        mockJobFetcherFactory.getFetcher.mockReturnValue({});
                        mockIngestionUseCase.execute.mockResolvedValue(undefined);

                        await cron.run();

                        expect(mockIngestionUseCase.execute).toHaveBeenCalledTimes(50);
                });

                it('should process sources sequentially', async () => {
                        const sources = [
                                JobSource.create({
                                        name: 'First',
                                        type: SourceFeedEnumType.JSON,
                                        provider: 'first',
                                        baseUrl: 'https://first.com',
                                        lastIngestedAt: null
                                }),
                                JobSource.create({
                                        name: 'Second',
                                        type: SourceFeedEnumType.JSON,
                                        provider: 'second',
                                        baseUrl: 'https://second.com',
                                        lastIngestedAt: null
                                })
                        ];

                        mockJobSourceRepository.findAllActive.mockResolvedValue(sources);
                        mockJobFetcherFactory.getFetcher.mockReturnValue({});

                        const executionOrder: string[] = [];
                        mockIngestionUseCase.execute.mockImplementation((cmd) => {
                                executionOrder.push(cmd.sourceId);
                                return Promise.resolve(undefined);
                        });

                        await cron.run();

                        expect(executionOrder).toHaveLength(2);
                        expect(executionOrder[0]).toBe(sources[0].id);
                        expect(executionOrder[1]).toBe(sources[1].id);
                });
        });

        describe('Supported Providers', () => {
                it('should support Remotive provider', async () => {
                        const jobSource = JobSource.rehydrate({
                                id: 'remotive-1',
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'REMOTIVE',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                isEnabled: true,
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findAllActive.mockResolvedValue([jobSource]);
                        mockJobFetcherFactory.getFetcher.mockReturnValue({});
                        mockIngestionUseCase.execute.mockResolvedValue(undefined);

                        await cron.run();

                        expect(mockJobFetcherFactory.getFetcher).toHaveBeenCalledWith('REMOTIVE');
                });

                it('should support WWR provider', async () => {
                        const jobSource = JobSource.rehydrate({
                                id: 'wwr-1',
                                name: 'WWR',
                                type: SourceFeedEnumType.XML,
                                provider: 'WWR',
                                baseUrl: 'https://wwr.com/feed.xml',
                                isEnabled: true,
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findAllActive.mockResolvedValue([jobSource]);
                        mockJobFetcherFactory.getFetcher.mockReturnValue({});
                        mockIngestionUseCase.execute.mockResolvedValue(undefined);

                        await cron.run();

                        expect(mockJobFetcherFactory.getFetcher).toHaveBeenCalledWith('WWR');
                });

                it('should support multiple providers in sequence', async () => {
                        const sources = [
                                JobSource.rehydrate({
                                        id: 'remotive-1',
                                        name: 'Remotive',
                                        type: SourceFeedEnumType.JSON,
                                        provider: 'REMOTIVE',
                                        baseUrl: 'https://remotive.com/api/remote-jobs',
                                        isEnabled: true,
                                        lastIngestedAt: null
                                }),
                                JobSource.rehydrate({
                                        id: 'wwr-1',
                                        name: 'WWR',
                                        type: SourceFeedEnumType.XML,
                                        provider: 'WWR',
                                        baseUrl: 'https://wwr.com/feed.xml',
                                        isEnabled: true,
                                        lastIngestedAt: null
                                })
                        ];

                        mockJobSourceRepository.findAllActive.mockResolvedValue(sources);
                        mockJobFetcherFactory.getFetcher.mockReturnValue({});
                        mockIngestionUseCase.execute.mockResolvedValue(undefined);

                        await cron.run();

                        expect(mockJobFetcherFactory.getFetcher).toHaveBeenNthCalledWith(1, 'REMOTIVE');
                        expect(mockJobFetcherFactory.getFetcher).toHaveBeenNthCalledWith(2, 'WWR');
                });
        });
});
