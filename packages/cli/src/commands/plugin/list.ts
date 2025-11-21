import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { log } from '@dxworks/common/src/logging.js';
import {
  updateDxworksHub,
  dxworksHubDir,
} from '@dxworks/common/src/dxworks-hub.js';
import { npm, type NpmListDependencies } from '../../npm.js';
import { emojify } from 'node-emoji';
import { SemVer } from 'semver';

export const pluginList = new Command()
  .name('list')
  .alias('ls')
  .description('lists the installed packages')
  .option('-a --available', 'list all officially available dxworks cli plugins')
  .action(listPlugins);

interface CliPluginsJSON {
  plugins: string[];
}

interface PluginInfo {
  name: string;
  description: string;
  latest: string;
  installed: string;
}

async function listPlugins(options: { available?: boolean }): Promise<void> {
  const installedPlugins = npm.list().dependencies;

  if (!options.available) {
    if (!installedPlugins) {
      log.info('No plugins are installed!');
    } else {
      log.info('The following plugins are installed on your system:');
      console.table(installedPlugins, ['version', 'resolved']);
    }
    log.info(
      `Run ${chalk.yellow('dxw plugin list -a')} for a list of all officially supported plugins.`,
    );
    log.info(
      `Run ${chalk.yellow('dxw plugin outdated')} for a list of all outdated installed plugins.`,
    );
  } else {
    await updateDxworksHub();
    log.info('These are all officially supported dxw plugins:');
    const tabularData = getAllAvailablePlugins(installedPlugins);
    console.table(tabularData, ['description', 'latest', 'installed']);
    log.info(
      `Run ${chalk.yellow('dxw plugin outdated')} for a list of all outdated installed plugins.`,
    );
  }
}

export function getPluginInfo(
  plugin: string,
  installedPlugins: NpmListDependencies | undefined,
  installedPluginNames: string[],
): PluginInfo | null {
  try {
    const pluginInfo = npm.info(plugin);
    const latestVersion = pluginInfo['dist-tags'].latest;
    const installedPluginVersion = installedPlugins
      ? installedPlugins[plugin]?.version
      : '';

    let _emoji = emojify(':thumbsdown:');
    try {
      if (installedPluginVersion === latestVersion) {
        _emoji = emojify(':tada:');
      } else if (installedPluginVersion) {
        const installedPluginSemver = new SemVer(installedPluginVersion);
        const latestSemver = new SemVer(latestVersion);
        if (installedPluginSemver.major === latestSemver.major) {
          _emoji = emojify(':thumbsup:');
        }
      }
    } catch {
      // ignore semver parsing errors
    }

    return {
      name: plugin,
      description: pluginInfo.description,
      latest: latestVersion,
      installed: installedPluginNames.includes(plugin)
        ? `${_emoji} ${installedPlugins![plugin].version}`
        : `$ dxw plugin i ${plugin}`,
    };
  } catch (e) {
    log.error(`Could not find plugin ${plugin}`, e);
    return null;
  }
}

export function getAllAvailablePlugins(
  installedPlugins: NpmListDependencies | undefined = npm.list().dependencies,
): Record<string, PluginInfo> {
  const pluginsFile = path.resolve(dxworksHubDir, 'cli-plugins.json');
  const cliPluginsJSON = JSON.parse(
    readFileSync(pluginsFile).toString(),
  ) as CliPluginsJSON;
  const installedPluginNames = installedPlugins
    ? Object.keys(installedPlugins)
    : [];

  return cliPluginsJSON.plugins
    .map((plugin) =>
      getPluginInfo(plugin, installedPlugins, installedPluginNames),
    )
    .filter((it): it is PluginInfo => it !== null)
    .reduce(
      (acc, item) => ({ ...acc, [item.name]: item }),
      {} as Record<string, PluginInfo>,
    );
}
