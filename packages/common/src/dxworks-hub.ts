import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import { log, dxwFolder } from './logging.js';
import path from 'node:path';

export const dxworksHubGithubUrl = 'https://github.com/dxworks/dxworks-hub';

export const dxworksHubDir = path.resolve(dxwFolder, 'hub');

/**
 * Update or clone the dxworks-hub repository
 * If the repository exists, it will pull the latest changes.
 * If it doesn't exist, it will clone it.
 */
export async function updateDxworksHub(): Promise<void> {
  try {
    log.info('Updating dxworks-hub...');
    await git.pull({
      fs: await import('node:fs'),
      http,
      dir: dxworksHubDir,
      ref: 'main',
      singleBranch: true,
      author: { name: 'cli', email: 'cli@dxworks.org' },
    });
    log.info('Successfully updated');
  } catch {
    log.warn('No repository found, cloning...');
    await git.clone({
      fs: await import('node:fs'),
      http,
      dir: dxworksHubDir,
      url: dxworksHubGithubUrl,
    });
    log.info('Successfully cloned');
  }
}
