/**
 * Remotive Adapter Tests
 *
 * This test suite covers:
 * - Fetching jobs from Remotive API
 * - Data transformation from API response to RawJobData
 * - Error handling
 * - Default values handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { RemotiveJsonAdapter } from './external-apis/remotive-json-jobAdapter.js';

vi.mock('axios');

describe('RemotiveJsonAdapter', () => {
        let adapter: RemotiveJsonAdapter;
        let mockedAxios = axios as any;

        beforeEach(() => {
                adapter = new RemotiveJsonAdapter();
                vi.clearAllMocks();
        });

        describe('fetchJobs() - Successful Responses', () => {
                it('should fetch and transform jobs from Remotive API', async () => {
                        const mockResponse = {
                                data: {
                                        'job-count': 2,
                                        jobs: [
                                                {
                                                        id: 1,
                                                        url: 'https://remotive.com/remote-jobs/software-engineer-1',
                                                        title: 'Senior Software Engineer',
                                                        company_name: 'TechCorp',
                                                        category: 'Software Development',
                                                        publication_date: '2024-01-15T10:00:00',
                                                        candidate_required_location: 'USA',
                                                        salary: '$120,000 - $150,000',
                                                        description: '<p>Great opportunity</p>'
                                                },
                                                {
                                                        id: 2,
                                                        url: 'https://remotive.com/remote-jobs/devops-engineer-1',
                                                        title: 'DevOps Engineer',
                                                        company_name: 'CloudInc',
                                                        publication_date: '2024-01-14T15:30:00',
                                                        candidate_required_location: 'Europe'
                                                }
                                        ]
                                }
                        };

                        mockedAxios.get.mockResolvedValueOnce(mockResponse);

                        const jobs = await adapter.fetchJobs();

                        expect(jobs).toHaveLength(2);
                        expect(jobs[0].externalId).toBe('1');
                        expect(jobs[0].title).toBe('Senior Software Engineer');
                        expect(jobs[0].company).toBe('TechCorp');
                        expect(jobs[0].category).toBe('Software Development');
                        expect(jobs[0].salary).toBe('$120,000 - $150,000');
                        expect(jobs[1].externalId).toBe('2');
                        expect(jobs[1].title).toBe('DevOps Engineer');
                });

                it('should use default API URL when no customUrl provided', async () => {
                        const mockResponse = {
                                data: {
                                        'job-count': 0,
                                        jobs: []
                                }
                        };

                        mockedAxios.get.mockResolvedValueOnce(mockResponse);

                        await adapter.fetchJobs();

                        expect(mockedAxios.get).toHaveBeenCalledWith(
                                'https://remotive.com/api/remote-jobs',
                                expect.objectContaining({
                                        headers: expect.objectContaining({
                                                'User-Agent': expect.any(String)
                                        })
                                })
                        );
                });

                it('should use custom URL when provided', async () => {
                        const customUrl =
                                'https://remotive.com/api/remote-jobs?category=software-development';
                        const mockResponse = {
                                data: {
                                        'job-count': 0,
                                        jobs: []
                                }
                        };

                        mockedAxios.get.mockResolvedValueOnce(mockResponse);

                        await adapter.fetchJobs(customUrl);

                        expect(mockedAxios.get).toHaveBeenCalledWith(customUrl, expect.any(Object));
                });

                it('should handle missing optional fields', async () => {
                        const mockResponse = {
                                data: {
                                        'job-count': 1,
                                        jobs: [
                                                {
                                                        id: 1,
                                                        url: 'https://remotive.com/remote-jobs/dev-1',
                                                        title: 'Developer',
                                                        company_name: 'Company',
                                                        publication_date: '2024-01-15T10:00:00',
                                                        candidate_required_location: 'Remote'
                                                        // salary and category are omitted
                                                }
                                        ]
                                }
                        };

                        mockedAxios.get.mockResolvedValueOnce(mockResponse);

                        const jobs = await adapter.fetchJobs();

                        expect(jobs).toHaveLength(1);
                        expect(jobs[0].salary).toBe('unspecified');
                        expect(jobs[0].category).toBe('uncategorized');
                });

                it('should handle missing location and default to Remote', async () => {
                        const mockResponse = {
                                data: {
                                        'job-count': 1,
                                        jobs: [
                                                {
                                                        id: 1,
                                                        url: 'https://remotive.com/remote-jobs/dev-1',
                                                        title: 'Developer',
                                                        company_name: 'Company',
                                                        publication_date: '2024-01-15T10:00:00',
                                                        candidate_required_location: ''
                                                        // Empty location
                                                }
                                        ]
                                }
                        };

                        mockedAxios.get.mockResolvedValueOnce(mockResponse);

                        const jobs = await adapter.fetchJobs();

                        expect(jobs[0].location).toBe('Remote');
                });

                it('should parse ISO format dates correctly', async () => {
                        const mockResponse = {
                                data: {
                                        'job-count': 1,
                                        jobs: [
                                                {
                                                        id: 1,
                                                        url: 'https://remotive.com/remote-jobs/dev-1',
                                                        title: 'Developer',
                                                        company_name: 'Company',
                                                        publication_date: '2024-01-15T14:30:45Z',
                                                        candidate_required_location: 'Remote'
                                                }
                                        ]
                                }
                        };

                        mockedAxios.get.mockResolvedValueOnce(mockResponse);

                        const jobs = await adapter.fetchJobs();

                        expect(jobs[0].publishedAt).toBeInstanceOf(Date);
                        expect(jobs[0].publishedAt.getFullYear()).toBe(2024);
                        expect(jobs[0].publishedAt.getMonth()).toBe(0);
                        expect(jobs[0].publishedAt.getDate()).toBe(15);
                });

                it('should transform multiple jobs correctly', async () => {
                        const mockResponse = {
                                data: {
                                        'job-count': 5,
                                        jobs: Array.from({ length: 5 }, (_, i) => ({
                                                id: i + 1,
                                                url: `https://remotive.com/job-${i + 1}`,
                                                title: `Job Title ${i + 1}`,
                                                company_name: `Company ${i + 1}`,
                                                publication_date: '2024-01-15T10:00:00',
                                                candidate_required_location: 'Remote'
                                        }))
                                }
                        };

                        mockedAxios.get.mockResolvedValueOnce(mockResponse);

                        const jobs = await adapter.fetchJobs();

                        expect(jobs).toHaveLength(5);
                        jobs.forEach((job, index) => {
                                expect(job.externalId).toBe((index + 1).toString());
                                expect(job.company).toBe(`Company ${index + 1}`);
                        });
                });
        });

        describe('fetchJobs() - Error Handling', () => {
                it('should return empty array on network error', async () => {
                        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

                        mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

                        const jobs = await adapter.fetchJobs();

                        expect(jobs).toEqual([]);
                        expect(consoleErrorSpy).toHaveBeenCalledWith(
                                'Remotive Fetch Error:',
                                'Network Error'
                        );
                });

                it('should return empty array on invalid response structure', async () => {
                        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

                        mockedAxios.get.mockResolvedValueOnce({
                                data: {
                                        jobs: undefined // Invalid structure
                                }
                        });

                        const jobs = await adapter.fetchJobs();

                        // Should handle gracefully without crashing
                        expect(Array.isArray(jobs)).toBe(true);
                });

                it('should handle 500 server error gracefully', async () => {
                        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

                        mockedAxios.get.mockRejectedValueOnce({
                                response: { status: 500, statusText: 'Internal Server Error' }
                        });

                        const jobs = await adapter.fetchJobs();

                        expect(jobs).toEqual([]);
                });

                it('should handle 404 not found error', async () => {
                        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

                        mockedAxios.get.mockRejectedValueOnce({
                                response: { status: 404, statusText: 'Not Found' }
                        });

                        const jobs = await adapter.fetchJobs();

                        expect(jobs).toEqual([]);
                });

                it('should handle timeout errors', async () => {
                        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

                        mockedAxios.get.mockRejectedValueOnce(new Error('Request timeout'));

                        const jobs = await adapter.fetchJobs();

                        expect(jobs).toEqual([]);
                });
        });

        describe('HTTP Headers', () => {
                it('should set proper User-Agent header', async () => {
                        const mockResponse = {
                                data: {
                                        'job-count': 0,
                                        jobs: []
                                }
                        };

                        mockedAxios.get.mockResolvedValueOnce(mockResponse);

                        await adapter.fetchJobs();

                        expect(mockedAxios.get).toHaveBeenCalledWith(
                                expect.any(String),
                                expect.objectContaining({
                                        headers: expect.objectContaining({
                                                'User-Agent': expect.stringContaining('JobBridge-App')
                                        })
                                })
                        );
                });
        });

        describe('Response Mapping', () => {
                it('should map all required fields correctly', async () => {
                        const mockResponse = {
                                data: {
                                        'job-count': 1,
                                        jobs: [
                                                {
                                                        id: 123,
                                                        url: 'https://example.com/job/123',
                                                        title: 'Test Job',
                                                        company_name: 'Test Company',
                                                        category: 'category',
                                                        publication_date: '2024-01-15T10:00:00',
                                                        candidate_required_location: 'Location',
                                                        salary: 'Salary'
                                                }
                                        ]
                                }
                        };

                        mockedAxios.get.mockResolvedValueOnce(mockResponse);

                        const jobs = await adapter.fetchJobs();

                        expect(jobs[0]).toMatchObject({
                                externalId: '123',
                                url: 'https://example.com/job/123',
                                title: 'Test Job',
                                company: 'Test Company',
                                category: 'category',
                                location: 'Location',
                                salary: 'Salary'
                        });
                });
        });
});
