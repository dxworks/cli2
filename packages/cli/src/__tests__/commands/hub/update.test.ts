import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mocks
const mockUpdateDxworksHub = vi.fn();

// Mock dependencies
vi.mock('@dxworks/common/src/dxworks-hub.js', () => ({
  updateDxworksHub: mockUpdateDxworksHub,
  dxworksHubDir: '/mock/.dxw/hub',
}));

// Import after mocking
const { hubUpdateCommand } = await import('../../../commands/hub/update.js');

describe('hub update command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hubUpdateCommand', () => {
    it('should be a Command instance', () => {
      expect(hubUpdateCommand).toBeDefined();
      expect(hubUpdateCommand.name()).toBe('update');
    });

    it('should have pull, fetch, and get aliases', () => {
      const aliases = hubUpdateCommand.aliases();
      expect(aliases).toContain('pull');
      expect(aliases).toContain('fetch');
      expect(aliases).toContain('get');
    });

    it('should have proper description', () => {
      expect(hubUpdateCommand.description()).toBe('update dxworks-hub');
    });
  });

  describe('update action', () => {
    it('should call updateDxworksHub', async () => {
      await hubUpdateCommand.parseAsync(['node', 'test']);

      expect(mockUpdateDxworksHub).toHaveBeenCalled();
    });
  });
});
