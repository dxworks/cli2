import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  noop,
  isNotNullNorUndefined,
  extractOwnerAndRepo,
  defaultOctokit,
} from '../utils.js';

describe('utils', () => {
  describe('noop', () => {
    it('should be a function', () => {
      expect(typeof noop).toBe('function');
    });

    it('should return undefined', () => {
      expect(noop()).toBeUndefined();
    });

    it('should not throw when called', () => {
      expect(() => noop()).not.toThrow();
    });
  });

  describe('isNotNullNorUndefined', () => {
    it('should return true for defined values', () => {
      expect(isNotNullNorUndefined(0)).toBe(true);
      expect(isNotNullNorUndefined('')).toBe(true);
      expect(isNotNullNorUndefined(false)).toBe(true);
      expect(isNotNullNorUndefined([])).toBe(true);
      expect(isNotNullNorUndefined({})).toBe(true);
      expect(isNotNullNorUndefined('test')).toBe(true);
      expect(isNotNullNorUndefined(123)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isNotNullNorUndefined(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isNotNullNorUndefined(undefined)).toBe(false);
    });
  });

  describe('extractOwnerAndRepo', () => {
    it('should extract owner and repo from string', () => {
      const result = extractOwnerAndRepo('dxworks/dxworks-hub');
      expect(result).toEqual(['dxworks', 'dxworks-hub']);
    });

    it('should handle different owner/repo combinations', () => {
      const result1 = extractOwnerAndRepo('facebook/react');
      expect(result1).toEqual(['facebook', 'react']);

      const result2 = extractOwnerAndRepo('microsoft/typescript');
      expect(result2).toEqual(['microsoft', 'typescript']);
    });

    it('should split on first slash only', () => {
      const result = extractOwnerAndRepo('owner/repo/extra');
      expect(result).toHaveLength(3);
      expect(result[0]).toBe('owner');
      expect(result[1]).toBe('repo');
      expect(result[2]).toBe('extra');
    });

    it('should handle single word', () => {
      const result = extractOwnerAndRepo('singleword');
      expect(result).toEqual(['singleword']);
    });
  });

  describe('defaultOctokit', () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
      originalEnv = process.env.GH_TOKEN;
    });

    afterEach(() => {
      if (originalEnv === undefined) {
        delete process.env.GH_TOKEN;
      } else {
        process.env.GH_TOKEN = originalEnv;
      }
    });

    it('should be defined', () => {
      expect(defaultOctokit).toBeDefined();
    });

    it('should be an Octokit instance', () => {
      expect(defaultOctokit).toHaveProperty('request');
      expect(defaultOctokit).toHaveProperty('rest');
    });
  });
});
