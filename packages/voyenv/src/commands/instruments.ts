import { Command } from 'commander';
import { log } from '@dxworks/common';

export const voyenvInstrument = new Command()
  .name('instruments')
  .description('Lists available instruments')
  .action(listInstruments);

async function listInstruments() {
  log.info('Available instruments:');
  log.info('  - dxworks/insider');
  log.info('  - dxworks/dude');
  log.info('  - dxworks/inspector-git');
  log.info('Use voyenv init -i to include all instruments in your voyenv.yml');
}
