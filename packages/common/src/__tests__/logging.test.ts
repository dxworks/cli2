import { describe, it, expect, beforeAll } from 'vitest';
import { log, dxwFolder } from '../logging.js';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';

describe('logging', () => {
  describe('dxwFolder', () => {
    it('should be defined in home directory', () => {
      const expectedPath = path.resolve(homedir(), '.dxw');
      expect(dxwFolder).toBe(expectedPath);
    });
  });

  describe('log', () => {
    beforeAll(() => {
      // Ensure the logger is initialized
      log.info('Test log initialization');
    });

    it('should be defined', () => {
      expect(log).toBeDefined();
    });

    it('should have console and file transports', () => {
      expect(log.transports).toHaveLength(2);
    });

    it('should create logs directory', () => {
      const logsDir = path.resolve(dxwFolder, 'logs');
      expect(existsSync(logsDir)).toBe(true);
    });

    it('should log info messages', () => {
      expect(() => log.info('Test info message')).not.toThrow();
    });

    it('should log error messages', () => {
      expect(() => log.error('Test error message')).not.toThrow();
    });

    it('should log warning messages', () => {
      expect(() => log.warn('Test warning message')).not.toThrow();
    });

    it('should log debug messages', () => {
      expect(() => log.debug('Test debug message')).not.toThrow();
    });
  });
});
