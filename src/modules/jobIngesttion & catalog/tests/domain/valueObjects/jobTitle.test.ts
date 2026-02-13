/**
 * JobTitle Value Object Tests
 *
 * This test suite covers:
 * - Valid job title creation
 * - Title length validation
 * - Title trimming
 * - Invalid inputs handling
 */

import { describe, it, expect } from 'vitest';
import { JobTitle } from '../model/valueObjects/jobTitle.js';

describe('JobTitle Value Object', () => {
        describe('Creation', () => {
                it('should create a valid job title', () => {
                        const title = new JobTitle({ value: 'Senior Software Engineer' });
                        expect(title.props.value).toBe('Senior Software Engineer');
                });

                it('should allow titles with special characters', () => {
                        const title = new JobTitle({ value: 'C++ Developer (Senior) - Full-time' });
                        expect(title.props.value).toBe('C++ Developer (Senior) - Full-time');
                });

                it('should allow titles with numbers', () => {
                        const title = new JobTitle({ value: 'DevOps Engineer Level 5' });
                        expect(title.props.value).toBe('DevOps Engineer Level 5');
                });

                it('should allow titles with unicode characters', () => {
                        const title = new JobTitle({ value: 'Ingeniero de Software' });
                        expect(title.props.value).toBe('Ingeniero de Software');
                });
        });

        describe('Validation', () => {
                it('should reject empty title', () => {
                        expect(() => new JobTitle({ value: '' })).toThrow();
                });

                it('should reject whitespace-only title', () => {
                        expect(() => new JobTitle({ value: '   ' })).toThrow();
                });

                it('should reject single character', () => {
                        expect(() => new JobTitle({ value: 'A' })).toThrow();
                });

                it('should reject title with only leading/trailing spaces when trimmed to empty', () => {
                        expect(() => new JobTitle({ value: '   ' })).toThrow();
                });

                it('should accept exactly 2 characters', () => {
                        const title = new JobTitle({ value: 'Jr' });
                        expect(title.props.value).toBe('Jr');
                });

                it('should accept very long titles', () => {
                        const longTitle =
                                'Senior Full Stack Developer with 10+ years of experience in cloud infrastructure';
                        const title = new JobTitle({ value: longTitle });
                        expect(title.props.value).toBe(longTitle);
                });
        });

        describe('Equality', () => {
                it('should consider two titles with same value as equal', () => {
                        const title1 = new JobTitle({ value: 'Software Engineer' });
                        const title2 = new JobTitle({ value: 'Software Engineer' });
                        expect(title1.equals(title2)).toBe(true);
                });

                it('should consider two titles with different values as not equal', () => {
                        const title1 = new JobTitle({ value: 'Software Engineer' });
                        const title2 = new JobTitle({ value: 'DevOps Engineer' });
                        expect(title1.equals(title2)).toBe(false);
                });

                it('should be case-sensitive in equality check', () => {
                        const title1 = new JobTitle({ value: 'Software Engineer' });
                        const title2 = new JobTitle({ value: 'software engineer' });
                        expect(title1.equals(title2)).toBe(false);
                });
        });
});
