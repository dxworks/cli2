import { describe, it, expect } from 'vitest';
import { OS, osType } from '../os-utils.js';
import { platform } from 'node:os';

describe('os-utils', () => {
  describe('OS constants', () => {
    it('should define OS types', () => {
      expect(OS.WINDOWS).toBe('windows');
      expect(OS.LINUX).toBe('linux');
      expect(OS.MAC).toBe('mac');
      expect(OS.UNKNOWN).toBe('unknown');
    });
  });

  describe('osType', () => {
    it('should be defined', () => {
      expect(osType).toBeDefined();
    });

    it('should match current platform', () => {
      const currentPlatform = platform();

      if (currentPlatform === 'darwin') {
        expect(osType).toBe(OS.MAC);
      } else if (currentPlatform === 'win32') {
        expect(osType).toBe(OS.WINDOWS);
      } else if (currentPlatform === 'linux') {
        expect(osType).toBe(OS.LINUX);
      } else {
        expect(osType).toBe(OS.UNKNOWN);
      }
    });

    it('should be one of the defined OS types', () => {
      expect(Object.values(OS)).toContain(osType);
    });
  });
});
