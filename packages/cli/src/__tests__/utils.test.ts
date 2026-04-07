import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockExecSync = vi.fn();

vi.mock('node:child_process', () => ({
  execSync: mockExecSync,
}));

vi.mock('node:fs', () => ({
  readFileSync: vi.fn((filePath: string) => {
    if (filePath.includes('package.json')) {
      return JSON.stringify({ name: '@dxworks/cli', version: '1.0.0' });
    }
    return '';
  }),
}));

vi.mock('node:os', () => ({
  homedir: vi.fn(() => 'C:\\Users\\test'),
  platform: vi.fn(() => 'win32'),
}));

describe('utils binary resolution', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockExecSync.mockReturnValue('C:\\Program Files\\nodejs\\npm.cmd\n');
  });

  it('should use where on Windows and never call which', async () => {
    const utils = await import('../utils.js');

    expect(utils.npmExePath).toBe('C:\\Program Files\\nodejs\\npm.cmd');
    expect(utils.ncuPath).toBe('C:\\Program Files\\nodejs\\npm.cmd');
    expect(mockExecSync).toHaveBeenCalledWith('where npm', {
      encoding: 'utf-8',
    });
    expect(mockExecSync).toHaveBeenCalledWith('where ncu', {
      encoding: 'utf-8',
    });
    expect(mockExecSync).not.toHaveBeenCalledWith(
      expect.stringContaining('which'),
      expect.anything(),
    );
  });
});
