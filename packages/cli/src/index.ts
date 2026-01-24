#!/usr/bin/env node

import { Command } from 'commander';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { log } from '@dxworks/common/src/logging.js';
import { pluginCommand } from './commands/plugin/index.js';
import { hubCommand } from './commands/hub/index.js';
import { initPlugins } from './plugins.js';
import { pluginsPackage, pluginPackageJson, getPluginFile } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json for version
const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

interface PluginCommandConfig {
  command: string;
  file: string;
}

/**
 * Check if a command is compatible with the current Commander version
 */
function isCompatibleCommand(command: unknown): command is Command {
  if (!command || typeof command !== 'object') {
    return false;
  }
  // Check for essential Commander methods that exist in v14
  const cmd = command as Record<string, unknown>;
  return (
    typeof cmd.name === 'function' &&
    typeof cmd.description === 'function' &&
    typeof cmd.helpGroup === 'function' // This is required in Commander v14
  );
}

/**
 * Load commands from installed plugins dynamically
 */
async function loadPluginCommands(cli: Command): Promise<void> {
  if (!existsSync(pluginsPackage)) {
    return;
  }

  const pluginsPackageJson = JSON.parse(readFileSync(pluginsPackage, 'utf-8'));
  const dependencies = pluginsPackageJson.dependencies || {};

  for (const plugin of Object.keys(dependencies)) {
    try {
      const pluginPkg = pluginPackageJson(plugin);
      const commands: PluginCommandConfig[] = pluginPkg?.dxw?.commands;

      if (commands) {
        for (const c of commands) {
          const filePath = getPluginFile(plugin, c.file);
          if (existsSync(filePath)) {
            try {
              const module = await import(filePath);
              const command = module[c.command];

              // Check if the command is compatible with Commander v14
              if (!isCompatibleCommand(command)) {
                log.warn(
                  `Plugin ${plugin} command ${c.command} is incompatible with this CLI version (needs update)`,
                );
                continue;
              }

              const originalDescription = command.description() || '';
              command.description(`[from: ${plugin}] ${originalDescription}`);
              cli.addCommand(command);
            } catch (e) {
              log.error(
                `Could not load command ${c.command} from plugin ${plugin}`,
                e,
              );
            }
          }
        }
      }
    } catch (e) {
      log.error(`Could not read plugin ${plugin}`, e);
    }
  }
}

export function createCli(): Command {
  const cli = new Command();

  cli
    .name('dxw')
    .description(packageJson.description || 'DXWorks CLI')
    .version(packageJson.version, '-v, --version', 'Output the version number')
    .addCommand(pluginCommand)
    .addCommand(hubCommand);

  return cli;
}

export const cli = createCli();

// Only parse if this is the main module
// Use realpathSync to handle symlinks (e.g., when installed via npm link)
const realArgv1 = realpathSync(process.argv[1]);
if (import.meta.url === `file://${realArgv1}`) {
  await initPlugins();
  await loadPluginCommands(cli);
  cli.parse(process.argv);
}
