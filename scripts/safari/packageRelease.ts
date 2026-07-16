#!/usr/bin/env ts-node

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { WORKSPACE_ROOT } from '../lib/paths';

async function main(): Promise<void> {
  const argv = await yargs
    .option('app', { type: 'string', demandOption: true, description: 'Notarized .app to package' })
    .option('output-dir', {
      type: 'string',
      default: 'release',
      description: 'ZIP destination directory',
    })
    .parse();

  const appPath = path.resolve(argv.app);
  if (!fs.existsSync(appPath)) throw new Error(`App not found: ${appPath}`);

  execFileSync('yarn', ['safari:audit-release', '--app', appPath], {
    cwd: WORKSPACE_ROOT,
    stdio: 'inherit',
  });

  const packageJson = JSON.parse(
    fs.readFileSync(path.join(WORKSPACE_ROOT, 'package.json'), 'utf-8'),
  );
  const outputDir = path.resolve(WORKSPACE_ROOT, argv['output-dir']);
  const zipPath = path.join(outputDir, `Toolkit-for-YNAB-${packageJson.version}-macOS.zip`);
  fs.mkdirSync(outputDir, { recursive: true });
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  execFileSync('ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', appPath, zipPath], {
    stdio: 'inherit',
  });
  console.log(`Release package created: ${zipPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
