import { Command } from 'commander';
import { dxworksHubDir } from '@dxworks/common/src/dxworks-hub.js';
import { hubUpdateCommand } from './update.js';
import { hubRefreshCommand } from './refresh.js';

export const hubCommand = new Command()
  .name('hub')
  .description(
    `provides information and access to the dxworks-hub available at (${dxworksHubDir})`,
  )
  .addCommand(hubUpdateCommand)
  .addCommand(hubRefreshCommand);
