/**
 * GetAllJobs Query Tests
 *
 * This test suite covers:
 * - Retrieving all jobs with pagination
 * - Category and location filtering
 * - Default pagination behavior
 * - Read model mapping
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetAllJobs } from './getAllJobs/getAllJobsHandler.js';
import { GetAllJobsQuery } from './getAllJobs/getAllJobsQuery.js';
import { GetAllJobsReadModel } from './getAllJobs/getAllJobsRepo.js';

describe('GetAllJobs Query', () => {
        const mockGetAllJobsRepository: any = {
                findAll: vi.fn()
        };

        let getAllJobs: GetAllJobs;

        const createMockJob = (overrides?: Partial<GetAllJobsReadModel>): GetAllJobsReadModel => ({
                id: 'job-1',
                title: 'Senior Developer',
                company: 'Tech Corp',
                category: 'IT',
                location: 'Remote',
                salary: '$100,000',
                type: 'Full-time',
                jobUrl: 'https://example.com/job/1',
                postedAt: new Date('2024-01-15'),
                sourceName: 'Remotive',
                ...overrides
        });

        beforeEach(() => {
                getAllJobs = new GetAllJobs(mockGetAllJobsRepository);
                vi.clearAllMocks();
        });

        describe('Basic Queries', () => {
                it('should retrieve all jobs without filters', async () => {
                        const mockJobs: GetAllJobsReadModel[] = [
                                createMockJob({ id: 'job-1' }),
                                createMockJob({ id: 'job-2' }),
                                createMockJob({ id: 'job-3' })
                        ];

                        mockGetAllJobsRepository.findAll.mockResolvedValue(mockJobs);

                        const result = await getAllJobs.execute({});

                        expect(result).toHaveLength(3);
                        expect(result).toEqual(mockJobs);
                });

                it('should return empty array when no jobs found', async () => {
                        mockGetAllJobsRepository.findAll.mockResolvedValue([]);

                        const result = await getAllJobs.execute({});

                        expect(result).toEqual([]);
                });

                it('should call repository with correct default pagination', async () => {
                        mockGetAllJobsRepository.findAll.mockResolvedValue([]);

                        await getAllJobs.execute({});

                        expect(mockGetAllJobsRepository.findAll).toHaveBeenCalledWith({
                                skip: 0,
                                take: 20,
                                category: undefined,
                                location: undefined
                        });
                });
        });

        describe('Pagination', () => {
                it('should use page 1 by default', async () => {
                        mockGetAllJobsRepository.findAll.mockResolvedValue([]);

                        await getAllJobs.execute({});

                        const call = mockGetAllJobsRepository.findAll.mock.calls[0][0];
                        expect(call.skip).toBe(0);
                        expect(call.take).toBe(20);
                });

                it('should calculate correct skip for page 2', async () => {
                        mockGetAllJobsRepository.findAll.mockResolvedValue([]);

                        await getAllJobs.execute({ page: 2 });

                        const call = mockGetAllJobsRepository.findAll.mock.calls[0][0];
                        expect(call.skip).toBe(20);
                        expect(call.take).toBe(20);
                });

                it('should calculate correct skip for page 3', async () => {
                        mockGetAllJobsRepository.findAll.mockResolvedValue([]);

                        await getAllJobs.execute({ page: 3 });

                        const call = mockGetAllJobsRepository.findAll.mock.calls[0][0];
                        expect(call.skip).toBe(40);
                });

                it('should calculate correct skip for page 5', async () => {
                        mockGetAllJobsRepository.findAll.mockResolvedValue([]);

                        await getAllJobs.execute({ page: 5 });

                        const call = mockGetAllJobsRepository.findAll.mock.calls[0][0];
                        expect(call.skip).toBe(80);
                });

                it('should use page size of 20 items', async () => {
                        mockGetAllJobsRepository.findAll.mockResolvedValue([]);

                        await getAllJobs.execute({ page: 1 });

                        const call = mockGetAllJobsRepository.findAll.mock.calls[0][0];
                        expect(call.take).toBe(20);
                });

                it('should use default page when undefined', async () => {
                        mockGetAllJobsRepository.findAll.mockResolvedValue([]);

                        await getAllJobs.execute({ page: undefined });

                        const call = mockGetAllJobsRepository.findAll.mock.calls[0][0];
                        expect(call.skip).toBe(0);
                });

                it('should handle large page numbers', async () => {
                        mockGetAllJobsRepository.findAll.mockResolvedValue([]);

                        await getAllJobs.execute({ page: 1000 });

                        const call = mockGetAllJobsRepository.findAll.mock.calls[0][0];
                        expect(call.skip).toBe(19980);
                });
        });

        describe('Category Filtering', () => {
                it('should filter by category', async () => {
                        const mockJobs: GetAllJobsReadModel[] = [
                                createMockJob({ category: 'IT' }),
                                createMockJob({ category: 'IT' })
                        ];

                        mockGetAllJobsRepository.findAll.mockResolvedValue(mockJobs);

                        await getAllJobs.execute({ category: 'IT' });

                        expect(mockGetAllJobsRepository.findAll).toHaveBeenCalledWith(
                                expect.objectContaining({ category: 'IT' })
                        );
                });

                it('should pass category to repository', async () => {
                        mockGetAllJobsRepository.findAll.mockResolvedValue([]);

                        await getAllJobs.execute({ category: 'Engineering' });

                        const call = mockGetAllJobsRepository.findAll.mock.calls[0][0];
                        expect(call.category).toBe('Engineering');
                });

                it('should return jobs with matching category', async () => {
                        const mockJobs: GetAllJobsReadModel[] = [
                                createMockJob({ category: 'Sales' }),
                                createMockJob({ category: 'Sales' }),
                                createMockJob({ category: 'Sales' })
                        ];

                        mockGetAllJobsRepository.findAll.mockResolvedValue(mockJobs);

                        const result = await getAllJobs.execute({ category: 'Sales' });

                        expect(result).toHaveLength(3);
                        result.forEach((job) => {
                                expect(job.category).toBe('Sales');
                        });
                });

                it('should handle no results for category filter', async () => {
                        mockGetAllJobsRepository.findAll.mockResolvedValue([]);

                        const result = await getAllJobs.execute({ category: 'NonExistent' });

                        expect(result).toEqual([]);
                });
        });

        describe('Location Filtering', () => {
                it('should filter by location', async () => {
                        const mockJobs: GetAllJobsReadModel[] = [
                                createMockJob({ location: 'Remote' }),
                                createMockJob({ location: 'Remote' })
                        ];

                        mockGetAllJobsRepository.findAll.mockResolvedValue(mockJobs);

                        await getAllJobs.execute({ location: 'Remote' });

                        expect(mockGetAllJobsRepository.findAll).toHaveBeenCalledWith(
                                expect.objectContaining({ location: 'Remote' })
                        );
                });

                it('should pass location to repository', async () => {
                        mockGetAllJobsRepository.findAll.mockResolvedValue([]);

                        await getAllJobs.execute({ location: 'San Francisco' });

                        const call = mockGetAllJobsRepository.findAll.mock.calls[0][0];
                        expect(call.location).toBe('San Francisco');
                });

                it('should return jobs matching location', async () => {
                        const mockJobs: GetAllJobsReadModel[] = [
                                createMockJob({ location: 'USA' }),
                                createMockJob({ location: 'USA' })
                        ];

                        mockGetAllJobsRepository.findAll.mockResolvedValue(mockJobs);

                        const result = await getAllJobs.execute({ location: 'USA' });

                        expect(result).toHaveLength(2);
                        result.forEach((job) => {
                                expect(job.location).toBe('USA');
                        });
                });

                it('should handle no results for location filter', async () => {
                        mockGetAllJobsRepository.findAll.mockResolvedValue([]);

                        const result = await getAllJobs.execute({ location: 'NonExistent' });

                        expect(result).toEqual([]);
                });
        });

        describe('Combined Filters', () => {
                it('should apply category and location filters together', async () => {
                        const mockJobs: GetAllJobsReadModel[] = [
                                createMockJob({ category: 'IT', location: 'Remote' })
                        ];

                        mockGetAllJobsRepository.findAll.mockResolvedValue(mockJobs);

                        await getAllJobs.execute({
                                category: 'IT',
                                location: 'Remote',
                                page: 1
                        });

                        expect(mockGetAllJobsRepository.findAll).toHaveBeenCalledWith({
                                skip: 0,
                                take: 20,
                                category: 'IT',
                                location: 'Remote'
                        });
                });

                it('should apply filters with pagination', async () => {
                        mockGetAllJobsRepository.findAll.mockResolvedValue([]);

                        await getAllJobs.execute({
                                category: 'Sales',
                                location: 'Europe',
                                page: 3
                        });

                        const call = mockGetAllJobsRepository.findAll.mock.calls[0][0];
                        expect(call.category).toBe('Sales');
                        expect(call.location).toBe('Europe');
                        expect(call.skip).toBe(40);
                        expect(call.take).toBe(20);
                });

                it('should return jobs matching all filters', async () => {
                        const mockJobs: GetAllJobsReadModel[] = [
                                createMockJob({
                                        category: 'Engineering',
                                        location: 'Remote',
                                        title: 'Backend Engineer'
                                })
                        ];

                        mockGetAllJobsRepository.findAll.mockResolvedValue(mockJobs);

                        const result = await getAllJobs.execute({
                                category: 'Engineering',
                                location: 'Remote'
                        });

                        expect(result[0].category).toBe('Engineering');
                        expect(result[0].location).toBe('Remote');
                });

                it('should handle partial filters', async () => {
                        mockGetAllJobsRepository.findAll.mockResolvedValue([]);

                        await getAllJobs.execute({
                                category: 'IT'
                                // location not specified
                        });

                        const call = mockGetAllJobsRepository.findAll.mock.calls[0][0];
                        expect(call.category).toBe('IT');
                        expect(call.location).toBeUndefined();
                });
        });

        describe('Read Model Mapping', () => {
                it('should return read model with all required fields', async () => {
                        const mockJob: GetAllJobsReadModel = createMockJob();
                        mockGetAllJobsRepository.findAll.mockResolvedValue([mockJob]);

                        const result = await getAllJobs.execute({});

                        expect(result[0]).toMatchObject({
                                id: expect.any(String),
                                title: expect.any(String),
                                company: expect.any(String),
                                category: expect.any(String),
                                location: expect.any(String),
                                salary: expect.any(String),
                                type: expect.any(String),
                                jobUrl: expect.any(String),
                                postedAt: expect.any(Date),
                                sourceName: expect.any(String)
                        });
                });

                it('should maintain data integrity across multiple jobs', async () => {
                        const mockJobs: GetAllJobsReadModel[] = [
                                createMockJob({
                                        id: 'id-1',
                                        title: 'Title 1',
                                        company: 'Company 1'
                                }),
                                createMockJob({
                                        id: 'id-2',
                                        title: 'Title 2',
                                        company: 'Company 2'
                                }),
                                createMockJob({
                                        id: 'id-3',
                                        title: 'Title 3',
                                        company: 'Company 3'
                                })
                        ];

                        mockGetAllJobsRepository.findAll.mockResolvedValue(mockJobs);

                        const result = await getAllJobs.execute({});

                        expect(result).toHaveLength(3);
                        expect(result[0].id).toBe('id-1');
                        expect(result[1].id).toBe('id-2');
                        expect(result[2].id).toBe('id-3');
                });
        });

        describe('Edge Cases', () => {
                it('should return full page when available', async () => {
                        const mockJobs = Array.from({ length: 20 }, (_, i) =>
                                createMockJob({ id: `job-${i}` })
                        );

                        mockGetAllJobsRepository.findAll.mockResolvedValue(mockJobs);

                        const result = await getAllJobs.execute({ page: 1 });

                        expect(result).toHaveLength(20);
                });

                it('should return partial page for last page', async () => {
                        const mockJobs = Array.from({ length: 5 }, (_, i) =>
                                createMockJob({ id: `job-${i}` })
                        );

                        mockGetAllJobsRepository.findAll.mockResolvedValue(mockJobs);

                        const result = await getAllJobs.execute({ page: 10 });

                        expect(result).toHaveLength(5);
                });

                it('should handle single job', async () => {
                        const mockJobs: GetAllJobsReadModel[] = [createMockJob()];

                        mockGetAllJobsRepository.findAll.mockResolvedValue(mockJobs);

                        const result = await getAllJobs.execute({});

                        expect(result).toHaveLength(1);
                        expect(result[0].id).toBe('job-1');
                });

                it('should handle very large page numbers', async () => {
                        mockGetAllJobsRepository.findAll.mockResolvedValue([]);

                        const result = await getAllJobs.execute({ page: 999999 });

                        expect(Array.isArray(result)).toBe(true);
                });

                it('should handle page: 0 as page 1', async () => {
                        mockGetAllJobsRepository.findAll.mockResolvedValue([]);

                        await getAllJobs.execute({ page: 0 });

                        const call = mockGetAllJobsRepository.findAll.mock.calls[0][0];
                        expect(call.skip).toBe(0);
                });

                it('should handle negative page as page 1', async () => {
                        mockGetAllJobsRepository.findAll.mockResolvedValue([]);

                        await getAllJobs.execute({ page: -10 });

                        const call = mockGetAllJobsRepository.findAll.mock.calls[0][0];
                        expect(call.skip).toBe(0);
                });
        });

        describe('Repository Interaction', () => {
                it('should call repository exactly once per query', async () => {
                        mockGetAllJobsRepository.findAll.mockResolvedValue([]);

                        await getAllJobs.execute({});

                        expect(mockGetAllJobsRepository.findAll).toHaveBeenCalledTimes(1);
                });

                it('should pass all query parameters to repository', async () => {
                        mockGetAllJobsRepository.findAll.mockResolvedValue([]);

                        const query: GetAllJobsQuery = {
                                page: 2,
                                category: 'IT',
                                location: 'Remote'
                        };

                        await getAllJobs.execute(query);

                        expect(mockGetAllJobsRepository.findAll).toHaveBeenCalledWith({
                                skip: 20,
                                take: 20,
                                category: 'IT',
                                location: 'Remote'
                        });
                });

                it('should not cache results', async () => {
                        mockGetAllJobsRepository.findAll.mockResolvedValue([]);

                        const query: GetAllJobsQuery = { page: 1 };

                        await getAllJobs.execute(query);
                        await getAllJobs.execute(query);

                        expect(mockGetAllJobsRepository.findAll).toHaveBeenCalledTimes(2);
                });
        });

        describe('Data Integrity', () => {
                it('should preserve job properties through query execution', async () => {
                        const originalJob: GetAllJobsReadModel = createMockJob({
                                id: 'preserved-id',
                                title: 'Preserved Title',
                                company: 'Preserved Company',
                                salary: '$999,999',
                                jobUrl: 'https://preserved.example.com'
                        });

                        mockGetAllJobsRepository.findAll.mockResolvedValue([originalJob]);

                        const result = await getAllJobs.execute({});

                        expect(result[0]).toEqual(originalJob);
                        expect(result[0].id).toBe('preserved-id');
                        expect(result[0].title).toBe('Preserved Title');
                        expect(result[0].company).toBe('Preserved Company');
                });

                it('should preserve dates correctly', async () => {
                        const testDate = new Date('2024-02-15T10:30:00Z');
                        const mockJob = createMockJob({ postedAt: testDate });

                        mockGetAllJobsRepository.findAll.mockResolvedValue([mockJob]);

                        const result = await getAllJobs.execute({});

                        expect(result[0].postedAt.getTime()).toBe(testDate.getTime());
                });
        });
});
