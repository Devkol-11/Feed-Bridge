/**
 * JobLocation Value Object Tests
 *
 * This test suite covers:
 * - Valid location creation
 * - Location validation
 * - Edge cases
 */

import { describe, it, expect } from 'vitest';
import { JobLocation } from '../model/valueObjects/jobLocation.js';

describe('JobLocation Value Object', () => {
        describe('Creation', () => {
                it('should create a valid job location', () => {
                        const location = new JobLocation({ value: 'San Francisco, CA' });
                        expect(location.props.value).toBe('San Francisco, CA');
                });

                it('should accept remote locations', () => {
                        const location = new JobLocation({ value: 'Remote' });
                        expect(location.props.value).toBe('Remote');
                });

                it('should accept locations with country', () => {
                        const location = new JobLocation({ value: 'London, UK' });
                        expect(location.props.value).toBe('London, UK');
                });

                it('should accept multiple locations', () => {
                        const location = new JobLocation({ value: 'New York, NY + Remote' });
                        expect(location.props.value).toBe('New York, NY + Remote');
                });

                it('should accept international locations', () => {
                        const location = new JobLocation({ value: 'Berlin, Germany' });
                        expect(location.props.value).toBe('Berlin, Germany');
                });

                it('should accept unicode characters in location', () => {
                        const location = new JobLocation({ value: 'São Paulo, Brasil' });
                        expect(location.props.value).toBe('São Paulo, Brasil');
                });
        });

        describe('Validation', () => {
                it('should reject empty location', () => {
                        expect(() => new JobLocation({ value: '' })).toThrow();
                });

                it('should reject whitespace-only location', () => {
                        expect(() => new JobLocation({ value: '   ' })).toThrow();
                });

                it('should reject single character location', () => {
                        expect(() => new JobLocation({ value: 'A' })).toThrow();
                });

                it('should accept exactly 2 characters', () => {
                        const location = new JobLocation({ value: 'CA' });
                        expect(location.props.value).toBe('CA');
                });

                it('should accept very long location names', () => {
                        const longLocation = 'San Francisco Bay Area, California, United States';
                        const location = new JobLocation({ value: longLocation });
                        expect(location.props.value).toBe(longLocation);
                });
        });

        describe('Equality', () => {
                it('should consider two locations with same value as equal', () => {
                        const loc1 = new JobLocation({ value: 'San Francisco, CA' });
                        const loc2 = new JobLocation({ value: 'San Francisco, CA' });
                        expect(loc1.equals(loc2)).toBe(true);
                });

                it('should consider two locations with different values as not equal', () => {
                        const loc1 = new JobLocation({ value: 'San Francisco, CA' });
                        const loc2 = new JobLocation({ value: 'New York, NY' });
                        expect(loc1.equals(loc2)).toBe(false);
                });

                it('should be case-sensitive', () => {
                        const loc1 = new JobLocation({ value: 'remote' });
                        const loc2 = new JobLocation({ value: 'Remote' });
                        expect(loc1.equals(loc2)).toBe(false);
                });
        });
});
