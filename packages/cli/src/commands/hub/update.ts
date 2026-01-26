import { Command } from 'commander';
import { updateDxworksHub } from '@dxworks/common/src/dxworks-hub.js';

export const hubUpdateCommand = new Command()
  .name('update')
  .description('update dxworks-hub')
  .aliases(['pull', 'fetch', 'get'])
  .action(updateDxworksHub);
