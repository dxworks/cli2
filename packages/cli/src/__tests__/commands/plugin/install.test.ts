import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mocks
const mockLog = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};
const mockNpmInstall = vi.fn();
const mockNpmList = vi.fn();
const mockNpmInfo = vi.fn();

// Mock dependencies
vi.mock('node:fs', () => ({
  readFileSync: vi.fn((path: string) => {
    if (path.includes('cli-plugins.json')) {
      return JSON.stringify({
        plugins: ['@dxworks/plugin-a', '@dxworks/plugin-b'],
      });
    }
    if (path.includes('package.json')) {
      return JSON.stringify({
        name: '@dxworks/cli',
        version: '1.0.0',
      });
    }
    return '';
  }),
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  cpSync: vi.fn(),
}));

vi.mock('node:child_process', () => ({
  execSync: vi.fn(() => '/usr/bin/npm'),
}));

vi.mock('../../../npm.js', () => ({
  npm: {
    install: mockNpmInstall,
    list: mockNpmList,
    info: mockNpmInfo,
  },
}));

vi.mock('@dxworks/common/src/logging.js', () => ({
  log: mockLog,
}));

vi.mock('@dxworks/common/src/dxworks-hub.js', () => ({
  updateDxworksHub: vi.fn(),
  dxworksHubDir: '/mock/.dxw/hub',
}));

// Import after mocking
const { pluginInstall } = await import('../../../commands/plugin/install.js');

describe('plugin install command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNpmList.mockReturnValue({ dependencies: {} });
    mockNpmInfo.mockReturnValue({
      description: 'Test plugin',
      'dist-tags': { latest: '1.0.0' },
    });
  });

  describe('pluginInstall', () => {
    it('should be a Command instance', () => {
      expect(pluginInstall).toBeDefined();
      expect(pluginInstall.name()).toBe('install');
    });

    it('should have i and add aliases', () => {
      const aliases = pluginInstall.aliases();
      expect(aliases).toContain('i');
      expect(aliases).toContain('add');
    });

    it('should have -a/--all option', () => {
      const options = pluginInstall.options;
      const allOption = options.find(
        (opt: { short?: string }) => opt.short === '-a',
      );
      expect(allOption).toBeDefined();
    });

    it('should have -f/--force option', () => {
      const options = pluginInstall.options;
      const forceOption = options.find(
        (opt: { short?: string }) => opt.short === '-f',
      );
      expect(forceOption).toBeDefined();
    });
  });

  describe('install action', () => {
    it('should warn when no plugins specified', async () => {
      await pluginInstall.parseAsync(['node', 'test']);

      expect(mockLog.warn).toHaveBeenCalledWith(
        'No plugins specified to install.',
      );
      expect(mockNpmInstall).not.toHaveBeenCalled();
    });

    it('should install known plugins', async () => {
      await pluginInstall.parseAsync(['node', 'test', '@dxworks/plugin-a']);

      expect(mockNpmInstall).toHaveBeenCalledWith('@dxworks/plugin-a');
    });

    it('should warn about unknown plugins without force flag', async () => {
      await pluginInstall.parseAsync(['node', 'test', 'unknown-plugin']);

      expect(mockLog.warn).toHaveBeenCalledWith(
        expect.stringContaining('not known as dxw plugins'),
      );
      expect(mockNpmInstall).not.toHaveBeenCalled();
    });

    it('should install unknown plugins with force flag', async () => {
      await pluginInstall.parseAsync(['node', 'test', 'unknown-plugin', '-f']);

      expect(mockLog.warn).toHaveBeenCalledWith('Installing unknown plugins');
      expect(mockNpmInstall).toHaveBeenCalledWith('unknown-plugin');
    });

    it('should install all plugins with --all flag', async () => {
      await pluginInstall.parseAsync(['node', 'test', '--all']);

      expect(mockNpmInstall).toHaveBeenCalledWith(
        '@dxworks/plugin-a @dxworks/plugin-b',
      );
    });
  });
});
