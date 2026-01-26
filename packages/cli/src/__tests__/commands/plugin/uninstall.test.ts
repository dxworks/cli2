import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mocks
const mockNpmUninstall = vi.fn();

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
}));

vi.mock('../../../npm.js', () => ({
  npm: {
    uninstall: mockNpmUninstall,
  },
}));

// Import after mocking
const { pluginUninstall } =
  await import('../../../commands/plugin/uninstall.js');

describe('plugin uninstall command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('pluginUninstall', () => {
    it('should be a Command instance', () => {
      expect(pluginUninstall).toBeDefined();
      expect(pluginUninstall.name()).toBe('uninstall');
    });

    it('should have remove and rm aliases', () => {
      const aliases = pluginUninstall.aliases();
      expect(aliases).toContain('remove');
      expect(aliases).toContain('rm');
    });

    it('should have proper description', () => {
      expect(pluginUninstall.description()).toBe(
        'uninstalls a plugin from the dxw cli',
      );
    });
  });

  describe('uninstall action', () => {
    it('should call npm.uninstall with single plugin', async () => {
      await pluginUninstall.parseAsync(['node', 'test', 'plugin-a']);

      expect(mockNpmUninstall).toHaveBeenCalledWith('plugin-a');
    });

    it('should call npm.uninstall with multiple plugins', async () => {
      await pluginUninstall.parseAsync([
        'node',
        'test',
        'plugin-a',
        'plugin-b',
      ]);

      expect(mockNpmUninstall).toHaveBeenCalledWith('plugin-a plugin-b');
    });
  });
});
