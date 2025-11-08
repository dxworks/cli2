import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import { getAssetFile, pluginsFolder, pluginsPackage } from '../utils.js';

// Create mocks before importing modules that use them
const mockLog = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};
const mockUpdateDxworksHub = vi.fn();
const mockNpmInstall = vi.fn();

// Mock dependencies
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  cpSync: vi.fn(),
  readFileSync: vi.fn((path: string) => {
    if (path.includes('package.json')) {
      return JSON.stringify({
        name: '@dxworks/cli',
        version: '1.0.0',
        description: 'DXWorks CLI',
      });
    }
    return '';
  }),
}));

vi.mock('node:child_process', () => ({
  execSync: vi.fn(() => '/usr/bin/npm'),
}));

vi.mock('../npm.js', () => ({
  npm: {
    install: mockNpmInstall,
  },
}));

vi.mock('@dxworks/common/src/logging.js', () => ({
  log: mockLog,
}));

vi.mock('@dxworks/common/src/dxworks-hub.js', () => ({
  updateDxworksHub: mockUpdateDxworksHub,
}));

// Import after mocking
const { initPlugins, isPluginsInitialized } = await import('../plugins.js');

describe('plugins', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('isPluginsInitialized', () => {
    it('should return false when plugins package.json does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = isPluginsInitialized();

      expect(result).toBe(false);
      expect(fs.existsSync).toHaveBeenCalledWith(pluginsPackage);
    });

    it('should return true when plugins package.json exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const result = isPluginsInitialized();

      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith(pluginsPackage);
    });
  });

  describe('initPlugins', () => {
    it('should initialize plugins folder when not already initialized', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      mockUpdateDxworksHub.mockResolvedValue(undefined);

      await initPlugins();

      expect(fs.mkdirSync).toHaveBeenCalledWith(pluginsFolder, {
        recursive: true,
      });
      expect(fs.cpSync).toHaveBeenCalledWith(
        getAssetFile('plugins/package.json'),
        pluginsPackage,
      );
      expect(mockNpmInstall).toHaveBeenCalled();
      expect(mockUpdateDxworksHub).toHaveBeenCalled();
    });

    it('should log progress messages during initialization', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      mockUpdateDxworksHub.mockResolvedValue(undefined);

      await initPlugins();

      expect(mockLog.info).toHaveBeenCalledWith('Initializing plugins folder');
      expect(mockLog.info).toHaveBeenCalledWith('Created package.json');
      expect(mockLog.info).toHaveBeenCalledWith('Installing plugins');
      expect(mockLog.info).toHaveBeenCalledWith('Done installing plugins');
    });

    it('should not initialize if already initialized', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      await initPlugins();

      expect(fs.mkdirSync).not.toHaveBeenCalled();
      expect(fs.cpSync).not.toHaveBeenCalled();
      expect(mockNpmInstall).not.toHaveBeenCalled();
      expect(mockUpdateDxworksHub).not.toHaveBeenCalled();
    });

    it('should handle errors when updating dxworks hub fails', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      const error = new Error('Hub update failed');
      mockUpdateDxworksHub.mockRejectedValue(error);

      await initPlugins();

      expect(mockLog.error).toHaveBeenCalledWith(
        'Failed to update dxw hub',
        error,
      );
    });

    it('should log success message when hub update succeeds', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      mockUpdateDxworksHub.mockResolvedValue(undefined);
      const consoleLogSpy = vi
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      await initPlugins();

      expect(consoleLogSpy).toHaveBeenCalledWith('Updated dxw hub');
      consoleLogSpy.mockRestore();
    });

    it('should create plugins folder with correct path', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      mockUpdateDxworksHub.mockResolvedValue(undefined);

      await initPlugins();

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('.dxw'),
        { recursive: true },
      );
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('plugins'),
        { recursive: true },
      );
    });

    it('should copy asset files from correct locations', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      mockUpdateDxworksHub.mockResolvedValue(undefined);

      await initPlugins();

      const packageJsonSource = getAssetFile('plugins/package.json');

      expect(packageJsonSource).toContain('assets');
      expect(packageJsonSource).toContain('package.json');
    });
  });
});
