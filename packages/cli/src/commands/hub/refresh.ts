import { Command } from 'commander';
import { rmSync } from 'node:fs';
import { log } from '@dxworks/common/src/logging.js';
import {
  dxworksHubDir,
  updateDxworksHub,
} from '@dxworks/common/src/dxworks-hub.js';

export const hubRefreshCommand = new Command()
  .name('refresh')
  .description('refresh dxworks-hub by removing and re-cloning')
  .aliases(['reset', 'rs'])
  .action(refreshHub);

async function refreshHub(): Promise<void> {
  log.info(`Removing hub directory ${dxworksHubDir}`);
  rmSync(dxworksHubDir, { recursive: true, force: true });
  await updateDxworksHub();
}
