import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mocks
const mockNpmUpdate = vi.fn();
const mockNpmInstall = vi.fn();
const mockSpawnSync = vi.fn();

// Mock dependencies
vi.mock('node:fs', () => ({
  readFileSync: vi.fn((path: string) => {
    if (path.includes('package.json')) {
      return JSON.stringify({
        name: '@dxworks/cli',
        version: '1.0.0',
      });
    }
    return '';
  }),
  existsSync: vi.fn(),
}));

vi.mock('node:child_process', () => ({
  execSync: vi.fn(() => '/usr/bin/npm'),
  spawnSync: mockSpawnSync,
}));

vi.mock('../../../npm.js', () => ({
  npm: {
    update: mockNpmUpdate,
    install: mockNpmInstall,
  },
}));

// Import after mocking
const { pluginUpdate } = await import('../../../commands/plugin/update.js');

describe('plugin update command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('pluginUpdate', () => {
    it('should be a Command instance', () => {
      expect(pluginUpdate).toBeDefined();
      expect(pluginUpdate.name()).toBe('update');
    });

    it('should have upgrade and up aliases', () => {
      const aliases = pluginUpdate.aliases();
      expect(aliases).toContain('upgrade');
      expect(aliases).toContain('up');
    });

    it('should have -l/--latest option', () => {
      const options = pluginUpdate.options;
      const latestOption = options.find(
        (opt: { short?: string }) => opt.short === '-l',
      );
      expect(latestOption).toBeDefined();
    });
  });

  describe('update action', () => {
    it('should call npm.update when no plugins specified', async () => {
      await pluginUpdate.parseAsync(['node', 'test']);

      expect(mockNpmUpdate).toHaveBeenCalled();
    });

    it('should call npm.update with specific plugins', async () => {
      await pluginUpdate.parseAsync(['node', 'test', 'plugin-a', 'plugin-b']);

      expect(mockNpmUpdate).toHaveBeenCalledWith('plugin-a plugin-b');
    });

    it('should remove @latest suffix when updating plugins', async () => {
      await pluginUpdate.parseAsync(['node', 'test', 'plugin-a@latest']);

      expect(mockNpmUpdate).toHaveBeenCalledWith('plugin-a');
    });

    it('should install with @latest when --latest flag is used', async () => {
      await pluginUpdate.parseAsync(['node', 'test', 'plugin-a', '--latest']);

      expect(mockNpmInstall).toHaveBeenCalledWith('plugin-a@latest');
    });

    it('should use ncu when updating all with --latest flag', async () => {
      await pluginUpdate.parseAsync(['node', 'test', '--latest']);

      expect(mockSpawnSync).toHaveBeenCalled();
      expect(mockNpmInstall).toHaveBeenCalled();
    });
  });
});
