import { execaSync, type Options } from 'execa';
import { npmExePath, pluginsFolder } from './utils.js';

export interface NpmListResult {
  dependencies?: Record<string, any>;
  [key: string]: any;
}

/**
 * List installed packages
 * @param options - npm ls options
 * @param processOptions - Process execution options
 * @returns Parsed JSON result
 */
export function list(
  options = '--depth=0 --omit=dev --json',
  processOptions?: Options,
): NpmListResult {
  const result = npmCommand(`ls ${options}`, processOptions);
  return JSON.parse(result);
}

/**
 * Get available versions for a module
 * @param module - Module name
 * @returns Array of version strings
 */
export function versionsFor(module: string): string[] {
  return info(module, 'versions') as string[];
}

/**
 * Get information about a module
 * @param module - Module name
 * @param field - Specific field to retrieve
 * @param json - Whether to parse as JSON
 * @returns Module information
 */
export function info(module: string, field = '', json = true): any {
  const result = npmCommand(`info ${module} ${field} ${json ? '--json' : ''}`, {
    cwd: __dirname,
  });
  return JSON.parse(result);
}

/**
 * Install a package
 * @param module - Module name (empty for all packages)
 * @param otherOptions - Additional npm install options
 * @param directory - Directory to run install in
 */
export function install(
  module = '',
  otherOptions = '',
  directory = pluginsFolder,
): void {
  npmCommand(`install ${module} ${otherOptions}`, {
    cwd: directory,
    stdio: 'inherit',
  });
}

/**
 * Uninstall a package
 * @param module - Module name
 * @param otherOptions - Additional npm uninstall options
 * @param directory - Directory to run uninstall in
 */
export function uninstall(
  module: string,
  otherOptions = '',
  directory = pluginsFolder,
): void {
  npmCommand(`uninstall ${module} ${otherOptions}`, {
    cwd: directory,
    stdio: 'inherit',
  });
}

/**
 * Update packages
 * @param module - Module name (empty for all packages)
 * @param otherOptions - Additional npm update options
 * @param directory - Directory to run update in
 */
export function update(
  module = '',
  otherOptions = '',
  directory = pluginsFolder,
): void {
  npmCommand(`update ${module} ${otherOptions}`, {
    cwd: directory,
    stdio: 'inherit',
  });
}

/**
 * Check for outdated packages
 * @param directory - Directory to check
 */
export function outdated(directory = pluginsFolder): void {
  try {
    npmCommand('outdated', {
      cwd: directory,
      stdio: 'inherit',
    });
  } catch {
    // Ignore errors (npm outdated returns non-zero if packages are outdated)
  }
}

/**
 * Link a package
 * @param module - Module name (empty to link current directory)
 * @param otherOptions - Additional npm link options
 * @param directory - Directory to run link in
 */
export function link(
  module = '',
  otherOptions = '',
  directory = pluginsFolder,
): void {
  npmCommand(`link ${module} ${otherOptions}`, {
    cwd: directory,
    stdio: 'inherit',
  });
}

/**
 * Execute an npm command
 * @param args - Command arguments
 * @param options - Execution options
 * @returns Command output
 */
export function npmCommand(args: string, options?: Options): string {
  const defaultOptions: Options = {
    cwd: pluginsFolder,
  };

  const mergedOptions = { ...defaultOptions, ...options };

  const result = execaSync(npmExePath, args.split(' '), mergedOptions);
  return result.stdout;
}

export const npm = {
  list,
  versionsFor,
  info,
  install,
  npmCommand,
  update,
  outdated,
  uninstall,
  link,
};
