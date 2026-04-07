import { describe, it, expect, vi } from 'vitest';

vi.mock('@dxworks/common/src/logging.js', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@dxworks/common/src/dxworks-hub.js', () => ({
  updateDxworksHub: vi.fn(),
  dxworksHubDir: '/mock/.dxw/hub',
}));

import { createCli, cli } from '../index.js';

describe('CLI', () => {
  describe('createCli', () => {
    it('should create a CLI instance', () => {
      const testCli = createCli();
      expect(testCli).toBeDefined();
      expect(testCli.name()).toBe('dxw');
    });

    it('should have version command', () => {
      const testCli = createCli();
      expect(testCli.version()).toBeTruthy();
    });

    it('should have description', () => {
      const testCli = createCli();
      const description = testCli.description();
      expect(description).toBeTruthy();
      expect(typeof description).toBe('string');
    });
  });

  describe('cli instance', () => {
    it('should be exported', () => {
      expect(cli).toBeDefined();
    });

    it('should be a Command instance', () => {
      expect(cli.name()).toBe('dxw');
    });
  });
});
