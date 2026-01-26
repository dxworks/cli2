import { Command } from 'commander';
import { pluginList } from './list.js';
import { pluginInstall } from './install.js';
import { pluginUpdate } from './update.js';
import { pluginOutdated } from './outdated.js';
import { pluginUninstall } from './uninstall.js';
import { pluginLink } from './link.js';

export const pluginCommand = new Command()
  .name('plugin')
  .description('handles dxworks cli plugins')
  .addCommand(pluginList)
  .addCommand(pluginInstall)
  .addCommand(pluginUpdate)
  .addCommand(pluginOutdated)
  .addCommand(pluginUninstall)
  .addCommand(pluginLink);

export {
  pluginList,
  pluginInstall,
  pluginUpdate,
  pluginOutdated,
  pluginUninstall,
  pluginLink,
};
