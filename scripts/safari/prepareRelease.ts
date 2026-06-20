#!/usr/bin/env ts-node

import { execFileSync } from 'child_process';
import yargs from 'yargs';
import { WORKSPACE_ROOT } from '../lib/paths';

function run(command: string, args: string[] = [], cwd: string = WORKSPACE_ROOT): void {
  console.log(`\n> ${[command, ...args].join(' ')}\n`);
  execFileSync(command, args, { cwd, stdio: 'inherit' });
}

async function main(): Promise<void> {
  const argv = await yargs
    .option('build-number', {
      type: 'number',
      description: 'Use an explicit build number instead of incrementing it',
    })
    .check((args) => {
      if (args['build-number'] !== undefined && args['build-number'] < 1) {
        throw new Error('--build-number must be a positive integer.');
      }
      return true;
    })
    .parse();

  const versionArgs = argv['build-number']
    ? ['scripts/safari/syncVersion.ts', '--build-number', String(argv['build-number'])]
    : ['scripts/safari/syncVersion.ts', '--increment-build'];

  run('yarn', ['ts-node', ...versionArgs]);
  run('yarn', ['build:safari']);
  run('yarn', ['safari:copy-resources']);
  run('xcodegen', ['generate'], `${WORKSPACE_ROOT}/safari`);
  run('yarn', ['safari:audit-release']);

  console.log('\nSafari release sources and Xcode project are ready to archive.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
