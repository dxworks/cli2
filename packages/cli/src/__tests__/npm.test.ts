import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as npmModule from '../npm.js';

// Mock execa
vi.mock('execa', () => ({
  execaSync: vi.fn(() => ({ stdout: '{}' })),
}));

describe('npm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should be a function', () => {
      expect(typeof npmModule.list).toBe('function');
    });

    it('should return parsed JSON', () => {
      const result = npmModule.list();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('versionsFor', () => {
    it('should be a function', () => {
      expect(typeof npmModule.versionsFor).toBe('function');
    });
  });

  describe('info', () => {
    it('should be a function', () => {
      expect(typeof npmModule.info).toBe('function');
    });
  });

  describe('install', () => {
    it('should be a function', () => {
      expect(typeof npmModule.install).toBe('function');
    });
  });

  describe('uninstall', () => {
    it('should be a function', () => {
      expect(typeof npmModule.uninstall).toBe('function');
    });
  });

  describe('update', () => {
    it('should be a function', () => {
      expect(typeof npmModule.update).toBe('function');
    });
  });

  describe('outdated', () => {
    it('should be a function', () => {
      expect(typeof npmModule.outdated).toBe('function');
    });

    it('should not throw on error', () => {
      expect(() => npmModule.outdated()).not.toThrow();
    });
  });

  describe('link', () => {
    it('should be a function', () => {
      expect(typeof npmModule.link).toBe('function');
    });
  });

  describe('npmCommand', () => {
    it('should be a function', () => {
      expect(typeof npmModule.npmCommand).toBe('function');
    });
  });

  describe('npm object', () => {
    it('should export npm object with all methods', () => {
      expect(npmModule.npm).toBeDefined();
      expect(npmModule.npm.list).toBeDefined();
      expect(npmModule.npm.versionsFor).toBeDefined();
      expect(npmModule.npm.info).toBeDefined();
      expect(npmModule.npm.install).toBeDefined();
      expect(npmModule.npm.update).toBeDefined();
      expect(npmModule.npm.outdated).toBeDefined();
      expect(npmModule.npm.uninstall).toBeDefined();
      expect(npmModule.npm.link).toBeDefined();
      expect(npmModule.npm.npmCommand).toBeDefined();
    });
  });
});
