import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mocks
const mockNpmOutdated = vi.fn();

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
    outdated: mockNpmOutdated,
  },
}));

// Import after mocking
const { pluginOutdated } = await import('../../../commands/plugin/outdated.js');

describe('plugin outdated command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('pluginOutdated', () => {
    it('should be a Command instance', () => {
      expect(pluginOutdated).toBeDefined();
      expect(pluginOutdated.name()).toBe('outdated');
    });

    it('should have proper description', () => {
      expect(pluginOutdated.description()).toBe(
        'lists outdated dxworks cli plugins',
      );
    });
  });

  describe('outdated action', () => {
    it('should call npm.outdated', async () => {
      await pluginOutdated.parseAsync(['node', 'test']);

      expect(mockNpmOutdated).toHaveBeenCalled();
    });
  });
});
