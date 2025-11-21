import { Command } from 'commander';
import { voyenvInit } from './commands/init.js';
import { voyenvInstall } from './commands/install.js';
import { voyenvInstrument } from './commands/instruments.js';
import { _package } from './utils.js';

export const voyenvCommand = new Command()
  .name('voyenv')
  .description(_package.description)
  .version(_package.version, '-v, --version')
  .addCommand(voyenvInit)
  .addCommand(voyenvInstall)
  .addCommand(voyenvInstrument);
