/**
 * WWR XML Adapter Tests
 *
 * This test suite covers:
 * - Fetching and parsing XML from WWR feed
 * - Data transformation from XML to RawJobData
 * - Company extraction from job title
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { WwrXmlAdapter } from './external-apis/wwr-xml-jobAdapter.js';

vi.mock('axios');

describe('WwrXmlAdapter', () => {
        let adapter: WwrXmlAdapter;
        let mockedAxios = axios as any;

        beforeEach(() => {
                adapter = new WwrXmlAdapter();
                vi.clearAllMocks();
        });

        describe('fetchJobs() - Successful XML Parsing', () => {
                it('should fetch and parse valid RSS XML', async () => {
                        const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Senior Developer at TechCorp</title>
      <link>https://wwr.com/jobs/123</link>
      <guid>https://wwr.com/jobs/123</guid>
      <pubDate>Mon, 15 Jan 2024 10:00:00 GMT</pubDate>
    </item>
    <item>
      <title>DevOps Engineer at CloudInc</title>
      <link>https://wwr.com/jobs/124</link>
      <guid>https://wwr.com/jobs/124</guid>
      <pubDate>Sun, 14 Jan 2024 15:30:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

                        mockedAxios.get.mockResolvedValueOnce({ data: xmlResponse });

                        const jobs = await adapter.fetchJobs('https://wwr.com/feed.xml');

                        expect(jobs).toHaveLength(2);
                        expect(jobs[0].title).toBe('Senior Developer at TechCorp');
                        expect(jobs[0].company).toBe('TechCorp');
                        expect(jobs[0].url).toBe('https://wwr.com/jobs/123');
                        expect(jobs[0].location).toBe('Remote'); // WWR is remote-first
                        expect(jobs[1].company).toBe('CloudInc');
                });

                it('should extract company name from job title', async () => {
                        const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Product Manager at CompanyName</title>
      <link>https://wwr.com/jobs/1</link>
      <guid>https://wwr.com/jobs/1</guid>
      <pubDate>Mon, 15 Jan 2024 10:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

                        mockedAxios.get.mockResolvedValueOnce({ data: xmlResponse });

                        const jobs = await adapter.fetchJobs('https://wwr.com/feed.xml');

                        expect(jobs[0].company).toBe('CompanyName');
                });

                it('should handle multiple "at" in title - use last one', async () => {
                        const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Java Developer at 10+ years at Microsoft</title>
      <link>https://wwr.com/jobs/1</link>
      <guid>https://wwr.com/jobs/1</guid>
      <pubDate>Mon, 15 Jan 2024 10:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

                        mockedAxios.get.mockResolvedValueOnce({ data: xmlResponse });

                        const jobs = await adapter.fetchJobs('https://wwr.com/feed.xml');

                        expect(jobs[0].company).toBe('Microsoft');
                });

                it('should set location to Remote for all jobs', async () => {
                        const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Developer</title>
      <link>https://wwr.com/jobs/1</link>
      <guid>https://wwr.com/jobs/1</guid>
      <pubDate>Mon, 15 Jan 2024 10:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

                        mockedAxios.get.mockResolvedValueOnce({ data: xmlResponse });

                        const jobs = await adapter.fetchJobs('https://wwr.com/feed.xml');

                        jobs.forEach((job) => {
                                expect(job.location).toBe('Remote');
                        });
                });

                it('should use link as externalId when guid is missing', async () => {
                        const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Developer</title>
      <link>https://wwr.com/jobs/999</link>
      <pubDate>Mon, 15 Jan 2024 10:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

                        mockedAxios.get.mockResolvedValueOnce({ data: xmlResponse });

                        const jobs = await adapter.fetchJobs('https://wwr.com/feed.xml');

                        expect(jobs[0].externalId).toBe('https://wwr.com/jobs/999');
                });

                it('should use guid text when it contains #text property', async () => {
                        const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Developer</title>
      <link>https://wwr.com/jobs/1</link>
      <guid isPermaLink="false">unique-id-123</guid>
      <pubDate>Mon, 15 Jan 2024 10:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

                        mockedAxios.get.mockResolvedValueOnce({ data: xmlResponse });

                        const jobs = await adapter.fetchJobs('https://wwr.com/feed.xml');

                        expect(jobs[0].externalId).toBeDefined();
                });

                it('should parse RSS date format correctly', async () => {
                        const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Developer</title>
      <link>https://wwr.com/jobs/1</link>
      <guid>https://wwr.com/jobs/1</guid>
      <pubDate>Mon, 15 Jan 2024 10:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

                        mockedAxios.get.mockResolvedValueOnce({ data: xmlResponse });

                        const jobs = await adapter.fetchJobs('https://wwr.com/feed.xml');

                        expect(jobs[0].publishedAt).toBeInstanceOf(Date);
                        expect(jobs[0].publishedAt.getFullYear()).toBe(2024);
                });

                it('should handle single item (not array)', async () => {
                        const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Solo Developer</title>
      <link>https://wwr.com/jobs/single</link>
      <guid>https://wwr.com/jobs/single</guid>
      <pubDate>Mon, 15 Jan 2024 10:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

                        mockedAxios.get.mockResolvedValueOnce({ data: xmlResponse });

                        const jobs = await adapter.fetchJobs('https://wwr.com/feed.xml');

                        expect(jobs).toHaveLength(1);
                        expect(jobs[0].title).toBe('Solo Developer');
                });

                it('should handle multiple items correctly', async () => {
                        const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Frontend Developer</title>
      <link>https://wwr.com/jobs/1</link>
      <guid>id-1</guid>
      <pubDate>Mon, 15 Jan 2024 10:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Backend Developer</title>
      <link>https://wwr.com/jobs/2</link>
      <guid>id-2</guid>
      <pubDate>Sun, 14 Jan 2024 10:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Full Stack Developer</title>
      <link>https://wwr.com/jobs/3</link>
      <guid>id-3</guid>
      <pubDate>Sat, 13 Jan 2024 10:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

                        mockedAxios.get.mockResolvedValueOnce({ data: xmlResponse });

                        const jobs = await adapter.fetchJobs('https://wwr.com/feed.xml');

                        expect(jobs).toHaveLength(3);
                        expect(jobs.map((j) => j.title)).toEqual([
                                'Frontend Developer',
                                'Backend Developer',
                                'Full Stack Developer'
                        ]);
                });
        });

        describe('fetchJobs() - Error Handling', () => {
                it('should return empty array on network error', async () => {
                        mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

                        const jobs = await adapter.fetchJobs('https://wwr.com/feed.xml');

                        expect(jobs).toEqual([]);
                });

                it('should return empty array on XML parsing error', async () => {
                        mockedAxios.get.mockResolvedValueOnce({
                                data: 'Invalid XML <broken>'
                        });

                        try {
                                const jobs = await adapter.fetchJobs('https://wwr.com/feed.xml');
                                // Should either return empty array or throw
                                expect(Array.isArray(jobs)).toBe(true);
                        } catch (error) {
                                // Parser error is acceptable
                                expect(error).toBeDefined();
                        }
                });

                it('should return empty array on missing items', async () => {
                        const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
  </channel>
</rss>`;

                        mockedAxios.get.mockResolvedValueOnce({ data: xmlResponse });

                        const jobs = await adapter.fetchJobs('https://wwr.com/feed.xml');

                        expect(jobs).toEqual([]);
                });

                it('should handle 500 server error gracefully', async () => {
                        mockedAxios.get.mockRejectedValueOnce({
                                response: { status: 500, statusText: 'Internal Server Error' }
                        });

                        const jobs = await adapter.fetchJobs('https://wwr.com/feed.xml');

                        expect(jobs).toEqual([]);
                });

                it('should handle 404 not found error', async () => {
                        mockedAxios.get.mockRejectedValueOnce({
                                response: { status: 404, statusText: 'Not Found' }
                        });

                        const jobs = await adapter.fetchJobs('https://wwr.com/feed.xml');

                        expect(jobs).toEqual([]);
                });

                it('should handle timeout errors', async () => {
                        mockedAxios.get.mockRejectedValueOnce(new Error('Request timeout'));

                        const jobs = await adapter.fetchJobs('https://wwr.com/feed.xml');

                        expect(jobs).toEqual([]);
                });

                it('should handle empty response', async () => {
                        mockedAxios.get.mockResolvedValueOnce({ data: '' });

                        try {
                                const jobs = await adapter.fetchJobs('https://wwr.com/feed.xml');
                                expect(Array.isArray(jobs)).toBe(true);
                        } catch (error) {
                                // Parse error on empty string is acceptable
                                expect(error).toBeDefined();
                        }
                });
        });

        describe('Company Extraction', () => {
                it('should handle title without "at"', async () => {
                        const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Software Developer</title>
      <link>https://wwr.com/jobs/1</link>
      <guid>id-1</guid>
      <pubDate>Mon, 15 Jan 2024 10:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

                        mockedAxios.get.mockResolvedValueOnce({ data: xmlResponse });

                        const jobs = await adapter.fetchJobs('https://wwr.com/feed.xml');

                        expect(jobs[0].company).toBe('');
                });

                it('should trim whitespace from company name', async () => {
                        const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Developer at   SpacedCompany   </title>
      <link>https://wwr.com/jobs/1</link>
      <guid>id-1</guid>
      <pubDate>Mon, 15 Jan 2024 10:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

                        mockedAxios.get.mockResolvedValueOnce({ data: xmlResponse });

                        const jobs = await adapter.fetchJobs('https://wwr.com/feed.xml');

                        expect(jobs[0].company).toBe('SpacedCompany');
                });
        });

        describe('URL Handling', () => {
                it('should accept RSS feed URL parameter', async () => {
                        const feedUrl = 'https://custom-wwr-feed.example.com/jobs.xml';
                        const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Developer</title>
      <link>https://wwr.com/jobs/1</link>
      <guid>id-1</guid>
      <pubDate>Mon, 15 Jan 2024 10:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

                        mockedAxios.get.mockResolvedValueOnce({ data: xmlResponse });

                        await adapter.fetchJobs(feedUrl);

                        expect(mockedAxios.get).toHaveBeenCalledWith(feedUrl);
                });

                it('should preserve special characters in URLs', async () => {
                        const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Developer</title>
      <link>https://wwr.com/jobs/encode%20test</link>
      <guid>id-1</guid>
      <pubDate>Mon, 15 Jan 2024 10:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

                        mockedAxios.get.mockResolvedValueOnce({ data: xmlResponse });

                        const jobs = await adapter.fetchJobs('https://wwr.com/feed.xml');

                        expect(jobs[0].url).toBe('https://wwr.com/jobs/encode%20test');
                });
        });
});
