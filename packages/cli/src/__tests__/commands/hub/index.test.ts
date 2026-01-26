import { describe, it, expect, vi } from 'vitest';

// Mock dependencies
vi.mock('@dxworks/common/src/dxworks-hub.js', () => ({
  updateDxworksHub: vi.fn(),
  dxworksHubDir: '/mock/.dxw/hub',
}));

vi.mock('node:fs', () => ({
  rmSync: vi.fn(),
}));

vi.mock('@dxworks/common/src/logging.js', () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Import after mocking
const { hubCommand } = await import('../../../commands/hub/index.js');

describe('hub command', () => {
  describe('hubCommand', () => {
    it('should be a Command instance', () => {
      expect(hubCommand).toBeDefined();
      expect(hubCommand.name()).toBe('hub');
    });

    it('should have proper description mentioning hub directory', () => {
      expect(hubCommand.description()).toContain('dxworks-hub');
    });

    it('should have update subcommand', () => {
      const commands = hubCommand.commands;
      const updateCommand = commands.find((cmd) => cmd.name() === 'update');
      expect(updateCommand).toBeDefined();
    });

    it('should have refresh subcommand', () => {
      const commands = hubCommand.commands;
      const refreshCommand = commands.find((cmd) => cmd.name() === 'refresh');
      expect(refreshCommand).toBeDefined();
    });
  });
});
