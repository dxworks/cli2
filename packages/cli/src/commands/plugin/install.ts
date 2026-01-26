import { Command } from 'commander';
import chalk from 'chalk';
import { log } from '@dxworks/common/src/logging.js';
import { npm } from '../../npm.js';
import { getAllAvailablePlugins } from './list.js';

export const pluginInstall = new Command()
  .name('install')
  .aliases(['i', 'add'])
  .description('installs a dxworks cli plugin')
  .argument(
    '[plugins...]',
    'npm module name for the plugin you want to install',
  )
  .option(
    '-a, --all',
    'whether to install all available plugins; ignores any plugins added as arguments',
    false,
  )
  .option(
    '-f, --force',
    'install the plugins even if they are not known dxw plugins',
    false,
  )
  .action(installPlugins);

interface InstallOptions {
  all: boolean;
  force: boolean;
}

async function installPlugins(
  plugins: string[],
  options: InstallOptions,
): Promise<void> {
  const allPlugins = getAllAvailablePlugins();
  const allPluginNames = Object.keys(allPlugins);

  const pluginsToInstall = options.all ? allPluginNames : plugins;

  if (pluginsToInstall.length === 0) {
    log.warn('No plugins specified to install.');
    log.info(
      `Run ${chalk.yellow('dxw plugin list -a')} to see all available plugins`,
    );
    return;
  }

  const unknownPlugins = pluginsToInstall.filter(
    (p) => !allPluginNames.includes(p),
  );

  if (unknownPlugins.length > 0 && !options.force) {
    log.warn(
      `The following packages are not known as dxw plugins: ${unknownPlugins.join(', ')}`,
    );
    log.info(
      `Run ${chalk.yellow('dxw plugin list -a')} to see all available plugins`,
    );
    log.info(
      `Run with the ${chalk.yellow('-f or --force')} flag to install them anyway`,
    );
    return;
  }

  if (unknownPlugins.length > 0) {
    log.warn('Installing unknown plugins');
  }

  log.info(`Installing plugins ${pluginsToInstall.join(', ')}`);
  npm.install(pluginsToInstall.join(' '));
}
