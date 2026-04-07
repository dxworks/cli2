import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'node:path';

// Create mocks
const mockNpmLink = vi.fn();
const mockExistsSync = vi.fn();
const mockStatSync = vi.fn();
const mockReadFileSync = vi.fn();

// Mock dependencies
vi.mock('node:fs', () => ({
  existsSync: mockExistsSync,
  statSync: mockStatSync,
  readFileSync: mockReadFileSync,
}));

vi.mock('node:child_process', () => ({
  execSync: vi.fn(() => '/usr/bin/npm'),
}));

vi.mock('../../../npm.js', () => ({
  npm: {
    link: mockNpmLink,
  },
}));

// Import after mocking
const { pluginLink } = await import('../../../commands/plugin/link.js');

describe('plugin link command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReadFileSync.mockImplementation((path: string) => {
      if (path.includes('package.json')) {
        return JSON.stringify({
          name: '@dxworks/my-plugin',
          version: '1.0.0',
        });
      }
      return '';
    });
  });

  describe('pluginLink', () => {
    it('should be a Command instance', () => {
      expect(pluginLink).toBeDefined();
      expect(pluginLink.name()).toBe('link');
    });

    it('should have ln alias', () => {
      expect(pluginLink.alias()).toBe('ln');
    });

    it('should have proper description', () => {
      expect(pluginLink.description()).toContain('Links a local project');
    });
  });

  describe('link action', () => {
    it('should link a directory containing package.json', async () => {
      mockStatSync.mockReturnValue({
        isDirectory: () => true,
        isFile: () => false,
      });
      mockExistsSync.mockReturnValue(true);

      await pluginLink.parseAsync(['node', 'test', '/path/to/plugin']);

      expect(mockNpmLink).toHaveBeenCalledTimes(2);
      expect(mockNpmLink).toHaveBeenNthCalledWith(
        1,
        '',
        '',
        path.resolve('/path/to/plugin'),
      );
      expect(mockNpmLink).toHaveBeenNthCalledWith(
        2,
        '@dxworks/my-plugin',
        '--save',
      );
    });

    it('should link when given package.json path directly', async () => {
      mockStatSync.mockReturnValue({
        isDirectory: () => false,
        isFile: () => true,
      });

      await pluginLink.parseAsync(['node', 'test', '/path/to/package.json']);

      expect(mockNpmLink).toHaveBeenCalledTimes(2);
      expect(mockNpmLink).toHaveBeenNthCalledWith(
        1,
        '',
        '',
        path.dirname('/path/to/package.json'),
      );
      expect(mockNpmLink).toHaveBeenNthCalledWith(
        2,
        '@dxworks/my-plugin',
        '--save',
      );
    });

    it('should throw error for invalid path', async () => {
      mockStatSync.mockReturnValue({
        isDirectory: () => false,
        isFile: () => true,
      });

      await expect(
        pluginLink.parseAsync(['node', 'test', '/path/to/not-package.json']),
      ).rejects.toThrow(
        'Path is neither a package.json file nor a npm package folder.',
      );
    });

    it('should throw error when directory has no package.json', async () => {
      mockStatSync.mockReturnValue({
        isDirectory: () => true,
        isFile: () => false,
      });
      mockExistsSync.mockReturnValue(false);

      await expect(
        pluginLink.parseAsync(['node', 'test', '/path/to/empty-dir']),
      ).rejects.toThrow(
        'Path is neither a package.json file nor a npm package folder.',
      );
    });
  });
});
