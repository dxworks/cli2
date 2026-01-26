import { Command } from 'commander';
import { spawnSync } from 'node:child_process';
import { npm } from '../../npm.js';
import { ncuPath, pluginsFolder } from '../../utils.js';

export const pluginUpdate = new Command()
  .name('update')
  .description('update dxworks cli plugins')
  .aliases(['upgrade', 'up'])
  .argument('[plugins...]', 'npm modules of the plugins you want to update')
  .option('-l, --latest', 'update to the latest version', false)
  .action(updatePlugins);

interface UpdateOptions {
  latest: boolean;
}

/**
 * Remove a suffix from a string if it exists
 */
function removeSuffix(str: string, suffix: string): string {
  return str.endsWith(suffix) ? str.slice(0, -suffix.length) : str;
}

async function updatePlugins(
  plugins: string[],
  options: UpdateOptions,
): Promise<void> {
  if (!plugins || plugins.length === 0) {
    if (options.latest) {
      spawnSync(ncuPath, ['-u'], {
        cwd: pluginsFolder,
        stdio: 'inherit',
        shell: true,
      });
      npm.install();
    } else {
      npm.update();
    }
  } else {
    const cleanedPlugins = plugins.map((plugin) =>
      removeSuffix(plugin, '@latest'),
    );
    if (options.latest) {
      const latestPlugins = cleanedPlugins.map((plugin) => `${plugin}@latest`);
      npm.install(latestPlugins.join(' '));
    } else {
      npm.update(cleanedPlugins.join(' '));
    }
  }
}
