import { existsSync, mkdirSync, cpSync } from 'node:fs';
import { log } from '@dxworks/common/src/logging.js';
import { updateDxworksHub } from '@dxworks/common/src/dxworks-hub.js';
import { npm } from './npm.js';
import { getAssetFile, pluginsFolder, pluginsPackage } from './utils.js';

/**
 * Initialize the plugins folder if it doesn't exist
 * Creates the folder structure, copies template files, and installs plugins
 */
export async function initPlugins(): Promise<void> {
  if (!existsSync(pluginsPackage)) {
    log.info('Initializing plugins folder');
    mkdirSync(pluginsFolder, { recursive: true });

    // Copy template package.json
    cpSync(getAssetFile('plugins/package.json'), pluginsPackage);
    log.info('Created package.json');

    // Install plugins
    log.info('Installing plugins');
    npm.install();
    log.info('Done installing plugins');

    // Update dxworks hub
    try {
      await updateDxworksHub();
      console.log('Updated dxw hub');
    } catch (error) {
      log.error('Failed to update dxw hub', error);
    }
  }
}

/**
 * Check if plugins are initialized
 * @returns true if the plugins folder and package.json exist
 */
export function isPluginsInitialized(): boolean {
  return existsSync(pluginsPackage);
}
