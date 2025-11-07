#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json for version
const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

export function createCli(): Command {
  const cli = new Command();

  cli
    .name('dxw')
    .description(packageJson.description || 'DXWorks CLI')
    .version(packageJson.version, '-v, --version', 'Output the version number');

  return cli;
}

export const cli = createCli();

// Only parse if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  cli.parse(process.argv);
}
