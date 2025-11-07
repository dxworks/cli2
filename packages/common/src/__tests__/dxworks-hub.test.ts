import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  updateDxworksHub,
  dxworksHubGithubUrl,
  dxworksHubDir,
} from '../dxworks-hub.js';
import * as git from 'isomorphic-git';
import { dxwFolder } from '../logging.js';
import path from 'node:path';

vi.mock('isomorphic-git');

describe('dxworks-hub', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constants', () => {
    it('should have correct GitHub URL', () => {
      expect(dxworksHubGithubUrl).toBe(
        'https://github.com/dxworks/dxworks-hub',
      );
    });

    it('should have correct hub directory', () => {
      expect(dxworksHubDir).toBe(path.resolve(dxwFolder, 'hub'));
    });
  });

  describe('updateDxworksHub', () => {
    it('should pull when repository exists', async () => {
      vi.mocked(git.pull).mockResolvedValue(undefined);

      await updateDxworksHub();

      expect(git.pull).toHaveBeenCalledWith(
        expect.objectContaining({
          dir: dxworksHubDir,
          ref: 'main',
          singleBranch: true,
          author: { name: 'cli', email: 'cli@dxworks.org' },
        }),
      );
      expect(git.clone).not.toHaveBeenCalled();
    });

    it('should clone when pull fails', async () => {
      vi.mocked(git.pull).mockRejectedValue(new Error('Not a git repository'));
      vi.mocked(git.clone).mockResolvedValue(undefined);

      await updateDxworksHub();

      expect(git.pull).toHaveBeenCalled();
      expect(git.clone).toHaveBeenCalledWith(
        expect.objectContaining({
          dir: dxworksHubDir,
          url: dxworksHubGithubUrl,
        }),
      );
    });

    it('should use correct parameters for clone', async () => {
      vi.mocked(git.pull).mockRejectedValue(new Error('Not found'));
      vi.mocked(git.clone).mockResolvedValue(undefined);

      await updateDxworksHub();

      expect(git.clone).toHaveBeenCalledWith({
        fs: expect.any(Object),
        http: expect.any(Object),
        dir: dxworksHubDir,
        url: dxworksHubGithubUrl,
      });
    });
  });
});
