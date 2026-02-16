/**
 * JobUrl Value Object Tests
 *
 * This test suite covers:
 * - Valid URL creation
 * - URL format validation
 * - Invalid URLs handling
 */

import { describe, it, expect } from 'vitest';
import { JobUrl } from '../model/valueObjects/jobUrl.js';

describe('JobUrl Value Object', () => {
        describe('Creation', () => {
                it('should create a valid job URL', () => {
                        const url = new JobUrl({ value: 'https://example.com/job/123' });
                        expect(url.props.value).toBe('https://example.com/job/123');
                });

                it('should accept HTTP URLs', () => {
                        const url = new JobUrl({ value: 'http://example.com/job' });
                        expect(url.props.value).toBe('http://example.com/job');
                });

                it('should accept HTTPS URLs', () => {
                        const url = new JobUrl({ value: 'https://example.com/job' });
                        expect(url.props.value).toBe('https://example.com/job');
                });

                it('should accept URLs with query parameters', () => {
                        const url = new JobUrl({
                                value: 'https://example.com/job/123?ref=search&source=api'
                        });
                        expect(url.props.value).toBe('https://example.com/job/123?ref=search&source=api');
                });

                it('should accept URLs with fragments', () => {
                        const url = new JobUrl({
                                value: 'https://example.com/job/123#description'
                        });
                        expect(url.props.value).toBe('https://example.com/job/123#description');
                });

                it('should accept URLs with encoded characters', () => {
                        const url = new JobUrl({
                                value: 'https://example.com/job%20listing'
                        });
                        expect(url.props.value).toBe('https://example.com/job%20listing');
                });
        });

        describe('Validation', () => {
                it('should reject empty URL', () => {
                        expect(() => new JobUrl({ value: '' })).toThrow();
                });

                it('should reject invalid format URL', () => {
                        expect(() => new JobUrl({ value: 'not-a-url' })).toThrow();
                });

                it('should reject URL without protocol', () => {
                        expect(() => new JobUrl({ value: 'example.com/job' })).toThrow();
                });

                it('should reject URL with invalid protocol', () => {
                        expect(() => new JobUrl({ value: 'ftp://example.com/job' })).toThrow();
                });

                it('should reject whitespace-only URL', () => {
                        expect(() => new JobUrl({ value: '   ' })).toThrow();
                });

                it('should reject URL with spaces', () => {
                        expect(() => new JobUrl({ value: 'https://example.com/job with spaces' })).toThrow();
                });
        });

        describe('Equality', () => {
                it('should consider two URLs with same value as equal', () => {
                        const url1 = new JobUrl({ value: 'https://example.com/job/123' });
                        const url2 = new JobUrl({ value: 'https://example.com/job/123' });
                        expect(url1.equals(url2)).toBe(true);
                });

                it('should consider two URLs with different values as not equal', () => {
                        const url1 = new JobUrl({ value: 'https://example.com/job/123' });
                        const url2 = new JobUrl({ value: 'https://example.com/job/456' });
                        expect(url1.equals(url2)).toBe(false);
                });

                it('should be protocol-sensitive in equality', () => {
                        const url1 = new JobUrl({ value: 'https://example.com/job' });
                        const url2 = new JobUrl({ value: 'http://example.com/job' });
                        expect(url1.equals(url2)).toBe(false);
                });
        });
});
