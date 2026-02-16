/**
 * RegisterJobSource Command Tests
 *
 * This test suite covers:
 * - Successful job source registration
 * - Duplicate URL validation
 * - Authorization check
 * - ID generation
 * - Repository interaction
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RegisterJobSources } from './registerJobSource/registerJobsSourceHandler.js';
import { RegisterJobSourceCommand } from './registerJobSource/registerJobSourceCommand.js';
import { JobSource } from '../../domain/model/aggregates/jobSource.js';
import { SourceFeedEnumType } from '../../domain/enums/domainEnums.js';
import { DomainExceptions } from '../../domain/exceptions/domainExceptions.js';

describe('RegisterJobSource Command', () => {
        const mockJobSourceRepository: any = {
                findByUrl: vi.fn(),
                save: vi.fn(),
                findById: vi.fn()
        };

        let registerJobSource: RegisterJobSources;

        beforeEach(() => {
                registerJobSource = new RegisterJobSources(mockJobSourceRepository);
                vi.clearAllMocks();
        });

        describe('Successful Registration', () => {
                it('should register a new job source', async () => {
                        mockJobSourceRepository.findByUrl.mockResolvedValue(null);
                        mockJobSourceRepository.save.mockResolvedValue(undefined);

                        const result = await registerJobSource.execute({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                adminId: 'admin-123'
                        });

                        expect(result).toBeDefined();
                        expect(result.id).toBeDefined();
                        expect(mockJobSourceRepository.save).toHaveBeenCalled();
                });

                it('should save job source with correct properties', async () => {
                        mockJobSourceRepository.findByUrl.mockResolvedValue(null);

                        const command: RegisterJobSourceCommand = {
                                name: 'WWR',
                                type: SourceFeedEnumType.XML,
                                provider: 'wwr',
                                baseUrl: 'https://wwr.com/feed.xml',
                                adminId: 'admin-123'
                        };

                        await registerJobSource.execute(command);

                        expect(mockJobSourceRepository.save).toHaveBeenCalled();
                        const savedSource = mockJobSourceRepository.save.mock.calls[0][0];
                        expect(savedSource.props.name).toBe('WWR');
                        expect(savedSource.props.provider).toBe('WWR'); // Should be uppercase
                        expect(savedSource.props.baseUrl).toBe('https://wwr.com/feed.xml');
                        expect(savedSource.props.isEnabled).toBe(true); // Should be enabled by default
                });

                it('should return job source ID on successful registration', async () => {
                        mockJobSourceRepository.findByUrl.mockResolvedValue(null);

                        const result = await registerJobSource.execute({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                adminId: 'admin-123'
                        });

                        expect(result.id).toMatch(
                                /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                        );
                });

                it('should check for existing URL before registration', async () => {
                        mockJobSourceRepository.findByUrl.mockResolvedValue(null);

                        const baseUrl = 'https://remotive.com/api/remote-jobs';

                        await registerJobSource.execute({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: baseUrl,
                                adminId: 'admin-123'
                        });

                        expect(mockJobSourceRepository.findByUrl).toHaveBeenCalledWith(baseUrl);
                });
        });

        describe('Validation - Authorization', () => {
                it('should throw error when adminId is missing', async () => {
                        mockJobSourceRepository.findByUrl.mockResolvedValue(null);

                        await expect(
                                registerJobSource.execute({
                                        name: 'Remotive',
                                        type: SourceFeedEnumType.JSON,
                                        provider: 'remotive',
                                        baseUrl: 'https://remotive.com/api/remote-jobs',
                                        adminId: ''
                                } as any)
                        ).rejects.toThrow(DomainExceptions.JobSourceNotFoundException);
                });

                it('should throw error when adminId is null', async () => {
                        mockJobSourceRepository.findByUrl.mockResolvedValue(null);

                        await expect(
                                registerJobSource.execute({
                                        name: 'Remotive',
                                        type: SourceFeedEnumType.JSON,
                                        provider: 'remotive',
                                        baseUrl: 'https://remotive.com/api/remote-jobs',
                                        adminId: null
                                } as any)
                        ).rejects.toThrow(DomainExceptions.JobSourceNotFoundException);
                });
        });

        describe('Duplicate URL Validation', () => {
                it('should throw error if URL already exists', async () => {
                        const existingSource = JobSource.create({
                                name: 'Existing Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findByUrl.mockResolvedValue(existingSource);

                        await expect(
                                registerJobSource.execute({
                                        name: 'Remotive New',
                                        type: SourceFeedEnumType.JSON,
                                        provider: 'remotive',
                                        baseUrl: 'https://remotive.com/api/remote-jobs',
                                        adminId: 'admin-123'
                                })
                        ).rejects.toThrow(DomainExceptions.DuplicateJobSourceException);
                });

                it('should not call save when URL already exists', async () => {
                        const existingSource = JobSource.create({
                                name: 'Existing',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findByUrl.mockResolvedValue(existingSource);

                        try {
                                await registerJobSource.execute({
                                        name: 'Duplicate',
                                        type: SourceFeedEnumType.JSON,
                                        provider: 'remotive',
                                        baseUrl: 'https://remotive.com/api/remote-jobs',
                                        adminId: 'admin-123'
                                });
                        } catch (error) {
                                // Expected error
                        }

                        expect(mockJobSourceRepository.save).not.toHaveBeenCalled();
                });
        });

        describe('Multiple Registrations', () => {
                it('should allow registering multiple sources with different URLs', async () => {
                        mockJobSourceRepository.findByUrl.mockResolvedValue(null);

                        const result1 = await registerJobSource.execute({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                adminId: 'admin-123'
                        });

                        const result2 = await registerJobSource.execute({
                                name: 'WWR',
                                type: SourceFeedEnumType.XML,
                                provider: 'wwr',
                                baseUrl: 'https://wwr.com/feed.xml',
                                adminId: 'admin-123'
                        });

                        expect(result1.id).not.toBe(result2.id);
                        expect(mockJobSourceRepository.save).toHaveBeenCalledTimes(2);
                });
        });
});
