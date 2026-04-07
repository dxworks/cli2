#!/usr/bin/env node

import { Command } from 'commander';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
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
 * Check if a command has basic Commander methods
 */
function isCommandLike(command: unknown): command is Command {
  if (!command || typeof command !== 'object') {
    return false;
  }
  // Check for essential Commander methods
  const cmd = command as Record<string, unknown>;
  return (
    typeof cmd.name === 'function' && typeof cmd.description === 'function'
  );
}

/**
 * Add Commander v14 compatibility shims to older commands
 * Plugins built with Commander v11 or earlier may be missing some methods
 */
function addCompatibilityShims(command: Command): void {
  const cmd = command as unknown as Record<string, unknown>;

  // Add helpGroup if missing (Commander v14 feature for grouping commands in help)
  if (typeof cmd.helpGroup !== 'function') {
    cmd.helpGroup = () => 'Plugin Commands:';
  }

  // Add _checkForBrokenPassThrough if missing (Commander v14 internal method)
  if (typeof cmd._checkForBrokenPassThrough !== 'function') {
    cmd._checkForBrokenPassThrough = () => {};
  }

  // Add _prepareForParse if missing (Commander v14 internal method)
  if (typeof cmd._prepareForParse !== 'function') {
    cmd._prepareForParse = () => {};
  }

  // Add _getCommandAndAncestors if missing (Commander v14 internal method)
  if (typeof cmd._getCommandAndAncestors !== 'function') {
    cmd._getCommandAndAncestors = function () {
      const result: Command[] = [];

      let current: Command | null = this as unknown as Command;
      while (current) {
        result.push(current);
        current = (current as unknown as Record<string, unknown>)
          .parent as Command | null;
      }
      return result;
    };
  }

  // Add getOptionValueSource if missing (Commander v14 method)
  if (typeof cmd.getOptionValueSource !== 'function') {
    cmd.getOptionValueSource = () => undefined;
  }

  // Add setOptionValueWithSource if missing (Commander v14 method)
  if (typeof cmd.setOptionValueWithSource !== 'function') {
    cmd.setOptionValueWithSource = function (key: string, value: unknown) {
      (this as unknown as Record<string, unknown>)[key] = value;
    };
  }

  // Recursively add shims to subcommands
  if (Array.isArray(cmd.commands)) {
    for (const subCmd of cmd.commands as Command[]) {
      addCompatibilityShims(subCmd);
    }
  }
}

/**
 * Resolve the plugin command file path, with fallback to lib/ if dist/ doesn't exist
 */
function resolvePluginFilePath(plugin: string, file: string): string | null {
  const filePath = getPluginFile(plugin, file);
  if (existsSync(filePath)) {
    return filePath;
  }

  // Fallback: if file is in dist/, try lib/ instead (common packaging issue)
  if (file.startsWith('dist/')) {
    const libPath = getPluginFile(plugin, file.replace('dist/', 'lib/'));
    if (existsSync(libPath)) {
      return libPath;
    }
  }

  return null;
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
          const filePath = resolvePluginFilePath(plugin, c.file);
          if (filePath) {
            try {
              // Convert file path to proper URL for ESM import
              const fileUrl = pathToFileURL(filePath).href;
              const module = await import(fileUrl);
              // Handle both ESM and CommonJS exports
              // CommonJS modules may have exports on .default
              const exports = module.default || module;
              const command = exports[c.command] || module[c.command];

              // Check if the command has basic Commander structure
              if (!isCommandLike(command)) {
                log.warn(
                  `Plugin ${plugin} command ${c.command} is not a valid Commander command`,
                );
                continue;
              }

              // Add compatibility shims for older Commander versions
              addCompatibilityShims(command);

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
if (import.meta.url === pathToFileURL(realArgv1).href) {
  await initPlugins();
  await loadPluginCommands(cli);
  cli.parse(process.argv);
}
