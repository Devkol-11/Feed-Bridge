/**
 * ToggleJobSourceState Command Tests
 *
 * This test suite covers:
 * - Enabling a disabled source
 * - Disabling an enabled source
 * - Repository interaction
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToogleSourceState } from './toogleJobSourceState/toogleSourceStateHandler.js';
import { ToggleJobSourceStateCommand } from './toogleJobSourceState/toogleJobSourceStateCommand.js';
import { JobSource } from '../../domain/model/aggregates/jobSource.js';
import { SourceFeedEnumType } from '../../domain/enums/domainEnums.js';
import { DomainExceptions } from '../../domain/exceptions/domainExceptions.js';

describe('ToggleJobSourceState Command', () => {
        const mockJobSourceRepository: any = {
                findById: vi.fn(),
                save: vi.fn()
        };

        let toggleSourceState: ToogleSourceState;

        beforeEach(() => {
                toggleSourceState = new ToogleSourceState(mockJobSourceRepository);
                vi.clearAllMocks();
        });

        describe('Enable Source', () => {
                it('should enable a disabled job source', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        // Disable it first
                        jobSource.disable();
                        expect(jobSource.props.isEnabled).toBe(false);

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobSourceRepository.save.mockResolvedValue(undefined);

                        const command: ToggleJobSourceStateCommand = {
                                sourceId: jobSource.id,
                                isEnabled: true
                        };

                        await toggleSourceState.execute(command);

                        expect(jobSource.props.isEnabled).toBe(true);
                        expect(mockJobSourceRepository.save).toHaveBeenCalledWith(jobSource);
                });

                it('should save the source after enabling', async () => {
                        const jobSource = JobSource.rehydrate({
                                id: 'source-123',
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                isEnabled: false,
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobSourceRepository.save.mockResolvedValue(undefined);

                        await toggleSourceState.execute({
                                sourceId: 'source-123',
                                isEnabled: true
                        });

                        expect(mockJobSourceRepository.save).toHaveBeenCalled();
                });
        });

        describe('Disable Source', () => {
                it('should disable an enabled job source', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        expect(jobSource.props.isEnabled).toBe(true);

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobSourceRepository.save.mockResolvedValue(undefined);

                        const command: ToggleJobSourceStateCommand = {
                                sourceId: jobSource.id,
                                isEnabled: false
                        };

                        await toggleSourceState.execute(command);

                        expect(jobSource.props.isEnabled).toBe(false);
                });

                it('should save the source after disabling', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobSourceRepository.save.mockResolvedValue(undefined);

                        await toggleSourceState.execute({
                                sourceId: jobSource.id,
                                isEnabled: false
                        });

                        expect(mockJobSourceRepository.save).toHaveBeenCalledWith(jobSource);
                });
        });

        describe('Error Handling', () => {
                it('should throw error when job source does not exist', async () => {
                        mockJobSourceRepository.findById.mockResolvedValue(null);

                        await expect(
                                toggleSourceState.execute({
                                        sourceId: 'non-existent-id',
                                        isEnabled: true
                                })
                        ).rejects.toThrow(DomainExceptions.JobSourceNotFoundException);
                });

                it('should not save when source not found', async () => {
                        mockJobSourceRepository.findById.mockResolvedValue(null);

                        try {
                                await toggleSourceState.execute({
                                        sourceId: 'non-existent-id',
                                        isEnabled: true
                                });
                        } catch (error) {
                                // Expected error
                        }

                        expect(mockJobSourceRepository.save).not.toHaveBeenCalled();
                });

                it('should handle repository save errors', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobSourceRepository.save.mockRejectedValue(new Error('Database error'));

                        await expect(
                                toggleSourceState.execute({
                                        sourceId: jobSource.id,
                                        isEnabled: false
                                })
                        ).rejects.toThrow('Database error');
                });
        });

        describe('Toggle Transitions', () => {
                it('should allow toggling from enabled to disabled and back', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        expect(jobSource.props.isEnabled).toBe(true);

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobSourceRepository.save.mockResolvedValue(undefined);

                        // Disable
                        await toggleSourceState.execute({
                                sourceId: jobSource.id,
                                isEnabled: false
                        });

                        expect(jobSource.props.isEnabled).toBe(false);

                        // Enable
                        await toggleSourceState.execute({
                                sourceId: jobSource.id,
                                isEnabled: true
                        });

                        expect(jobSource.props.isEnabled).toBe(true);
                });

                it('should handle idempotent enable operations', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobSourceRepository.save.mockResolvedValue(undefined);

                        expect(jobSource.props.isEnabled).toBe(true);

                        // Enable again (already enabled)
                        await toggleSourceState.execute({
                                sourceId: jobSource.id,
                                isEnabled: true
                        });

                        expect(jobSource.props.isEnabled).toBe(true);
                        expect(mockJobSourceRepository.save).toHaveBeenCalled();
                });

                it('should handle idempotent disable operations', async () => {
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

                        expect(jobSource.props.isEnabled).toBe(false);

                        // Disable again (already disabled)
                        await toggleSourceState.execute({
                                sourceId: jobSource.id,
                                isEnabled: false
                        });

                        expect(jobSource.props.isEnabled).toBe(false);
                        expect(mockJobSourceRepository.save).toHaveBeenCalled();
                });
        });

        describe('Repository Interaction', () => {
                it('should retrieve source by correct ID', async () => {
                        const sourceId = 'source-123';
                        const jobSource = JobSource.rehydrate({
                                id: sourceId,
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                isEnabled: true,
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobSourceRepository.save.mockResolvedValue(undefined);

                        await toggleSourceState.execute({
                                sourceId: sourceId,
                                isEnabled: false
                        });

                        expect(mockJobSourceRepository.findById).toHaveBeenCalledWith(sourceId);
                });

                it('should save the exact source object', async () => {
                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobSourceRepository.save.mockResolvedValue(undefined);

                        await toggleSourceState.execute({
                                sourceId: jobSource.id,
                                isEnabled: false
                        });

                        const savedSource = mockJobSourceRepository.save.mock.calls[0][0];
                        expect(savedSource).toBe(jobSource);
                        expect(savedSource.props.isEnabled).toBe(false);
                });
        });

        describe('State Preservation', () => {
                it('should preserve other properties when toggling state', async () => {
                        const originalDate = new Date('2024-01-15T10:00:00Z');
                        const jobSource = JobSource.rehydrate({
                                id: 'source-123',
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                isEnabled: true,
                                lastIngestedAt: originalDate
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobSourceRepository.save.mockResolvedValue(undefined);

                        await toggleSourceState.execute({
                                sourceId: 'source-123',
                                isEnabled: false
                        });

                        expect(jobSource.props.name).toBe('Remotive');
                        expect(jobSource.props.provider).toBe('remotive');
                        expect(jobSource.props.baseUrl).toBe('https://remotive.com/api/remote-jobs');
                        expect(jobSource.props.lastIngestedAt?.getTime()).toBe(originalDate.getTime());
                });
        });

        describe('Console Logging', () => {
                it('should log state change on enable', async () => {
                        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

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

                        await toggleSourceState.execute({
                                sourceId: jobSource.id,
                                isEnabled: true
                        });

                        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('enabled'));
                });

                it('should log state change on disable', async () => {
                        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

                        const jobSource = JobSource.create({
                                name: 'Remotive',
                                type: SourceFeedEnumType.JSON,
                                provider: 'remotive',
                                baseUrl: 'https://remotive.com/api/remote-jobs',
                                lastIngestedAt: null
                        });

                        mockJobSourceRepository.findById.mockResolvedValue(jobSource);
                        mockJobSourceRepository.save.mockResolvedValue(undefined);

                        await toggleSourceState.execute({
                                sourceId: jobSource.id,
                                isEnabled: false
                        });

                        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('disabled'));
                });
        });
});
