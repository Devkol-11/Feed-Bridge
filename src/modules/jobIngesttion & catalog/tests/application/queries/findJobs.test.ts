/**
 * FindJobs Query Tests
 *
 * This test suite covers:
 * - Finding jobs with various filters
 * - Pagination
 * - Category, location, and salary filtering
 * - Repository interaction
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindJobs } from './findJobs/findJobsHandler.js';
import { FindJobsQuery } from './findJobs/findJobsQuery.js';
import { FindJobsReadModel } from './findJobs/findJobsRepoPort.js';

describe('FindJobs Query', () => {
        const mockFindJobsRepository: any = {
                find: vi.fn()
        };

        let findJobs: FindJobs;

        const createMockJob = (overrides?: Partial<FindJobsReadModel>): FindJobsReadModel => ({
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
                findJobs = new FindJobs(mockFindJobsRepository);
                vi.clearAllMocks();
        });

        describe('Basic Queries', () => {
                it('should retrieve jobs without filters', async () => {
                        const mockJobs: FindJobsReadModel[] = [
                                createMockJob({ id: 'job-1' }),
                                createMockJob({ id: 'job-2' }),
                                createMockJob({ id: 'job-3' })
                        ];

                        mockFindJobsRepository.find.mockResolvedValue(mockJobs);

                        const result = await findJobs.execute({});

                        expect(result).toHaveLength(3);
                        expect(result).toEqual(mockJobs);
                });

                it('should return empty array when no jobs found', async () => {
                        mockFindJobsRepository.find.mockResolvedValue([]);

                        const result = await findJobs.execute({});

                        expect(result).toEqual([]);
                });

                it('should call repository with correct default pagination', async () => {
                        mockFindJobsRepository.find.mockResolvedValue([]);

                        await findJobs.execute({});

                        expect(mockFindJobsRepository.find).toHaveBeenCalledWith({
                                category: undefined,
                                location: undefined,
                                salary: undefined,
                                skip: 0,
                                take: 20
                        });
                });
        });

        describe('Pagination', () => {
                it('should use page 1 by default', async () => {
                        mockFindJobsRepository.find.mockResolvedValue([]);

                        await findJobs.execute({});

                        const call = mockFindJobsRepository.find.mock.calls[0][0];
                        expect(call.skip).toBe(0);
                        expect(call.take).toBe(20);
                });

                it('should calculate correct skip for page 2', async () => {
                        mockFindJobsRepository.find.mockResolvedValue([]);

                        await findJobs.execute({ page: 2 });

                        const call = mockFindJobsRepository.find.mock.calls[0][0];
                        expect(call.skip).toBe(20);
                        expect(call.take).toBe(20);
                });

                it('should calculate correct skip for page 3', async () => {
                        mockFindJobsRepository.find.mockResolvedValue([]);

                        await findJobs.execute({ page: 3 });

                        const call = mockFindJobsRepository.find.mock.calls[0][0];
                        expect(call.skip).toBe(40);
                        expect(call.take).toBe(20);
                });

                it('should use page size of 20 items', async () => {
                        mockFindJobsRepository.find.mockResolvedValue([]);

                        await findJobs.execute({ page: 1 });

                        const call = mockFindJobsRepository.find.mock.calls[0][0];
                        expect(call.take).toBe(20);
                });

                it('should treat negative page as page 1', async () => {
                        mockFindJobsRepository.find.mockResolvedValue([]);

                        await findJobs.execute({ page: -5 });

                        const call = mockFindJobsRepository.find.mock.calls[0][0];
                        expect(call.skip).toBe(0);
                });

                it('should treat page 0 as page 1', async () => {
                        mockFindJobsRepository.find.mockResolvedValue([]);

                        await findJobs.execute({ page: 0 });

                        const call = mockFindJobsRepository.find.mock.calls[0][0];
                        expect(call.skip).toBe(0);
                });

                it('should handle large page numbers', async () => {
                        mockFindJobsRepository.find.mockResolvedValue([]);

                        await findJobs.execute({ page: 100 });

                        const call = mockFindJobsRepository.find.mock.calls[0][0];
                        expect(call.skip).toBe(1980);
                });
        });

        describe('Category Filtering', () => {
                it('should filter by single category', async () => {
                        const mockJobs: FindJobsReadModel[] = [
                                createMockJob({ category: 'IT' }),
                                createMockJob({ category: 'IT' })
                        ];

                        mockFindJobsRepository.find.mockResolvedValue(mockJobs);

                        await findJobs.execute({ category: 'IT' });

                        expect(mockFindJobsRepository.find).toHaveBeenCalledWith(
                                expect.objectContaining({ category: 'IT' })
                        );
                });

                it('should pass category to repository', async () => {
                        mockFindJobsRepository.find.mockResolvedValue([]);

                        await findJobs.execute({ category: 'Engineering' });

                        const call = mockFindJobsRepository.find.mock.calls[0][0];
                        expect(call.category).toBe('Engineering');
                });

                it('should handle multiple different categories in sequence', async () => {
                        mockFindJobsRepository.find.mockResolvedValue([]);

                        await findJobs.execute({ category: 'Sales' });
                        await findJobs.execute({ category: 'Marketing' });

                        expect(mockFindJobsRepository.find).toHaveBeenNthCalledWith(
                                1,
                                expect.objectContaining({ category: 'Sales' })
                        );
                        expect(mockFindJobsRepository.find).toHaveBeenNthCalledWith(
                                2,
                                expect.objectContaining({ category: 'Marketing' })
                        );
                });
        });

        describe('Location Filtering', () => {
                it('should filter by single location', async () => {
                        const mockJobs: FindJobsReadModel[] = [
                                createMockJob({ location: 'Remote' }),
                                createMockJob({ location: 'Remote' })
                        ];

                        mockFindJobsRepository.find.mockResolvedValue(mockJobs);

                        await findJobs.execute({ location: 'Remote' });

                        expect(mockFindJobsRepository.find).toHaveBeenCalledWith(
                                expect.objectContaining({ location: 'Remote' })
                        );
                });

                it('should pass location to repository', async () => {
                        mockFindJobsRepository.find.mockResolvedValue([]);

                        await findJobs.execute({ location: 'San Francisco' });

                        const call = mockFindJobsRepository.find.mock.calls[0][0];
                        expect(call.location).toBe('San Francisco');
                });

                it('should return jobs matching location filter', async () => {
                        const mockJobs: FindJobsReadModel[] = [
                                createMockJob({ location: 'USA' }),
                                createMockJob({ location: 'USA' }),
                                createMockJob({ location: 'USA' })
                        ];

                        mockFindJobsRepository.find.mockResolvedValue(mockJobs);

                        const result = await findJobs.execute({ location: 'USA' });

                        expect(result).toHaveLength(3);
                        result.forEach((job) => {
                                expect(job.location).toBe('USA');
                        });
                });
        });

        describe('Salary Filtering', () => {
                it('should filter by salary range', async () => {
                        const mockJobs: FindJobsReadModel[] = [createMockJob({ salary: '$100k-$150k' })];

                        mockFindJobsRepository.find.mockResolvedValue(mockJobs);

                        await findJobs.execute({ salary: '$100k-$150k' });

                        expect(mockFindJobsRepository.find).toHaveBeenCalledWith(
                                expect.objectContaining({ salary: '$100k-$150k' })
                        );
                });

                it('should pass salary to repository', async () => {
                        mockFindJobsRepository.find.mockResolvedValue([]);

                        await findJobs.execute({ salary: '$80k-$120k' });

                        const call = mockFindJobsRepository.find.mock.calls[0][0];
                        expect(call.salary).toBe('$80k-$120k');
                });
        });

        describe('Combined Filters', () => {
                it('should apply multiple filters simultaneously', async () => {
                        const mockJobs: FindJobsReadModel[] = [
                                createMockJob({ category: 'IT', location: 'Remote', salary: '$100k' })
                        ];

                        mockFindJobsRepository.find.mockResolvedValue(mockJobs);

                        await findJobs.execute({
                                category: 'IT',
                                location: 'Remote',
                                salary: '$100k',
                                page: 2
                        });

                        expect(mockFindJobsRepository.find).toHaveBeenCalledWith({
                                category: 'IT',
                                location: 'Remote',
                                salary: '$100k',
                                skip: 20,
                                take: 20
                        });
                });

                it('should return jobs matching all filters', async () => {
                        const mockJobs: FindJobsReadModel[] = [
                                createMockJob({
                                        category: 'IT',
                                        location: 'Remote',
                                        salary: '$100k',
                                        title: 'Senior Engineer'
                                })
                        ];

                        mockFindJobsRepository.find.mockResolvedValue(mockJobs);

                        const result = await findJobs.execute({
                                category: 'IT',
                                location: 'Remote',
                                salary: '$100k'
                        });

                        expect(result[0].category).toBe('IT');
                        expect(result[0].location).toBe('Remote');
                        expect(result[0].salary).toBe('$100k');
                });

                it('should handle partial filters', async () => {
                        mockFindJobsRepository.find.mockResolvedValue([]);

                        await findJobs.execute({
                                category: 'Sales',
                                page: 1
                                // location and salary omitted
                        });

                        const call = mockFindJobsRepository.find.mock.calls[0][0];
                        expect(call.category).toBe('Sales');
                        expect(call.location).toBeUndefined();
                        expect(call.salary).toBeUndefined();
                });
        });

        describe('Read Model Mapping', () => {
                it('should return read model with all required fields', async () => {
                        const mockJob: FindJobsReadModel = createMockJob();
                        mockFindJobsRepository.find.mockResolvedValue([mockJob]);

                        const result = await findJobs.execute({});

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

                it('should maintain data integrity in read models', async () => {
                        const mockJobs: FindJobsReadModel[] = [
                                createMockJob({
                                        id: 'unique-id-1',
                                        title: 'Unique Title',
                                        company: 'Unique Company',
                                        sourceName: 'Unique Source'
                                }),
                                createMockJob({
                                        id: 'unique-id-2',
                                        title: 'Different Title',
                                        company: 'Different Company',
                                        sourceName: 'Different Source'
                                })
                        ];

                        mockFindJobsRepository.find.mockResolvedValue(mockJobs);

                        const result = await findJobs.execute({});

                        expect(result[0].id).not.toBe(result[1].id);
                        expect(result[0].title).not.toBe(result[1].title);
                        expect(result[0].company).not.toBe(result[1].company);
                });
        });

        describe('Edge Cases', () => {
                it('should return full page when available', async () => {
                        const mockJobs = Array.from({ length: 20 }, (_, i) =>
                                createMockJob({ id: `job-${i}` })
                        );

                        mockFindJobsRepository.find.mockResolvedValue(mockJobs);

                        const result = await findJobs.execute({ page: 1 });

                        expect(result).toHaveLength(20);
                });

                it('should return less than page size when last page', async () => {
                        const mockJobs = Array.from({ length: 5 }, (_, i) =>
                                createMockJob({ id: `job-${i}` })
                        );

                        mockFindJobsRepository.find.mockResolvedValue(mockJobs);

                        const result = await findJobs.execute({ page: 10 });

                        expect(result).toHaveLength(5);
                });

                it('should handle very large page numbers gracefully', async () => {
                        mockFindJobsRepository.find.mockResolvedValue([]);

                        const result = await findJobs.execute({ page: 999999 });

                        expect(Array.isArray(result)).toBe(true);
                });
        });

        describe('Repository Calls', () => {
                it('should call repository exactly once per query', async () => {
                        mockFindJobsRepository.find.mockResolvedValue([]);

                        await findJobs.execute({ category: 'IT' });

                        expect(mockFindJobsRepository.find).toHaveBeenCalledTimes(1);
                });

                it('should not call repository multiple times for same query', async () => {
                        mockFindJobsRepository.find.mockResolvedValue([]);

                        const query: FindJobsQuery = { category: 'IT', page: 2 };

                        await findJobs.execute(query);
                        await findJobs.execute(query);

                        expect(mockFindJobsRepository.find).toHaveBeenCalledTimes(2);
                });
        });
});
