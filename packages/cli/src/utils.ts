import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { homedir } from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json
const packageJsonPath = path.resolve(__dirname, '../package.json');
export const _package = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

// DXW root folder in user's home directory
export const dxwFolder = path.resolve(homedir(), '.dxw');

// Plugins folder in ~/.dxw/plugins
export const pluginsFolder = path.resolve(dxwFolder, 'plugins');

// Plugins package.json path
export const pluginsPackage = path.resolve(pluginsFolder, 'package.json');

/**
 * Get the path to an executable binary
 * @param exe - Name of the executable
 * @returns Path to the executable
 */
function getBin(exe: string): string {
  try {
    return execSync(`which ${exe}`, { encoding: 'utf-8' }).trim();
  } catch {
    return exe; // Fallback to just the name if which fails
  }
}

// Path to npm executable
export const npmExePath = getBin('npm');

// Path to ncu (npm-check-updates) executable
export const ncuPath = getBin('ncu');

/**
 * Get package.json for a specific plugin
 * @param module - Plugin module name
 * @returns Parsed package.json
 */
export function pluginPackageJson(module: string): any {
  return JSON.parse(
    readFileSync(
      path.resolve(pluginsFolder, 'node_modules', module, 'package.json'),
      'utf-8',
    ),
  );
}

/**
 * Get the path to a file within a plugin
 * @param module - Plugin module name
 * @param file - File path within the plugin
 * @returns Full path to the file
 */
export function getPluginFile(module: string, file: string): string {
  return path.resolve(pluginsFolder, 'node_modules', module, file);
}

/**
 * Get the path to an asset file
 * @param assetName - Name of the asset
 * @returns Path to the asset
 */
export function getAssetFile(assetName: string): string {
  return path.join(__dirname, 'assets', assetName);
}
