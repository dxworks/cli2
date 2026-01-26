import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mocks
const mockUpdateDxworksHub = vi.fn();
const mockRmSync = vi.fn();
const mockLog = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

// Mock dependencies
vi.mock('node:fs', () => ({
  rmSync: mockRmSync,
}));

vi.mock('@dxworks/common/src/logging.js', () => ({
  log: mockLog,
}));

vi.mock('@dxworks/common/src/dxworks-hub.js', () => ({
  updateDxworksHub: mockUpdateDxworksHub,
  dxworksHubDir: '/mock/.dxw/hub',
}));

// Import after mocking
const { hubRefreshCommand } = await import('../../../commands/hub/refresh.js');

describe('hub refresh command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hubRefreshCommand', () => {
    it('should be a Command instance', () => {
      expect(hubRefreshCommand).toBeDefined();
      expect(hubRefreshCommand.name()).toBe('refresh');
    });

    it('should have reset and rs aliases', () => {
      const aliases = hubRefreshCommand.aliases();
      expect(aliases).toContain('reset');
      expect(aliases).toContain('rs');
    });

    it('should have proper description', () => {
      expect(hubRefreshCommand.description()).toContain('refresh');
    });
  });

  describe('refresh action', () => {
    it('should remove hub directory and update', async () => {
      await hubRefreshCommand.parseAsync(['node', 'test']);

      expect(mockLog.info).toHaveBeenCalledWith(
        expect.stringContaining('Removing hub directory'),
      );
      expect(mockRmSync).toHaveBeenCalledWith('/mock/.dxw/hub', {
        recursive: true,
        force: true,
      });
      expect(mockUpdateDxworksHub).toHaveBeenCalled();
    });
  });
});
