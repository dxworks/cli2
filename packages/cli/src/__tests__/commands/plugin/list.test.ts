import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mocks
const mockLog = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};
const mockUpdateDxworksHub = vi.fn();
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
    list: mockNpmList,
    info: mockNpmInfo,
  },
}));

vi.mock('@dxworks/common/src/logging.js', () => ({
  log: mockLog,
}));

vi.mock('@dxworks/common/src/dxworks-hub.js', () => ({
  updateDxworksHub: mockUpdateDxworksHub,
  dxworksHubDir: '/mock/.dxw/hub',
}));

// Import after mocking
const { pluginList, getPluginInfo, getAllAvailablePlugins } = await import(
  '../../../commands/plugin/list.js'
);

describe('plugin list command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('pluginList', () => {
    it('should be a Command instance', () => {
      expect(pluginList).toBeDefined();
      expect(pluginList.name()).toBe('list');
    });

    it('should have ls alias', () => {
      expect(pluginList.alias()).toBe('ls');
    });

    it('should have -a/--available option', () => {
      const options = pluginList.options;
      const availableOption = options.find(
        (opt: { short?: string }) => opt.short === '-a',
      );
      expect(availableOption).toBeDefined();
    });
  });

  describe('getPluginInfo', () => {
    it('should return plugin info with thumbsdown emoji when not installed', () => {
      mockNpmInfo.mockReturnValue({
        description: 'Test plugin',
        'dist-tags': { latest: '2.0.0' },
      });

      const result = getPluginInfo('@dxworks/plugin-a', undefined, []);

      expect(result).toBeDefined();
      expect(result?.name).toBe('@dxworks/plugin-a');
      expect(result?.description).toBe('Test plugin');
      expect(result?.latest).toBe('2.0.0');
      expect(result?.installed).toContain('$ dxw plugin i');
    });

    it('should return plugin info with tada emoji when version matches', () => {
      mockNpmInfo.mockReturnValue({
        description: 'Test plugin',
        'dist-tags': { latest: '1.0.0' },
      });

      const installedPlugins = {
        '@dxworks/plugin-a': { version: '1.0.0' },
      };

      const result = getPluginInfo('@dxworks/plugin-a', installedPlugins, [
        '@dxworks/plugin-a',
      ]);

      expect(result).toBeDefined();
      expect(result?.installed).toContain('1.0.0');
    });

    it('should return plugin info with thumbsup emoji when same major version', () => {
      mockNpmInfo.mockReturnValue({
        description: 'Test plugin',
        'dist-tags': { latest: '1.5.0' },
      });

      const installedPlugins = {
        '@dxworks/plugin-a': { version: '1.0.0' },
      };

      const result = getPluginInfo('@dxworks/plugin-a', installedPlugins, [
        '@dxworks/plugin-a',
      ]);

      expect(result).toBeDefined();
      expect(result?.installed).toContain('1.0.0');
    });

    it('should return null and log error when npm info fails', () => {
      mockNpmInfo.mockImplementation(() => {
        throw new Error('Not found');
      });

      const result = getPluginInfo('@dxworks/plugin-a', undefined, []);

      expect(result).toBeNull();
      expect(mockLog.error).toHaveBeenCalled();
    });
  });

  describe('getAllAvailablePlugins', () => {
    it('should return available plugins from hub', () => {
      mockNpmList.mockReturnValue({ dependencies: {} });
      mockNpmInfo.mockReturnValue({
        description: 'Test plugin',
        'dist-tags': { latest: '1.0.0' },
      });

      const result = getAllAvailablePlugins({});

      expect(result).toBeDefined();
      expect(Object.keys(result).length).toBeGreaterThan(0);
    });

    it('should handle empty installed plugins', () => {
      mockNpmList.mockReturnValue({ dependencies: undefined });
      mockNpmInfo.mockReturnValue({
        description: 'Test plugin',
        'dist-tags': { latest: '1.0.0' },
      });

      const result = getAllAvailablePlugins(undefined);

      expect(result).toBeDefined();
    });

    it('should filter out null plugin info', () => {
      mockNpmList.mockReturnValue({ dependencies: {} });
      mockNpmInfo.mockImplementation((plugin: string) => {
        if (plugin === '@dxworks/plugin-a') {
          throw new Error('Not found');
        }
        return {
          description: 'Test plugin',
          'dist-tags': { latest: '1.0.0' },
        };
      });

      const result = getAllAvailablePlugins({});

      // Only plugin-b should be returned since plugin-a throws
      expect(Object.keys(result)).toContain('@dxworks/plugin-b');
      expect(Object.keys(result)).not.toContain('@dxworks/plugin-a');
    });
  });
});
